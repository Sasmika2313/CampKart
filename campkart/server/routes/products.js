const express = require('express');
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Multer config — save uploads to /uploads folder locally
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
    const { search, category, minPrice, maxPrice, sort, page = 1, limit = 10 } = req.query;

    const filter = {};

    if (search) {
      filter.$text = { $search: search };
    }
    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    // Requirement: Sold products hidden by default unless searched
    if (!search) {
      filter.status = 'available';
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'cheapest') sortOption = { price: 1 };
    else if (sort === 'expensive') sortOption = { price: -1 };
    else if (sort === 'latest') sortOption = { createdAt: -1 };

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate('sellerId', 'name email')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.json({
      products,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalProducts: total,
    });
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
// GET /api/products/:id/recommendations — Similar products (public)
// ─────────────────────────────────────────
router.get('/:id/recommendations', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Recommendation logic: same category, different product, limit to 4
    const recommendations = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      status: 'available'
    })
    .populate('sellerId', 'name email')
    .limit(4);

    res.json(recommendations);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching recommendations', error: err.message });
  }
});

// ─────────────────────────────────────────
// PUT /api/products/:id/buy — Simulate buying (protected)
// ─────────────────────────────────────────
router.put('/:id/buy', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.sellerId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You can't buy your own listing" });
    }

    if (product.status === 'sold') {
      return res.status(400).json({ message: 'Item is already sold' });
    }

    product.status = 'sold';
    product.buyerId = req.user._id; // Store buyer info
    await product.save();

    res.json({ message: 'Order Placed Successfully! 🎉', product });
  } catch (err) {
    res.status(500).json({ message: 'Purchase simulation failed', error: err.message });
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

// ─────────────────────────────────────────
// GET /api/products/seller/:id — Get products by seller (sold included)
// ─────────────────────────────────────────
router.get('/seller/:id', async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.params.id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching products', error: err.message });
  }
});

// ─────────────────────────────────────────
// PUT /api/products/:id — Update a product (protected, seller/admin)
// ─────────────────────────────────────────
router.put('/:id', protect, upload.single('image'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, description, price, category } = req.body;
    product.title = title || product.title;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    if (req.file) {
      product.imageUrl = `/uploads/${req.file.filename}`;
    }

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
});

// ─────────────────────────────────────────
// POST /api/products/:id/reviews — Create a review (protected)
// ─────────────────────────────────────────
router.post('/:id/reviews', protect, async (req, res) => {
  const { rating, comment } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'Product already reviewed' });
      }

      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      product.reviews.push(review);
      // Wait for seller to be updated too (future enhancement: link product rating to seller)
      await product.save();
      res.status(201).json({ message: 'Review added' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Review failed', error: err.message });
  }
});

module.exports = router;
