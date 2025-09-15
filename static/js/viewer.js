// PDF Viewer Module
(function() {
    let currentPage = 1;
    let pdfDoc = null;
    let isDarkMode = localStorage.getItem('pdfViewerDarkMode') === 'true';
    let scale = 1.5;

    // Create viewer HTML structure
    function createViewerHTML() {
        const viewerHTML = `
            <div class="pdf-viewer-container ${isDarkMode ? 'dark-mode' : ''}">
                <div class="pdf-toolbar">
                    <div class="pdf-nav">
                        <button id="prevPage" class="pdf-btn" title="Previous Page">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <div class="page-info">
                            <input type="number" id="currentPage" value="1" min="1">
                            <span>of</span>
                            <span id="pageCount">0</span>
                        </div>
                        <button id="nextPage" class="pdf-btn" title="Next Page">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                    <div class="pdf-tools">
                        <button id="zoomOut" class="pdf-btn" title="Zoom Out">
                            <i class="fas fa-search-minus"></i>
                        </button>
                        <button id="zoomIn" class="pdf-btn" title="Zoom In">
                            <i class="fas fa-search-plus"></i>
                        </button>
                        <button id="toggleDarkMode" class="pdf-btn" title="Toggle Dark Mode">
                            <i class="fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}"></i>
                        </button>
                    </div>
                </div>
                <div class="pdf-content">
                    <canvas id="pdfCanvas"></canvas>
                </div>
            </div>
        `;

        document.body.innerHTML = viewerHTML;

        // Add styles
        const styles = `
            <style>
                body, html {
                    margin: 0;
                    padding: 0;
                    height: 100%;
                }
                .pdf-viewer-container {
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    background: #fff;
                    color: #333;
                }
                .pdf-viewer-container.dark-mode {
                    background: #1a1a1a;
                    color: #fff;
                }
                .pdf-toolbar {
                    padding: 10px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #ddd;
                    background: #f8f9fa;
                }
                .dark-mode .pdf-toolbar {
                    background: #2d2d2d;
                    border-color: #444;
                }
                .pdf-nav, .pdf-tools {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .page-info {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                }
                #currentPage {
                    width: 50px;
                    text-align: center;
                    padding: 4px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }
                .dark-mode #currentPage {
                    background: #333;
                    border-color: #555;
                    color: #fff;
                }
                .pdf-btn {
                    padding: 8px 12px;
                    border: none;
                    background: #fff;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    cursor: pointer;
                    color: #333;
                    transition: all 0.2s;
                }
                .dark-mode .pdf-btn {
                    background: #333;
                    border-color: #555;
                    color: #fff;
                }
                .pdf-btn:hover {
                    background: #f0f0f0;
                }
                .dark-mode .pdf-btn:hover {
                    background: #444;
                }
                .pdf-content {
                    flex: 1;
                    overflow: auto;
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                    padding: 20px;
                    background: ${isDarkMode ? '#333' : '#f0f0f0'};
                }
                #pdfCanvas {
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    background: #fff;
                }
                .dark-mode #pdfCanvas {
                    box-shadow: 0 0 10px rgba(0,0,0,0.3);
                }
            </style>
        `;
        document.head.insertAdjacentHTML('beforeend', styles);
    }

    // Initialize PDF viewer
async function initPdfViewer() {
    const urlParams = new URLSearchParams(window.location.search);
    const fileId = urlParams.get('pdf');
    
    if (!fileId) {
        alert('No file identifier provided');
        return;
    }

    try {
        console.log('Loading document:', fileId);
        let docUrl = fileId;

        // Check if it's a direct URL
        if (!fileId.startsWith('http')) {
            docUrl = `${appConfig.apiEndpoint}/api/databasecontent/file/${fileId}`;
        }

        // Check file type and handle accordingly
        if (docUrl.toLowerCase().endsWith('.html')) {
            createHtmlViewer(docUrl);
            return; // Exit early for HTML files
        }

        // Continue with PDF loading
        createViewerHTML();
        
        // Configure PDF.js
        if (!window.pdfjsLib) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }

        const loadingTask = pdfjsLib.getDocument({
            url: docUrl,
            withCredentials: docUrl.includes(appConfig.apiEndpoint)
        });

        pdfDoc = await loadingTask.promise;
        document.getElementById('pageCount').textContent = pdfDoc.numPages;
        renderPage(currentPage);
        setupEventListeners();

    } catch (error) {
        console.error('Error loading document:', error);
        if (fileId.toLowerCase().endsWith('.html')) {
            // Try loading HTML directly if PDF loading fails
            createHtmlViewer(fileId);
        } else {
            alert(`Error loading document: ${error.message}`);
        }
    }
}



function createHtmlViewer(url) {
    const viewerHtml = `
        <div class="html-viewer-container ${isDarkMode ? 'dark-mode' : ''}">
            <div class="html-toolbar">
                <button onclick="history.back()" class="viewer-btn" style="margin-right: 10px;">
                    <i class="fas fa-arrow-left" ></i> Return
                </button>
                <button id="toggleDarkMode" class="viewer-btn">
                    <i class="fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}"></i>
                </button>


            </div>
            <iframe 
                src="${url}" 
                class="html-content"
                sandbox="allow-same-origin allow-scripts"
                style="width: 100%; height: calc(100vh - 50px); border: none;"
            ></iframe>
        </div>
    `;

    document.body.innerHTML = viewerHtml;

    // Add styles
    const styles = `
        <style>
            .html-viewer-container {
                height: 100vh;
                background: ${isDarkMode ? '#1a1a1a' : '#fff'};
                color: ${isDarkMode ? '#fff' : '#000'};
            }
            .html-toolbar {
                height: 50px;
                padding: 0 20px;
                display: flex;
                align-items: center;
                justify-content: flex-end;
                background: ${isDarkMode ? '#2d2d2d' : '#f8f9fa'};
                border-bottom: 1px solid ${isDarkMode ? '#444' : '#ddd'};
            }
            .viewer-btn {
                padding: 8px 12px;
                border: none;
                background: ${isDarkMode ? '#444' : '#f0f0f0ff'};
                color: ${isDarkMode ? '#fff' : '#000'};
                border-radius: 4px;
                cursor: pointer;
            }
            .html-content {
                background: ${isDarkMode ? '' : '#fff'};
            }
            
            .dark-mode .html-content {
                filter: invert(1) hue-rotate(180deg);
            }
        </style>
    `;
    document.head.insertAdjacentHTML('beforeend', styles);

    // Setup dark mode toggle
    document.getElementById('toggleDarkMode')?.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        localStorage.setItem('pdfViewerDarkMode', isDarkMode);
        document.querySelector('.html-viewer-container').classList.toggle('dark-mode');
        document.querySelector('.html-content').style.filter = 
            isDarkMode ? 'invert(1) hue-rotate(180deg)' : 'none';
        location.reload();
    });
}


