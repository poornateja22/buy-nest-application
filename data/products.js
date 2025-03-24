// Products Service
const productService = (function() {
    // Sample product data
    let products = [
        {
            id: 1,
            name: "Wireless Bluetooth Headphones",
            price: 79.99,
            description: "Premium wireless headphones with noise cancellation technology. Experience superior sound quality and comfort for extended listening sessions.",
            category: "Electronics",
            imageUrl: "assets/images/headphones.jpg",
            stock: 15,
            rating: 4.5,
            featured: true
        },
        {
            id: 2,
            name: "Smart Fitness Tracker",
            price: 49.99,
            description: "Monitor your heart rate, steps, sleep, and more. Water-resistant and compatible with iOS and Android.",
            category: "Electronics",
            imageUrl: "assets/images/fitness-tracker.jpg",
            stock: 25,
            rating: 4.2,
            featured: true
        },
        {
            id: 3,
            name: "Coffee Maker with Grinder",
            price: 129.99,
            description: "Programmable coffee maker with built-in grinder. Fresh coffee at your fingertips every morning.",
            category: "Home & Kitchen",
            imageUrl: "assets/images/coffee-maker.jpg",
            stock: 10,
            rating: 4.7,
            featured: true
        },
        {
            id: 4,
            name: "Portable Bluetooth Speaker",
            price: 39.99,
            description: "Compact, water-resistant speaker with 12 hours of battery life and amazing sound quality.",
            category: "Electronics",
            imageUrl: "assets/images/bluetooth-speaker.jpg",
            stock: 30,
            rating: 4.1,
            featured: false
        },
        {
            id: 5,
            name: "Leather Laptop Bag",
            price: 59.99,
            description: "Stylish and durable leather laptop bag with multiple compartments for all your accessories.",
            category: "Fashion",
            imageUrl: "assets/images/laptop-bag.jpg",
            stock: 20,
            rating: 4.3,
            featured: false
        },
        {
            id: 6,
            name: "Stainless Steel Water Bottle",
            price: 24.99,
            description: "Keep your drinks cold for 24 hours or hot for 12 hours with this double-walled insulated bottle.",
            category: "Sports & Outdoors",
            imageUrl: "assets/images/water-bottle.jpg",
            stock: 50,
            rating: 4.4,
            featured: false
        },
        {
            id: 7,
            name: "Wireless Charging Pad",
            price: 29.99,
            description: "Fast wireless charging for all Qi-enabled devices. Sleek and minimalist design.",
            category: "Electronics",
            imageUrl: "assets/images/charging-pad.jpg",
            stock: 40,
            rating: 4.0,
            featured: true
        },
        {
            id: 8,
            name: "Cast Iron Skillet",
            price: 34.99,
            description: "Pre-seasoned cast iron skillet for perfect cooking every time. Lasts a lifetime with proper care.",
            category: "Home & Kitchen",
            imageUrl: "assets/images/cast-iron-skillset.jpg",
            stock: 15,
            rating: 4.8,
            featured: false
        },
        {
            id: 9,
            name: "Yoga Mat",
            price: 19.99,
            description: "Non-slip, eco-friendly yoga mat with alignment lines. Perfect for all types of yoga practice.",
            category: "Sports & Outdoors",
            imageUrl: "assets/images/yoga-mat.jpg",
            stock: 35,
            rating: 4.2,
            featured: false
        },
        {
            id: 10,
            name: "Smart LED Light Bulbs",
            price: 15.99,
            description: "Set the mood with these color-changing, WiFi-enabled smart bulbs. Control with your phone or voice assistant.",
            category: "Home & Kitchen",
            imageUrl: "assets/images/smart-bulb.jpg",
            stock: 45,
            rating: 4.6,
            featured: true
        },
        {
            id: 11,
            name: "Leather Wallet",
            price: 29.99,
            description: "Genuine leather wallet with RFID protection. Slim design with multiple card slots.",
            category: "Fashion",
            imageUrl: "assets/images/wallet.jpg",
            stock: 25,
            rating: 4.3,
            featured: false
        },
        {
            id: 12,
            name: "Digital Kitchen Scale",
            price: 18.99,
            description: "Precise digital scale for all your cooking and baking needs. Easy to clean and store.",
            category: "Home & Kitchen",
            imageUrl: "assets/images/kitchen-scale.jpg",
            stock: 30,
            rating: 4.1,
            featured: false
        }
    ];

    // Get all products
    function getAllProducts() {
        return products;
    }

    // Get a product by ID
    function getProductById(id) {
        return products.find(product => product.id === id);
    }

    // Get featured products
    function getFeaturedProducts() {
        return products.filter(product => product.featured);
    }

    // Get products by category
    function getProductsByCategory(category) {
        return products.filter(product => product.category === category);
    }

    // Add a new product
    function addProduct(product) {
        // Generate new ID (max ID + 1)
        const newId = Math.max(...products.map(p => p.id), 0) + 1;
        
        // Add new product with generated ID
        const newProduct = {
            ...product,
            id: newId,
            rating: product.rating || 0
        };
        
        products.push(newProduct);
        return newProduct;
    }

    // Update an existing product
    function updateProduct(updatedProduct) {
        const index = products.findIndex(product => product.id === updatedProduct.id);
        
        if (index !== -1) {
            products[index] = { ...products[index], ...updatedProduct };
            return products[index];
        }
        
        return null;
    }

    // Delete a product
    function deleteProduct(id) {
        const initialLength = products.length;
        products = products.filter(product => product.id !== id);
        
        return initialLength !== products.length;
    }

    // Get all unique categories
    function getAllCategories() {
        return [...new Set(products.map(product => product.category))];
    }

    // Filter products by criteria
    function filterProducts(options = {}) {
        let filteredProducts = [...products];
        
        // Filter by category
        if (options.category) {
            filteredProducts = filteredProducts.filter(product => product.category === options.category);
        }
        
        // Filter by price
        if (options.maxPrice) {
            filteredProducts = filteredProducts.filter(product => product.price <= options.maxPrice);
        }
        
        // Filter by search term
        if (options.searchTerm) {
            const searchLower = options.searchTerm.toLowerCase();
            filteredProducts = filteredProducts.filter(product => 
                product.name.toLowerCase().includes(searchLower) || 
                product.description.toLowerCase().includes(searchLower)
            );
        }
        
        // Sort products
        if (options.sortBy) {
            switch (options.sortBy) {
                case 'price-low':
                    filteredProducts.sort((a, b) => a.price - b.price);
                    break;
                case 'price-high':
                    filteredProducts.sort((a, b) => b.price - a.price);
                    break;
                case 'name-asc':
                    filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case 'name-desc':
                    filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
                    break;
                default:
                    // Default sorting: featured first, then by id
                    filteredProducts.sort((a, b) => {
                        if (a.featured && !b.featured) return -1;
                        if (!a.featured && b.featured) return 1;
                        return a.id - b.id;
                    });
            }
        }
        
        return filteredProducts;
    }

    // Public API
    return {
        getAllProducts,
        getProductById,
        getFeaturedProducts,
        getProductsByCategory,
        addProduct,
        updateProduct,
        deleteProduct,
        getAllCategories,
        filterProducts
    };
})();