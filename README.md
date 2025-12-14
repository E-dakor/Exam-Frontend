.# Campus Food Ordering System

This is a campus based food ordering website designed for campus environment.The system allows users to  browse menus and place orders while administrators can manage menus and orders.

## 🌐 Live Demo

- *Frontend*: [View Edi's Website](https://exam-frontend-woad.vercel.app/)


## Login Details
Manager

edinam.kumordjie@acity.edu.gh password 123456

Student 

deji@gmail.com  
Password 0987654321

# Features


# Student Features
User Authentication: Secure registration and login system
- **Menu Browsing: Browse food items by category (Breakfast, Lunch, Dinner, Snacks,)
- **Shopping Cart: Add items to cart, adjust quantities, and remove items
- **Order Placement**: Place orders with delivery location and special instructions
- **Order Tracking**: View order history and current order status

### Admin Features
- **Dashboard**: View statistics (total users, orders, revenue, pending orders)
- **Menu Management**: Add, update, and delete menu items
- **Order Management**: View all orders and update order status
- **User Management**: View all registered users

## Technology Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** (great with pgAdmin + Render)
- **JWT** for authentication
- **bcryptjs** for password hashing

### Frontend
- **HTML5** with semantic markup
- **CSS3** with modern styling and responsive design
- **Vanilla JavaScript** for interactivity

## Installation

1. **Clone or download the project**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL**
   - Make sure PostgreSQL is installed and running (or use a hosted DB like Render)
   - Create a database, e.g. `campus_food`
   - Note the connection string, e.g. `postgres://postgres:postgres@localhost:5432/campus_food`

4. **Create a `.env` file** (optional)
   ```
   DATABASE_URL=postgres://postgres:postgres@localhost:5432/campus_food
   JWT_SECRET=your-secret-key-here
   PORT=3000
   ```

5. **Start the server**
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Open your browser and navigate to `http://localhost:3000`
   - The application will serve the frontend files automatically

## Project Structure

```
Campus food ordering system/
├── backend/
│   ├── controllers/
│   │   ├── admincontroller.js    # Admin dashboard and user management
│   │   ├── authcontroller.js     # Authentication (login, register)
│   │   ├── menucontroller.js      # Menu item CRUD operations
│   │   └── ordercontroller.js    # Order creation and management
│   ├── database/
│   │   └── database.js           # MongoDB schemas and models
│   ├── middleware/
│   │   └── auth.js               # JWT authentication middleware
│   ├── routes/
│   │   ├── admin.js              # Admin routes
│   │   ├── auth.js               # Authentication routes
│   │   ├── menu.js               # Menu routes
│   │   └── orders.js             # Order routes
│   └── server/
│       └── server.js             # Express server setup
├── Frontend/
│   ├── css/
│   │   └── style.css             # Main stylesheet
│   ├── html/
│   │   ├── index.html            # Login page
│   │   ├── signup.html           # Registration page
│   │   ├── menu.html             # Menu browsing page
│   │   ├── cart.html             # Shopping cart page
│   │   ├── orders.html           # User orders page
│   │   └── admin.html            # Admin dashboard
│   └── js/
│       ├── config.js             # API configuration and utilities
│       ├── auth.js               # Authentication logic
│       ├── menu.js               # Menu and cart functionality
│       ├── orders.js             # Order display logic
│       └── admin.js              # Admin panel functionality
├── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Menu
- `GET /api/menu` - Get all menu items (with optional category filter)
- `GET /api/menu/:id` - Get single menu item
- `POST /api/menu` - Create menu item (admin only)
- `PUT /api/menu/:id` - Update menu item (admin only)
- `DELETE /api/menu/:id` - Delete menu item (admin only)

### Orders
- `POST /api/orders` - Create new order (protected)
- `GET /api/orders/my-orders` - Get user's orders (protected)
- `GET /api/orders/all` - Get all orders (admin only)
- `GET /api/orders/:id` - Get single order (protected)
- `PUT /api/orders/:id/status` - Update order status (admin only)

### Admin
- `GET /api/admin/dashboard` - Get dashboard statistics (admin only)
- `GET /api/admin/users` - Get all users (admin only)

## Usage

### For Students

1. **Register/Login**: Create an account or login with existing credentials
2. **Browse Menu**: View available food items filtered by category
3. **Add to Cart**: Click "Add to Cart" on any available item
4. **View Cart**: Navigate to cart page to review items
5. **Place Order**: Enter delivery location and place order
6. **Track Orders**: View order history and status on Orders page

### For Administrators

1. **Login**: Login with admin credentials
2. **Dashboard**: View system statistics and recent orders
3. **Manage Menu**: Add new items, update availability, or delete items
4. **Manage Orders**: View all orders and update their status (pending → confirmed → preparing → ready → delivered)

## Creating an Admin User

To create an admin user, you can either:
1. Manually update the database to set a user's role to 'admin'
2. Use MongoDB shell:
   ```javascript
   db.users.updateOne(
     { email: "admin@example.com" },
     { $set: { role: "admin" } }
   )
   ```

## Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Protected routes with middleware
- Role-based access control (student/admin)

## Future Enhancements

- Real-time order updates with WebSockets
- Payment integration
- Email notifications
- Order rating and reviews
- Restaurant-specific dashboards
- Advanced search and filtering
- Image upload for menu items
