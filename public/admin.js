async function getDeposits() {
    try {
        const response = await fetch('http://localhost:3000/admin/deposits');
        const deposits = await response.json();
        const tbody = document.querySelector('#deposit-table tbody');
        tbody.innerHTML = '';
        deposits.forEach(dep => {
            tbody.innerHTML += `
                <tr>
                    <td>${dep.phone}</td>
                    <td>${dep.utrNumber}</td>
                    <td>${dep.amount}</td>
                    <td>स्वीकृत</td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('डिपॉजिट त्रुटि:', error);
    }
}

async function getRecharges() {
    try {
        const response = await fetch('http://localhost:3000/admin/recharges');
        const recharges = await response.json();
        const tbody = document.querySelector('#recharge-table tbody');
        tbody.innerHTML = '';
        recharges.forEach(req => {
            tbody.innerHTML += `
                <tr>
                    <td>${req.mobileNumber}</td>
                    <td>${req.simCard}</td>
                    <td>${req.amount}</td>
                    <td>
                        <button onclick="successRecharge('${req._id}')">सफल</button>
                        <button onclick="cancelRecharge('${req._id}')">रद्द</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('रिचार्ज त्रुटि:', error);
    }
}