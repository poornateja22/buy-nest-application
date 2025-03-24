// Users Service
const userService = (function() {
    // Sample user data
    let users = [
        {
            id: 1,
            name: "Admin User",
            email: "admin@shopeasy.com",
            password: "admin123", // In a real app, this would be hashed
            role: "admin"
        },
        {
            id: 2,
            name: "John Doe",
            email: "john@example.com",
            password: "password123", // In a real app, this would be hashed
            role: "customer"
        }
    ];
    
    // Sample order data
    let orders = [
        {
            id: 1,
            userId: 2,
            orderNumber: "ORD-2025-001",
            customerName: "John Doe",
            email: "john@example.com",
            address: "123 Main St, Anytown, CA 12345",
            items: [
                {
                    id: 1,
                    name: "Wireless Bluetooth Headphones",
                    price: 79.99,
                    quantity: 1,
                    imageUrl: "https://via.placeholder.com/500x500?text=Headphones"
                },
                {
                    id: 3,
                    name: "Coffee Maker with Grinder",
                    price: 129.99,
                    quantity: 1,
                    imageUrl: "https://via.placeholder.com/500x500?text=Coffee+Maker"
                }
            ],
            subtotal: 209.98,
            shipping: 10.00,
            tax: 21.00,
            discount: 0,
            total: 240.98,
            paymentMethod: "Credit Card",
            status: "delivered",
            date: "2025-03-01T10:30:00"
        },
        {
            id: 2,
            userId: 2,
            orderNumber: "ORD-2025-002",
            customerName: "John Doe",
            email: "john@example.com",
            address: "123 Main St, Anytown, CA 12345",
            items: [
                {
                    id: 7,
                    name: "Wireless Charging Pad",
                    price: 29.99,
                    quantity: 1,
                    imageUrl: "https://via.placeholder.com/500x500?text=Charging+Pad"
                }
            ],
            subtotal: 29.99,
            shipping: 5.00,
            tax: 3.00,
            discount: 0,
            total: 37.99,
            paymentMethod: "PayPal",
            status: "shipped",
            date: "2025-03-15T14:15:00"
        },
        {
            id: 3,
            userId: 2,
            orderNumber: "ORD-2025-003",
            customerName: "John Doe",
            email: "john@example.com",
            address: "123 Main St, Anytown, CA 12345",
            items: [
                {
                    id: 5,
                    name: "Leather Laptop Bag",
                    price: 59.99,
                    quantity: 1,
                    imageUrl: "https://via.placeholder.com/500x500?text=Laptop+Bag"
                },
                {
                    id: 11,
                    name: "Leather Wallet",
                    price: 29.99,
                    quantity: 1,
                    imageUrl: "https://via.placeholder.com/500x500?text=Wallet"
                }
            ],
            subtotal: 89.98,
            shipping: 7.50,
            tax: 9.00,
            discount: 5.00,
            total: 101.48,
            paymentMethod: "Credit Card",
            status: "processing",
            date: "2025-03-20T09:45:00"
        }
    ];
    
    // Current user session
    let currentUser = null;
    
    // Load user from localStorage on init
    function init() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            try {
                currentUser = JSON.parse(savedUser);
            } catch (e) {
                localStorage.removeItem('currentUser');
            }
        }
    }
    
    // Register a new user
    function registerUser(userData) {
        // Check if email already exists
        if (users.some(user => user.email === userData.email)) {
            return { success: false, message: 'Email already registered' };
        }
        
        // Generate new ID
        const newId = Math.max(...users.map(u => u.id), 0) + 1;
        
        // Create new user with customer role
        const newUser = {
            id: newId,
            name: userData.name,
            email: userData.email,
            password: userData.password, // In a real app, this would be hashed
            role: "customer"
        };
        
        users.push(newUser);
        
        // Auto login after registration
        currentUser = { ...newUser };
        delete currentUser.password; // Don't store password in session
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        return { success: true, user: currentUser };
    }
    
    // Login user
    function loginUser(email, password) {
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Set current user session without password
            currentUser = { ...user };
            delete currentUser.password;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            return { success: true, user: currentUser };
        }
        
        return { success: false, message: 'Invalid email or password' };
    }
    
    // Logout user
    function logoutUser() {
        currentUser = null;
        localStorage.removeItem('currentUser');
    }
    
    // Get current user
    function getCurrentUser() {
        return currentUser;
    }
    
    // Check if user is logged in
    function isUserLoggedIn() {
        return currentUser !== null;
    }
    
    // Check if user is admin
    function isAdmin() {
        return currentUser && currentUser.role === 'admin';
    }
    
    // Get all users (admin only)
    function getAllUsers() {
        // In a real app, this would check for admin privileges
        return users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
    }
    
    // Get user by ID (admin only)
    function getUserById(id) {
        const user = users.find(u => u.id === id);
        
        if (user) {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
        
        return null;
    }
    
    // Get all orders (admin only)
    function getAllOrders() {
        // In a real app, this would check for admin privileges
        return orders;
    }
    
    // Get order by ID
    function getOrderById(id) {
        return orders.find(order => order.id === id);
    }
    
    // Get user orders
    function getUserOrders(userId) {
        return orders.filter(order => order.userId === userId);
    }
    
    // Create a new order
    function createOrder(orderData) {
        // Generate new ID
        const newId = Math.max(...orders.map(o => o.id), 0) + 1;
        
        // Generate order number
        const orderNumber = `ORD-2025-${String(newId).padStart(3, '0')}`;
        
        // Create new order
        const newOrder = {
            id: newId,
            orderNumber,
            ...orderData,
            date: new Date().toISOString(),
            status: 'pending'
        };
        
        orders.push(newOrder);
        return newOrder;
    }
    
    // Update order status (admin only)
    function updateOrderStatus(orderId, status) {
        const order = orders.find(o => o.id === orderId);
        
        if (order) {
            order.status = status;
            return true;
        }
        
        return false;
    }
    
    // Initialize on load
    init();
    
    // Public API
    return {
        registerUser,
        loginUser,
        logoutUser,
        getCurrentUser,
        isUserLoggedIn,
        isAdmin,
        getAllUsers,
        getUserById,
        getAllOrders,
        getOrderById,
        getUserOrders,
        createOrder,
        updateOrderStatus
    };
})();