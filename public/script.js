function showLogin() {
    console.log('Showing login form');
    document.getElementById('register').style.display = 'none';
    document.getElementById('login').style.display = 'block';
}

function showRegister() {
    console.log('Showing register form');
    document.getElementById('register').style.display = 'block';
    document.getElementById('login').style.display = 'none';
}

async function register() {
    console.log('Register button clicked');
    const phone = document.getElementById('reg-phone').value;
    const password = document.getElementById('reg-password').value;
    const referralCode = document.getElementById('referral-code').value;
    const error = document.getElementById('reg-error');

    if (!phone || !password || !referralCode) {
        error.textContent = 'सभी फील्ड्स भरें';
        console.log('Validation failed: All fields required');
        return;
    }

    try {
        console.log('Sending register request:', { phone, referralCode });
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, password, referralCode })
        });
        const data = await response.json();
        console.log('Register response:', data);

        if (response.ok) {
            error.textContent = '';
            localStorage.setItem('userId', data.userId);
            showLogin();
        } else {
            error.textContent = data.message;
        }
    } catch (error) {
        console.error('Register error:', error);
        error.textContent = 'रजिस्ट्रेशन में त्रुटि: ' + error.message;
    }
}

async function login() {
    console.log('Login button clicked');
    const phone = document.getElementById('login-phone').value;
    const password = document.getElementById('login-password').value;
    const error = document.getElementById('login-error');

    if (!phone || !password) {
        error.textContent = 'फोन नंबर और पासवर्ड भरें';
        console.log('Validation failed: Phone and password required');
        return;
    }

    try {
        console.log('Sending login request:', { phone });
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, password })
        });
        const data = await response.json();
        console.log('Login response:', data);

        if (response.ok) {
            error.textContent = '';
            localStorage.setItem('userId', data.userId);
            window.location.href = '/dashboard.html';
        } else {
            error.textContent = data.message;
        }
    } catch (error) {
        console.error('Login error:', error);
        error.textContent = 'लॉगिन में त्रुटि: ' + error.message;
    }
}