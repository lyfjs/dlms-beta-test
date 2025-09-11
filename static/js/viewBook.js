function resetViewState() {
    const detailsContainer = document.getElementById('bookDetailsContainer');
    const commentsSection = document.getElementById('commentsSection');
    const viewCommentsBtn = document.getElementById('viewCommentsBtn');
    const addCommentBtn = document.getElementById('addCommentBtn');
    const addCommentForm = document.getElementById('addCommentForm');
    
    // Reset to book details view
    detailsContainer.style.display = 'block';
    commentsSection.style.display = 'none';
    viewCommentsBtn.innerHTML = '<i class="fas fa-comments"></i> View Comments';
    
    // Reset comment form
    if (addCommentBtn) addCommentBtn.style.display = 'none';
    if (addCommentForm) addCommentForm.style.display = 'none';
}
// Book Popup Module - Handles the popup display with dynamic API data
(function() {

    
    let currentBookData = null;

    // Create popup HTML structure
    function createPopupHTML() {
        const popupHTML = `
            <div id="bookPopup" class="book-popup" style="display: none;">
                <div class="popup-overlay"></div>
                <div class="popup-content">
                    <div class="popup-header">
                        <h2 id="popupTitle">Book Details</h2>
                        <button class="popup-close" id="popupClose">&times;</button>
                    </div>
                    <div class="popup-body">
                        <div id="popupLoading" class="loading-spinner" style="display: none;">
                            <div class="spinner"></div>
                            <p>Loading book details...</p>
                        </div>
                        <div class="book-details-container" id="bookDetailsContainer">
                            <div class="book-cover-section">
                                <img id="popupCover" class="book-cover-image" src="" alt="Book Cover">
                            </div>
                            <div class="book-info-section">
                                <div class="book-info-item">
                                    <label>Title:</label>
                                    <span id="popupBookTitle">-</span>
                                </div>
                                <div class="book-info-item">
                                    <label>Type:</label>
                                    <span id="popupBookType">-</span>
                                </div>
                                <div class="book-info-item" id="popupLevelItem" style="display: none;">
                                    <label>Grade Level:</label>
                                    <span id="popupLevel">-</span>
                                </div>
                                <div class="book-info-item" id="popupStrandItem" style="display: none;">
                                    <label>Strand:</label>
                                    <span id="popupStrand">-</span>
                                </div>
                                <div class="book-info-item" id="popupQuarterItem" style="display: none;">
                                    <label>Quarter:</label>
                                    <span id="popupQuarter">-</span>
                                </div>
                                <div class="book-info-item" id="popupGenreItem" style="display: none;">
                                    <label>Genre:</label>
                                    <span id="popupGenre">-</span>
                                </div>
                                <div class="book-info-item" id="popupAuthorItem" style="display: none;">
                                    <label>Author:</label>
                                    <span id="popupAuthor">-</span>
                                </div>
                                <div class="book-info-item" id="popupPublisherItem" style="display: none;">
                                    <label>Publisher:</label>
                                    <span id="popupPublisher">-</span>
                                </div>
                                <div class="book-info-item" id="popupIsbnItem" style="display: none;">
                                    <label>ISBN:</label>
                                    <span id="popupIsbn">-</span>
                                </div>
                                <div class="book-info-item" id="popupPublicationItem" style="display: none;">
                                    <label>Publication Date:</label>
                                    <span id="popupPublication">-</span>
                                </div>
                                <div class="book-info-item">
                                    <label>Quantity Available:</label>
                                    <span id="popupQuantity" class="quantity-badge">-</span>
                                </div>
                                <div class="book-info-item" id="popupStatusItem" style="display: none;">
                                    <label>Status:</label>
                                    <span id="popupStatus" class="status-badge">-</span>
                                </div>
                                <div class="book-info-item" id="popupDescriptionItem">
                                    <label>Description:</label>
                                    <div id="popupDescription" class="description-text">-</div>
                                </div>
                            </div>
                        </div>
                        <!-- Comments section - now toggleable -->
                        <div class="comments-section" id="commentsSection" style="display: none;">
                            <div class="comments-header">
                                <h3><i class="fas fa-comments"></i> Comments</h3>
                            </div>
                            <div class="add-comment-form" id="addCommentForm" style="display: none;">
                                <div class="comment-input-group">
                                    <textarea id="commentTextarea" placeholder="Share your thoughts about this book..." 
                                              class="comment-textarea" rows="3" maxlength="500"></textarea>
                                    <div class="comment-actions">
                                        <button type="button" id="submitCommentBtn" class="btn btn-primary">
                                            <i class="fas fa-paper-plane"></i> Post Comment
                                        </button>
                                        <button type="button" id="cancelCommentBtn" class="btn btn-secondary">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="comments-list" id="commentsList">
                                <div class="loading-comments">
                                    <i class="fas fa-spinner fa-spin"></i> Loading comments...
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="popup-footer">
                        <button class="btn btn-outline" id="viewCommentsBtn">
                            <i class="fas fa-comments"></i> View Comments
                        </button>
                        <button class="btn btn-outline" id="addCommentBtn" style="display: none;">
                            <i class="fas fa-comment"></i> Add Comment
                        </button>
                        <button class="btn btn-primary" id="popupBorrowBtn" style="display: none;">
                            Request Borrow
                        </button>
                        <button class="btn btn-secondary" id="popupCloseBtn">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add popup to body if it doesn't exist
        if (!document.getElementById('bookPopup')) {
            document.body.insertAdjacentHTML('beforeend', popupHTML);
        }
    }

    // Show popup with book data
    function showBookPopup(bookData, isLoading = false) {
        currentBookData = bookData;
        
        const popup = document.getElementById('bookPopup');
        const loadingDiv = document.getElementById('popupLoading');
        const detailsContainer = document.getElementById('bookDetailsContainer');
        const commentsSection = document.getElementById('commentsSection');
        
        if (isLoading) {
            loadingDiv.style.display = 'block';
            detailsContainer.style.display = 'none';
            commentsSection.style.display = 'none';
            popup.style.display = 'block';
            document.body.style.overflow = 'hidden';
            return;
        }
        
        // Hide loading and show book details by default
        loadingDiv.style.display = 'none';
        detailsContainer.style.display = 'block';
        commentsSection.style.display = 'none';
        
        
        // Populate popup with book data
        document.getElementById('popupTitle').textContent = bookData.title || 'Book Details';
        document.getElementById('popupBookTitle').textContent = bookData.title || '-';
        document.getElementById('popupBookType').textContent = bookData.bookType || '-';
        
        // Handle cover image using shared utility
        const coverImg = document.getElementById('popupCover');
        if (bookData.cover) {
            const coverUrl = window.BookUtils ? 
                window.BookUtils.resolveCoverUrl(bookData.cover) : 
                bookData.cover;
            coverImg.src = coverUrl;
            coverImg.style.display = 'block';
            coverImg.onerror = function() {
                this.style.display = 'none';
            };
        } else {
            coverImg.style.display = 'none';
        }

        


        // Populate all fields
        populateField('popupQuantity', bookData.quantity || bookData.stock || '0');
        populateField('popupDescription', bookData.description || 'No description available.');
        
        // Optional fields - show only if data exists
        populateOptionalField('popupAuthorItem', 'popupAuthor', bookData.author);
        populateOptionalField('popupPublisherItem', 'popupPublisher', bookData.publisher);
        populateOptionalField('popupIsbnItem', 'popupIsbn', bookData.isbn);
        populateOptionalField('popupPublicationItem', 'popupPublication', 
            bookData.publicationDate || bookData.publishedDate);
        populateOptionalField('popupStatusItem', 'popupStatus', bookData.status);

        // Show/hide fields based on book type
        const levelItem = document.getElementById('popupLevelItem');
        const strandItem = document.getElementById('popupStrandItem');
        const quarterItem = document.getElementById('popupQuarterItem');
        const genreItem = document.getElementById('popupGenreItem');

        // Reset all conditional fields
        levelItem.style.display = 'none';
        strandItem.style.display = 'none';
        quarterItem.style.display = 'none';
        genreItem.style.display = 'none';

        if (bookData.bookType === 'Module') {
            // Show module-specific fields
            if (bookData.level) {
                levelItem.style.display = 'block';
                document.getElementById('popupLevel').textContent = `Grade ${bookData.level}`;
            }
            if (bookData.strand) {
                strandItem.style.display = 'block';
                document.getElementById('popupStrand').textContent = bookData.strand;
            }
            if (bookData.qtr || bookData.quarter) {
                quarterItem.style.display = 'block';
                const quarter = bookData.qtr || bookData.quarter;
                document.getElementById('popupQuarter').textContent = 
                    quarter.toString().replace('qtr', 'Quarter ').replace(/^(\d+)$/, 'Quarter $1');
            }
        } else if (bookData.bookType === 'Novel' && bookData.genre) {
            // Show novel-specific fields
            genreItem.style.display = 'block';
            document.getElementById('popupGenre').textContent = bookData.genre;
        }

        // Handle buttons
        const borrowBtn = document.getElementById('popupBorrowBtn');
        const addCommentBtn = document.getElementById('addCommentBtn');
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const hasQuantity = parseInt(bookData.quantity || bookData.stock || 0) > 0;
        
        // Show/hide borrow button
        if (isLoggedIn && hasQuantity) {
            borrowBtn.style.display = 'inline-block';
        } else {
            borrowBtn.style.display = 'none';
        }

        // Show/hide comment button
        if (isLoggedIn) {
            addCommentBtn.style.display = 'inline-block';
        } else {
            addCommentBtn.style.display = 'none';
        }

        // Update quantity badge styling
        const quantitySpan = document.getElementById('popupQuantity');
        const quantity = parseInt(bookData.quantity || bookData.stock || 0);
        quantitySpan.className = `quantity-badge ${quantity > 0 ? 'available' : 'unavailable'}`;

        // Setup event listeners for this popup instance
        setupPopupButtonListeners(bookData);

        // Load comments
        if (bookData.id) {
            loadBookComments(bookData.id);
        }

        // Show popup
        popup.style.display = 'block';
        document.body.style.overflow = 'hidden';
    } 


    function toggleCommentsView() {
        const detailsContainer = document.getElementById('bookDetailsContainer');
        const commentsSection = document.getElementById('commentsSection');
        const viewCommentsBtn = document.getElementById('viewCommentsBtn');
        const addCommentBtn = document.getElementById('addCommentBtn');
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        
        const isCommentsVisible = commentsSection.style.display === 'block';
        
        if (isCommentsVisible) {
            // Hide comments, show book details
            commentsSection.style.display = 'none';
            detailsContainer.style.display = 'block';
            viewCommentsBtn.innerHTML = '<i class="fas fa-comments"></i> View Comments';
            
            // Hide add comment button and form
            if (addCommentBtn) addCommentBtn.style.display = 'none';
            const addCommentForm = document.getElementById('addCommentForm');
            if (addCommentForm) addCommentForm.style.display = 'none';
            
        } else {
            // Show comments, hide book details
            detailsContainer.style.display = 'none';
            commentsSection.style.display = 'block';
            viewCommentsBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Hide Comments';
            
            // Show add comment button if logged in
            if (isLoggedIn && addCommentBtn) {
                addCommentBtn.style.display = 'inline-block';
            }
        }
    }



    // Setup button event listeners for the current popup
    function setupPopupButtonListeners(bookData) {
        const borrowBtn = document.getElementById('popupBorrowBtn');
        const addCommentBtn = document.getElementById('addCommentBtn');
        const viewCommentsBtn = document.getElementById('viewCommentsBtn');
        const addCommentForm = document.getElementById('addCommentForm');
        const submitCommentBtn = document.getElementById('submitCommentBtn');
        const cancelCommentBtn = document.getElementById('cancelCommentBtn');
        const commentTextarea = document.getElementById('commentTextarea');
    
        // Remove existing event listeners by cloning elements
        const newBorrowBtn = borrowBtn.cloneNode(true);
        const newAddCommentBtn = addCommentBtn.cloneNode(true);
        const newViewCommentsBtn = viewCommentsBtn.cloneNode(true);
        const newSubmitCommentBtn = submitCommentBtn.cloneNode(true);
        const newCancelCommentBtn = cancelCommentBtn.cloneNode(true);
        
        borrowBtn.parentNode.replaceChild(newBorrowBtn, borrowBtn);
        addCommentBtn.parentNode.replaceChild(newAddCommentBtn, addCommentBtn);
        viewCommentsBtn.parentNode.replaceChild(newViewCommentsBtn, viewCommentsBtn);
        submitCommentBtn.parentNode.replaceChild(newSubmitCommentBtn, submitCommentBtn);
        cancelCommentBtn.parentNode.replaceChild(newCancelCommentBtn, cancelCommentBtn);
    
        // Add new event listeners
        newBorrowBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleBorrowRequest(bookData);
        });
    
        // View/Hide Comments toggle
        newViewCommentsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleCommentsView();
        });
    
        newAddCommentBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            if (!isLoggedIn) {
                alert('Please log in to add comments');
                return;
            }
            
            addCommentForm.style.display = 'block';
            commentTextarea.focus();
            newAddCommentBtn.style.display = 'none';
        });
    
        newCancelCommentBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            addCommentForm.style.display = 'none';
            newAddCommentBtn.style.display = 'inline-block';
            commentTextarea.value = '';
        });
    
        newSubmitCommentBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            submitComment(bookData.id);
        });
    
        // Handle Enter key in textarea (Ctrl+Enter to submit)
        commentTextarea.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                submitComment(bookData.id);
            }
        });
    }

    // Helper function to populate a field
    function populateField(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            if (element.tagName.toLowerCase() === 'div') {
                element.innerHTML = value;
            } else {
                element.textContent = value;
            }
        }
    }

    // Helper function to populate optional fields
    function populateOptionalField(containerElementId, valueElementId, value) {
        const container = document.getElementById(containerElementId);
        const valueElement = document.getElementById(valueElementId);
        
        if (value && value !== '' && value !== '-') {
            container.style.display = 'block';
            valueElement.textContent = value;
        } else {
            container.style.display = 'none';
        }
    }

    // Handle borrow request
    async function handleBorrowRequest(bookData) {
        if (!bookData || !bookData.id) {
            alert('Error: Book data not available');
            return;
        }

        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (!user.id) {
                alert('Error: User not properly logged in');
                return;
            }

            const API_BASE_URL = appConfig.apiEndpoint + '/api';
            
            // Show loading state
            const borrowBtn = document.getElementById('popupBorrowBtn');
            const originalText = borrowBtn.innerHTML;
            borrowBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            borrowBtn.disabled = true;

            const response = await fetch(`${API_BASE_URL}/borrow`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    bookId: bookData.id,
                    userId: user.id
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                alert('Borrow request submitted successfully!');
                hideBookPopup();
                // Optionally refresh the book list to update quantities
                if (window.location.pathname.includes('books.html')) {
                    window.location.reload();
                }
            } else {
                const error = await response.json();
                alert(`Error: ${error.message || error.error || 'Failed to submit borrow request'}`);
            }
        } catch (error) {
            console.error('Error submitting borrow request:', error);
            alert('Error submitting borrow request. Please try again.');
        } finally {
            // Reset button state
            const borrowBtn = document.getElementById('popupBorrowBtn');
            if (borrowBtn) {
                borrowBtn.innerHTML = 'Request Borrow';
                borrowBtn.disabled = false;
            }
        }
    }

    // Load comments for a book
    async function loadBookComments(bookId) {
        if (!bookId) return;
        
        const commentsList = document.getElementById('commentsList');
        
        try {
            const API_BASE_URL = appConfig.apiEndpoint + '/api';
            const response = await fetch(`${API_BASE_URL}/books/${bookId}/comments`, {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Failed to load comments');
            }
            
            const comments = await response.json();
            displayComments(comments);
            
        } catch (error) {
            console.error('Error loading comments:', error);
            commentsList.innerHTML = `
                <div class="comments-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load comments</p>
                </div>
            `;
        }
    }

    // Display comments in the list
    function displayComments(comments) {
        const commentsList = document.getElementById('commentsList');
        
        if (!comments || comments.length === 0) {
            commentsList.innerHTML = `
                <div class="no-comments">
                    <i class="fas fa-comment-slash"></i>
                    <p>No comments yet. Be the first to share your thoughts!</p>
                </div>
            `;
            return;
        }
        
        commentsList.innerHTML = comments.map(comment => `
            <div class="comment-item">
                <div class="comment-header">
                    <div class="comment-author">
                        <i class="fas fa-user-circle"></i>
                        <span class="author-name">${escapeHtml(comment.user_name || comment.username || 'Anonymous')}</span>
                    </div>
                    <div class="comment-date">
                        <i class="fas fa-clock"></i>
                        <span>${formatCommentDate(comment.created_at)}</span>
                    </div>
                </div>
                <div class="comment-content">
                    <p>${escapeHtml(comment.comment)}</p>
                    ${comment.sub_comment ? `<div class="sub-comment">${escapeHtml(comment.sub_comment)}</div>` : ''}
                </div>
            </div>
        `).join('');
    }

    // Submit a new comment
    async function submitComment(bookId) {
        const commentTextarea = document.getElementById('commentTextarea');
        const submitBtn = document.getElementById('submitCommentBtn');
        const commentText = commentTextarea.value.trim();
        
        if (!commentText) {
            alert('Please enter a comment');
            return;
        }
        
        if (commentText.length > 500) {
            alert('Comment is too long. Maximum 500 characters allowed.');
            return;
        }
        
        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';
        
        try {
            const API_BASE_URL = appConfig.apiEndpoint + '/api';
            const response = await fetch(`${API_BASE_URL}/books/${bookId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    comment: commentText
                })
            });
            
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to post comment');
            }
            
            // Clear form and hide it
            commentTextarea.value = '';
            document.getElementById('addCommentForm').style.display = 'none';
            document.getElementById('addCommentBtn').style.display = 'inline-block';
            
            // Reload comments
            await loadBookComments(bookId);
            
            // Show success message
            showCommentMessage('Comment posted successfully!', 'success');
            
        } catch (error) {
            console.error('Error posting comment:', error);
            showCommentMessage(error.message || 'Failed to post comment', 'error');
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Post Comment';
        }
    }

    // Format comment date
    function formatCommentDate(dateString) {
        if (!dateString) return 'Unknown date';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = now - date;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        
        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        
        // For older dates, show the actual date
        return date.toLocaleDateString();
    }

    // Show comment message
    function showCommentMessage(message, type) {
        // Create or get existing message element
        let messageElement = document.getElementById('commentMessage');
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.id = 'commentMessage';
            messageElement.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                padding: 12px 16px;
                border-radius: 6px;
                color: white;
                font-weight: 500;
                z-index: 1100;
                max-width: 300px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                transform: translateX(100%);
                transition: transform 0.3s ease-in-out;
            `;
            document.body.appendChild(messageElement);
        }
        
        // Set message content and style
        messageElement.textContent = message;
        messageElement.style.background = type === 'success' ? '#059669' : '#dc2626';
        
        // Show message with animation
        setTimeout(() => {
            messageElement.style.transform = 'translateX(0)';
        }, 10);
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            messageElement.style.transform = 'translateX(100%)';
        }, 3000);
    }

    // Helper function to escape HTML
    function escapeHtml(text) {
        if (text === null || text === undefined) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Hide popup
    function hideBookPopup() {
        const popup = document.getElementById('bookPopup');
        if (popup) {
            popup.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        currentBookData = null;
    }

    // Setup event listeners
    function setupPopupEventListeners() {
        const closeBtn = document.getElementById('popupClose');
        const closeBtnFooter = document.getElementById('popupCloseBtn');
        const overlay = document.querySelector('.popup-overlay');
        
        if (closeBtn) closeBtn.addEventListener('click', hideBookPopup);
        if (closeBtnFooter) closeBtnFooter.addEventListener('click', hideBookPopup);
        if (overlay) overlay.addEventListener('click', hideBookPopup);
        
        // ESC key to close
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const popup = document.getElementById('bookPopup');
                if (popup && popup.style.display === 'block') {
                    hideBookPopup();
                }
            }
        });
    }

    // Initialize popup when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        createPopupHTML();
        setupPopupEventListeners();
    });

    // Export popup functionality
    window.BookPopup = {
        show: showBookPopup,
        hide: hideBookPopup
    };

    // Also export the individual functions for direct access
    window.showBookPopup = showBookPopup;
    window.hideBookPopup = hideBookPopup;
})();