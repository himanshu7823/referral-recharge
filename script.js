function showLogin() {
    document.getElementById('registration-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('error-message').style.display = 'none';
}

function showRegister() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('registration-form').style.display = 'block';
}

async function register() {
    const phone = document.getElementById('reg-phone').value.trim();
    const password = document.getElementById('reg-password').value.trim();
    const referralCode = document.getElementById('reg-referral').value.trim();

    if (!phone || !password || !referralCode) {
        alert('फोन नंबर, पासवर्ड और रेफर कोड अनिवार्य हैं');
        return;
    }

    try {
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
    } catch (error) {
        console.error('रजिस्ट्रेशन त्रुटि:', error);
        alert('सर्वर से कनेक्शन त्रुटि');
    }
}

async function login() {
    const phone = document.getElementById('login-phone').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const errorMessage = document.getElementById('error-message');

    if (!phone || !password) {
        errorMessage.textContent = 'फोन नंबर और पासवर्ड दोनों आवश्यक हैं';
        errorMessage.style.display = 'block';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, password })
        });
        const data = await response.json();

        if (response.ok) {
            errorMessage.style.display = 'none';
            alert(data.message);
            window.location.href = '/dashboard.html';
        } else {
            errorMessage.textContent = data.message;
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('लॉगिन त्रुटि:', error);
        errorMessage.textContent = 'सर्वर से कनेक्शन त्रुटि';
        errorMessage.style.display = 'block';
    }
}