async function loadAndDisplayPdf(url) {
    // Configure PDF.js
    if (!window.pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    // Load the PDF with appropriate settings
    const loadingTask = pdfjsLib.getDocument({
        url: url,
        withCredentials: url.includes(appConfig.apiEndpoint)
    });

    pdfDoc = await loadingTask.promise;
    document.getElementById('pageCount').textContent = pdfDoc.numPages;
    renderPage(currentPage);
    setupEventListeners();
}

    // Load PDF.js library
    function loadPdfJs() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Render PDF page
    async function renderPage(pageNumber) {
        try {
            const page = await pdfDoc.getPage(pageNumber);
            const canvas = document.getElementById('pdfCanvas');
            const context = canvas.getContext('2d');

            const viewport = page.getViewport({ scale });
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

            currentPage = pageNumber;
            document.getElementById('currentPage').value = pageNumber;

        } catch (error) {
            console.error('Error rendering page:', error);
            alert('Error rendering page');
        }
    }

    // Setup event listeners
    function setupEventListeners() {
        // Page navigation
        document.getElementById('prevPage').addEventListener('click', () => {
            if (currentPage > 1) renderPage(currentPage - 1);
        });

        document.getElementById('nextPage').addEventListener('click', () => {
            if (currentPage < pdfDoc.numPages) renderPage(currentPage + 1);
        });

        document.getElementById('currentPage').addEventListener('change', (e) => {
            const pageNum = parseInt(e.target.value);
            if (pageNum >= 1 && pageNum <= pdfDoc.numPages) renderPage(pageNum);
        });

        // Zoom controls
        document.getElementById('zoomIn').addEventListener('click', () => {
            scale *= 1.2;
            renderPage(currentPage);
        });

        document.getElementById('zoomOut').addEventListener('click', () => {
            scale *= 0.8;
            renderPage(currentPage);
        });

        // Dark mode toggle
        document.getElementById('toggleDarkMode').addEventListener('click', () => {
            isDarkMode = !isDarkMode;
            localStorage.setItem('pdfViewerDarkMode', isDarkMode);
            document.querySelector('.pdf-viewer-container').classList.toggle('dark-mode');
            document.getElementById('toggleDarkMode').innerHTML = 
                `<i class="fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}"></i>`;
            document.querySelector('.pdf-content').style.background = isDarkMode ? '#333' : '#f0f0f0';
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' && currentPage > 1) {
                renderPage(currentPage - 1);
            } else if (e.key === 'ArrowRight' && currentPage < pdfDoc.numPages) {
                renderPage(currentPage + 1);
            }
        });
    }

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', initPdfViewer);
})();