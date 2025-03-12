function showLogin() {
    document.getElementById('register').style.display = 'none';
    document.getElementById('login').style.display = 'block';
}

function showRegister() {
    document.getElementById('register').style.display = 'block';
    document.getElementById('login').style.display = 'none';
}

async function register() {
    const phone = document.getElementById('reg-phone').value;
    const password = document.getElementById('reg-password').value;
    const referralCode = document.getElementById('referral-code').value;
    const error = document.getElementById('reg-error');

    if (!phone || !password || !referralCode) {
        error.textContent = 'सभी फील्ड्स भरें';
        return;
    }

    const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password, referralCode })
    });
    const data = await response.json();

    if (response.ok) {
        error.textContent = '';
        showLogin();
    } else {
        error.textContent = data.message;
    }
}

async function login() {
    const phone = document.getElementById('login-phone').value;
    const password = document.getElementById('login-password').value;
    const error = document.getElementById('login-error');

    if (!phone || !password) {
        error.textContent = 'फोन नंबर और पासवर्ड भरें';
        return;
    }

    const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
    });
    const data = await response.json();

    if (response.ok) {
        error.textContent = '';
        window.location.href = '/dashboard.html';
    } else {
        error.textContent = data.message;
    }
}