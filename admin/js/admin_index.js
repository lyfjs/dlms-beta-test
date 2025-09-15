let API_SERVER = appConfig.apiEndpoint;

document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, checking authentication...');
    checkAuthStatus();
    setupMenuToggle();
    setupNavigation();
    setupEventListeners();
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await logout();
        });
    }
});

// Global variables
let allBooks = [];
let filteredBooks = [];

// Setup menu toggle functionality
function setupMenuToggle() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (menuToggle && sidebar && mainContent) {
        menuToggle.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                // Mobile behavior - slide in/out
                sidebar.classList.toggle('show');
                menuToggle.classList.toggle('active');
            } else {
                // Desktop behavior - collapse/expand
                sidebar.classList.toggle('collapsed');
                mainContent.classList.toggle('expanded');
                menuToggle.classList.toggle('active');
                
                // Save state to localStorage only for desktop
                const isCollapsed = sidebar.classList.contains('collapsed');
                localStorage.setItem('adminSidebarCollapsed', isCollapsed);
            }
        });
        
        // Restore state from localStorage (desktop only)
        const isCollapsed = localStorage.getItem('adminSidebarCollapsed') === 'true';
        if (isCollapsed && window.innerWidth > 768) {
            sidebar.classList.add('collapsed');
            mainContent.classList.add('expanded');
            menuToggle.classList.add('active');
        }
        
        // Handle responsive behavior
        function handleResize() {
            if (window.innerWidth <= 768) {
                // Mobile: reset to default state
                sidebar.classList.remove('collapsed', 'expanded');
                mainContent.classList.remove('expanded');
                sidebar.classList.remove('show');
                menuToggle.classList.remove('active');
            } else {
                // Desktop: restore collapse state
                sidebar.classList.remove('show');
                const isCollapsed = localStorage.getItem('adminSidebarCollapsed') === 'true';
                if (isCollapsed) {
                    sidebar.classList.add('collapsed');
                    mainContent.classList.add('expanded');
                    menuToggle.classList.add('active');
                } else {
                    sidebar.classList.remove('collapsed');
                    mainContent.classList.remove('expanded');
                    menuToggle.classList.remove('active');
                }
            }
        }
        
        window.addEventListener('resize', handleResize);
        handleResize(); // Initial check
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                    sidebar.classList.remove('show');
                    menuToggle.classList.remove('active');
                }
            }
        });
    }
}

// Setup navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link[data-content]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            link.classList.add('active');
            
            // Get the content type
            const contentType = link.getAttribute('data-content');
            
            // Show the appropriate content
            showContent(contentType);
        });
    });
}

// Show content based on navigation
function showContent(contentType) {
    console.log('Showing content:', contentType);
    
    // Hide all content sections
    const allSections = document.querySelectorAll('.content-section, .dashboard-content');
    allSections.forEach(section => {
        section.style.display = 'none';
        section.classList.remove('visible');
    });
    
    // Show the selected content
    switch (contentType) {
        case 'add-books':
            const addBooksContent = document.getElementById('addBooksContent');
            if (addBooksContent) {
                addBooksContent.style.display = 'block';
                addBooksContent.classList.add('visible');
                initializeAddBooksForm();
            }
            break;
        case 'book-list':
            const bookListContent = document.getElementById('bookListContent');
            if (bookListContent) {
                bookListContent.style.display = 'block';
                bookListContent.classList.add('visible');
                loadBooks();
            }
            break;
        case 'users':
            const usersContent = document.getElementById('usersContent');
            if (usersContent) {
                usersContent.style.display = 'block';
                usersContent.classList.add('visible');
                if (typeof loadUsers === 'function') {
                    loadUsers();
                }
            }
            break;
        case 'requests':
            const requestsContent = document.getElementById('requestsContent');
            if (requestsContent) {
                requestsContent.style.display = 'block';
                requestsContent.classList.add('visible');
                if (typeof loadRequests === 'function') {
                    loadRequests();
                }
            }
            break;
        case 'history':
            const historyContent = document.getElementById('historyContent');
            if (historyContent) {
                historyContent.style.display = 'block';
                historyContent.classList.add('visible');
            }
            break;
        default:
            // Show dashboard
            const dashboardContent = document.getElementById('dashboardContent');
            if (dashboardContent) {
                dashboardContent.style.display = 'block';
                dashboardContent.classList.add('visible');
            }
            break;
    }
}


