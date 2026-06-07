# PageScroll — TXT Document Reader

> A browser-based `.txt` reader that splits text into pages by word count, with scrollable page windows, smart punctuation-aware pagination, and keyboard navigation.

---

## Live Demo

👉 https://ryanchen0311.github.io/PageScroll/

---

## Features

- **Three input methods** — click to select a `.txt` file, drag & drop onto the dedicated drop zone, or paste text directly into the text area
- **Smart pagination** — accumulates text until the target word count is reached, then cuts only at a punctuation mark or paragraph boundary — never mid-sentence
- **Scrollable page windows** — each page is a fixed-height viewport; if the content exceeds the visible area, an inner scrollbar lets you read the full context without switching pages
- **Configurable page size** — 100 to 2,000 words per page, applied via the **設定** button
- **Navigation** — Prev / Next buttons, jump-to-page input, arrow key support
- **Word count badge** — each page shows its exact word count
- **Back-to-top button** — appears at the bottom-right of the active page card
- **Success toast** — confirms file name or paste action on load
- **Responsive** — works on desktop and mobile

---

## How Pagination Works

```
Input text
    │
    ├─ Split into minimum units
    │       ├─ Double newline  →  paragraph segments
    │       ├─ Single newline  →  line segments
    │       └─ No newlines     →  sentence segments (split at 。！？.!?)
    │
    └─ Group units until cumulative word count ≥ target
            │
            └─ Flush page at next punctuation boundary
               (each page contains AT LEAST the target word count,
                except the final page)
```

### Word counting

| Token type | Count |
|---|---|
| Chinese character (一字) | 1 |
| English word | 1 |
| Number token | 1 |
| Punctuation | 0 |

---

## Input Methods

| Method | How to use |
|---|---|
| File button | Click **選擇 .txt 檔案** and pick a file |
| Drag & drop | Drop a `.txt` file onto the dashed drop zone |
| Paste | Paste text into the text area, then click **分頁切割** |

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `←` / `↑` | Previous page |
| `→` / `↓` | Next page |
| `Enter` (in jump input) | Jump to page |

---

## Project Structure

```
PageScroll/
├── index.html          # HTML structure
├── styles.css          # Layout, page windows, responsive design
├── script.js           # Pagination logic, navigation, file reading
└── sample_熟能生巧.txt  # Sample text for demo
```

---

## Running Locally

```bash
# Any static file server works
npx serve .
# open http://localhost:3000
```

> No build step, no dependencies — pure HTML / CSS / JS.

---

## License

MIT — see [LICENSE](LICENSE).
