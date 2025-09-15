/**
 * Advanced Search Engine JavaScript
 * Integrates with the Python searchEngine.py backend
 */

class AdvancedSearchEngine {
    constructor() {
        this.apiEndpoint = appConfig.apiEndpoint;
        this.searchModal = null;
        this.searchInput = null;
        this.searchResults = null;
        this.isSearching = false;
    }

    /**
     * Initialize the search engine
     */
    init() {
        this.searchModal = document.getElementById('searchModal');
        this.searchInput = document.getElementById('searchInput');
        this.searchResults = document.getElementById('searchResults');
        
        if (!this.searchModal || !this.searchInput || !this.searchResults) {
            console.error('Search modal elements not found');
            return;
        }

        this.setupEventListeners();
        this.setupSearchForm();
        this.checkBackendHealth();
    }

    /**
     * Check if backend is healthy
     */
    async checkBackendHealth() {
        try {
            const response = await fetch(`${this.apiEndpoint}/api/health`, {
                method: 'GET',
                timeout: 5000
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Backend health:', data);
                if (!data.search_engine_available) {
                    console.warn('Search engine not available, using fallback');
                }
            } else {
                console.warn('Backend health check failed');
            }
        } catch (error) {
            console.error('Backend health check error:', error);
        }
    }

    /**
     * Setup event listeners for the search modal
     */
    setupEventListeners() {
        // Search form submission
        const searchForm = this.searchModal.querySelector('.search-form');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.performSearch();
            });
        }

        // Search button click
        const searchSubmit = document.getElementById('searchSubmit');
        if (searchSubmit) {
            searchSubmit.addEventListener('click', () => {
                this.performSearch();
            });
        }

        // Enter key in search input
        if (this.searchInput) {
            this.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.performSearch();
                }
            });

            // Real-time search suggestions (debounced)
            this.searchInput.addEventListener('input', this.debounce((e) => {
                this.showSearchSuggestions(e.target.value);
            }, 300));
        }

        // Close modal events
        this.setupModalCloseEvents();
    }

    /**
     * Setup modal close event listeners
     */
    setupModalCloseEvents() {
        // Close button
        const closeBtn = document.getElementById('closeSearchModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }

        // Click outside modal
        if (this.searchModal) {
            this.searchModal.addEventListener('click', (e) => {
                if (e.target === this.searchModal) {
                    this.closeModal();
                }
            });
        }

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.searchModal.style.display === 'block') {
                this.closeModal();
            }
        });
    }

    /**
     * Setup search form with enhanced functionality
     */
    setupSearchForm() {
        // Add loading states to buttons
        const searchSubmit = document.getElementById('searchSubmit');
        if (searchSubmit) {
            searchSubmit.addEventListener('click', () => {
                this.setSearchButtonLoading(true);
            });
        }

        // Setup filter change events
        const filters = ['categoryFilter', 'authorFilter', 'yearFilter'];
        filters.forEach(filterId => {
            const filter = document.getElementById(filterId);
            if (filter) {
                filter.addEventListener('change', () => {
                    this.updateSearchPreview();
                });
            }
        });

        // Setup checkbox events
        const checkboxes = ['exactMatch', 'includeDescription'];
        checkboxes.forEach(checkboxId => {
            const checkbox = document.getElementById(checkboxId);
            if (checkbox) {
                checkbox.addEventListener('change', () => {
                    this.updateSearchPreview();
                });
            }
        });
    }

    /**
     * Perform the advanced search
     */
    async performSearch() {
        if (this.isSearching) return;

        const query = this.searchInput.value.trim();
        if (!query) {
            this.showError('Please enter a search term');
            return;
        }

        this.isSearching = true;
        this.setSearchButtonLoading(true);
        this.showLoadingState();

        try {
            const searchParams = this.buildSearchParams();
            console.log('Search params:', searchParams.toString());
            
            const response = await this.fetchSearchResults(searchParams);
            const data = await response.json();
            
            console.log('Search response:', data);
            this.displaySearchResults(data);
            
        } catch (error) {
            console.error('Search error:', error);
            
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                this.showError('Cannot connect to server. Please check if the backend is running.');
            } else if (error.message.includes('timeout')) {
                this.showError('Request timed out. Please try again.');
            } else {
                this.showError('Network error. Please try again.');
            }
        } finally {
            this.isSearching = false;
            this.setSearchButtonLoading(false);
        }
    }

    /**
     * Build search parameters from form
     */
    buildSearchParams() {
        const params = new URLSearchParams();
        
        // Main search query
        const query = this.searchInput.value.trim();
        if (query) params.append('q', query);

        // Filters
        const category = document.getElementById('categoryFilter')?.value;
        if (category) params.append('category', category);

        const author = document.getElementById('authorFilter')?.value;
        if (author) params.append('author', author);

        const year = document.getElementById('yearFilter')?.value;
        if (year) params.append('year', year);

        // Options
        const exactMatch = document.getElementById('exactMatch')?.checked;
        if (exactMatch) params.append('exact', 'true');

        const includeDescription = document.getElementById('includeDescription')?.checked;
        if (includeDescription) params.append('description', 'true');

        const availableOnly = document.getElementById('availableOnly')?.checked;
        if (availableOnly) params.append('available', 'true');

        return params;
    }

    /**
     * Fetch search results from the API
     */
    async fetchSearchResults(params) {
        const url = `${this.apiEndpoint}/api/search?${params.toString()}`;
        console.log('Searching URL:', url);
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                timeout: 10000 // 10 second timeout
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return response;
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    }

    /**
     * Display search results
     */
    displaySearchResults(data) {
        if (!data.books || data.books.length === 0) {
            this.showNoResults(data.message || 'No books found');
            return;
        }

        const resultsHTML = this.generateResultsHTML(data.books, data.total);
        this.searchResults.innerHTML = resultsHTML;
        this.searchResults.style.display = 'block';

        // Add click handlers for result items
        this.setupResultClickHandlers();
    }

    /**
     * Generate HTML for search results
     */
    generateResultsHTML(books, total) {
        const resultsHeader = `
            <div class="search-results-header" style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #e1e5e9;">
                <h3 style="margin: 0; color: #333; font-size: 18px;">Search Results</h3>
                <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Found ${total} book(s)</p>
            </div>
        `;

        const booksHTML = books.map(book => this.generateBookCardHTML(book)).join('');
        
        return resultsHeader + booksHTML;
    }

    /**
     * Generate HTML for individual book card
     */
    generateBookCardHTML(book) {
        const availability = book.quantity > 0 ? 
            `<span style="color: #51cf66; font-weight: 500;">Available (${book.quantity})</span>` : 
            `<span style="color: #ff6b6b; font-weight: 500;">Not Available</span>`;

        const metaInfo = [];
        if (book.bookType) metaInfo.push(book.bookType);
        if (book.level) metaInfo.push(`Grade ${book.level}`);
        if (book.strand) metaInfo.push(book.strand);
        if (book.genre) metaInfo.push(book.genre);

        return `
            <div class="search-result-item" style="border: 1px solid #e1e5e9; border-radius: 12px; padding: 20px; margin-bottom: 15px; background: #f8f9fa; transition: all 0.3s ease; cursor: pointer;" data-book-id="${book.id}">
                <div style="display: flex; gap: 20px; align-items: flex-start;">
                    <div class="book-cover" style="width: 80px; height: 100px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold; flex-shrink: 0; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                        ${book.title ? book.title.charAt(0).toUpperCase() : 'B'}
                    </div>
                    <div class="book-info" style="flex: 1;">
                        <h4 style="margin: 0 0 8px 0; color: #333; font-size: 18px; font-weight: 600;">${book.title || 'Untitled'}</h4>
                        <p style="margin: 0 0 8px 0; color: #666; font-size: 15px;">by ${book.author || 'Unknown Author'}</p>
                        ${metaInfo.length > 0 ? `<p style="margin: 0 0 8px 0; color: #888; font-size: 13px;">${metaInfo.join(' • ')}</p>` : ''}
                        <p style="margin: 0 0 8px 0; color: #555; font-size: 14px; line-height: 1.4;">${book.description ? this.truncateText(book.description, 150) : 'No description available'}</p>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                            <span style="color: #888; font-size: 12px;">ID: ${book.id}</span>
                            ${availability}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Setup click handlers for result items
     */
    setupResultClickHandlers() {
        const resultItems = this.searchResults.querySelectorAll('.search-result-item');
        resultItems.forEach(item => {
            item.addEventListener('click', () => {
                const bookId = item.dataset.bookId;
                this.viewBookDetails(bookId);
            });

            // Add hover effects
            item.addEventListener('mouseenter', () => {
                item.style.transform = 'translateY(-2px)';
                item.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
            });

            item.addEventListener('mouseleave', () => {
                item.style.transform = 'translateY(0)';
                item.style.boxShadow = 'none';
            });
        });
    }

    /**
     * View book details (redirect to books page or show modal)
     */
    viewBookDetails(bookId) {
        // Redirect to books page with the specific book
        window.location.href = `books.html?book=${bookId}`;
    }

    /**
     * Show loading state
     */
    showLoadingState() {
        this.searchResults.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <p style="margin-top: 15px; font-size: 16px;">Searching with AI-powered engine...</p>
            </div>
        `;
        this.searchResults.style.display = 'block';
    }

    /**
     * Show error message
     */
    showError(message) {
        this.searchResults.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #ff6b6b;">
                <div style="font-size: 48px; margin-bottom: 15px;">⚠️</div>
                <p style="font-size: 16px; margin: 0;">${message}</p>
            </div>
        `;
        this.searchResults.style.display = 'block';
    }

    /**
     * Show no results message
     */
    showNoResults(message) {
        this.searchResults.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <div style="font-size: 48px; margin-bottom: 15px;">📚</div>
                <p style="font-size: 16px; margin: 0;">${message}</p>
                <p style="font-size: 14px; margin: 10px 0 0 0; color: #888;">Try different keywords or check your spelling</p>
            </div>
        `;
        this.searchResults.style.display = 'block';
    }

    /**
     * Set search button loading state
     */
    setSearchButtonLoading(loading) {
        const searchSubmit = document.getElementById('searchSubmit');
        if (searchSubmit) {
            if (loading) {
                searchSubmit.innerHTML = 'Searching...';
                searchSubmit.disabled = true;
                searchSubmit.style.opacity = '0.7';
            } else {
                searchSubmit.innerHTML = 'Search';
                searchSubmit.disabled = false;
                searchSubmit.style.opacity = '1';
            }
        }
    }

    /**
     * Update search preview (for real-time feedback)
     */
    updateSearchPreview() {
        // This could show a preview of what will be searched
        // For now, we'll just update the search button state
    }

    /**
     * Show search suggestions (placeholder for future enhancement)
     */
    showSearchSuggestions(query) {
        // This could show autocomplete suggestions
        // For now, it's a placeholder for future enhancement
    }

    /**
     * Close the search modal
     */
    closeModal() {
        if (this.searchModal) {
            this.searchModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    /**
     * Utility function to truncate text
     */
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    /**
     * Debounce utility function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize the search engine when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const searchEngine = new AdvancedSearchEngine();
    searchEngine.init();
    
    // Make it globally available for the existing index.js
    window.advancedSearchEngine = searchEngine;
});

// Add CSS animation for loading spinner
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