// Add CSS styles for the request management (add to your existing CSS or create a separate CSS file)
const requestStyles = `
<style>
.status-badge {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
}

.status-pending {
    background-color: #fef3c7;
    color: #92400e;
}

.status-approved {
    background-color: #d1fae5;
    color: #065f46;
}

.status-rejected {
    background-color: #fee2e2;
    color: #991b1b;
}

.status-toReturn {
    background-color: #fef3c7;
    color: #92400e;
}

.status-returned {
    background-color: #e0e7ff;
    color: #3730a3;
}

.student-info {
    display: flex;
    flex-direction: column;
}

.student-name {
    font-weight: 500;
    color: #374151;
}

.student-email {
    font-size: 0.75rem;
    color: #6b7280;
}

.approve-btn {
    background-color: #059669;
    color: white;
}

.approve-btn:hover {
    background-color: #047857;
}

.reject-btn {
    background-color: #dc2626;
    color: white;
}

.reject-btn:hover {
    background-color: #b91c1c;
}

.return-btn {
    background-color: #7c3aed;
    color: white;
}

.return-btn:hover {
    background-color: #6d28d9;
}

.no-data-message {
    text-align: center;
    padding: 2rem;
    color: #6b7280;
    font-style: italic;
}

.requests-table-container {
    overflow-x: auto;
}

.text-muted {
    color: #6b7280;
    font-style: italic;
}
</style>
`;

// Add styles to head if not already added
if (!document.getElementById('requestStyles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'requestStyles';
    styleElement.textContent = requestStyles.replace(/<\/?style>/g, '');
    document.head.appendChild(styleElement);
}




// Setup event listeners for forms and interactions
function setupEventListeners() {
    // Add Books form
    const addBookForm = document.getElementById('addBookForm');
    if (addBookForm) {
        addBookForm.addEventListener('submit', handleAddBookSubmit);
    }

    // Book list search and filters
    const searchInput = document.getElementById('searchInput');
    const filterBookType = document.getElementById('filterBookType');
    const filterStrand = document.getElementById('filterStrand');
    const filterLevel = document.getElementById('filterLevel');
    
    if (searchInput) searchInput.addEventListener('input', filterBooks);
    if (filterBookType) filterBookType.addEventListener('change', filterBooks);
    if (filterStrand) filterStrand.addEventListener('change', filterBooks);
    if (filterLevel) filterLevel.addEventListener('change', filterBooks);

    // Edit modal
    const closeModal = document.getElementById('closeModal');
    if (closeModal) {
        closeModal.addEventListener('click', closeEditModal);
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('editModal');
        if (event.target === modal) {
            closeEditModal();
        }
    });

    // Edit form submission
    const editForm = document.getElementById('editBookForm');
    if (editForm) {
        editForm.addEventListener('submit', handleEditFormSubmission);
    }
}

// Initialize Add Books form
function initializeAddBooksForm() {
    const bookTypeSelect = document.querySelector('#bookType');
    if (bookTypeSelect) {
        toggleFields(bookTypeSelect);
    }
    
    // Setup cover preview
    setupCoverPreview();
}

// Setup cover preview functionality
function setupCoverPreview() {
    const coverInput = document.querySelector('#cover');
    const coverPreview = document.querySelector('#coverPreview');
    
    if (coverInput && coverPreview) {
        coverInput.addEventListener('change', function() {
            const file = coverInput.files && coverInput.files[0];
            if (!file) { 
                coverPreview.src = ''; 
                coverPreview.alt = 'No image selected'; 
                return; 
            }
            const reader = new FileReader();
            reader.onload = function(e) { 
                coverPreview.src = e.target.result; 
                coverPreview.alt = 'Cover preview'; 
            };
            reader.readAsDataURL(file); 
        });
    }
}

async function handleAddBookSubmit(e) {
    e.preventDefault();
    await submitBook();
}

