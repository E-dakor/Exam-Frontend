let allMenuItems = [];
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;

    loadMenu();
    updateCartCount();
    displayCart();

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterMenu(btn.dataset.category);
        });
    });

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }

    // Checkout
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }

    // Setup featured items (price + add to cart)
    document.querySelectorAll('.featured-item').forEach(el => {
        const name = el.dataset.name;
        if (!name) return;

        // Random price between $20 and $100
        const value = Math.floor(Math.random() * 81) + 20; // 20–100
        el.dataset.price = value;

        // Create footer container
        const footer = document.createElement('div');
        footer.className = 'featured-footer';

        const priceSpan = document.createElement('span');
        priceSpan.className = 'featured-price';
        priceSpan.textContent = formatCurrency(value);

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn-add';
        btn.textContent = 'Add to Cart';

        const addHandler = () => {
            const item = allMenuItems.find(i => i.name === name);
            if (item) {
                // Item exists in backend menu – use normal flow
                addToCart(item._id);
            } else {
                // Fallback: allow adding featured items even if not in API menu
                addFeaturedToCart(name, value);
            }
        };

        
        el.addEventListener('click', addHandler);
        // Click on button (don’t trigger card twice)
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            addHandler();
        });

        footer.appendChild(priceSpan);
        footer.appendChild(btn);
        el.appendChild(footer);
    });
});

// Load menu items
async function loadMenu() {
    try {
        const response = await apiRequest('/menu');
        allMenuItems = response.items || [];
        displayMenuItems(allMenuItems);
    } catch (error) {
        console.error('Failed to load menu:', error);
        showError('Failed to load menu items');
    }
}

// Display menu items
function displayMenuItems(items) {
    const menuGrid = document.getElementById('menuGrid');
    if (!menuGrid) return;

    if (items.length === 0) {
        menuGrid.innerHTML = '<p class="no-items">No menu items available</p>';
        return;
    }

    menuGrid.innerHTML = items.map(item => `
        <div class="menu-item ${!item.available ? 'unavailable' : ''}">
            ${item.image ? `<img src="${item.image}" alt="${item.name}" onerror="this.style.display='none'">` : ''}
            <div class="menu-item-content">
                <h3>${item.name}</h3>
                <p class="restaurant">${item.restaurant}</p>
                <p class="description">${item.description || ''}</p>
                <div class="menu-item-footer">
                    <span class="price">${formatCurrency(item.price)}</span>
                    <button class="btn-add" onclick="addToCart('${item._id}')" ${!item.available ? 'disabled' : ''}>
                        ${!item.available ? 'Unavailable' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Filter menu
function filterMenu(category) {
    if (category === 'all') {
        displayMenuItems(allMenuItems);
    } else {
        const filtered = allMenuItems.filter(item => item.category === category);
        displayMenuItems(filtered);
    }

    
    const sections = document.querySelectorAll('.featured-section');
    sections.forEach(section => {
        const sectionCategory = section.dataset.category;
        if (!sectionCategory || category === 'all' || sectionCategory === category) {
            section.style.display = '';
        } else {
            section.style.display = 'none';
        }
    });
}

// Add to cart
function addToCart(menuItemId) {
    const item = allMenuItems.find(i => i._id === menuItemId);
    if (!item || !item.available) return;

    const existingItem = cart.find(i => i.menuItemId === menuItemId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            menuItemId: item._id,
            name: item.name,
            price: item.price,
            quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showSuccess(`${item.name} added to cart!`);
}

// Add a featured-only item to cart (not loaded from API)
function addFeaturedToCart(name, price) {
    const existingItem = cart.find(i => i.name === name && !i.menuItemId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            menuItemId: null,
            name,
            price,
            quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showSuccess(`${name} added to cart!`);
}

// Display cart
function displayCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        if (cartTotal) cartTotal.textContent = formatCurrency(0);
        return;
    }

    cartItems.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>${formatCurrency(item.price)} each</p>
            </div>
            <div class="cart-item-controls">
                <button onclick="updateQuantity(${index}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQuantity(${index}, 1)">+</button>
                <button class="btn-remove" onclick="removeFromCart(${index})">Remove</button>
            </div>
            <div class="cart-item-total">
                ${formatCurrency(item.price * item.quantity)}
            </div>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (cartTotal) cartTotal.textContent = formatCurrency(total);
}

// Update quantity
function updateQuantity(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
    updateCartCount();
}

// Remove from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
    updateCartCount();
}

// Update cart count
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.textContent = count;
        cartCount.style.display = count > 0 ? 'block' : 'none';
    }
}

// Handle checkout
async function handleCheckout() {
    if (cart.length === 0) {
        showError('Your cart is empty');
        return;
    }

    const deliveryLocation = document.getElementById('deliveryLocation')?.value || '';
    const specialInstructions = document.getElementById('specialInstructions')?.value || '';

    try {
        const response = await apiRequest('/orders', {
            method: 'POST',
            body: {
                items: cart,
                deliveryLocation,
                specialInstructions
            }
        });

        cart = [];
        localStorage.removeItem('cart');
        updateCartCount();
        displayCart();

        // Strong visual + text feedback
        const checkoutBtnEl = document.getElementById('checkoutBtn');
        if (checkoutBtnEl) {
            checkoutBtnEl.textContent = 'Order placed successfully';
            checkoutBtnEl.disabled = true;
        }

        showSuccess('Order placed successfully!');
        alert('Order placed successfully!');
        setTimeout(() => {
            window.location.href = 'orders.html';
        }, 2000);
    } catch (error) {
        showError(error.message);
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.add('show');
        setTimeout(() => errorDiv.classList.remove('show'), 5000);
    }
}

// Show success message
function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.classList.add('show');
        setTimeout(() => successDiv.classList.remove('show'), 3000);
    }
}

