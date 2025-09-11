// Edit book functionality
// Edit book functionality
async function editBook(bookId) {
    try {
        const response = await fetch(`${API_SERVER}/api/admin/books/${bookId}`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch book details');
        }
        
        const book = await response.json();
        
        // Populate the edit form
        const editBookId = document.getElementById('editBookId');
        const editTitle = document.getElementById('editTitle');
        const editBookType = document.getElementById('editBookType');
        const editLevel = document.getElementById('editLevel');
        const editStrand = document.getElementById('editStrand');
        const editQtr = document.getElementById('editQtr');
        const editGenre = document.getElementById('editGenre');
        const editQuantity = document.getElementById('editQuantity');
        const editPublisher = document.getElementById('editPublisher');
        const editDescription = document.getElementById('editDescription');
        const editAuthor = document.getElementById('editAuthor');
        const editLink = document.getElementById('editLink');
        
        if (editBookId) editBookId.value = book.id;
        if (editTitle) editTitle.value = book.title || '';
        if (editBookType) editBookType.value = book.bookType || 'Module';
        if (editLevel) editBookType.value === 'Module' ? editLevel.value = book.level || '' : editLevel.value = '';
        if (editStrand) editBookType.value === 'Module' ? editStrand.value = book.strand || '' : editStrand.value = '';
        if (editQtr) editBookType.value === 'Module' ? editQtr.value = book.qtr || '' : editQtr.value = '';
        if (editGenre) editBookType.value === 'Novel' ? editGenre.value = book.genre || '' : editGenre.value = '';
        if (editQuantity) editQuantity.value = book.quantity || 0;
        if (editPublisher) editPublisher.value = book.publisher || '';
        if (editDescription) editDescription.value = book.description || '';
        if (editAuthor) editAuthor.value = book.author || '';
        if (editLink) editLink.value = book.link || '';
        
        // Show current cover
        const currentCover = document.getElementById('editCurrentCover');
        if (currentCover) {
            if (book.cover) {
                currentCover.src = `${API_SERVER}/api/databasecontent/cover/${book.cover}`;
                currentCover.style.display = 'block';
            } else {
                currentCover.style.display = 'none';
            }
        }

        // Show current file
        const currentFileName = document.getElementById('currentFileName');
        if (currentFileName) {
            if (book.file_path) {
                currentFileName.textContent = book.file_path;
                currentFileName.parentElement.style.display = 'block';
            } else {
                currentFileName.textContent = 'No file uploaded';
                currentFileName.parentElement.style.display = 'block';
            }
        }
        
        // Toggle fields based on book type
        toggleEditFields(editBookType);
        
        // Show the modal
        const modal = document.getElementById('editModal');
        if (modal) {
            modal.style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading book for edit:', error);
        showMessage('Failed to load book details. Please try again.', 'error');
    }
}

// Toggle fields in edit form based on book type
function toggleEditFields(select) {
    const form = select.closest('form');
    if (!form) return;
    
    const showNovel = select.value === 'Novel';
    const genreGroup = form.querySelector('#editGenreGroup');
    const levelGroup = form.querySelector('#editLevelGroup');
    const qtrGroup = form.querySelector('#editQtrGroup');
    const strandGroup = form.querySelector('#editStrandGroup');
    
    if (showNovel) {
        if (genreGroup) genreGroup.style.display = 'block';
        if (levelGroup) levelGroup.style.display = 'none';
        if (qtrGroup) qtrGroup.style.display = 'none';
        if (strandGroup) strandGroup.style.display = 'none';
    } else {
        if (genreGroup) genreGroup.style.display = 'none';
        if (levelGroup) levelGroup.style.display = 'block';
        if (qtrGroup) qtrGroup.style.display = 'block';
        if (strandGroup) strandGroup.style.display = 'block';
    }
}

// Close the edit modal
function closeEditModal() {
    const modal = document.getElementById('editModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Handle edit form submission
// Handle edit form submission
async function handleEditFormSubmission(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const bookId = formData.get('book_id');
    
    try {
        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
        submitBtn.disabled = true;
        
        // Handle cover upload if a new file is selected
        let coverFilename = null;
        const coverFile = formData.get('cover');
        if (coverFile && coverFile.size > 0) {
            const coverFormData = new FormData();
            coverFormData.append('cover', coverFile);
            
            const coverResponse = await fetch(`${API_SERVER}/api/admin/books/upload-cover`, {
                method: 'POST',
                body: coverFormData,
                credentials: 'include'
            });
            
            if (coverResponse.ok) {
                const coverData = await coverResponse.json();
                coverFilename = coverData.filename;
            } else {
                const coverError = await coverResponse.json();
                throw new Error(coverError.error || 'Failed to upload cover');
            }
        }
        
        // Handle file upload if a new file is selected
        let filePathFilename = null;
        const bookFile = formData.get('file_path');
        if (bookFile && bookFile.size > 0) {
            const fileFormData = new FormData();
            fileFormData.append('file', bookFile);
            
            const fileResponse = await fetch(`${API_SERVER}/api/admin/books/upload-file`, {
                method: 'POST',
                body: fileFormData,
                credentials: 'include'
            });
            
            if (fileResponse.ok) {
                const fileData = await fileResponse.json();
                filePathFilename = fileData.filename;
            } else {
                const fileError = await fileResponse.json();
                throw new Error(fileError.error || 'Failed to upload file');
            }
        }
        
        // Convert FormData to JSON for the API
        const bookData = {
            title: formData.get('title'),
            description: formData.get('description') || '',
            quantity: formData.get('quantity'),
            publisher: formData.get('publisher') || '',
            bookType: formData.get('bookType'),
            level: formData.get('level') || '',
            strand: formData.get('strand') || '',
            qtr: formData.get('qtr') || '',
            genre: formData.get('genre') || '',
            author: formData.get('author') || '',
            link: formData.get('link') || ''
        };
        
        // Add filenames if new ones were uploaded
        if (coverFilename) {
            bookData.cover = coverFilename;
        }
        
        if (filePathFilename) {
            bookData.file_path = filePathFilename;
        }
        
        const response = await fetch(`${API_SERVER}/api/admin/books/${bookId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookData),
            credentials: 'include'
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to update book');
        }
        
        // Reload the books list
        await loadBooks();
        closeEditModal();
        
        showMessage('Book updated successfully', 'success');
    } catch (error) {
        console.error('Error updating book:', error);
        showMessage(error.message || 'Failed to update book. Please try again.', 'error');
    } finally {
        const submitBtn = form.querySelector('.submit-btn');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Book';
            submitBtn.disabled = false;
        }
    }
}