// Update the toggleFields function to remove required attributes
function toggleFields(select) {
    const form = select.closest('form');
    if (!form) return;
    
    const showNovel = select.value === 'Novel';
    const genreGroup = form.querySelector('#genreGroup');
    const levelGroup = form.querySelector('#levelGroup');
    const qtrGroup = form.querySelector('#qtrGroup');
    const strandGroup = form.querySelector('#strandGroup');
    const authorSelect = form.querySelector('.author-group');
    
    if (showNovel) {
        if (genreGroup) genreGroup.style.display = 'block';
        if (levelGroup) levelGroup.style.display = 'none';
        if (qtrGroup) qtrGroup.style.display = 'none';
        if (strandGroup) strandGroup.style.display = 'none';
        if (authorSelect) authorSelect.style.display = 'block';
    } else {
        if (genreGroup) genreGroup.style.display = 'none';
        if (levelGroup) levelGroup.style.display = 'block';
        if (qtrGroup) qtrGroup.style.display = 'block';
        if (strandGroup) strandGroup.style.display = 'block';
        if (authorSelect) authorSelect.style.display = 'none';
    }
}
function validatePdfUrl(input) {
    const url = input.value.toLowerCase();
    if (url && !url.endsWith('.pdf') && !url.endsWith('.html')) {
        input.setCustomValidity('URL must point to a PDF or HTML file (ending with .pdf or .html)');
    } else {
        input.setCustomValidity('');
    }
}
// Update the submitBook function to make all fields optional
async function submitBook() {
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitBtn.disabled = true;
    
    try {
        // Update PDF/HTML URL validation
        const linkInput = document.getElementById('link');
        if (linkInput.value && 
            !linkInput.value.toLowerCase().endsWith('.pdf') && 
            !linkInput.value.toLowerCase().endsWith('.html')) {
            throw new Error('Raw link must point to a PDF or HTML file');
        }
        
    } catch (error) {
        console.error('Error submitting book:', error);
        showMessage(error.message || 'Network error. Please check your connection.', 'error');
    }


    try {
        // Handle file uploads if present
        let coverFilename = null;
        let filePathFilename = null;
        
        const coverFile = document.getElementById('cover').files[0];
        if (coverFile) {
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
            }
        }
        
        const bookFile = document.getElementById('file_path').files[0];
        if (bookFile) {
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
            }
        }
        
        // Create FormData with optional fields
        const formData = new FormData();
        const fields = {
            'title': document.getElementById('title').value || '',
            'description': document.getElementById('description').value || '',
            'quantity': document.getElementById('quantity').value || '0',
            'publisher': document.getElementById('publisher').value || '',
            'bookType': document.getElementById('bookType').value || '',
            'link': document.getElementById('link').value || '',
            'genre': document.getElementById('genre')?.value || '',
            'author': document.getElementById('author')?.value || '',
            'level': document.getElementById('level')?.value || '',
            'strand': document.getElementById('strand')?.value || '',
            'qtr': document.getElementById('qtr')?.value || ''
        };
        
        // Append non-empty values to FormData
        Object.entries(fields).forEach(([key, value]) => {
            formData.append(key, value);
        });
        
        // Add filenames if files were uploaded
        if (coverFilename) formData.append('cover_filename', coverFilename);
        if (filePathFilename) formData.append('file_path_filename', filePathFilename);
        
        const response = await fetch(`${API_SERVER}/api/admin/books`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage(data.message || 'Book added successfully!', 'success');
            document.getElementById('addBookForm').reset();
            const coverPreview = document.getElementById('coverPreview');
            if (coverPreview) {
                coverPreview.src = '';
                coverPreview.alt = 'No image selected';
            }
            toggleFields(document.getElementById('bookType'));
        } else {
            showMessage(data.error || 'Failed to add book. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error submitting book:', error);
        showMessage(error.message || 'Network error. Please check your connection.', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Toggle fields based on book type
function toggleFields(select) {
    const form = select.closest('form');
    if (!form) return;
    
    const showNovel = select.value === 'Novel';
    const genreGroup = form.querySelector('#genreGroup');
    const levelGroup = form.querySelector('#levelGroup');
    const qtrGroup = form.querySelector('#qtrGroup');
    const strandGroup = form.querySelector('#strandGroup');
    
    const levelSelect = form.querySelector('#level');
    const qtrSelect = form.querySelector('#qtr');
    const strandSelect = form.querySelector('#strand');
    const genreSelect = form.querySelector('#genre');
    const authorSelect = form.querySelector('.author-group');
    
    if (showNovel) {
        if (genreGroup) genreGroup.style.display = 'block';
        if (levelGroup) levelGroup.style.display = 'none';
        if (qtrGroup) qtrGroup.style.display = 'none';
        if (strandGroup) strandGroup.style.display = 'none';
        if (authorSelect) authorSelect.style.display = 'block';
        
        if (levelSelect) levelSelect.removeAttribute('required');
        if (qtrSelect) qtrSelect.removeAttribute('required');
        if (strandSelect) strandSelect.removeAttribute('required');
        if (genreSelect) genreSelect.setAttribute('required', 'required');
    } else {
        if (genreGroup) genreGroup.style.display = 'none';
        if (levelGroup) levelGroup.style.display = 'block';
        if (qtrGroup) qtrGroup.style.display = 'block';
        if (strandGroup) strandGroup.style.display = 'block';
        if (authorSelect) authorSelect.style.display = 'none';
        
        if (levelSelect) levelSelect.setAttribute('required', 'required');
        if (qtrSelect) qtrSelect.setAttribute('required', 'required');
        if (strandSelect) strandSelect.setAttribute('required', 'required');
        if (genreSelect) genreSelect.removeAttribute('required');
    }
}

// Load books from API
async function loadBooks() {
    showLoading(true);
    
    try {
        const response = await fetch(`${API_SERVER}/api/admin/books`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch books');
        }
        
        const books = await response.json();
        allBooks = books || [];
        filteredBooks = [...allBooks];
        
        displayBooks();
        
    } catch (error) {
        console.error('Error loading books:', error);
        showError('Failed to load books. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Display books in the table
// Display books in the table
function displayBooks() {
    const tbody = document.getElementById('booksTableBody');
    const noBooksMessage = document.getElementById('noBooksMessage');
    
    if (!tbody || !noBooksMessage) return;
    
    if (filteredBooks.length === 0) {
        tbody.innerHTML = '';
        noBooksMessage.style.display = 'block';
        return;
    }
    
    noBooksMessage.style.display = 'none';
    
    tbody.innerHTML = filteredBooks.map(book => `
        <tr>
            <td>
                ${book.cover ? 
                    `<img src="${API_SERVER}/api/databasecontent/cover/${book.cover}" alt="Book cover" class="book-cover-thumb">` : 
                    '<div class="no-cover">No Cover</div>'
                }
            </td>
            <td>${escapeHtml(book.title)}</td>
            <td>${escapeHtml(book.bookType || 'N/A')}</td>
            <td>${escapeHtml(book.level || 'N/A')}</td>
            <td>${escapeHtml(book.strand || 'N/A')}</td>
            <td>${escapeHtml(book.qtr || 'N/A')}</td>
            <td>${escapeHtml(book.genre || 'N/A')}</td>
            <td>${book.quantity}</td>
            <td>${escapeHtml(book.publisher)}</td>
            <td>${escapeHtml(book.author || 'N/A')}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editBook(${book.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="action-btn delete-btn" onclick="deleteBook(${book.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        </tr>
    `).join('');
}

// Filter books based on search and filter criteria
function filterBooks() {
    const searchInput = document.getElementById('searchInput');
    const filterBookType = document.getElementById('filterBookType');
    const filterStrand = document.getElementById('filterStrand');
    const filterLevel = document.getElementById('filterLevel');
    
    if (!searchInput || !filterBookType || !filterStrand || !filterLevel) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const bookType = filterBookType.value;
    const strand = filterStrand.value;
    const level = filterLevel.value;
    
    filteredBooks = allBooks.filter(book => {
        const matchesSearch = !searchTerm || 
            book.title.toLowerCase().includes(searchTerm) ||
            (book.description && book.description.toLowerCase().includes(searchTerm)) ||
            book.publisher.toLowerCase().includes(searchTerm);
            
        const matchesBookType = !bookType || book.bookType === bookType;
        const matchesStrand = !strand || book.strand === strand;
        const matchesLevel = !level || book.level == level;
        
        return matchesSearch && matchesBookType && matchesStrand && matchesLevel;
    });
    
    displayBooks();
}






// Delete book functionality
async function deleteBook(bookId) {
    if (!confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_SERVER}/api/admin/books/${bookId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to delete book');
        }
        
        // Remove the book from the list
        allBooks = allBooks.filter(book => book.id !== bookId);
        filteredBooks = filteredBooks.filter(book => book.id !== bookId);
        displayBooks();
        
        showMessage('Book deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting book:', error);
        showMessage(error.message || 'Failed to delete book. Please try again.', 'error');
    }
}





// Utility function to escape HTML
function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show/hide loading indicator
function showLoading(show) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const booksTable = document.getElementById('booksTable');
    
    if (loadingIndicator) loadingIndicator.style.display = show ? 'flex' : 'none';
    if (booksTable) booksTable.style.display = show ? 'none' : 'table';
}

// Show error message
function showError(message) {
    const tbody = document.getElementById('booksTableBody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; color: #dc2626; padding: 2rem;">
                    <i class="fas fa-exclamation-circle"></i> ${message}
                </td>
            </tr>
        `;
    }
}

// Show message function for success/error notifications
function showMessage(message, type) {
    // Create message element if it doesn't exist
    let messageElement = document.getElementById('messageNotification');
    if (!messageElement) {
        messageElement = document.createElement('div');
        messageElement.id = 'messageNotification';
        messageElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            max-width: 300px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;
        document.body.appendChild(messageElement);
    }
    
    // Set message content and style
    messageElement.textContent = message;
    messageElement.style.background = type === 'success' ? '#059669' : '#dc2626';
    
    // Show message
    messageElement.style.display = 'block';
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        messageElement.style.display = 'none';
    }, 3000);
}

// Check if admin is logged in
function checkAuthStatus() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    const admin = JSON.parse(localStorage.getItem('admin') || '{}');
    
    if (isLoggedIn && admin.id) {
        console.log('Admin authenticated:', admin);
        
        if (admin.superadmin) {
            console.log('Superadmin is true');
        } else {
            console.log('Superadmin is false');
        }
        
        updateUI(admin);
        setupUserAccess(admin.superadmin); // Add this line
    } else {
        console.log('Admin not authenticated, redirecting to login');
        redirectToLogin();
    }
}

// You'll also need to update the login process to store the superadmin flag
// Look for where the login response is handled and update it to include superadmin
// This is typically in your admin_login.js file, but if it's in this file, find where:
// localStorage.setItem('admin', JSON.stringify(adminData));
// and make sure it includes the superadmin flag

async function logout() {
    try {
        console.log('Logging out...');
        const response = await fetch(`${API_SERVER}/api/admin/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        console.log('Logout response:', response.status);
    } catch (error) {
        console.warn('Logout request failed:', error);
    }
    
    // Clear local storage
    localStorage.removeItem('admin');
    localStorage.removeItem('adminLoggedIn');
    
    // Always redirect regardless of API response
    window.location.href = 'admin_login.html';
}

function updateUI(admin) {
    console.log('Updating UI with admin data:', admin);
    
    // Update welcome message
    const topRight = document.querySelector('.topbar-right');
    if (topRight && admin?.username) {
        topRight.textContent = `Welcome, ${admin.username}`;
    }
    
    // Show dashboard
    const dashboard = document.getElementById('dashboardContent');
    if (dashboard) {
        dashboard.classList.add('visible');
        console.log('Dashboard shown');
    }
}

function redirectToLogin() {
    console.log('Redirecting to login page');
    window.location.href = 'admin_login.html';
}

// Make functions globally available
window.editBook = editBook;
window.deleteBook = deleteBook;
window.closeEditModal = closeEditModal;
window.toggleEditFields = toggleEditFields;
window.toggleFields = toggleFields;