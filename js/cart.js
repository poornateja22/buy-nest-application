// Cart functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart
    initCart();
    
    // Update cart count in navbar
    updateCartCount();
    
    // Handle add to cart button on product detail page
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            const productId = parseInt(new URLSearchParams(window.location.search).get('id'));
            const quantity = parseInt(document.getElementById('product-quantity').value);
            
            if (productId && quantity) {
                addToCart(productId, quantity);
                showToast('Product added to cart!');
            }
        });
    }
    
    // Set up quantity controls on product detail page
    const decreaseBtn = document.getElementById('decrease-quantity');
    const increaseBtn = document.getElementById('increase-quantity');
    const quantityInput = document.getElementById('product-quantity');
    
    if (decreaseBtn && increaseBtn && quantityInput) {
        decreaseBtn.addEventListener('click', function() {
            const currentValue = parseInt(quantityInput.value);
            if (currentValue > 1) {
                quantityInput.value = currentValue - 1;
            }
        });
        
        increaseBtn.addEventListener('click', function() {
            const currentValue = parseInt(quantityInput.value);
            quantityInput.value = currentValue + 1;
        });
    }
    
    // Render cart page if on cart.html
    if (window.location.pathname.includes('cart.html')) {
        renderCartPage();
        addCartPageEventListeners();
    }
    
    // Render checkout page if on checkout.html
    if (window.location.pathname.includes('checkout.html')) {
        renderCheckoutPage();
        setupCheckoutFormListeners();
    }
});

// Initialize cart in localStorage if not exists
function initCart() {
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }
}

// Get cart from localStorage
function getCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
}

// Save cart to localStorage
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Update cart count in navbar
function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = totalItems;
    });
}

// Add product to cart
function addToCart(productId, quantity = 1) {
    const cart = getCart();
    const product = productService.getProductById(productId);
    
    if (!product) return;
    
    // Check if product already in cart
    const existingItemIndex = cart.findIndex(item => item.id === productId);
    
    if (existingItemIndex >= 0) {
        // Update quantity if product already in cart
        cart[existingItemIndex].quantity += quantity;
    } else {
        // Add new product to cart
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            quantity: quantity
        });
    }
    
    // Save updated cart
    saveCart(cart);
    
    // Update cart count
    updateCartCount();
}

// Update cart item quantity
function updateCartItemQuantity(productId, quantity) {
    const cart = getCart();
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex >= 0) {
        if (quantity > 0) {
            cart[itemIndex].quantity = quantity;
        } else {
            // Remove item if quantity is 0 or negative
            cart.splice(itemIndex, 1);
        }
        
        saveCart(cart);
        updateCartCount();
        
        // Update UI if on cart page
        if (window.location.pathname.includes('cart.html')) {
            renderCartPage();
        }
    }
}

// Remove product from cart
function removeFromCart(productId) {
    const cart = getCart();
    const updatedCart = cart.filter(item => item.id !== productId);
    
    saveCart(updatedCart);
    updateCartCount();
    
    // Update UI if on cart page
    if (window.location.pathname.includes('cart.html')) {
        renderCartPage();
    }
}

// Clear cart
function clearCart() {
    saveCart([]);
    updateCartCount();
    
    // Update UI if on cart page
    if (window.location.pathname.includes('cart.html')) {
        renderCartPage();
    }
}

// Calculate cart totals
function calculateCartTotals() {
    const cart = getCart();
    
    // Get applied coupon discount from session
    const appliedCoupon = sessionStorage.getItem('appliedCoupon');
    const discountPercent = appliedCoupon ? 10 : 0; // 10% discount for any valid coupon
    
    // Calculate subtotal
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Calculate discount
    const discount = (subtotal * discountPercent) / 100;
    
    // Calculate tax (10%)
    const tax = (subtotal - discount) * 0.1;
    
    // Calculate shipping (free over $100, otherwise $10)
    const shipping = subtotal > 100 ? 0 : 10;
    
    // Calculate total
    const total = subtotal - discount + tax + shipping;
    
    return {
        subtotal,
        discount,
        tax,
        shipping,
        total,
        appliedCoupon
    };
}

// Apply coupon code
function applyCoupon(code) {
    // In a real app, we would validate the coupon code against a database
    if (code && code.toLowerCase() === 'discount10') {
        sessionStorage.setItem('appliedCoupon', code);
        return true;
    }
    
    sessionStorage.removeItem('appliedCoupon');
    return false;
}

