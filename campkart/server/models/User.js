const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
  refreshToken: { type: String },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    zip: { type: String, default: '' },
    phone: { type: String, default: '' }
  },
  notifications: [{
    type: { type: String }, 
    content: String,
    metadata: Object,
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
