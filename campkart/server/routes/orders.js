const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ─────────────────────────────────────────
// POST /api/orders — Create new order (checkout)
// ─────────────────────────────────────────
router.post('/', protect, async (req, res) => {
    const { items, shippingAddress, paymentMethod, totalPrice } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'No items in order' });
    }

    try {
        const order = new Order({
            buyerId: req.user._id,
            items,
            shippingAddress,
            paymentMethod,
            totalPrice,
            isPaid: req.body.isPaid || false
        });

        const createdOrder = await order.save();

        // Mark items as sold
        for (const item of items) {
            await Product.findByIdAndUpdate(item.productId, { status: 'sold', buyerId: req.user._id });
        }

        res.status(201).json(createdOrder);
    } catch (err) {
        res.status(500).json({ message: 'Order creation failed', error: err.message });
    }
});

// GET user orders
router.get('/', protect, async (req, res) => {
    try {
        const orders = await Order.find({ buyerId: req.user._id })
            .populate('items.productId', 'imageUrl category')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Fetching orders failed', error: err.message });
    }
});

module.exports = router;
