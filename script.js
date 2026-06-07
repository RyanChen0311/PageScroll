document.addEventListener('DOMContentLoaded', function() {
    // 初始化元素
    const fileInput = document.getElementById('fileInput');
    const wordsPerSectionInput = document.getElementById('wordsPerSection');
    const prevPageButton = document.getElementById('prevPage');
    const nextPageButton = document.getElementById('nextPage');
    const windowsContainer = document.querySelector('.windows-container');
    const pageInfo = document.querySelector('.page-info');
    const jumpToPageInput = document.getElementById('jumpToPage');
    const jumpButton = document.getElementById('jumpButton');
    const successMessage = document.querySelector('.success-message');

    let currentPage = 0;
    let pages = [];
    let originalText = '';
    let activeWindow = null;

    // 顯示成功訊息
    function showSuccessMessage(message) {
        successMessage.textContent = message;
        successMessage.classList.add('show');
        setTimeout(() => {
            successMessage.classList.remove('show');
        }, 1000);
    }

    // 計算字數
    function countWords(text) {
        const cleanText = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ' ');
        const chineseChars = (cleanText.match(/[\u4e00-\u9fa5]/g) || []).length;
        const englishWords = (cleanText.match(/\b[a-zA-Z]+\b/g) || []).length;
        const numbers = (cleanText.match(/\b\d+\b/g) || []).length;
        return chineseChars + englishWords + numbers;
    }

    // 依段落切分後，依字數上限將相鄰段落合組為一頁（不切斷段落）
    function createPages() {
        if (!originalText) return;

        const text = originalText.trim();
        const wordsPerSection = parseInt(wordsPerSectionInput.value) || 500;

        // 取得原始段落：優先雙換行，次選單換行，最後依句末標點
        let rawSegments = text.split(/\n[ \t]*\n/).map(s => s.trim()).filter(Boolean);

        if (rawSegments.length <= 1) {
            rawSegments = text.split(/\n/).map(s => s.trim()).filter(Boolean);
        }

        if (rawSegments.length <= 1) {
            const flat = rawSegments[0] || text;
            const parts = flat.split(/([。！？!?])/).filter(Boolean);
            rawSegments = [];
            let chunk = '';
            for (let i = 0; i < parts.length; i++) {
                chunk += parts[i];
                if (/[。！？!?]/.test(parts[i]) && countWords(chunk) >= 80) {
                    rawSegments.push(chunk.trim());
                    chunk = '';
                }
            }
            if (chunk.trim()) rawSegments.push(chunk.trim());
        }

        // 將相鄰段落合組，直到累積字數超過上限才開新頁
        pages = [];
        let group = '';
        let groupWordCount = 0;

        for (const seg of rawSegments) {
            const segCount = countWords(seg);
            if (groupWordCount > 0 && groupWordCount + segCount > wordsPerSection) {
                pages.push(group.trim());
                group = seg;
                groupWordCount = segCount;
            } else {
                group += (group ? '\n\n' : '') + seg;
                groupWordCount += segCount;
            }
        }
        if (group.trim()) pages.push(group.trim());

        currentPage = 0;
        createWindows();
        updateDisplay();
    }

    // 視窗高度由每頁字數推算（代表可視範圍大小）
    function getWindowHeight() {
        const wps = parseInt(wordsPerSectionInput.value) || 500;
        return Math.max(150, Math.min(600, Math.round(wps * 0.6)));
    }

    // 創建視窗（固定高度 + 內部卷軸，讓讀者可在視窗內捲動查看完整段落）
    function createWindows() {
        const windowHeight = getWindowHeight();
        windowsContainer.innerHTML = '';
        pages.forEach((content, index) => {
            const wordCount = countWords(content);
            const win = document.createElement('div');
            win.className = 'window';
            win.style.height = windowHeight + 'px';
            win.setAttribute('data-page', `第 ${index + 1} 頁`);
            win.setAttribute('data-word-count', `${wordCount} 字`);

            const contentDiv = document.createElement('div');
            contentDiv.className = 'window-content';
            contentDiv.textContent = content;

            win.appendChild(contentDiv);
            windowsContainer.appendChild(win);

            win.addEventListener('click', () => {
                setActiveWindow(win);
            });
        });
    }

    // 設置當前活動視窗
    function setActiveWindow(window) {
        if (activeWindow) {
            activeWindow.classList.remove('active');
        }
        window.classList.add('active');
        activeWindow = window;
        currentPage = Array.from(windowsContainer.children).indexOf(window);
        updateDisplay();
    }

    // 更新顯示
    function updateDisplay() {
        if (pages.length === 0) {
            windowsContainer.innerHTML = '<div class="empty-message">請選擇一個文件</div>';
            pageInfo.textContent = '0 / 0 頁';
            return;
        }
        
        pageInfo.textContent = `${currentPage + 1} / ${pages.length} 頁`;
        prevPageButton.disabled = currentPage === 0;
        nextPageButton.disabled = currentPage === pages.length - 1;

        // 確保當前頁面在視圖中
        const currentWindow = windowsContainer.children[currentPage];
        if (currentWindow) {
            currentWindow.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // 跳轉到指定頁面
    function jumpToPage() {
        const pageNum = parseInt(jumpToPageInput.value);
        if (pageNum && pageNum >= 1 && pageNum <= pages.length) {
            const targetWindow = windowsContainer.children[pageNum - 1];
            if (targetWindow) {
                setActiveWindow(targetWindow);
            }
        }
    }

    // 處理鍵盤事件
    function handleKeyDown(e) {
        if (pages.length === 0) return;

        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            if (currentPage > 0) {
                const prevWindow = windowsContainer.children[currentPage - 1];
                setActiveWindow(prevWindow);
            }
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            if (currentPage < pages.length - 1) {
                const nextWindow = windowsContainer.children[currentPage + 1];
                setActiveWindow(nextWindow);
            }
        }
    }

    function loadFile(file) {
        if (!file || !file.name.endsWith('.txt')) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            originalText = e.target.result;
            createPages();
            showSuccessMessage(`${file.name} 讀取成功`);
        };
        reader.readAsText(file, 'UTF-8');
    }

    // 事件監聽器
    fileInput.addEventListener('change', function(e) {
        loadFile(e.target.files[0]);
    });

    // 拖曳上傳（獨立拖放區）
    const dropZone = document.getElementById('dropZone');

    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', function() {
        this.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        loadFile(e.dataTransfer.files[0]);
    });

    // 貼上文字處理
    const pasteArea = document.getElementById('pasteArea');
    const pasteButton = document.getElementById('pasteButton');

    pasteButton.addEventListener('click', function() {
        const text = pasteArea.value.trim();
        if (!text) return;
        originalText = text;
        createPages();
        showSuccessMessage('文字貼上成功');
    });

    wordsPerSectionInput.addEventListener('change', function() {
        const value = parseInt(this.value);
        if (value < 100) {
            this.value = 100;
            alert('每頁最少 100 字');
        } else if (value > 2000) {
            this.value = 2000;
            alert('每頁最多 2000 字');
        }

        if (originalText) {
            createPages();
        }
    });

    prevPageButton.addEventListener('click', function() {
        if (currentPage > 0) {
            const prevWindow = windowsContainer.children[currentPage - 1];
            setActiveWindow(prevWindow);
        }
    });

    nextPageButton.addEventListener('click', function() {
        if (currentPage < pages.length - 1) {
            const nextWindow = windowsContainer.children[currentPage + 1];
            setActiveWindow(nextWindow);
        }
    });

    jumpButton.addEventListener('click', jumpToPage);
    jumpToPageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            jumpToPage();
        }
    });

    // 添加鍵盤事件監聽器
    document.addEventListener('keydown', handleKeyDown);

    // 回到頂部按鈕
    const backToTop = document.getElementById('backToTop');
    window.addEventListener('scroll', function() {
        backToTop.classList.toggle('visible', window.scrollY > 300);
    });
    backToTop.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}); 