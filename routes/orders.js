const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// In-memory order storage
const orders = [];

// POST /api/orders - Place a new order
router.post('/', (req, res) => {
  const { cartId, items, totals, customer } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Cannot place an empty order' });
  }

  if (!customer || !customer.name || !customer.email || !customer.address) {
    return res.status(400).json({ success: false, message: 'Customer details are required' });
  }

  const order = {
    id: uuidv4().split('-')[0].toUpperCase(),
    cartId,
    items: items.map(item => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      subtotal: Math.round(item.price * item.quantity * 100) / 100
    })),
    totals,
    customer: {
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      address: customer.address
    },
    status: 'confirmed',
    paymentMethod: customer.paymentMethod || 'cash',
    estimatedDelivery: getEstimatedDelivery(),
    createdAt: new Date().toISOString()
  };

  orders.push(order);

  res.status(201).json({
    success: true,
    message: 'Order placed successfully!',
    data: order
  });
});

// GET /api/orders/:orderId - Get order details
router.get('/:orderId', (req, res) => {
  const order = orders.find(o => o.id === req.params.orderId);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  res.json({ success: true, data: order });
});

// GET /api/orders - Get all orders (for demo)
router.get('/', (req, res) => {
  res.json({
    success: true,
    count: orders.length,
    data: orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  });
});

function getEstimatedDelivery() {
  const now = new Date();
  const minMinutes = 30;
  const maxMinutes = 60;
  const deliveryStart = new Date(now.getTime() + minMinutes * 60000);
  const deliveryEnd = new Date(now.getTime() + maxMinutes * 60000);
  return {
    start: deliveryStart.toISOString(),
    end: deliveryEnd.toISOString(),
    display: `${minMinutes}-${maxMinutes} mins`
  };
}

module.exports = router;
