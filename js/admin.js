let allMenuItems = [];
let allOrders = [];

document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'admin') {
        window.location.href = 'menu.html';
        return;
    }

    loadDashboard();
    loadMenuItems();
    loadOrders();

    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });

  
    const menuForm = document.getElementById('menuForm');
    if (menuForm) {
        menuForm.addEventListener('submit', handleMenuSubmit);
    }

    const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.clear();
                window.location.href = 'index.html';
            });
        }
});


function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(`${tab}Tab`).classList.add('active');
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
}


async function loadDashboard() {
    try {
        const response = await apiRequest('/admin/dashboard');
        displayDashboard(response.stats, response.recentOrders);
    } catch (error) {
        console.error('Failed to load dashboard:', error);
    }
}


function displayDashboard(stats, recentOrders) {
    const statsContainer = document.getElementById('statsContainer');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="stat-card">
                <h3>${stats.totalUsers}</h3>
                <p>Total Users</p>
            </div>
            <div class="stat-card">
                <h3>${stats.totalOrders}</h3>
                <p>Total Orders</p>
            </div>
            <div class="stat-card">
                <h3>${stats.pendingOrders}</h3>
                <p>Pending Orders</p>
            </div>
            <div class="stat-card">
                <h3>${formatCurrency(stats.totalRevenue)}</h3>
                <p>Total Revenue</p>
            </div>
        `;
    }

    const recentOrdersContainer = document.getElementById('recentOrdersContainer');
    if (recentOrdersContainer) {
        if (!recentOrders || recentOrders.length === 0) {
            recentOrdersContainer.innerHTML = '<p>No recent orders</p>';
        } else {
            recentOrdersContainer.innerHTML = recentOrders.map(order => {
                const codeSource = order.id ?? order._id ?? '';
                const code = String(codeSource).slice(-6) || '------';
                const customerName = order.userName || order.userId?.name || 'Unknown';

                return `
                <div class="recent-order">
                    <div>
                        <strong>Order #${code}</strong>
                        <p>${customerName} - ${formatCurrency(order.totalAmount)}</p>
                    </div>
                    <span class="status-badge status-${order.status}">${order.status}</span>
                </div>
                `;
            }).join('');
        }
    }
}

async function loadMenuItems() {
    try {
        const response = await apiRequest('/menu');
        allMenuItems = response.items || [];
        displayMenuItems(allMenuItems);
    } catch (error) {
        console.error('Failed to load menu items:', error);
    }
}


function displayMenuItems(items) {
    const menuContainer = document.getElementById('menuContainer');
    if (!menuContainer) return;

    menuContainer.innerHTML = items.map(item => {
        const itemId = item.id ?? item._id;

        return `
        <div class="admin-menu-item">
            <div class="menu-item-details">
                <h4>${item.name}</h4>
                <p>${item.restaurant} - ${item.category}</p>
                <p>${formatCurrency(item.price)}</p>
                <span class="status-badge ${item.available ? 'available' : 'unavailable'}">
                    ${item.available ? 'Available' : 'Unavailable'}
                </span>
            </div>
            <div class="menu-item-actions">
                <button onclick="toggleMenuItem('${itemId}', ${!item.available})" class="btn-toggle">
                    ${item.available ? 'Mark Unavailable' : 'Mark Available'}
                </button>
                <button onclick="deleteMenuItem('${itemId}')" class="btn-delete">Delete</button>
            </div>
        </div>
        `;
    }).join('');
}


async function handleMenuSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price')),
        category: formData.get('category'),
        restaurant: formData.get('restaurant'),
        image: formData.get('image') || ''
    };

    try {
        await apiRequest('/menu', {
            method: 'POST',
            body: data
        });
        e.target.reset();
        loadMenuItems();
        showSuccess('Menu item added successfully!');
    } catch (error) {
        showError(error.message);
    }
}


async function toggleMenuItem(id, available) {
    try {
        await apiRequest(`/menu/${id}`, {
            method: 'PUT',
            body: { available }
        });
        loadMenuItems();
        showSuccess('Menu item updated!');
    } catch (error) {
        showError(error.message);
    }
}


async function deleteMenuItem(id) {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
        await apiRequest(`/menu/${id}`, {
            method: 'DELETE'
        });
        loadMenuItems();
        showSuccess('Menu item deleted!');
    } catch (error) {
        showError(error.message);
    }
}


async function loadOrders() {
    try {
        const response = await apiRequest('/orders/all');
        allOrders = response.orders || [];
        displayOrders(allOrders);
    } catch (error) {
        console.error('Failed to load orders:', error);
    }
}


function displayOrders(orders) {
    const ordersContainer = document.getElementById('adminOrdersContainer');
    if (!ordersContainer) return;

    if (orders.length === 0) {
        ordersContainer.innerHTML = '<p>No orders found</p>';
        return;
    }

    ordersContainer.innerHTML = orders.map(order => {
        const codeSource = order.id ?? order._id ?? '';
        const code = String(codeSource).slice(-6) || '------';
        const userName = order.userName || order.userId?.name || 'Unknown';
        const userEmail = order.userEmail || order.userId?.email || '';
        const items = order.items || [];
        const idForUpdate = order.id ?? order._id;

        return `
        <div class="admin-order-card">
            <div class="order-header">
                <div>
                    <h4>Order #${code}</h4>
                    <p>${userName} - ${userEmail}</p>
                    <p class="order-date">${formatDate(order.createdAt)}</p>
                </div>
                <select onchange="updateOrderStatus('${idForUpdate}', this.value)" class="status-select">
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                    <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>Preparing</option>
                    <option value="ready" ${order.status === 'ready' ? 'selected' : ''}>Ready</option>
                    <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
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
                <strong>Total: ${formatCurrency(order.totalAmount)}</strong>
            </div>
        </div>
        `;
    }).join('');
}


async function updateOrderStatus(orderId, status) {
    try {
        await apiRequest(`/orders/${orderId}/status`, {
            method: 'PUT',
            body: { status }
        });
        loadOrders();
        loadDashboard();
        showSuccess('Order status updated!');
    } catch (error) {
        showError(error.message);
    }
}


function showError(message) {
    alert(message);
}

function showSuccess(message) {
    alert(message);
}

