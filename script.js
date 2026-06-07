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

    // 創建頁面
    function createPages() {
        if (!originalText) return;
        
        const wordsPerSection = parseInt(wordsPerSectionInput.value) || 500;
        const text = originalText.trim();
        pages = [];
        let currentPage = '';
        let currentWordCount = 0;
        
        // 按段落分割文本
        const paragraphs = text.split(/\n\s*\n/);
        
        for (const paragraph of paragraphs) {
            const paragraphWordCount = countWords(paragraph);
            
            // 如果當前段落加上現有內容超過限制，且當前頁面不為空
            if (currentWordCount + paragraphWordCount > wordsPerSection && currentPage !== '') {
                pages.push(currentPage.trim());
                currentPage = '';
                currentWordCount = 0;
            }
            
            // 如果單個段落超過限制，需要進一步分割
            if (paragraphWordCount > wordsPerSection) {
                // 按句子分割
                const sentences = paragraph.split(/([。！？.!?])/g);
                let currentSentence = '';
                
                for (let i = 0; i < sentences.length; i++) {
                    const sentence = sentences[i];
                    const sentenceWordCount = countWords(sentence);
                    
                    if (currentWordCount + sentenceWordCount > wordsPerSection && currentPage !== '') {
                        pages.push(currentPage.trim());
                        currentPage = '';
                        currentWordCount = 0;
                    }
                    
                    currentPage += sentence;
                    currentWordCount += sentenceWordCount;
                }
            } else {
                currentPage += paragraph + '\n\n';
                currentWordCount += paragraphWordCount;
            }
        }
        
        // 添加最後一頁
        if (currentPage.trim() !== '') {
            pages.push(currentPage.trim());
        }
        
        createWindows();
        updateDisplay();
    }

    // 創建視窗
    function createWindows() {
        windowsContainer.innerHTML = '';
        pages.forEach((content, index) => {
            const wordCount = countWords(content);
            const window = document.createElement('div');
            window.className = 'window';
            window.setAttribute('data-page', `第 ${index + 1} 頁`);
            window.setAttribute('data-word-count', `${wordCount} 字`);
            
            const contentDiv = document.createElement('div');
            contentDiv.className = 'window-content';
            contentDiv.textContent = content;
            
            window.appendChild(contentDiv);
            windowsContainer.appendChild(window);

            // 添加點擊事件
            window.addEventListener('click', () => {
                setActiveWindow(window);
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

    // 拖曳上傳
    const uploadLabel = document.querySelector('.upload-label');

    uploadLabel.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    });

    uploadLabel.addEventListener('dragleave', function() {
        this.classList.remove('drag-over');
    });

    uploadLabel.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        loadFile(e.dataTransfer.files[0]);
    });

    wordsPerSectionInput.addEventListener('change', function() {
        const value = parseInt(this.value);
        if (value < 100) {
            this.value = 100;
            alert('每頁最少需要 100 字');
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
}); 