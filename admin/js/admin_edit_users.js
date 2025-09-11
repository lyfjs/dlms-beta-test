// Add this function to setup user access controls
function setupUserAccess(isSuperadmin) {
    const usersNavLink = document.querySelector('.nav-link[data-content="users"]');
    const usersContent = document.getElementById('usersContent');
    
    if (!isSuperadmin) {
        // Hide or disable users section for non-superadmins
        if (usersNavLink) {
            usersNavLink.style.display = 'none';
        }
    } else {
        // Show users section and load users for superadmins
        if (usersNavLink) {
            usersNavLink.style.display = 'flex';
        }
        // Load users when users section is shown
        const loadUsersOnShow = () => {
            if (usersContent.style.display === 'block') {
                loadUsers();
            }
        };
        
        // Add event listener to load users when users section is shown
        if (usersNavLink) {
            usersNavLink.addEventListener('click', loadUsersOnShow);
        }
    }
}

// Add this function to load users
async function loadUsers() {
    try {
        const response = await fetch(`${API_SERVER}/api/admin/users`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }
        
        const users = await response.json();
        displayUsers(users);
    } catch (error) {
        console.error('Error loading users:', error);
        showMessage('Failed to load users. Please try again.', 'error');
    }
}

// Add this function to display users
function displayUsers(users) {
    const usersContent = document.getElementById('usersContent');
    if (!usersContent) return;
    
    usersContent.innerHTML = `
        <div class="page-header">
            <h1 class="page-title">Users</h1>
            <p class="page-subtitle">Manage student accounts (Superadmin Only)</p>
        </div>
        <div class="form-card">
            <div class="search-controls">
                <div class="search-row">
                    <div class="search-group">
                        <input type="text" id="userSearchInput" placeholder="Search users by name or email..." class="search-input">
                    </div>
                </div>
            </div>
            
            <div class="users-table-container">
                <table class="books-table" id="usersTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Grade Level</th>
                            <th>Section</th>
                            <th>Phone</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="usersTableBody">
                        ${users.map(user => `
                            <tr>
                                <td>${user.id}</td>
                                <td>${escapeHtml(user.first_name)} ${escapeHtml(user.last_name)}</td>
                                <td>${escapeHtml(user.email)}</td>
                                <td>${escapeHtml(user.grade_level)}</td>
                                <td>${escapeHtml(user.section)}</td>
                                <td>${escapeHtml(user.phone_number)}</td>
                                <td>
                                    <button class="action-btn edit-btn" onclick="editUser(${user.id})">
                                        <i class="fas fa-edit"></i> Edit
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    // Add search functionality
    const searchInput = document.getElementById('userSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterUsers);
    }
}

// Add user filtering function
function filterUsers() {
    const searchInput = document.getElementById('userSearchInput');
    const searchTerm = searchInput.value.toLowerCase();
    const rows = document.querySelectorAll('#usersTableBody tr');
    
    rows.forEach(row => {
        const name = row.cells[1].textContent.toLowerCase();
        const email = row.cells[2].textContent.toLowerCase();
        const shouldShow = name.includes(searchTerm) || email.includes(searchTerm);
        row.style.display = shouldShow ? '' : 'none';
    });
}

// Add user edit function
async function editUser(userId) {
    try {
        const response = await fetch(`${API_SERVER}/api/admin/users/${userId}`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch user details');
        }
        
        const user = await response.json();
        
        // Create edit modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Edit User</h2>
                    <span class="close" type="button" class="cancel-btn" onclick="this.closest('.modal').style.display='none'">&times;</span>
                </div>
                <div class="modal-body">
                    <form id="editUserForm">
                        <input type="hidden" name="user_id" value="${user.id}">
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">First Name</label>
                                <input class="form-input" name="first_name" value="${escapeHtml(user.first_name)}" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Last Name</label>
                                <input class="form-input" name="last_name" value="${escapeHtml(user.last_name)}" required>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Email</label>
                                <input class="form-input" type="email" name="email" value="${escapeHtml(user.email)}" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Phone Number</label>
                                <input class="form-input" name="phone_number" value="${escapeHtml(user.phone_number)}">
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Grade Level</label>
                                <select class="form-select" name="grade_level" required>
                                    <option value="11" ${user.grade_level === '11' ? 'selected' : ''}>Grade 11</option>
                                    <option value="12" ${user.grade_level === '12' ? 'selected' : ''}>Grade 12</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Section</label>
                                <input class="form-input" name="section" value="${escapeHtml(user.section)}" required>
                            </div>
                        </div>
                        
                        <div class="button-group">
                            <button type="submit" class="submit-btn">
                                <i class="fas fa-save"></i>
                                Update User
                            </button>
                            <button type="button" class="cancel-btn" onclick="this.closest('.modal').style.display='none'">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add form submission handler
        const form = modal.querySelector('#editUserForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleUserUpdate(form, user.id);
        });
        
    } catch (error) {
        console.error('Error loading user for edit:', error);
        showMessage('Failed to load user details. Please try again.', 'error');
    }
}

// Add user update handler
async function handleUserUpdate(form, userId) {
    try {
        const formData = new FormData(form);
        const userData = Object.fromEntries(formData.entries());
        
        const response = await fetch(`${API_SERVER}/api/admin/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
            credentials: 'include'
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to update user');
        }
        
        // Close modal and reload users
        form.closest('.modal').style.display = 'none';
        await loadUsers();
        showMessage('User updated successfully', 'success');
        
    } catch (error) {
        console.error('Error updating user:', error);
        showMessage(error.message || 'Failed to update user. Please try again.', 'error');
    }
}

// Add this to the global functions
window.editUser = editUser;