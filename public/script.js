function showLogin() {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('error-message').style.display = 'none';
}

function showRegister() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
}

async function register() {
    const phone = document.getElementById('reg-phone').value;
    const password = document.getElementById('reg-password').value;
    const referralCode = document.getElementById('reg-referral').value;

    if (!phone || !password || !referralCode) {
        alert('सभी फील्ड्स भरें');
        return;
    }

    const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password, referralCode })
    });
    const data = await response.json();
    alert(data.message);
    if (response.ok) {
        showLogin();
    }
}

async function login() {
    const phone = document.getElementById('login-phone').value;
    const password = document.getElementById('login-password').value;
    const errorMessage = document.getElementById('error-message');

    if (!phone || !password) {
        errorMessage.textContent = 'फोन नंबर और पासवर्ड भरें';
        errorMessage.style.display = 'block';
        return;
    }

    const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
    });
    const data = await response.json();

    if (response.ok) {
        errorMessage.style.display = 'none';
        alert('लॉगिन सफल');
        window.location.href = '/dashboard.html';
    } else {
        errorMessage.textContent = data.message;
        errorMessage.style.display = 'block';
    }
}