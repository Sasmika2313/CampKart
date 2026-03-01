const express = require('express');
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Multer config — save uploads to /uploads folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// ─────────────────────────────────────────
// POST /api/products — Create a product (protected)
// ─────────────────────────────────────────
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { title, description, price, category } = req.body;

    if (!title || !price) {
      return res.status(400).json({ message: 'Title and price are required' });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const newProduct = new Product({
      title,
      description,
      price,
      category,
      imageUrl,
      sellerId: req.user._id,
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: 'Failed to upload product', error: error.message });
  }
});

// ─────────────────────────────────────────
// GET /api/products — Fetch all available products (public)
// ─────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice } = req.query;

    const filter = {};

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }
    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(filter)
      .populate('sellerId', 'name email')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products', error: err.message });
  }
});

// ─────────────────────────────────────────
// GET /api/products/:id — Single product (public)
// ─────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('sellerId', 'name email');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching product', error: err.message });
  }
});

// ─────────────────────────────────────────
// PUT /api/products/:id/buy — Mark a product as sold (protected)
// ─────────────────────────────────────────
router.put('/:id/buy', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Prevent seller from buying their own item
    if (product.sellerId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You can't buy your own listing" });
    }

    if (product.status === 'sold') {
      return res.status(400).json({ message: 'Item is already sold' });
    }

    product.status = 'sold';
    await product.save();

    res.json({ message: 'Purchase successful!', product });
  } catch (err) {
    res.status(500).json({ message: 'Purchase failed', error: err.message });
  }
});

// ─────────────────────────────────────────
// DELETE /api/products/:id — Delete a listing (protected, only seller)
// ─────────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }

    await product.deleteOne();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
});

module.exports = router;
