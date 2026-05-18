const express = require('express');
const router = express.Router();
const products = require('../data/products');

// GET /api/products/categories/list - Get all categories
// IMPORTANT: This MUST be defined BEFORE /:id, otherwise Express
// treats "categories" as an :id parameter and never reaches this route.
router.get('/categories/list', (req, res) => {
  const categories = [...new Set(products.map(p => p.category))];
  const categoryData = categories.map(cat => ({
    id: cat,
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    count: products.filter(p => p.category === cat).length,
    icon: getCategoryIcon(cat)
  }));
  res.json({ success: true, data: categoryData });
});

// GET /api/products - Get all products with optional filters
router.get('/', (req, res) => {
  let filtered = [...products];
  const { category, search, sort, minPrice, maxPrice } = req.query;

  if (category && category !== 'all') {
    filtered = filtered.filter(p => p.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }

  if (minPrice) {
    filtered = filtered.filter(p => p.price >= parseFloat(minPrice));
  }
  if (maxPrice) {
    filtered = filtered.filter(p => p.price <= parseFloat(maxPrice));
  }

  if (sort) {
    switch (sort) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
  }

  res.json({
    success: true,
    count: filtered.length,
    data: filtered
  });
});

// GET /api/products/:id - Get single product
router.get('/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.json({ success: true, data: product });
});

function getCategoryIcon(cat) {
  const icons = {
    fruits: '🍎',
    vegetables: '🥬',
    dairy: '🥛',
    bakery: '🍞',
    beverages: '☕',
    snacks: '🥜'
  };
  return icons[cat] || '🛒';
}

module.exports = router;
