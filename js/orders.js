document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;

    loadOrders();

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }
});

//  user orders
async function loadOrders() {
    try {
        const response = await apiRequest('/orders/my-orders');
        const orders = response.orders || [];
        displayOrders(orders);
    } catch (error) {
        console.error('Failed to load orders:', error);
        showError('Failed to load orders');
    }
}

// To Display orders
function displayOrders(orders) {
    const ordersContainer = document.getElementById('ordersContainer');
    if (!ordersContainer) return;

    if (orders.length === 0) {
        ordersContainer.innerHTML = '<p class="no-orders">You have no orders yet</p>';
        return;
    }

    ordersContainer.innerHTML = orders.map(order => {
        const codeSource = order.id ?? order._id ?? '';
        const code = String(codeSource).slice(-6) || '------';
        const items = order.items || [];

        return `
        <div class="order-card">
            <div class="order-header">
                <div>
                    <h3>Order #${code}</h3>
                    <p class="order-date">${formatDate(order.createdAt)}</p>
                </div>
                <span class="status-badge status-${order.status}">${order.status}</span>
            </div>
            <div class="order-items">
                ${items.map(item => `
                    <div class="order-item">
                        <span>${item.name} x${item.quantity}</span>
                        <span>${formatCurrency(item.price * item.quantity)}</span>
                    </div>
                `).join('')}
            </div>
            <div class="order-footer">
                <div class="order-total">
                    <strong>Total: ${formatCurrency(order.totalAmount)}</strong>
                </div>
                ${order.deliveryLocation ? `<p class="delivery-location">📍 ${order.deliveryLocation}</p>` : ''}
            </div>
        </div>
    `;
    }).join('');
}

// To show error message
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.add('show');
        setTimeout(() => errorDiv.classList.remove('show'), 5000);
    }
}

