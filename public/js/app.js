/* ======================================
   FreshCart — Frontend Application Logic
   ====================================== */

(() => {
  'use strict';

  // ─── State ──────────────────────────────────────────────
  const CART_ID = localStorage.getItem('freshcart_cart_id') || generateCartId();
  let products = [];
  let cartItems = [];
  let cartTotals = {};
  let currentCategory = 'all';
  let currentSearch = '';
  let currentSort = '';
  let searchDebounceTimer = null;

  function generateCartId() {
    const id = 'cart_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('freshcart_cart_id', id);
    return id;
  }

  // ─── API Helpers ────────────────────────────────────────
  const API_BASE = '/api';

  async function apiFetch(url, options = {}) {
    try {
      const res = await fetch(API_BASE + url, {
        headers: { 'Content-Type': 'application/json' },
        ...options
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Request failed');
      }
      return data;
    } catch (err) {
      console.error('API Error:', err);
      showToast(err.message || 'Something went wrong', 'error');
      throw err;
    }
  }

  // ─── Product Loading ───────────────────────────────────
  async function loadProducts() {
    const params = new URLSearchParams();
    if (currentCategory && currentCategory !== 'all') params.set('category', currentCategory);
    if (currentSearch) params.set('search', currentSearch);
    if (currentSort) params.set('sort', currentSort);

    const query = params.toString();
    const url = '/products' + (query ? '?' + query : '');

    try {
      const data = await apiFetch(url);
      products = data.data;
      renderProducts(products);
      updateResultsCount(data.count);
    } catch {
      renderProducts([]);
      updateResultsCount(0);
    }
  }

  function renderProducts(items) {
    const grid = document.getElementById('products-grid');
    const emptyState = document.getElementById('empty-state');

    if (!items || items.length === 0) {
      grid.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';

    grid.innerHTML = items.map((product, index) => {
      const cartItem = cartItems.find(ci => ci.productId === product.id);
      const inCart = !!cartItem;
      const qty = cartItem ? cartItem.quantity : 0;
      const stars = getStarRating(product.rating);
      const badgeClass = product.badge
        ? (product.badge === 'Seasonal' ? 'seasonal' : product.badge === 'Premium' ? 'premium' : '')
        : '';

      return `
        <div class="product-card" style="animation-delay: ${index * 0.05}s" id="product-${product.id}">
          ${product.badge ? `<span class="product-badge ${badgeClass}">${product.badge}</span>` : ''}
          <div class="product-card-image">${product.image}</div>
          <div class="product-card-body">
            <div class="product-category">${product.category}</div>
            <h3 class="product-name">${product.name}</h3>
            <p class="product-desc">${product.description}</p>
            <div class="product-rating">
              <span class="rating-stars">${stars}</span>
              <span class="rating-value">${product.rating}</span>
            </div>
            <div class="product-footer">
              <div class="product-price">
                <span class="price-value">$${product.price.toFixed(2)}</span>
                <span class="price-unit">${product.unit}</span>
              </div>
              ${inCart
                ? `<div class="qty-controls" data-product-id="${product.id}">
                     <button class="qty-btn" onclick="app.updateQty(${product.id}, ${qty - 1})" aria-label="Decrease">−</button>
                     <span class="qty-value">${qty}</span>
                     <button class="qty-btn" onclick="app.updateQty(${product.id}, ${qty + 1})" aria-label="Increase">+</button>
                   </div>`
                : `<button class="add-to-cart-btn" onclick="app.addToCart(${product.id})" id="add-btn-${product.id}">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                     Add
                   </button>`
              }
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function getStarRating(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
  }

  function updateResultsCount(count) {
    const el = document.getElementById('results-count');
    if (el) el.textContent = `${count} Product${count !== 1 ? 's' : ''}`;
  }

  // ─── Cart Operations ──────────────────────────────────
  async function loadCart() {
    try {
      const data = await apiFetch(`/cart/${CART_ID}`);
      cartItems = data.data.items;
      cartTotals = data.data.totals;
      updateCartUI();
    } catch {
      cartItems = [];
      cartTotals = {};
    }
  }

  async function addToCart(productId) {
    try {
      const data = await apiFetch(`/cart/${CART_ID}/add`, {
        method: 'POST',
        body: JSON.stringify({ productId, quantity: 1 })
      });
      cartItems = data.data.items;
      cartTotals = data.data.totals;
      updateCartUI();
      renderProducts(products); // Re-render to show qty controls
      showToast(data.message, 'success');
    } catch {
      // Error already shown by apiFetch
    }
  }

  async function updateQty(productId, newQty) {
    try {
      if (newQty <= 0) {
        await removeFromCart(productId);
        return;
      }
      const data = await apiFetch(`/cart/${CART_ID}/update`, {
        method: 'PUT',
        body: JSON.stringify({ productId, quantity: newQty })
      });
      cartItems = data.data.items;
      cartTotals = data.data.totals;
      updateCartUI();
      renderProducts(products);
    } catch {
      // Error already shown
    }
  }

  async function removeFromCart(productId) {
    try {
      const data = await apiFetch(`/cart/${CART_ID}/remove/${productId}`, {
        method: 'DELETE'
      });
      cartItems = data.data.items;
      cartTotals = data.data.totals;
      updateCartUI();
      renderProducts(products);
      showToast(data.message, 'success');
    } catch {
      // Error already shown
    }
  }

  async function clearCart() {
    try {
      const data = await apiFetch(`/cart/${CART_ID}/clear`, {
        method: 'DELETE'
      });
      cartItems = data.data.items;
      cartTotals = data.data.totals;
      updateCartUI();
      renderProducts(products);
      showToast('Cart cleared', 'success');
    } catch {
      // Error already shown
    }
  }

  function updateCartUI() {
    const badge = document.getElementById('cart-badge');
    const cartBody = document.getElementById('cart-items');
    const cartEmpty = document.getElementById('cart-empty');
    const cartFooter = document.getElementById('cart-footer');
    const count = cartTotals.itemCount || 0;

    // Badge
    if (badge) {
      badge.textContent = count;
      if (count > 0) {
        badge.classList.add('visible');
        badge.classList.add('bump');
        setTimeout(() => badge.classList.remove('bump'), 300);
      } else {
        badge.classList.remove('visible');
      }
    }

    // Cart items
    if (cartItems.length === 0) {
      if (cartEmpty) cartEmpty.style.display = 'block';
      if (cartBody) cartBody.innerHTML = '';
      if (cartFooter) cartFooter.style.display = 'none';
      return;
    }

    if (cartEmpty) cartEmpty.style.display = 'none';
    if (cartFooter) cartFooter.style.display = 'block';

    if (cartBody) {
      cartBody.innerHTML = cartItems.map(item => `
        <div class="cart-item" data-product-id="${item.productId}">
          <div class="cart-item-image">${item.image}</div>
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">$${item.price.toFixed(2)} × ${item.quantity}</div>
            <div class="qty-controls">
              <button class="qty-btn" onclick="app.updateQty(${item.productId}, ${item.quantity - 1})" aria-label="Decrease">−</button>
              <span class="qty-value">${item.quantity}</span>
              <button class="qty-btn" onclick="app.updateQty(${item.productId}, ${item.quantity + 1})" aria-label="Increase">+</button>
            </div>
          </div>
          <div class="cart-item-actions">
            <span class="cart-item-total">$${(item.price * item.quantity).toFixed(2)}</span>
            <button class="cart-item-remove" onclick="app.removeFromCart(${item.productId})">Remove</button>
          </div>
        </div>
      `).join('');
    }

    // Totals
    updateElement('cart-subtotal', `$${cartTotals.subtotal.toFixed(2)}`);
    updateElement('cart-delivery', cartTotals.deliveryFee === 0 ? 'FREE' : `$${cartTotals.deliveryFee.toFixed(2)}`);
    updateElement('cart-tax', `$${cartTotals.tax.toFixed(2)}`);
    updateElement('cart-total', `$${cartTotals.total.toFixed(2)}`);

    // Delivery notice
    const deliveryNotice = document.getElementById('delivery-notice');
    if (deliveryNotice) {
      if (cartTotals.amountToFreeDelivery > 0) {
        deliveryNotice.className = 'delivery-notice warning';
        deliveryNotice.textContent = `Add $${cartTotals.amountToFreeDelivery.toFixed(2)} more for FREE delivery!`;
      } else {
        deliveryNotice.className = 'delivery-notice';
        deliveryNotice.textContent = '🎉 You qualify for FREE delivery!';
      }
    }
  }

  function updateElement(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // ─── Cart Sidebar ──────────────────────────────────────
  function openCart() {
    document.getElementById('cart-sidebar').classList.add('open');
    document.getElementById('cart-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    document.getElementById('cart-sidebar').classList.remove('open');
    document.getElementById('cart-overlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  // ─── Checkout ──────────────────────────────────────────
  function openCheckout() {
    if (cartItems.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }
    closeCart();

    // Populate checkout summary
    const summaryItems = document.getElementById('checkout-summary-items');
    if (summaryItems) {
      summaryItems.innerHTML = cartItems.map(item => `
        <div class="checkout-summary-item">
          <span class="item-name">
            <span>${item.image}</span>
            <span>${item.name} × ${item.quantity}</span>
          </span>
          <span>$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
      `).join('');
    }

    updateElement('co-subtotal', `$${cartTotals.subtotal.toFixed(2)}`);
    updateElement('co-delivery', cartTotals.deliveryFee === 0 ? 'FREE' : `$${cartTotals.deliveryFee.toFixed(2)}`);
    updateElement('co-tax', `$${cartTotals.tax.toFixed(2)}`);
    updateElement('co-total', `$${cartTotals.total.toFixed(2)}`);

    document.getElementById('checkout-overlay').style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeCheckout() {
    document.getElementById('checkout-overlay').style.display = 'none';
    document.body.style.overflow = '';
  }

  async function placeOrder(e) {
    e.preventDefault();

    const name = document.getElementById('customer-name').value.trim();
    const email = document.getElementById('customer-email').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();
    const address = document.getElementById('customer-address').value.trim();
    const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'cash';

    if (!name || !email || !address) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    const placeBtn = document.getElementById('place-order-btn');
    placeBtn.disabled = true;
    placeBtn.textContent = '⏳ Placing Order...';

    try {
      const data = await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({
          cartId: CART_ID,
          items: cartItems,
          totals: cartTotals,
          customer: { name, email, phone, address, paymentMethod }
        })
      });

      // Close checkout and show confirmation
      closeCheckout();
      showOrderConfirmation(data.data);

      // Clear the cart on the server
      await apiFetch(`/cart/${CART_ID}/clear`, { method: 'DELETE' });
      cartItems = [];
      cartTotals = { subtotal: 0, itemCount: 0, deliveryFee: 4.99, tax: 0, total: 4.99, savings: 0, freeDeliveryThreshold: 25, amountToFreeDelivery: 25 };
      updateCartUI();
      renderProducts(products);

      // Reset checkout form
      document.getElementById('checkout-form').reset();
    } catch {
      // Error already shown
    } finally {
      placeBtn.disabled = false;
      placeBtn.textContent = '🛒 Place Order';
    }
  }

  function showOrderConfirmation(order) {
    const details = document.getElementById('order-details');
    if (details) {
      details.innerHTML = `
        <div class="order-detail-row">
          <span class="label">Order ID</span>
          <span class="value">#${order.id}</span>
        </div>
        <div class="order-detail-row">
          <span class="label">Items</span>
          <span class="value">${order.items.length} item${order.items.length !== 1 ? 's' : ''}</span>
        </div>
        <div class="order-detail-row">
          <span class="label">Total</span>
          <span class="value">$${order.totals.total.toFixed(2)}</span>
        </div>
        <div class="order-detail-row">
          <span class="label">Payment</span>
          <span class="value">${formatPayment(order.paymentMethod)}</span>
        </div>
        <div class="order-detail-row">
          <span class="label">Delivery</span>
          <span class="value">${order.estimatedDelivery.display}</span>
        </div>
      `;
    }
    document.getElementById('order-confirmation-overlay').style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeOrderConfirmation() {
    document.getElementById('order-confirmation-overlay').style.display = 'none';
    document.body.style.overflow = '';
  }

  function formatPayment(method) {
    const methods = { cash: 'Cash on Delivery', card: 'Credit Card', upi: 'UPI / Digital' };
    return methods[method] || method;
  }

  // ─── Orders List ───────────────────────────────────────
  async function openOrders() {
    const overlay = document.getElementById('orders-overlay');
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    const list = document.getElementById('orders-list');
    list.innerHTML = '<div class="cart-empty"><span class="cart-empty-icon">⏳</span><h3>Loading orders...</h3></div>';

    try {
      const data = await apiFetch('/orders');
      if (data.data.length === 0) {
        list.innerHTML = `
          <div class="cart-empty">
            <span class="cart-empty-icon">📋</span>
            <h3>No orders yet</h3>
            <p>Place your first order!</p>
          </div>
        `;
        return;
      }
      list.innerHTML = data.data.map(order => `
        <div class="order-card">
          <div class="order-card-header">
            <span class="order-id">#${order.id}</span>
            <span class="order-status">${order.status}</span>
          </div>
          <div class="order-card-items">
            ${order.items.map(item => `
              <span class="order-item-chip">${item.image} ${item.name} × ${item.quantity}</span>
            `).join('')}
          </div>
          <div class="order-card-footer">
            <span>${new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            <span class="order-total">$${order.totals.total.toFixed(2)}</span>
          </div>
        </div>
      `).join('');
    } catch {
      list.innerHTML = `
        <div class="cart-empty">
          <span class="cart-empty-icon">⚠️</span>
          <h3>Failed to load orders</h3>
          <p>Please try again later.</p>
        </div>
      `;
    }
  }

  function closeOrders() {
    document.getElementById('orders-overlay').style.display = 'none';
    document.body.style.overflow = '';
  }

  // ─── Filtering & Sorting ──────────────────────────────
  function filterCategory(category) {
    currentCategory = category;

    // Update active chip
    document.querySelectorAll('.category-chip').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.category === category);
    });

    loadProducts();

    // Scroll to products
    const productsSection = document.getElementById('products-section');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function clearFilters() {
    currentCategory = 'all';
    currentSearch = '';
    currentSort = '';

    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) sortSelect.value = '';

    document.querySelectorAll('.category-chip').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.category === 'all');
    });

    loadProducts();
  }

  // ─── Toast Notifications ──────────────────────────────
  function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${type === 'success' ? '✅' : '⚠️'}</span>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ─── Header Scroll Effect ─────────────────────────────
  function initScrollEffect() {
    const header = document.getElementById('header');
    if (!header) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          header.classList.toggle('scrolled', window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // ─── Event Bindings ────────────────────────────────────
  function bindEvents() {
    // Cart open/close
    document.getElementById('cart-btn')?.addEventListener('click', openCart);
    document.getElementById('cart-close-btn')?.addEventListener('click', closeCart);
    document.getElementById('cart-overlay')?.addEventListener('click', closeCart);

    // Checkout
    document.getElementById('checkout-btn')?.addEventListener('click', openCheckout);
    document.getElementById('checkout-close-btn')?.addEventListener('click', closeCheckout);
    document.getElementById('checkout-overlay')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeCheckout();
    });
    document.getElementById('checkout-form')?.addEventListener('submit', placeOrder);

    // Order confirmation
    document.getElementById('continue-shopping-btn')?.addEventListener('click', closeOrderConfirmation);
    document.getElementById('order-confirmation-overlay')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeOrderConfirmation();
    });

    // Orders
    document.getElementById('orders-btn')?.addEventListener('click', openOrders);
    document.getElementById('orders-close-btn')?.addEventListener('click', closeOrders);
    document.getElementById('orders-overlay')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeOrders();
    });

    // Cart actions
    document.getElementById('clear-cart-btn')?.addEventListener('click', clearCart);

    // Search
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
          currentSearch = e.target.value.trim();
          loadProducts();
        }, 350);
      });
    }

    // Sort
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        loadProducts();
      });
    }

    // Category chips
    document.querySelectorAll('.category-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        filterCategory(chip.dataset.category);
      });
    });

    // Hero CTA / Shop Now
    document.getElementById('shop-now-btn')?.addEventListener('click', () => {
      document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
    });

    // Logo click = scroll to top
    document.getElementById('logo')?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Clear filters
    document.getElementById('clear-filters-btn')?.addEventListener('click', clearFilters);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Cmd/Ctrl + K = focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const search = document.getElementById('search-input');
        if (search) search.focus();
      }
      // Escape = close modals/cart
      if (e.key === 'Escape') {
        closeCart();
        closeCheckout();
        closeOrders();
        closeOrderConfirmation();
      }
    });
  }

  // ─── Initialize ────────────────────────────────────────
  async function init() {
    bindEvents();
    initScrollEffect();
    await Promise.all([loadProducts(), loadCart()]);
  }

  // Wait for DOM then initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ─── Expose public API for inline event handlers ──────
  window.app = {
    addToCart,
    updateQty,
    removeFromCart,
    clearCart
  };

  // Expose filterCategory globally for footer links
  window.filterCategory = filterCategory;

})();
