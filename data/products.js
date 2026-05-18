const products = [
  // Fruits
  { id: 1, name: "Organic Apples", category: "fruits", price: 3.99, unit: "1 kg", image: "🍎", description: "Crisp and sweet organic apples, freshly picked from local orchards.", stock: 150, rating: 4.7, badge: "Organic" },
  { id: 2, name: "Ripe Bananas", category: "fruits", price: 1.49, unit: "1 bunch", image: "🍌", description: "Perfectly ripe bananas, great for smoothies or snacking.", stock: 200, rating: 4.5, badge: null },
  { id: 3, name: "Naval Oranges", category: "fruits", price: 4.29, unit: "1 kg", image: "🍊", description: "Juicy naval oranges bursting with vitamin C.", stock: 120, rating: 4.6, badge: null },
  { id: 4, name: "Fresh Strawberries", category: "fruits", price: 5.99, unit: "250g", image: "🍓", description: "Sweet, plump strawberries — perfect for desserts.", stock: 80, rating: 4.8, badge: "Popular" },
  { id: 5, name: "Blueberries", category: "fruits", price: 6.49, unit: "200g", image: "🫐", description: "Antioxidant-rich blueberries from premium farms.", stock: 60, rating: 4.9, badge: "Superfood" },
  { id: 6, name: "Alphonso Mangoes", category: "fruits", price: 8.99, unit: "500g", image: "🥭", description: "Premium Alphonso mangoes with rich, creamy flavor.", stock: 40, rating: 4.9, badge: "Seasonal" },
  { id: 7, name: "Red Grapes", category: "fruits", price: 4.79, unit: "500g", image: "🍇", description: "Seedless red grapes, crisp and refreshing.", stock: 90, rating: 4.4, badge: null },
  { id: 8, name: "Watermelon", category: "fruits", price: 6.99, unit: "1 pc", image: "🍉", description: "Juicy seedless watermelon, perfect for hot days.", stock: 30, rating: 4.3, badge: null },

  // Vegetables
  { id: 9, name: "Roma Tomatoes", category: "vegetables", price: 2.99, unit: "500g", image: "🍅", description: "Vine-ripened Roma tomatoes, ideal for cooking.", stock: 180, rating: 4.5, badge: null },
  { id: 10, name: "Baby Spinach", category: "vegetables", price: 3.49, unit: "200g", image: "🥬", description: "Tender baby spinach leaves, pre-washed and ready.", stock: 100, rating: 4.7, badge: "Organic" },
  { id: 11, name: "Russet Potatoes", category: "vegetables", price: 2.49, unit: "1 kg", image: "🥔", description: "All-purpose russet potatoes, great for baking and mashing.", stock: 200, rating: 4.3, badge: null },
  { id: 12, name: "Sweet Carrots", category: "vegetables", price: 1.99, unit: "500g", image: "🥕", description: "Sweet, crunchy carrots packed with beta-carotene.", stock: 150, rating: 4.4, badge: null },
  { id: 13, name: "Bell Peppers Mix", category: "vegetables", price: 4.49, unit: "3 pcs", image: "🫑", description: "Colorful mix of red, yellow, and green bell peppers.", stock: 70, rating: 4.6, badge: "Popular" },
  { id: 14, name: "Fresh Broccoli", category: "vegetables", price: 2.79, unit: "1 head", image: "🥦", description: "Crisp green broccoli florets, nutrient-dense.", stock: 90, rating: 4.5, badge: null },
  { id: 15, name: "Red Onions", category: "vegetables", price: 1.79, unit: "1 kg", image: "🧅", description: "Mild and sweet red onions for salads and cooking.", stock: 170, rating: 4.2, badge: null },
  { id: 16, name: "Garlic Bulbs", category: "vegetables", price: 2.29, unit: "3 pcs", image: "🧄", description: "Aromatic garlic bulbs, essential for every kitchen.", stock: 140, rating: 4.6, badge: null },

  // Dairy & Eggs
  { id: 17, name: "Whole Milk", category: "dairy", price: 3.49, unit: "1 L", image: "🥛", description: "Farm-fresh whole milk, pasteurized and creamy.", stock: 100, rating: 4.5, badge: null },
  { id: 18, name: "Free-Range Eggs", category: "dairy", price: 5.99, unit: "12 pcs", image: "🥚", description: "Premium free-range eggs from happy hens.", stock: 80, rating: 4.8, badge: "Free Range" },
  { id: 19, name: "Cheddar Cheese", category: "dairy", price: 6.49, unit: "250g", image: "🧀", description: "Aged cheddar cheese with a sharp, rich flavor.", stock: 60, rating: 4.7, badge: null },
  { id: 20, name: "Greek Yogurt", category: "dairy", price: 4.29, unit: "500g", image: "🍶", description: "Thick, creamy Greek yogurt — high in protein.", stock: 90, rating: 4.6, badge: "Protein" },
  { id: 21, name: "Unsalted Butter", category: "dairy", price: 4.99, unit: "250g", image: "🧈", description: "Premium unsalted butter for baking and cooking.", stock: 70, rating: 4.5, badge: null },

  // Bakery
  { id: 22, name: "Sourdough Bread", category: "bakery", price: 4.99, unit: "1 loaf", image: "🍞", description: "Artisan sourdough bread with a perfect crust.", stock: 50, rating: 4.8, badge: "Artisan" },
  { id: 23, name: "Butter Croissants", category: "bakery", price: 5.49, unit: "4 pcs", image: "🥐", description: "Flaky, golden butter croissants baked fresh daily.", stock: 40, rating: 4.9, badge: "Fresh" },
  { id: 24, name: "Multigrain Bagels", category: "bakery", price: 3.99, unit: "4 pcs", image: "🥯", description: "Hearty multigrain bagels loaded with seeds.", stock: 60, rating: 4.4, badge: null },
  { id: 25, name: "Chocolate Muffins", category: "bakery", price: 6.99, unit: "4 pcs", image: "🧁", description: "Rich double-chocolate muffins with chocolate chips.", stock: 35, rating: 4.7, badge: "Bestseller" },

  // Beverages
  { id: 26, name: "Cold Brew Coffee", category: "beverages", price: 7.99, unit: "1 L", image: "☕", description: "Smooth, bold cold brew coffee concentrate.", stock: 45, rating: 4.8, badge: "Premium" },
  { id: 27, name: "Fresh Orange Juice", category: "beverages", price: 5.49, unit: "1 L", image: "🧃", description: "100% freshly squeezed orange juice, no added sugar.", stock: 55, rating: 4.7, badge: "Fresh" },
  { id: 28, name: "Green Tea Matcha", category: "beverages", price: 9.99, unit: "100g", image: "🍵", description: "Ceremonial grade matcha green tea powder.", stock: 30, rating: 4.9, badge: "Premium" },
  { id: 29, name: "Sparkling Water", category: "beverages", price: 2.99, unit: "6 pack", image: "💧", description: "Naturally sparkling mineral water, refreshing.", stock: 100, rating: 4.3, badge: null },
  { id: 30, name: "Coconut Water", category: "beverages", price: 3.99, unit: "500ml", image: "🥥", description: "Pure coconut water with natural electrolytes.", stock: 75, rating: 4.5, badge: "Natural" },

  // Snacks & Pantry
  { id: 31, name: "Mixed Nuts", category: "snacks", price: 8.99, unit: "300g", image: "🥜", description: "Premium roasted mixed nuts — almonds, cashews, walnuts.", stock: 65, rating: 4.8, badge: "Bestseller" },
  { id: 32, name: "Dark Chocolate", category: "snacks", price: 4.49, unit: "100g", image: "🍫", description: "72% dark chocolate, smooth and indulgent.", stock: 80, rating: 4.7, badge: null },
  { id: 33, name: "Honey Granola", category: "snacks", price: 5.99, unit: "400g", image: "🥣", description: "Crunchy honey granola with oats and dried fruits.", stock: 50, rating: 4.6, badge: null },
  { id: 34, name: "Rice Crackers", category: "snacks", price: 3.49, unit: "200g", image: "🍘", description: "Light and crispy rice crackers, lightly salted.", stock: 90, rating: 4.3, badge: null },
  { id: 35, name: "Extra Virgin Olive Oil", category: "snacks", price: 11.99, unit: "500ml", image: "🫒", description: "Cold-pressed extra virgin olive oil from Italy.", stock: 40, rating: 4.9, badge: "Premium" },
  { id: 36, name: "Basmati Rice", category: "snacks", price: 7.49, unit: "1 kg", image: "🍚", description: "Aged premium basmati rice, aromatic and fluffy.", stock: 110, rating: 4.6, badge: null },
];

module.exports = products;