// Render cart page
function renderCartPage() {
    const cart = getCart();
    const cartEmptyEl = document.getElementById('cart-empty');
    const cartContentEl = document.getElementById('cart-content');
    const cartItemsEl = document.getElementById('cart-items');
    
    // Show empty cart message if cart is empty
    if (cart.length === 0) {
        cartEmptyEl.classList.remove('d-none');
        cartContentEl.classList.add('d-none');
        return;
    }
    
    // Show cart content
    cartEmptyEl.classList.add('d-none');
    cartContentEl.classList.remove('d-none');
    
    // Clear cart items
    cartItemsEl.innerHTML = '';
    
    // Render cart items
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <img src="${item.imageUrl}" alt="${item.name}" class="cart-item-img me-3">
                    <div>
                        <h6 class="mb-0">${item.name}</h6>
                        <small class="text-muted">ID: ${item.id}</small>
                    </div>
                </div>
            </td>
            <td>$${item.price.toFixed(2)}</td>
            <td>
                <div class="d-flex align-items-center">
                    <button class="btn btn-sm btn-outline-secondary me-2 btn-quantity decrease-quantity" data-id="${item.id}">-</button>
                    <input type="number" class="form-control text-center" value="${item.quantity}" min="1" style="width: 60px;" data-id="${item.id}">
                    <button class="btn btn-sm btn-outline-secondary ms-2 btn-quantity increase-quantity" data-id="${item.id}">+</button>
                </div>
            </td>
            <td>$${itemTotal.toFixed(2)}</td>
            <td>
                <button class="btn btn-sm btn-danger remove-item" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        cartItemsEl.appendChild(tr);
    });
    
    // Update order summary
    updateOrderSummary();
}

// Update order summary
function updateOrderSummary() {
    const totals = calculateCartTotals();
    
    document.getElementById('subtotal').textContent = `$${totals.subtotal.toFixed(2)}`;
    document.getElementById('discount').textContent = `$${totals.discount.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${totals.tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${totals.total.toFixed(2)}`;
    
    // Update coupon field if coupon is applied
    const couponField = document.getElementById('coupon-code');
    if (couponField && totals.appliedCoupon) {
        couponField.value = totals.appliedCoupon;
        couponField.disabled = true;
        document.getElementById('apply-coupon').textContent = 'Applied';
        document.getElementById('apply-coupon').classList.remove('btn-outline-primary');
        document.getElementById('apply-coupon').classList.add('btn-success');
    }
}

// Add event listeners for cart page
function addCartPageEventListeners() {
    // Increase quantity buttons
    document.querySelectorAll('.increase-quantity').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.dataset.id);
            const input = document.querySelector(`input[data-id="${productId}"]`);
            const newQuantity = parseInt(input.value) + 1;
            
            input.value = newQuantity;
            updateCartItemQuantity(productId, newQuantity);
        });
    });
    
    // Decrease quantity buttons
    document.querySelectorAll('.decrease-quantity').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.dataset.id);
            const input = document.querySelector(`input[data-id="${productId}"]`);
            const newQuantity = parseInt(input.value) - 1;
            
            if (newQuantity > 0) {
                input.value = newQuantity;
                updateCartItemQuantity(productId, newQuantity);
            }
        });
    });
    
    // Quantity inputs
    document.querySelectorAll('input[data-id]').forEach(input => {
        input.addEventListener('change', function() {
            const productId = parseInt(this.dataset.id);
            const newQuantity = parseInt(this.value);
            
            if (newQuantity > 0) {
                updateCartItemQuantity(productId, newQuantity);
            } else {
                this.value = 1;
                updateCartItemQuantity(productId, 1);
            }
        });
    });
    
    // Remove item buttons
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.dataset.id);
            removeFromCart(productId);
        });
    });
    
    // Apply coupon button
    const applyButton = document.getElementById('apply-coupon');
    if (applyButton) {
        applyButton.addEventListener('click', function() {
            const couponCode = document.getElementById('coupon-code').value;
            
            if (applyCoupon(couponCode)) {
                updateOrderSummary();
                showToast('Coupon applied successfully!');
            } else {
                showToast('Invalid coupon code', 'error');
            }
        });
    }
    
    // Checkout button
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function(e) {
            // Prevent navigation if cart is empty
            if (getCart().length === 0) {
                e.preventDefault();
                showToast('Your cart is empty', 'error');
            }
            
            // If user is not logged in, save current page for redirect after login
            if (!userService.isUserLoggedIn()) {
                e.preventDefault();
                localStorage.setItem('redirectAfterLogin', 'checkout.html');
                window.location.href = 'login.html';
            }
        });
    }
}

