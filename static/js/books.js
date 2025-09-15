// API Configuration
const API_BASE_URL = appConfig.apiEndpoint + '/api';

// Shared utility functions
const BookUtils = {
    resolveCoverUrl(cover) {
        if (!cover) return '';
        if (cover.startsWith('databasecontent/')) return `${API_BASE_URL}/${cover}`;
        if (cover.startsWith('static/')) return cover;
        if (cover.startsWith('./') || cover.startsWith('../')) return cover;
        if (cover.includes('/')) return cover.replace(/^\/+/, '');
        
        return `${API_BASE_URL}/databasecontent/cover/${cover}`;
    },

    async fetchBookDetails(bookId) {
        try {
            const response = await fetch(`${API_BASE_URL}/books/${bookId}`);
            if (response.ok) {
                return await response.json();
            }
            throw new Error('Failed to fetch book details');
        } catch (error) {
            console.error('Error fetching book details:', error);
            return null;
        }
    }
};

// Main books functionality
(function() {
    const searchInput = document.getElementById('searchInput');
    const filterBookType = document.getElementById('filterBookType');
    const filterStrand = document.getElementById('filterStrand');
    const filterGenre = document.getElementById('filterGenre');
    const filterLevel = document.getElementById('filterlevel');
    const bookList = document.getElementById('bookList');

    let booksData = [];

    // Check authentication status on page load
    document.addEventListener('DOMContentLoaded', function() {
        checkAuthStatus();
        setupHamburgerMenu(); // Add hamburger menu setup
        loadBooks();
        setupEventListeners();
    });

    function setupHamburgerMenu() {
        const menuToggle = document.getElementById('menuToggle');
        const navMenu = document.getElementById('navMenu');
        
        if (menuToggle && navMenu) {
            menuToggle.addEventListener('click', function() {
                navMenu.classList.toggle('show');
                menuToggle.classList.toggle('active');
            });
            
            const navLinks = navMenu.querySelectorAll('a');
            navLinks.forEach(link => {
                link.addEventListener('click', function() {
                    navMenu.classList.remove('show');
                    menuToggle.classList.remove('active');
                });
            });
            
            window.addEventListener('resize', function() {
                if (window.innerWidth > 768) {
                    navMenu.classList.remove('show');
                    menuToggle.classList.remove('active');
                }
            });
        }
    }

    function checkAuthStatus() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        const authLink = document.getElementById('authLink');
        const welcomeSection = document.getElementById('welcomeSection');
        
        if (isLoggedIn && user.id) {
            authLink.innerHTML = `<a href="#" onclick="logout()">Logout</a>`;
            if (welcomeSection) {
                welcomeSection.style.display = 'block';
            }
        } else {
            authLink.innerHTML = `<a href="login.html">Login</a>`;
            if (welcomeSection) {
                welcomeSection.style.display = 'none';
            }
        }
    }

    // Logout function
    async function logout() {
        try {
            const response = await fetch(`${API_BASE_URL}/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            
            if (response.ok) {
                localStorage.removeItem('user');
                localStorage.removeItem('isLoggedIn');
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error('Logout error:', error);
            localStorage.removeItem('user');
            localStorage.removeItem('isLoggedIn');
            window.location.href = 'index.html';
        }
    }

    // Load books from API
    async function loadBooks() {
        try {
            const response = await fetch(`${API_BASE_URL}/books`);
            if (response.ok) {
                booksData = await response.json();
                renderBooks(booksData);
                setupBookCardClicks(); // Setup click handlers after rendering
            } else {
                console.error('Failed to load books');
                bookList.innerHTML = '<p>Failed to load books. Please try again later.</p>';
            }
        } catch (error) {
            console.error('Error loading books:', error);
            bookList.innerHTML = '<p>Error loading books. Please check your connection.</p>';
        }
    }

function renderBooks(items) {
    bookList.innerHTML = items.map(b => {
        let bookInfo = '';
        
        if (b.bookType === 'Novel') {
            bookInfo = b.genre ? `${b.bookType} - ${b.genre}` : b.bookType;
        } else {
            const academicInfo = [];
            if (b.strand) academicInfo.push(b.strand);
            if (b.level) academicInfo.push(`Grade ${b.level}`);
            if (b.qtr) academicInfo.push(b.qtr.replace('qtr', 'Quarter '));
            
            bookInfo = academicInfo.length > 0 ? 
                `${b.bookType} - ${academicInfo.join(' - ')}` : 
                b.bookType;
        }

        // Create additional info sections based on book type
        const additionalInfo = b.bookType === 'Novel' ? 
            `<p class="book-author">${b.author ? `Author: ${b.author}` : ''}</p>` :
            '';
            
        const publisherInfo = b.publisher ? 
            `<p class="book-publisher">Publisher: ${b.publisher}</p>` : 
            '';
            
        // Updated description with 50 character limit
        const description = b.description ? 
            `<p class="book-description">${b.description.length > 50 ? b.description.substring(0, 50) + '...' : b.description}</p>` : 
            '';
        
        return `
            <div class="feature-card book-card" 
                 data-book-id="${b.id || ''}"
                 data-level="${b.bookType === 'Novel' ? '' : (b.level ?? '')}" 
                 data-genre="${b.bookType === 'Novel' ? (b.genre ?? '') : (b.strand ?? '')}" 
                 data-booktype="${b.bookType ?? ''}"
                 data-novel-genre="${b.bookType === 'Novel' ? (b.genre ?? '') : ''}"
                 data-module-strand="${b.bookType !== 'Novel' ? (b.strand ?? '') : ''}"
                 style="cursor: pointer;">
                <div class="book-card-content">
                    ${BookUtils.resolveCoverUrl(b.cover) ? `<img class="book-image" src="${BookUtils.resolveCoverUrl(b.cover)}" alt="${b.title}">` : ''}
                    <div class="book-text">
                        <h3>${b.title}</h3>
                        <p class="book-type-info">${bookInfo}</p>
                        ${b.bookType === 'Novel' ? additionalInfo : ''}
                        ${publisherInfo}
                        ${description}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

    function setupBookCardClicks() {
        const bookCards = document.querySelectorAll('.book-card');
        bookCards.forEach(card => {
            card.addEventListener('click', async function() {
                const bookId = card.getAttribute('data-book-id');
                if (bookId && window.BookPopup) {
                    // Show loading state
                    const loadingData = {
                        title: 'Loading...',
                        description: 'Fetching book details...'
                    };
                    window.BookPopup.show(loadingData);
                    
                    // Fetch detailed book data
                    const detailedBook = await BookUtils.fetchBookDetails(bookId);
                    if (detailedBook) {
                        window.BookPopup.show(detailedBook);
                    } else {
                        // Fallback to basic data from card
                        const basicData = extractBookDataFromCard(card);
                        window.BookPopup.show(basicData);
                    }
                }
            });
        });
    }

    function extractBookDataFromCard(card) {
        const titleElement = card.querySelector('h3');
        const infoElement = card.querySelector('p');
        const imageElement = card.querySelector('img');
        
        const title = titleElement ? titleElement.textContent : '';
        const info = infoElement ? infoElement.textContent : '';
        const cover = imageElement ? imageElement.src : '';
        
        const bookType = card.getAttribute('data-booktype') || '';
        const level = card.getAttribute('data-level') || '';
        const genre = card.getAttribute('data-genre') || '';
        const strand = card.getAttribute('data-module-strand') || '';
        
        let qtr = '';
        if (info.includes('Quarter')) {
            const quarterMatch = info.match(/Quarter\s+(\d+)/);
            if (quarterMatch) {
                qtr = `qtr${quarterMatch[1]}`;
            }
        }
        
        return {
            title: title,
            bookType: bookType,
            level: level ? parseInt(level) : null,
            strand: strand,
            qtr: qtr,
            genre: genre,
            cover: cover,
            description: 'No additional details available.',
            quantity: 'Unknown',
            publisher: 'Unknown',
            author: ''
        };
    }

    function filterBooks() {
        const searchTerm = (searchInput?.value || '').toLowerCase();
        const selectedBookType = filterBookType?.value || '';
        const selectedStrand = filterStrand?.value || '';
        const selectedGenre = filterGenre?.value || '';
        const selectedLevel = filterLevel?.value || '';

        const filtered = booksData.filter(b => {
            const title = (b.title || '').toLowerCase();
            const desc = (b.description || '').toLowerCase();
            const bookType = b.bookType || '';
            const level = String(b.level || '');
            
            const matchesSearch = title.includes(searchTerm) || desc.includes(searchTerm);
            const matchesBookType = selectedBookType === '' || bookType === selectedBookType;
            
            let matchesStrand = true;
            if (selectedStrand !== '') {
                if (bookType === 'Novel') {
                    matchesStrand = true;
                } else {
                    matchesStrand = b.strand === selectedStrand;
                }
            }
            
            let matchesGenre = true;
            if (selectedGenre !== '') {
                if (bookType === 'Novel') {
                    matchesGenre = b.genre === selectedGenre;
                } else {
                    matchesGenre = true;
                }
            }
            
            const matchesLevel = selectedLevel === '' || level === selectedLevel;
            
            return matchesSearch && matchesBookType && matchesStrand && matchesGenre && matchesLevel;
        });
        
        renderBooks(filtered);
        setupBookCardClicks(); // Re-setup click handlers after filtering
    }

    function setupEventListeners() {
        if (searchInput) {
            searchInput.addEventListener('input', filterBooks);
        }
        
        if (filterBookType) {
            filterBookType.addEventListener('change', filterBooks);
        }
        if (filterStrand) {
            filterStrand.addEventListener('change', filterBooks);
        }
        if (filterGenre) {
            filterGenre.addEventListener('change', filterBooks);
        }
        if (filterLevel) {
            filterLevel.addEventListener('change', filterBooks);
        }
    }

    // Make functions globally accessible
    window.logout = logout;
    window.BookUtils = BookUtils;
})();