// Main site functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the home page
    if (isHomePage()) {
        loadFeaturedProducts();
        loadCategories();
    }
    
    // Check if we're on the products page
    if (isProductsPage()) {
        setupFiltersAndSorting();
        loadAllProducts();
    }
    
    // Check if we're on the product detail page
    if (isProductDetailPage()) {
        loadProductDetail();
    }
});

// Check if current page is home page
function isHomePage() {
    const path = window.location.pathname;
    return path === '/' || path.endsWith('index.html');
}

// Check if current page is products page
function isProductsPage() {
    return window.location.pathname.endsWith('products.html');
}

// Check if current page is product detail page
function isProductDetailPage() {
    return window.location.pathname.endsWith('product-detail.html');
}

// Load featured products on home page
function loadFeaturedProducts() {
    const featuredProductsContainer = document.getElementById('featured-products');
    if (!featuredProductsContainer) return;
    
    const featuredProducts = productService.getFeaturedProducts();
    
    featuredProductsContainer.innerHTML = '';
    
    featuredProducts.forEach(product => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-3';
        
        col.innerHTML = `
            <div class="card h-100 product-card">
                <img src="${product.imageUrl}" class="card-img-top" alt="${product.name}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${product.name}</h5>
                    <div class="mb-2">
                        ${generateStarRating(product.rating)}
                    </div>
                    <p class="card-text text-truncate-2">${truncateText(product.description, 100)}</p>
                    <div class="mt-auto">
                        <p class="product-price mb-2">$${product.price.toFixed(2)}</p>
                        <a href="product-detail.html?id=${product.id}" class="btn btn-primary">View Details</a>
                    </div>
                </div>
            </div>
        `;
        
        featuredProductsContainer.appendChild(col);
    });
}

// Load categories on home page
function loadCategories() {
    const categoriesContainer = document.getElementById('categories');
    if (!categoriesContainer) return;
    
    const categories = productService.getAllCategories();
    
    categoriesContainer.innerHTML = '';
    
    categories.forEach(category => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-3';
        
        col.innerHTML = `
            <a href="products.html?category=${encodeURIComponent(category)}" class="text-decoration-none">
                <div class="card category-card">
                    <img src="${getCategoryImage(category)}" class="card-img" alt="${category}">
                    <div class="category-overlay">
                        <h5 class="mb-0">${category}</h5>
                    </div>
                </div>
            </a>
        `;
        
        categoriesContainer.appendChild(col);
    });
}

// Load all products with filters
function loadAllProducts(filters = {}) {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    
    // Get URL parameters for category filter
    const urlParams = new URLSearchParams(window.location.search);
    const categoryFromUrl = urlParams.get('category');
    
    // Merge URL category with other filters
    const mergedFilters = { ...filters };
    if (categoryFromUrl) {
        mergedFilters.category = categoryFromUrl;
        
        // Update category filter checkboxes
        const categoryCheckbox = document.querySelector(`input[name="category"][value="${categoryFromUrl}"]`);
        if (categoryCheckbox) {
            categoryCheckbox.checked = true;
        }
    }
    
    // Get filtered products
    const products = productService.filterProducts(mergedFilters);
    
    // Update product count
    document.getElementById('product-count').textContent = products.length;
    
    // Clear products grid
    productsGrid.innerHTML = '';
    
    // Show message if no products found
    if (products.length === 0) {
        productsGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h4>No products found</h4>
                <p>Try adjusting your filters or search criteria.</p>
            </div>
        `;
        return;
    }
    
    // Add products to grid
    products.forEach(product => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4';
        
        col.innerHTML = `
            <div class="card h-100 product-card">
                <img src="${product.imageUrl}" class="card-img-top" alt="${product.name}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${product.name}</h5>
                    <div class="mb-2">
                        ${generateStarRating(product.rating)}
                    </div>
                    <p class="card-text text-truncate-2">${truncateText(product.description, 80)}</p>
                    <div class="mt-auto d-flex justify-content-between align-items-center">
                        <p class="product-price mb-0">$${product.price.toFixed(2)}</p>
                        <div>
                            <a href="product-detail.html?id=${product.id}" class="btn btn-sm btn-outline-primary">Details</a>
                            <button class="btn btn-sm btn-primary add-to-cart" data-id="${product.id}">
                                <i class="fas fa-cart-plus"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        productsGrid.appendChild(col);
    });
    
    // Add event listeners for "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.dataset.id);
            addToCart(productId);
            showToast('Product added to cart!');
        });
    });
}