// Render checkout page
function renderCheckoutPage() {
    const cart = getCart();
    
    // Redirect to cart if cart is empty
    if (cart.length === 0) {
        window.location.href = 'cart.html';
        return;
    }
    
    // Render order summary
    const orderItemsContainer = document.getElementById('order-items');
    if (orderItemsContainer) {
        orderItemsContainer.innerHTML = '';
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'border-bottom py-2';
            cartItem.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                        <img src="${item.imageUrl}" alt="${item.name}" class="cart-item-img me-3" width="50" height="50">
                        <div>
                            <h6 class="mb-0">${item.name}</h6>
                            <small class="text-muted">Quantity: ${item.quantity}</small>
                        </div>
                    </div>
                    <div class="text-end">
                        <div>$${item.price.toFixed(2)} x ${item.quantity}</div>
                        <strong>$${itemTotal.toFixed(2)}</strong>
                    </div>
                </div>
            `;
            
            orderItemsContainer.appendChild(cartItem);
        });
    }
    
    // Update checkout summary
    const totals = calculateCartTotals();
    
    const subtotalEl = document.getElementById('checkout-subtotal');
    const discountEl = document.getElementById('checkout-discount');
    const shippingEl = document.getElementById('checkout-shipping');
    const taxEl = document.getElementById('checkout-tax');
    const totalEl = document.getElementById('checkout-total');
    
    if (subtotalEl) subtotalEl.textContent = `$${totals.subtotal.toFixed(2)}`;
    if (discountEl) {
        if (totals.discount > 0) {
            discountEl.parentElement.classList.remove('d-none');
            discountEl.textContent = `-$${totals.discount.toFixed(2)}`;
        } else {
            discountEl.parentElement.classList.add('d-none');
        }
    }
    if (shippingEl) shippingEl.textContent = totals.shipping > 0 ? `$${totals.shipping.toFixed(2)}` : 'Free';
    if (taxEl) taxEl.textContent = `$${totals.tax.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${totals.total.toFixed(2)}`;
    
    // Pre-fill user data if logged in
    const currentUser = userService.getCurrentUser();
    if (currentUser) {
        const nameInput = document.getElementById('checkout-name');
        const emailInput = document.getElementById('checkout-email');
        
        if (nameInput) nameInput.value = currentUser.name;
        if (emailInput) emailInput.value = currentUser.email;
    }
}

// Setup checkout form event listeners
function setupCheckoutFormListeners() {
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handlePlaceOrder);
    }
}

// Handle place order button click
function handlePlaceOrder(event) {
    event.preventDefault();
    
    // Get form data
    const form = event.target;
    const name = form.querySelector('#checkout-name').value;
    const email = form.querySelector('#checkout-email').value;
    const address = `${form.querySelector('#checkout-address').value}, ${form.querySelector('#checkout-city').value}, ${form.querySelector('#checkout-zip').value}`;
    const paymentMethod = form.querySelector('input[name="payment-method"]:checked').value;
    
    // Get cart and totals
    const cart = getCart();
    const totals = calculateCartTotals();
    
    // Create order data
    const orderData = {
        userId: userService.getCurrentUser()?.id || 0,
        customerName: name,
        email: email,
        address: address,
        items: cart,
        subtotal: totals.subtotal,
        discount: totals.discount,
        tax: totals.tax,
        shipping: totals.shipping,
        total: totals.total,
        paymentMethod: paymentMethod
    };
    
    // Create order
    const order = userService.createOrder(orderData);
    
    // Clear cart and applied coupon
    clearCart();
    sessionStorage.removeItem('appliedCoupon');
    
    // Show success message and redirect to order confirmation
    alert(`Order #${order.orderNumber} placed successfully! Thank you for your purchase.`);
    window.location.href = 'index.html';
}

// Show toast notification
function showToast(message, type = 'success') {
    // Check if toast container exists, create if not
    let toastContainer = document.querySelector('.toast-container');
    
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `alert alert-${type === 'success' ? 'success' : 'danger'} mb-2`;
    toast.textContent = message;
    
    // Add toast to container
    toastContainer.appendChild(toast);
    
    // Auto-remove toast after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}