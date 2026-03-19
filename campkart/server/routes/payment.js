const express = require('express');
const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/create-payment-intent', protect, async (req, res) => {
  const { productId } = req.body;

  try {
    if (!stripe) return res.status(500).json({ message: 'Stripe is not configured on the server' });
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.status === 'sold') return res.status(400).json({ message: 'Product already sold' });
    if (product.sellerId.toString() === req.user._id.toString()) return res.status(400).json({ message: 'Cannot buy your own product' });

    // amount in cents (Stripe expects integer cents for INR or USD)
    // Assuming price is in INR, so multiply by 100
    const paymentIntent = await stripe.paymentIntents.create({
      amount: product.price * 100,
      currency: 'inr',
      metadata: { productId: product._id.toString(), buyerId: req.user._id.toString() },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ message: 'Payment intent failed', error: err.message });
  }
});

module.exports = router;
