// API Configuration
// Backend is running from backend/server.js on port 5000
const API_BASE_URL = 'https://exam-backend-hs3q.onrender.com/api';


async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        },
        ...options
    };

    if (options.body && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Request failed');
    }

    return data;
}


function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        // Use relative path so it works with both Live Server and Express
        window.location.href = 'index.html';
        return false;
    }
    return true;
}


function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}


function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

