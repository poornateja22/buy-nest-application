document.addEventListener('DOMContentLoaded', function() {
    // Check if user is admin, redirect if not
    if (!userService.isAdmin()) {
      window.location.href = '../index.html';
      return;
    }
    
    // Set up sidebar toggle
    setupSidebarToggle();
    
    // Check which admin page we're on and load appropriate content
    if (isAdminDashboard()) {
      loadDashboardData();
    } else if (isAdminProducts()) {
      loadProductsTable();
      setupProductFormHandlers();
    } else if (isAdminOrders()) {
      loadOrdersTable();
    }
  });
  
  // Check if current page is admin dashboard
  function isAdminDashboard() {
    return window.location.pathname.endsWith('dashboard.html');
  }
  
  // Check if current page is admin products
  function isAdminProducts() {
    return window.location.pathname.endsWith('products.html');
  }
  
  // Check if current page is admin orders
  function isAdminOrders() {
    return window.location.pathname.endsWith('orders.html');
  }
  
  // Set up sidebar toggle functionality
  function setupSidebarToggle() {
    const sidebarToggleBtn = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const content = document.querySelector('.admin-content');
    
    if (sidebarToggleBtn && sidebar && content) {
      sidebarToggleBtn.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        content.classList.toggle('expanded');
      });
    }
  }
  
  // Load dashboard data
  function loadDashboardData() {
    const products = productService.getAllProducts();
    const orders = userService.getAllOrders();
    const users = userService.getAllUsers().filter(user => user.role !== 'admin');
    
    // Calculate total revenue
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    
    // Update dashboard stats
    document.getElementById('total-orders').textContent = orders.length;
    document.getElementById('total-revenue').textContent = `$${totalRevenue.toFixed(2)}`;
    document.getElementById('total-products').textContent = products.length;
    document.getElementById('total-customers').textContent = users.length;
    
    // Load recent orders
    loadRecentOrders(orders.slice(0, 5));
    
    // Load top selling products
    loadTopProducts(products.slice(0, 5));
  }
  
  // Load recent orders for dashboard
  function loadRecentOrders(orders) {
    const recentOrdersContainer = document.getElementById('recent-orders');
    if (!recentOrdersContainer) return;
    
    recentOrdersContainer.innerHTML = '';
    
    if (orders.length === 0) {
      recentOrdersContainer.innerHTML = `
        <tr>
          <td colspan="6" class="text-center">No orders found</td>
        </tr>
      `;
      return;
    }
    
    // Sort orders by date (newest first)
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    orders.forEach(order => {
      const formattedDate = new Date(order.date).toLocaleDateString();
      
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${order.orderNumber}</td>
        <td>${order.customerName}</td>
        <td>${formattedDate}</td>
        <td>$${order.total.toFixed(2)}</td>
        <td>
          <span class="badge ${getStatusBadgeClass(order.status)}">${order.status}</span>
        </td>
        <td>
          <a href="orders.html?id=${order.id}" class="btn btn-sm btn-primary">View</a>
        </td>
      `;
      
      recentOrdersContainer.appendChild(tr);
    });
  }
  
  // Load top products for dashboard
  function loadTopProducts(products) {
    const topProductsContainer = document.getElementById('top-products');
    if (!topProductsContainer) return;
    
    topProductsContainer.innerHTML = '';
    
    if (products.length === 0) {
      topProductsContainer.innerHTML = `
        <tr>
          <td colspan="5" class="text-center">No products found</td>
        </tr>
      `;
      return;
    }
    
    // Sort products by stock (lowest first) as a simple proxy for popularity
    products.sort((a, b) => a.stock - b.stock);
    
    products.forEach(product => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div class="d-flex align-items-center">
            <img src="${product.imageUrl}" alt="${product.name}" width="40" height="40" class="me-2">
            ${product.name}
          </div>
        </td>
        <td>${product.category}</td>
        <td>$${product.price.toFixed(2)}</td>
        <td>${Math.floor(Math.random() * 50) + 10}</td> <!-- Mock sales data -->
        <td>${product.stock}</td>
      `;
      
      topProductsContainer.appendChild(tr);
    });
  }
  
  // Load products table for admin products page
  function loadProductsTable() {
    const productsTableContainer = document.getElementById('products-table-body');
    if (!productsTableContainer) return;
    
    const products = productService.getAllProducts();
    
    productsTableContainer.innerHTML = '';
    
    if (products.length === 0) {
      productsTableContainer.innerHTML = `
        <tr>
          <td colspan="7" class="text-center">No products found</td>
        </tr>
      `;
      return;
    }
    
    products.forEach(product => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${product.id}</td>
        <td>
          <div class="d-flex align-items-center">
            <img src="${product.imageUrl}" alt="${product.name}" width="40" height="40" class="me-2">
            ${product.name}
          </div>
        </td>
        <td>${product.category}</td>
        <td>$${product.price.toFixed(2)}</td>
        <td>${product.stock}</td>
        <td>${product.featured ? '<span class="badge bg-success">Yes</span>' : '<span class="badge bg-secondary">No</span>'}</td>
        <td>
          <div class="btn-group">
            <button class="btn btn-sm btn-primary edit-product" data-id="${product.id}" data-bs-toggle="modal" data-bs-target="#productModal">Edit</button>
            <button class="btn btn-sm btn-danger delete-product" data-id="${product.id}">Delete</button>
          </div>
        </td>
      `;
      
      productsTableContainer.appendChild(tr);
    });
    
    // Add event listeners for edit and delete buttons
    addProductTableEventListeners();
  }
  
  // Set up product form handlers
  function setupProductFormHandlers() {
    // Reset form when modal is opened for a new product
    const newProductBtn = document.getElementById('new-product-btn');
    if (newProductBtn) {
      newProductBtn.addEventListener('click', function() {
        resetProductForm();
        document.getElementById('product-form-title').textContent = 'Add New Product';
        document.getElementById('product-id').value = '';
      });
    }
    
    // Handle form submission
    const productForm = document.getElementById('product-form');
    if (productForm) {
      productForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Get form values
        const productId = document.getElementById('product-id').value;
        const name = document.getElementById('product-name').value;
        const price = parseFloat(document.getElementById('product-price').value);
        const category = document.getElementById('product-category').value;
        const description = document.getElementById('product-description').value;
        const stock = parseInt(document.getElementById('product-stock').value);
        const imageUrl = document.getElementById('product-image').value;
        const featured = document.getElementById('product-featured').checked;
        
        const productData = {
          name,
          price,
          category,
          description,
          stock,
          imageUrl,
          ratings: 0,
          featured
        };
        
        if (productId) {
          // Update existing product
          productData.id = parseInt(productId);
          productService.updateProduct(productData);
        } else {
          // Add new product
          productService.addProduct(productData);
        }
        
        // Close modal and reload products table
        const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
        modal.hide();
        
        loadProductsTable();
      });
    }
    
    // Populate categories dropdown
    const categorySelect = document.getElementById('product-category');
    if (categorySelect) {
      const categories = productService.getAllCategories();
      
      categorySelect.innerHTML = '<option value="">Select Category</option>';
      
      categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
      });
    }
  }
  
  // Add event listeners for product table actions
  function addProductTableEventListeners() {
    // Edit product buttons
    document.querySelectorAll('.edit-product').forEach(btn => {
      btn.addEventListener('click', function() {
        const productId = this.dataset.id;
        const product = productService.getProductById(parseInt(productId));
        
        if (product) {
          // Populate form with product data
          document.getElementById('product-form-title').textContent = 'Edit Product';
          document.getElementById('product-id').value = product.id;
          document.getElementById('product-name').value = product.name;
          document.getElementById('product-price').value = product.price;
          document.getElementById('product-category').value = product.category;
          document.getElementById('product-description').value = product.description;
          document.getElementById('product-stock').value = product.stock;
          document.getElementById('product-image').value = product.imageUrl;
          document.getElementById('product-featured').checked = product.featured;
          
          // Show product image preview
          const imagePreview = document.getElementById('image-preview');
          if (imagePreview) {
            imagePreview.src = product.imageUrl;
            imagePreview.style.display = 'block';
          }
        }
      });
    });
    
    // Delete product buttons
    document.querySelectorAll('.delete-product').forEach(btn => {
      btn.addEventListener('click', function() {
        const productId = this.dataset.id;
        
        if (confirm('Are you sure you want to delete this product?')) {
          productService.deleteProduct(parseInt(productId));
          loadProductsTable();
        }
      });
    });
  }
  
  // Reset product form
  function resetProductForm() {
    const productForm = document.getElementById('product-form');
    if (productForm) {
      productForm.reset();
      
      // Hide image preview
      const imagePreview = document.getElementById('image-preview');
      if (imagePreview) {
        imagePreview.style.display = 'none';
      }
    }
  }
  
  // Load orders table for admin orders page
  function loadOrdersTable() {
    const ordersTableContainer = document.getElementById('orders-table-body');
    if (!ordersTableContainer) return;
    
    const orders = userService.getAllOrders();
    
    ordersTableContainer.innerHTML = '';
    
    if (orders.length === 0) {
      ordersTableContainer.innerHTML = `
        <tr>
          <td colspan="7" class="text-center">No orders found</td>
        </tr>
      `;
      return;
    }
    
    // Sort orders by date (newest first)
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    orders.forEach(order => {
      const formattedDate = new Date(order.date).toLocaleDateString();
      
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${order.orderNumber}</td>
        <td>${order.customerName}</td>
        <td>${formattedDate}</td>
        <td>$${order.total.toFixed(2)}</td>
        <td>${order.paymentMethod}</td>
        <td>
          <select class="form-select form-select-sm status-select" data-id="${order.id}">
            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
            <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </td>
        <td>
          <button class="btn btn-sm btn-primary view-order" data-id="${order.id}" data-bs-toggle="modal" data-bs-target="#orderModal">View Details</button>
        </td>
      `;
      
      ordersTableContainer.appendChild(tr);
    });
    
    // Add event listeners
    addOrderTableEventListeners();
    
    // Check for order ID in URL to open details modal
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');
    
    if (orderId) {
      const order = userService.getOrderById(parseInt(orderId));
      if (order) {
        showOrderDetails(order);
        const orderModal = new bootstrap.Modal(document.getElementById('orderModal'));
        orderModal.show();
      }
    }
  }
  
  // Add event listeners for order table actions
  function addOrderTableEventListeners() {
    // Status change selects
    document.querySelectorAll('.status-select').forEach(select => {
      select.addEventListener('change', function() {
        const orderId = this.dataset.id;
        const newStatus = this.value;
        
        userService.updateOrderStatus(parseInt(orderId), newStatus);
        
        // Show success message
        alert('Order status updated successfully');
      });
    });
    
    // View order details buttons
    document.querySelectorAll('.view-order').forEach(btn => {
      btn.addEventListener('click', function() {
        const orderId = this.dataset.id;
        const order = userService.getOrderById(parseInt(orderId));
        
        if (order) {
          showOrderDetails(order);
        }
      });
    });
  }
  
  // Show order details in modal
  function showOrderDetails(order) {
    const modalTitle = document.getElementById('order-modal-title');
    const orderDetailsContainer = document.getElementById('order-details');
    
    if (!modalTitle || !orderDetailsContainer) return;
    
    modalTitle.textContent = `Order #${order.orderNumber}`;
    
    const formattedDate = new Date(order.date).toLocaleDateString();
    
    // Generate HTML for order details
    let html = `
      <div class="row mb-3">
        <div class="col-md-6">
          <h5>Customer Information</h5>
          <p><strong>Name:</strong> ${order.customerName}</p>
          <p><strong>Email:</strong> ${order.email}</p>
          <p><strong>Address:</strong> ${order.address}</p>
        </div>
        <div class="col-md-6">
          <h5>Order Information</h5>
          <p><strong>Order Date:</strong> ${formattedDate}</p>
          <p><strong>Status:</strong> <span class="badge ${getStatusBadgeClass(order.status)}">${order.status}</span></p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
        </div>
      </div>
      
      <h5>Order Items</h5>
      <div class="table-responsive">
        <table class="table table-bordered">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    // Add order items to table
    order.items.forEach(item => {
      const itemTotal = item.price * item.quantity;
      
      html += `
        <tr>
          <td>
            <div class="d-flex align-items-center">
              <img src="${item.imageUrl}" alt="${item.name}" width="40" height="40" class="me-2">
              ${item.name}
            </div>
          </td>
          <td>$${item.price.toFixed(2)}</td>
          <td>${item.quantity}</td>
          <td>$${itemTotal.toFixed(2)}</td>
        </tr>
      `;
    });
    
    html += `
          </tbody>
        </table>
      </div>
      
      <div class="row">
        <div class="col-md-6 offset-md-6">
          <table class="table table-bordered">
            <tr>
              <td>Subtotal:</td>
              <td>$${order.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Shipping:</td>
              <td>$${order.shipping.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Tax:</td>
              <td>$${order.tax.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Discount:</td>
              <td>-$${order.discount.toFixed(2)}</td>
            </tr>
            <tr class="table-primary">
              <td><strong>Total:</strong></td>
              <td><strong>$${order.total.toFixed(2)}</strong></td>
            </tr>
          </table>
        </div>
      </div>
    `;
    
    orderDetailsContainer.innerHTML = html;
  }
  
  // Get CSS class for status badge
  function getStatusBadgeClass(status) {
    switch (status) {
      case 'pending':
        return 'bg-warning';
      case 'processing':
        return 'bg-info';
      case 'shipped':
        return 'bg-primary';
      case 'delivered':
        return 'bg-success';
      case 'cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }