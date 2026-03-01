const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Serve uploaded images as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test route
app.get('/', (req, res) => {
  res.send('CampKart Backend is running! 🎒');
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('✅ MongoDB Connected');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
