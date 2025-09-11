        let API_SERVER = appConfig.apiEndpoint;
        
        // Check if already logged in on page load
        document.addEventListener('DOMContentLoaded', () => {
            checkIfAlreadyLoggedIn();
        });

        async function checkIfAlreadyLoggedIn() {
            const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
            const admin = JSON.parse(localStorage.getItem('admin') || '{}');
            
            if (isLoggedIn && admin.id) {
                // Already logged in, redirect to admin panel
                window.location.href = 'admin_index.html';
            }
        }

        document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const errorMessage = document.getElementById('errorMessage');
            const successMessage = document.getElementById('successMessage');
            const loginBtn = document.getElementById('loginBtn');
            
            // Basic validation
            if (!username || !password) {
                showError('Username and password are required');
                return;
            }
            
            // Reset UI
            hideMessages();
            setLoading(true);
            
            try {
                console.log('Attempting login...');
                
                const response = await fetch(`${API_SERVER}/api/admin/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ username, password })
                });
                
                const data = await response.json();
                console.log('Login response:', data);
                
                if (response.ok && data.success) {
                    // Store admin info in localStorage
                    localStorage.setItem('admin', JSON.stringify({
                        id: data.admin_id,
                        username: data.username || username,
                        superadmin: data.superadmin || false  // This will now work with the updated API
                    }));
                    localStorage.setItem('adminLoggedIn', 'true');
                    
                    showSuccess('Login successful! Redirecting...');
                    
                    // Wait a moment to show success message, then redirect
                    setTimeout(() => {
                        console.log('Redirecting to admin panel...');
                        window.location.href = 'admin_index.html';
                    }, 1500);
                } else {
                    showError(data.error || 'Invalid credentials');
                }
                
            } catch (error) {
                console.error('Login failed:', error);
                showError('Network error. Please check your connection and try again.');
            } finally {
                setLoading(false);
            }
            
            function showError(message) {
                errorMessage.textContent = message;
                errorMessage.style.display = 'block';
                successMessage.style.display = 'none';
            }
            
            function showSuccess(message) {
                successMessage.textContent = message;
                successMessage.style.display = 'block';
                errorMessage.style.display = 'none';
            }
            
            function hideMessages() {
                errorMessage.style.display = 'none';
                successMessage.style.display = 'none';
            }
            
            function setLoading(isLoading) {
                loginBtn.disabled = isLoading;
                loginBtn.textContent = isLoading ? 'Signing In...' : 'Sign In';
            }
        });
        
        // Clear error when user starts typing
        document.getElementById('username').addEventListener('input', clearMessages);
        document.getElementById('password').addEventListener('input', clearMessages);
        
        function clearMessages() {
            const errorMessage = document.getElementById('errorMessage');
            const successMessage = document.getElementById('successMessage');
            if (errorMessage.style.display === 'block' || successMessage.style.display === 'block') {
                errorMessage.style.display = 'none';
                successMessage.style.display = 'none';
            }
        }