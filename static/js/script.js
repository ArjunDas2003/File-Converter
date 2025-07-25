document.addEventListener('DOMContentLoaded', function () {
    const page = document.body.dataset.page;

    if (page === 'images-to-pdf') {
        setupImagesToPdfPage();
    } else if (page === 'mp4-to-mp3') {
        setupSingleFilePage();
    }
});

function setupSingleFilePage() {
    const fileInput = document.getElementById('fileInput');
    const dragDropArea = document.getElementById('dragDropArea');
    const fileInfo = document.getElementById('fileInfo');
    const convertBtn = document.getElementById('convertBtn');
    const form = document.getElementById('converterForm');

    dragDropArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('click', (e) => e.stopPropagation());

    dragDropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dragDropArea.classList.add('dragover');
    });
    dragDropArea.addEventListener('dragleave', () => dragDropArea.classList.remove('dragover'));
    dragDropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dragDropArea.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            fileInput.files = e.dataTransfer.files;
            handleFileSelect();
        }
    });

    fileInput.addEventListener('change', handleFileSelect);

    function handleFileSelect() {
        if (fileInput.files.length > 0) {
            displayFileInfo(fileInput.files[0]);
            convertBtn.disabled = false;
        } else {
            removeFile();
        }
    }

    function displayFileInfo(file) {
        fileInfo.innerHTML = `
            <div class="file-preview">
                <div class="file-icon"><i class="fas fa-file"></i></div>
                <div class="file-details">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${formatFileSize(file.size)}</div>
                </div>
                <button type="button" class="remove-file" id="removeFileBtn"><i class="fas fa-times"></i></button>
            </div>`;
        dragDropArea.style.display = 'none';
        fileInfo.style.display = 'block';
        document.getElementById('removeFileBtn').addEventListener('click', removeFile);
    }

    function removeFile() {
        fileInput.value = '';
        dragDropArea.style.display = 'block';
        fileInfo.style.display = 'none';
        fileInfo.innerHTML = '';
        convertBtn.disabled = true;
    }

    form.addEventListener('submit', () => {
        const btnContent = form.querySelector('.btn-content');
        const loadingSpinner = form.querySelector('.loading-spinner');
        
        btnContent.style.display = 'none';
        loadingSpinner.style.display = 'flex';
        convertBtn.disabled = true;

        window.setTimeout(() => {
            btnContent.style.display = 'flex';
            loadingSpinner.style.display = 'none';
            convertBtn.disabled = fileInput.files.length === 0;
        }, 4000);
    });
}

function setupImagesToPdfPage() {
    const fileInput = document.getElementById('fileInput');
    const dragDropArea = document.getElementById('dragDropArea');
    const addMoreCard = document.getElementById('addMoreCard');
    const previewContainer = document.getElementById('preview');
    const fileOrderInput = document.getElementById('fileOrder');
    const convertBtn = document.getElementById('convertBtn');
    const form = document.getElementById('converterForm');
    let filesMap = new Map();
    let draggedItem = null;

    // Event listeners for uploading files
    dragDropArea.addEventListener('click', () => fileInput.click());
    addMoreCard.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('click', (e) => e.stopPropagation());

    dragDropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dragDropArea.classList.add('dragover');
    });
    dragDropArea.addEventListener('dragleave', () => dragDropArea.classList.remove('dragover'));
    dragDropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dragDropArea.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });
    fileInput.addEventListener('change', () => handleFiles(fileInput.files));

    async function handleFiles(files) {
        const newFiles = [];
        for (const file of files) {
            if (!filesMap.has(file.name) && file.type.startsWith('image/')) {
                filesMap.set(file.name, file);
                newFiles.push(file);
            }
        }

        if (newFiles.length === 0) return;

        const previewPromises = newFiles.map(createPreview);
        await Promise.all(previewPromises);

        updateFileInput();
        updateFileOrderAndIndexes();
        toggleUploadAreas();
    }

    function createPreview(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                previewItem.setAttribute('draggable', 'true');
                previewItem.dataset.filename = file.name;
                previewItem.innerHTML = `
                    <div class="index-overlay"></div>
                    <img src="${e.target.result}" alt="${file.name}">
                    <div class="file-name-overlay">${file.name}</div>
                    <button type="button" class="remove-file-btn" data-filename="${file.name}">&times;</button>
                `;
                previewContainer.insertBefore(previewItem, addMoreCard);
                resolve();
            };
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    }

    previewContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-file-btn')) {
            const filename = e.target.dataset.filename;
            filesMap.delete(filename);
            e.target.parentElement.remove();
            updateFileInput();
            updateFileOrderAndIndexes();
            toggleUploadAreas();
        }
    });

    // Drag and Drop Sorting Logic
    previewContainer.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('preview-item')) {
            draggedItem = e.target;
            setTimeout(() => {
                if(draggedItem) draggedItem.classList.add('dragging');
            }, 0);
        }
    });

    previewContainer.addEventListener('dragend', () => {
        if(draggedItem) {
            draggedItem.classList.remove('dragging');
            draggedItem = null;
            updateFileOrderAndIndexes();
        }
    });

    previewContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(previewContainer, e.clientX, e.clientY);
        const currentDragged = document.querySelector('.dragging');
        if (currentDragged) {
            if (afterElement == null) {
                previewContainer.insertBefore(currentDragged, addMoreCard);
            } else {
                previewContainer.insertBefore(currentDragged, afterElement);
            }
        }
    });

    // FIX: Simplified and more robust reordering logic
    function getDragAfterElement(container, x, y) {
        const draggableElements = [...container.querySelectorAll('.preview-item:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            // Calculate the center of the element
            const offsetX = x - box.left - box.width / 2;
            const offsetY = y - box.top - box.height / 2;

            // Use distance from center for more accurate placement
            const distance = Math.sqrt(offsetX*offsetX + offsetY*offsetY);

            if (distance < closest.distance) {
                return { distance: distance, element: child };
            } else {
                return closest;
            }
        }, { distance: Number.POSITIVE_INFINITY }).element;
    }
    
    function updateFileOrderAndIndexes() {
        const orderedItems = [...previewContainer.querySelectorAll('.preview-item')];
        orderedItems.forEach((item, index) => {
            const indexOverlay = item.querySelector('.index-overlay');
            if(indexOverlay) indexOverlay.textContent = index + 1;
        });
        
        const orderedFilenames = orderedItems.map(item => item.dataset.filename);
        fileOrderInput.value = JSON.stringify(orderedFilenames);
        convertBtn.disabled = orderedFilenames.length === 0;
    }

    function updateFileInput() {
        const dataTransfer = new DataTransfer();
        filesMap.forEach(file => dataTransfer.items.add(file));
        fileInput.files = dataTransfer.files;
    }

    function toggleUploadAreas() {
        if (filesMap.size > 0) {
            dragDropArea.style.display = 'none';
            previewContainer.style.display = 'grid';
        } else {
            dragDropArea.style.display = 'block';
            previewContainer.style.display = 'none';
        }
    }
    
    form.addEventListener('submit', () => {
        const btnContent = form.querySelector('.btn-content');
        const loadingSpinner = form.querySelector('.loading-spinner');
        
        btnContent.style.display = 'none';
        loadingSpinner.style.display = 'flex';
        convertBtn.disabled = true;

        window.setTimeout(() => {
            btnContent.style.display = 'flex';
            loadingSpinner.style.display = 'none';
            const orderedItems = [...previewContainer.querySelectorAll('.preview-item')];
            convertBtn.disabled = orderedItems.length === 0;
        }, 4000);
    });
}

// Helper for file size formatting (used by both pages)
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