// Set up filters and sorting on products page
function setupFiltersAndSorting() {
    // Load categories into filter
    const categoryFiltersContainer = document.getElementById('category-filters');
    if (categoryFiltersContainer) {
        const categories = productService.getAllCategories();
        
        categories.forEach(category => {
            const div = document.createElement('div');
            div.className = 'form-check';
            div.innerHTML = `
                <input class="form-check-input category-filter" type="checkbox" name="category" value="${category}" id="category-${category.toLowerCase().replace(/[^a-z0-9]/g, '-')}">
                <label class="form-check-label" for="category-${category.toLowerCase().replace(/[^a-z0-9]/g, '-')}">
                    ${category}
                </label>
            `;
            
            categoryFiltersContainer.appendChild(div);
        });
    }
    
    // Set up price range filter
    const priceRange = document.getElementById('price-range');
    const priceValue = document.getElementById('price-value');
    
    if (priceRange && priceValue) {
        priceRange.addEventListener('input', function() {
            priceValue.textContent = this.value;
        });
    }
    
    // Set up apply filters button
    const applyFilters = document.getElementById('apply-filters');
    if (applyFilters) {
        applyFilters.addEventListener('click', function() {
            const selectedCategories = [];
            document.querySelectorAll('.category-filter:checked').forEach(checkbox => {
                selectedCategories.push(checkbox.value);
            });
            
            const maxPrice = parseInt(priceRange.value);
            
            const filters = {
                maxPrice: maxPrice
            };
            
            // Only add category filter if exactly one category is selected
            if (selectedCategories.length === 1) {
                filters.category = selectedCategories[0];
            }
            
            loadAllProducts(filters);
        });
    }
    
    // Set up sorting
    const sortOptions = document.getElementById('sort-options');
    if (sortOptions) {
        sortOptions.addEventListener('change', function() {
            loadAllProducts({ sortBy: this.value });
        });
    }
}

// Load product detail page
function loadProductDetail() {
    const productId = parseInt(new URLSearchParams(window.location.search).get('id'));
    
    if (!productId) {
        window.location.href = 'products.html';
        return;
    }
    
    const product = productService.getProductById(productId);
    
    if (!product) {
        window.location.href = 'products.html';
        return;
    }
    
    // Update page title
    document.title = `${product.name} - ShopEasy`;
    
    // Set product details
    document.getElementById('product-name').textContent = product.name;
    document.getElementById('product-price').textContent = `$${product.price.toFixed(2)}`;
    document.getElementById('product-description').textContent = product.description;
    document.getElementById('product-category').textContent = product.category;
    document.getElementById('product-image').src = product.imageUrl;
    document.getElementById('product-rating').innerHTML = generateStarRating(product.rating);
    
    // Set stock status
    const stockElement = document.getElementById('product-stock');
    if (product.stock > 10) {
        stockElement.textContent = 'In Stock';
        stockElement.classList.add('text-success');
    } else if (product.stock > 0) {
        stockElement.textContent = `Only ${product.stock} left in stock - order soon!`;
        stockElement.classList.add('text-warning');
    } else {
        stockElement.textContent = 'Out of Stock';
        stockElement.classList.add('text-danger');
        
        // Disable add to cart button
        const addToCartBtn = document.getElementById('add-to-cart-btn');
        addToCartBtn.disabled = true;
        addToCartBtn.textContent = 'Out of Stock';
    }
    
    // Load related products
    loadRelatedProducts(product.category, product.id);
}

// Load related products for product detail page
function loadRelatedProducts(category, excludeId) {
    const relatedProductsContainer = document.getElementById('related-products');
    if (!relatedProductsContainer) return;
    
    // Get products in the same category
    let relatedProducts = productService.getProductsByCategory(category);
    
    // Exclude current product
    relatedProducts = relatedProducts.filter(product => product.id !== excludeId);
    
    // Limit to 4 products
    relatedProducts = relatedProducts.slice(0, 4);
    
    relatedProductsContainer.innerHTML = '';
    
    // Show message if no related products
    if (relatedProducts.length === 0) {
        relatedProductsContainer.innerHTML = '<div class="col-12"><p class="text-center">No related products found.</p></div>';
        return;
    }
    
    // Add related products
    relatedProducts.forEach(product => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-3';
        
        col.innerHTML = `
            <div class="card h-100 product-card">
                <img src="${product.imageUrl}" class="card-img-top" alt="${product.name}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${product.name}</h5>
                    <div class="mb-2">
                        ${generateStarRating(product.rating)}
                    </div>
                    <p class="product-price mt-auto mb-2">$${product.price.toFixed(2)}</p>
                    <a href="product-detail.html?id=${product.id}" class="btn btn-sm btn-primary">View Details</a>
                </div>
            </div>
        `;
        
        relatedProductsContainer.appendChild(col);
    });
}

// Generate star rating HTML
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let starsHtml = '';
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<i class="fas fa-star text-warning"></i>';
    }
    
    // Add half star if needed
    if (halfStar) {
        starsHtml += '<i class="fas fa-star-half-alt text-warning"></i>';
    }
    
    // Add empty stars
    for (let i = 0; i < emptyStars; i++) {
        starsHtml += '<i class="far fa-star text-warning"></i>';
    }
    
    return starsHtml;
}

// Truncate text to a certain length
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Get category image based on category name
function getCategoryImage(category) {
    // In a real app, we would have a database of category images
    const categoryImages = {
        'Electronics': 'assets/images/electronics.jpg',
        'Home & Kitchen': 'assets/images/home-kitchen.jpg',
        'Fashion': 'assets/images/fashion.jpg',
        'Sports & Outdoors': 'assets/images/sports.jpg'
    };
    
    return categoryImages[category] || 'https://via.placeholder.com/500x300?text=' + category;
}