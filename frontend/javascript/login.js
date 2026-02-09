/**
 * Login Page JavaScript
 * Handles login form submission and authentication
 */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const messageArea = document.getElementById('messageArea');
    const loginBtn = document.getElementById('loginBtn');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!username || !password) {
            showMessage('Please enter both username and password', 'error');
            return;
        }

        // Show loading state
        loginBtn.disabled = true;
        loginBtn.textContent = 'Logging in...';
        showMessage('Authenticating...', 'info');

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            const data = await response.json();

            if (data.success) {
                showMessage('Login successful! Redirecting...', 'success');

                // Store user info in sessionStorage (optional, for client-side use)
                sessionStorage.setItem('user_role', data.role);
                sessionStorage.setItem('user_name', data.name);
                sessionStorage.setItem('user_id', data.user_id);

                // Redirect after short delay
                setTimeout(() => {
                    window.location.href = data.redirect;
                }, 1000);
            } else {
                showMessage(data.message || 'Login failed. Please check your credentials.', 'error');
                loginBtn.disabled = false;
                loginBtn.textContent = 'Login';
            }
        } catch (error) {
            console.error('Login error:', error);
            showMessage('An error occurred. Please try again later.', 'error');
            loginBtn.disabled = false;
            loginBtn.textContent = 'Login';
        }
    });

    /**
     * Display message to user
     * @param {string} message - Message text
     * @param {string} type - Message type: 'success', 'error', 'info'
     */
    function showMessage(message, type) {
        let color = '#333';
        let bgColor = '#f0f0f0';

        switch (type) {
            case 'success':
                color = '#155724';
                bgColor = '#d4edda';
                break;
            case 'error':
                color = '#721c24';
                bgColor = '#f8d7da';
                break;
            case 'info':
                color = '#004085';
                bgColor = '#d1ecf1';
                break;
        }

        messageArea.innerHTML = `
            <div style="
                padding: 0.75rem;
                border-radius: 8px;
                background-color: ${bgColor};
                color: ${color};
                text-align: center;
                font-size: 1rem;
            ">
                ${message}
            </div>
        `;
    }
});
