// Auth functionality
document.addEventListener('DOMContentLoaded', function() {
    // Update UI based on auth state
    updateAuthUI();
    
    // Register form submission
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Logout button click
    const logoutBtns = document.querySelectorAll('#logout-btn, #admin-logout, #admin-logout-top');
    logoutBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', handleLogout);
        }
    });
    
    // Check auth for protected pages
    checkAuthForProtectedPages();
});

// Update UI based on authentication state
function updateAuthUI() {
    const isLoggedIn = userService.isUserLoggedIn();
    const isAdmin = userService.isAdmin();
    const currentUser = userService.getCurrentUser();
    
    // Update the user dropdown items
    document.querySelectorAll('.logged-in').forEach(el => {
        el.style.display = isLoggedIn ? 'block' : 'none';
    });
    
    document.querySelectorAll('.logged-out').forEach(el => {
        el.style.display = isLoggedIn ? 'none' : 'block';
    });
    
    document.querySelectorAll('.admin-only').forEach(el => {
        el.style.display = isAdmin ? 'block' : 'none';
    });
    
    // Update admin name if on admin page
    const adminName = document.getElementById('admin-name');
    if (adminName && currentUser) {
        adminName.textContent = currentUser.name;
    }
}

// Handle registration form submission
function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Simple validation
    if (password !== confirmPassword) {
        showError(document.getElementById('register-error'), 'Passwords do not match');
        return;
    }
    
    // Register user
    const result = userService.registerUser({ name, email, password });
    
    if (result.success) {
        // Redirect to home page
        window.location.href = 'index.html';
    } else {
        // Show error
        showError(document.getElementById('register-error'), result.message);
    }
}

// Handle login form submission
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Login user
    const result = userService.loginUser(email, password);
    
    if (result.success) {
        // Check if user is admin to redirect to admin dashboard
        if (result.user.role === 'admin') {
            window.location.href = 'admin/dashboard.html';
        } else {
            // Redirect to home page for regular users
            window.location.href = 'index.html';
        }
    } else {
        // Show error
        showError(document.getElementById('login-error'), result.message);
    }
}

// Handle logout
function handleLogout(event) {
    event.preventDefault();
    
    // Logout user
    userService.logoutUser();
    
    // Redirect to home page
    window.location.href = event.target.id.includes('admin') ? '../index.html' : 'index.html';
}

// Check if current page requires authentication and redirect if needed
function checkAuthForProtectedPages() {
    const currentPath = window.location.pathname;
    
    // Check for admin pages
    if (currentPath.includes('/admin/')) {
        if (!userService.isAdmin()) {
            window.location.href = '../login.html';
        }
    }
    
    // Check for other protected pages (like checkout)
    if (currentPath.includes('checkout.html')) {
        if (!userService.isUserLoggedIn()) {
            window.location.href = 'login.html?redirect=checkout.html';
        }
    }
}

// Show error message
function showError(element, message) {
    if (element) {
        element.textContent = message;
        element.classList.remove('d-none');
    }
}