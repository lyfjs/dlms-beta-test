// API Configuration
const API_BASE_URL = appConfig.apiEndpoint;

// Check authentication status on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    console.log(API_BASE_URL);
    
    // Hamburger menu functionality
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
    
    // Feature cards animation
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach(card => {
        const img = card.querySelector('.feature-icon__img');
        
        // if this image has an animated version
        if (img && img.dataset.animatedSrc) {
            const staticSrc = img.src;
            const animatedSrc = img.dataset.animatedSrc;
            
            card.addEventListener('mouseenter', function() {
                img.src = animatedSrc;
            });
            
            card.addEventListener('mouseleave', function() {
                img.src = staticSrc;
            });
        }
    });

    // Advanced Search Modal functionality - using the new search engine
    const advancedSearchCard = document.getElementById('advancedSearchCard');
    const searchModal = document.getElementById('searchModal');
    const closeSearchModal = document.getElementById('closeSearchModal');

    // Open modal when clicking the advanced search card
    if (advancedSearchCard) {
        advancedSearchCard.addEventListener('click', function() {
            searchModal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
            
            // Focus on search input after a short delay to ensure modal is visible
            setTimeout(() => {
                const searchInput = document.getElementById('searchInput');
                if (searchInput) {
                    searchInput.focus();
                }
            }, 100);
        });
    }

    // Close modal functionality
    if (closeSearchModal) {
        closeSearchModal.addEventListener('click', function() {
            searchModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    // Close modal when clicking outside
    if (searchModal) {
        searchModal.addEventListener('click', function(e) {
            if (e.target === searchModal) {
                searchModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
});

// Check if user is logged in
function checkAuthStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const authLink = document.getElementById('authLink');
    const mainWelcomeSection = document.querySelector('.welcome-section h2');
    const mainWelcomeText = document.querySelector('.welcome-section p');
    
    if (isLoggedIn && user.id) {
        // User is logged in
        authLink.innerHTML = `<a href="#" onclick="logout()">Logout</a>`;
        if (mainWelcomeSection) {
            mainWelcomeSection.textContent = 'Welcome back!';
        }
        if (mainWelcomeText) {
            mainWelcomeText.textContent = 'You are logged in to the LYFJSHS Library System.';
        }
    } else {
        // User is not logged in
        authLink.innerHTML = `<a href="login.html">Login</a>`;
        if (mainWelcomeSection) {
            mainWelcomeSection.textContent = 'Welcome to the LYFJSHS Library System';
        }
        if (mainWelcomeText) {
            mainWelcomeText.textContent = 'Here you can manage your library resources efficiently.';
        }
    }
}

// Logout function
async function logout() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            // Clear local storage
            localStorage.removeItem('user');
            localStorage.removeItem('isLoggedIn');
            
            // Redirect to home page
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Logout error:', error);
        // Still clear local storage and redirect
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'index.html';
    }
}

window.addEventListener('scroll', function() {
    const heroBackground = document.querySelector('.hero__background');
    const navbar = document.querySelector('.navbar');
    
    const scrollPosition = window.scrollY;
    
    // blur effect hero background
    if (heroBackground && navbar && scrollPosition > 50) {
        const blurAmount = Math.min(scrollPosition / 30, 20);
        heroBackground.style.filter = `blur(${blurAmount}px)`;
        
        if (navbar) navbar.classList.add('scrolled');
    } else {
        // blur effect top
        if (heroBackground) heroBackground.style.filter = 'blur(0)';
        
        if (navbar) navbar.classList.remove('scrolled');
    }
    
    //  paralax effect pra sa hero content
    const heroContent = document.querySelector('.hero__content');
    if (heroContent && scrollPosition < window.innerHeight) {
        heroContent.style.transform = `translateY(${scrollPosition * 0.3}px)`;
        heroContent.style.opacity = 1 - scrollPosition / 600;
    }
});

function redirectCatalog() {
    window.location.href = 'books.html'; 
}