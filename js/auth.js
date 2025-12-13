// Login functionality
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    // Login form
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorMessage.textContent = '';
            successMessage.textContent = '';

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await apiRequest('/auth/login', {
                    method: 'POST',
                    body: { email, password }
                });

                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));

                if (response.user.role === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'menu.html';
                }
            } catch (error) {
                errorMessage.textContent = error.message;
            }
        });
    }

    // Signup form
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorMessage.textContent = '';
            successMessage.textContent = '';

            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const roomNumber = document.getElementById('roomNumber').value;
            const phone = document.getElementById('phone').value;

            try {
                const response = await apiRequest('/auth/register', {
                    method: 'POST',
                    body: { name, email, password, roomNumber, phone }
                });

                successMessage.textContent = 'Registration successful! Redirecting...';
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));

                setTimeout(() => {
                    window.location.href = 'menu.html';
                }, 1500);
            } catch (error) {
                errorMessage.textContent = error.message;
            }
        });
    }

    
    const token = localStorage.getItem('token');
    if (token && (loginForm || signupForm)) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'menu.html';
        }
    }
});

