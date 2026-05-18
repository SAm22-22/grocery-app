const express = require('express');
const router = express.Router();
const products = require('../data/products');

// In-memory cart storage (session-based in production, simplified here)
const carts = new Map();

function getCart(cartId) {
  if (!carts.has(cartId)) {
    carts.set(cartId, { items: [], updatedAt: new Date().toISOString() });
  }
  return carts.get(cartId);
}

function calculateCartTotals(cart) {
  const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFee = subtotal > 25 ? 0 : 4.99;
  const tax = subtotal * 0.08;
  const total = subtotal + deliveryFee + tax;
  const savings = cart.items.reduce((sum, item) => {
    return sum + (item.originalPrice ? (item.originalPrice - item.price) * item.quantity : 0);
  }, 0);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    itemCount,
    deliveryFee: Math.round(deliveryFee * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
    savings: Math.round(savings * 100) / 100,
    freeDeliveryThreshold: 25,
    amountToFreeDelivery: subtotal >= 25 ? 0 : Math.round((25 - subtotal) * 100) / 100
  };
}

// GET /api/cart/:cartId - Get cart contents
router.get('/:cartId', (req, res) => {
  const cart = getCart(req.params.cartId);
  const totals = calculateCartTotals(cart);
  res.json({
    success: true,
    data: {
      items: cart.items,
      totals,
      updatedAt: cart.updatedAt
    }
  });
});

// POST /api/cart/:cartId/add - Add item to cart
router.post('/:cartId/add', (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const cart = getCart(req.params.cartId);
  const product = products.find(p => p.id === parseInt(productId));

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  if (quantity < 1 || quantity > 99) {
    return res.status(400).json({ success: false, message: 'Invalid quantity' });
  }

  const existingItem = cart.items.find(item => item.productId === product.id);

  if (existingItem) {
    existingItem.quantity = Math.min(existingItem.quantity + quantity, 99);
  } else {
    cart.items.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      image: product.image,
      category: product.category,
      quantity: quantity
    });
  }

  cart.updatedAt = new Date().toISOString();
  const totals = calculateCartTotals(cart);

  res.json({
    success: true,
    message: `${product.name} added to cart`,
    data: { items: cart.items, totals }
  });
});

// PUT /api/cart/:cartId/update - Update item quantity
router.put('/:cartId/update', (req, res) => {
  const { productId, quantity } = req.body;
  const cart = getCart(req.params.cartId);
  const itemIndex = cart.items.findIndex(item => item.productId === parseInt(productId));

  if (itemIndex === -1) {
    return res.status(404).json({ success: false, message: 'Item not in cart' });
  }

  if (quantity <= 0) {
    cart.items.splice(itemIndex, 1);
  } else {
    cart.items[itemIndex].quantity = Math.min(quantity, 99);
  }

  cart.updatedAt = new Date().toISOString();
  const totals = calculateCartTotals(cart);

  res.json({
    success: true,
    data: { items: cart.items, totals }
  });
});

// DELETE /api/cart/:cartId/remove/:productId - Remove item from cart
router.delete('/:cartId/remove/:productId', (req, res) => {
  const cart = getCart(req.params.cartId);
  const itemIndex = cart.items.findIndex(item => item.productId === parseInt(req.params.productId));

  if (itemIndex === -1) {
    return res.status(404).json({ success: false, message: 'Item not in cart' });
  }

  const removed = cart.items.splice(itemIndex, 1)[0];
  cart.updatedAt = new Date().toISOString();
  const totals = calculateCartTotals(cart);

  res.json({
    success: true,
    message: `${removed.name} removed from cart`,
    data: { items: cart.items, totals }
  });
});

// DELETE /api/cart/:cartId/clear - Clear entire cart
router.delete('/:cartId/clear', (req, res) => {
  const cart = getCart(req.params.cartId);
  cart.items = [];
  cart.updatedAt = new Date().toISOString();

  res.json({
    success: true,
    message: 'Cart cleared',
    data: { items: [], totals: calculateCartTotals(cart) }
  });
});

module.exports = router;
