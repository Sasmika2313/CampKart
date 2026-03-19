const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Conversation = require('./models/Conversation');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const categories = ['Electronics', 'Books', 'Stationery', 'Clothing', 'Furniture', 'Other'];
const names = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Peyton', 'Riley', 'Skyler', 'Charlie', 'Drew', 'Avery', 'Emerson', 'Quinn', 'Sage'];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Seed: MongoDB Connected');

    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Conversation.deleteMany({});

    const users = [];
    const credentials = [];
    
    for (let i = 0; i < names.length; i++) {
        const email = `${names[i].toLowerCase()}@campus.edu`;
        const passRaw = 'password123';
        const password = await bcrypt.hash(passRaw, 12);
        
        const user = new User({
            name: names[i],
            email,
            password,
            role: i < 5 ? 'seller' : 'buyer',
            rating: 4 + Math.random(),
            numReviews: Math.floor(Math.random() * 50),
            address: {
                street: `${Math.floor(Math.random() * 100)} Campus Dr`,
                city: 'University Town',
                zip: '12345',
                phone: '555-01' + i.toString().padStart(2, '0')
            },
            notifications: [{
                type: 'Welcome',
                content: 'Welcome to CampKart! Start buying or selling items today.',
                read: false
            }]
        });
        const savedUser = await user.save();
        users.push(savedUser);
        credentials.push({ name: names[i], email, password: passRaw, role: savedUser.role });
    }

    fs.writeFileSync(path.join(__dirname, 'credentials.json'), JSON.stringify(credentials, null, 2));
    console.log('✅ credentials.json created');

    const products = [];
    const itemVariations = [
        { title: 'Calculus Textbook', cat: 'Books', desc: 'Slightly worn but no markings inside. Essential for first-year engineering.' },
        { title: 'Scientific Calculator', cat: 'Electronics', desc: 'Casio FX-991EX. Works perfectly, solar powered. Used for 2 semesters.' },
        { title: 'LED Desk Lamp', cat: 'Electronics', desc: 'Flexible neck, 3 brightness levels. Includes power adapter.' },
        { title: 'Drafting Board (A3)', cat: 'Stationery', desc: 'Professional grade drafting board. Great for architecture students.' },
        { title: 'Noise Cancelling Headphones', cat: 'Electronics', desc: 'Bluetooth 5.0, 20 hour battery life. Great for studying in noisy libraries.' },
        { title: 'Hoodie (Medium)', cat: 'Clothing', desc: 'Comfortable cotton hoodie. Classic campus look, barely worn.' },
        { title: 'Standing Fan', cat: 'Furniture', desc: 'High speed portable fan. Essential for summer nights in the dorm.' },
        { title: 'Blue Ink Pen Box (12pcs)', cat: 'Stationery', desc: 'Unopened box of premium gel pens. Smooth writing experience.' },
        { title: 'Chemistry Lab Coat', cat: 'Clothing', desc: 'White lab coat, size XL. Standard safety gear, used for 5 labs only.' },
        { title: 'Wireless Mouse', cat: 'Electronics', desc: 'Ergonomic design, silent clicks. 2.4GHz wireless connection.' }
    ];

    for (let i = 1; i <= 45; i++) {
        const seller = users[Math.floor(Math.random() * 5)]; 
        const variation = itemVariations[i % itemVariations.length];
        
        const status = i > 40 ? 'sold' : 'available';

        const product = new Product({
            title: `${variation.title} #${Math.ceil(i/10)}`,
            description: variation.desc,
            price: Math.floor(Math.random() * 901) + 100, // Range 100 - 1000
            category: variation.cat,
            sellerId: seller._id,
            imageUrl: `/api/placeholder/400/300?text=${encodeURIComponent(variation.title)}`, // Use placeholders for demo diversity
            status: status
        });

        const numReviews = Math.floor(Math.random() * 4);
        for (let j = 0; j < numReviews; j++) {
            const reviewer = users[Math.floor(Math.random() * users.length)];
            product.reviews.push({
                user: reviewer._id,
                name: reviewer.name,
                rating: 4 + Math.round(Math.random()),
                comment: 'Reasonable price for the condition. Student-friendly seller!'
            });
        }

        const savedProduct = await product.save();
        products.push(savedProduct);

        if (status === 'sold') {
            const buyer = users[Math.floor(Math.random() * 10) + 5]; 
            const order = new Order({
                buyerId: buyer._id,
                items: [{
                    productId: savedProduct._id,
                    title: savedProduct.title,
                    price: savedProduct.price,
                    sellerId: seller._id
                }],
                shippingAddress: {
                    address: buyer.address.street,
                    city: buyer.address.city,
                    postalCode: buyer.address.zip,
                    phone: buyer.address.phone
                },
                paymentMethod: i % 2 === 0 ? 'Online' : 'COD',
                totalPrice: savedProduct.price,
                status: 'Delivered',
                isPaid: i % 2 === 0,
                isDelivered: true
            });
            await order.save();
        }
    }

    console.log(`✅ Seeded ${users.length} users and ${products.length} products!`);
    process.exit();
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seedData();
