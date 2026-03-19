import React, { useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import './CheckoutPage.css';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('campkart-user') || '{}');
    const [address, setAddress] = useState({
        address: user.address?.street || '',
        city: user.address?.city || '',
        postalCode: user.address?.zip || '',
        phone: user.address?.phone || ''
    });
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [showCardMock, setShowCardMock] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cardData, setCardData] = useState({ number: '', expiry: '', cvv: '' });

    // Get cart from user (simplified for demo)
    const [cart, setCart] = useState(JSON.parse(localStorage.getItem('campkart-cart') || '[]'));
    const totalPrice = cart.reduce((acc, item) => acc + item.price, 0);

    const removeFromCart = (index) => {
        const newCart = cart.filter((_, i) => i !== index);
        setCart(newCart);
        localStorage.setItem('campkart-cart', JSON.stringify(newCart));
    };

    const placeOrder = async (e) => {
        if (e) e.preventDefault();
        
        if (paymentMethod === 'Online' && !showCardMock) {
            setShowCardMock(true);
            return;
        }

        setLoading(true);
        try {
            const orderItems = cart.map(item => ({
                productId: item._id,
                title: item.title,
                price: item.price,
                sellerId: item.sellerId?._id || item.sellerId
            }));

            await API.post('/orders', {
                items: orderItems,
                shippingAddress: address,
                paymentMethod,
                totalPrice,
                isPaid: paymentMethod === 'Online'
            });

            localStorage.removeItem('campkart-cart');
            alert(paymentMethod === 'Online' ? 'Payment Verified & Order Placed! 🎉' : 'Order Placed Successfully! 🎉');
            navigate('/orders');
        } catch (err) {
            alert('Checkout failed: ' + (err.response?.data?.message || 'Server error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="checkout-container">
            <div className="checkout-grid">
                <main className="checkout-form">
                    <h2>Shipping Details</h2>
                    <form onSubmit={placeOrder}>
                        <div className="form-group">
                            <label>Address</label>
                            <input type="text" required value={address.address} onChange={(e) => setAddress({...address, address: e.target.value})} />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>City</label>
                                <input type="text" required value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Postal Code</label>
                                <input type="text" required value={address.postalCode} onChange={(e) => setAddress({...address, postalCode: e.target.value})} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input type="text" required value={address.phone} onChange={(e) => setAddress({...address, phone: e.target.value})} />
                        </div>

                        <h2>Payment Method</h2>
                        <div className="payment-options">
                            <label className={`payment-option ${paymentMethod === 'COD' ? 'active' : ''}`}>
                                <input type="radio" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                                <div>
                                    <strong>Cash on Delivery</strong>
                                    <p>Pay when you meet on campus</p>
                                </div>
                            </label>
                            <label className={`payment-option ${paymentMethod === 'Online' ? 'active' : ''}`}>
                                <input type="radio" value="Online" checked={paymentMethod === 'Online'} onChange={() => setPaymentMethod('Online')} />
                                <div>
                                    <strong>Safe Campus Pay (Cards)</strong>
                                    <p>Fast digital checkout</p>
                                </div>
                            </label>
                        </div>

                        {showCardMock && (
                            <div className="card-mimic-overlay">
                                <div className="card-mimic-box">
                                    <h3>💳 Enter Card Details</h3>
                                    <input type="text" placeholder="1234 5678 9123 0000" value={cardData.number} onChange={e => setCardData({...cardData, number: e.target.value})} maxLength="16" />
                                    <div className="form-row">
                                        <input type="text" placeholder="MM/YY" value={cardData.expiry} onChange={e => setCardData({...cardData, expiry: e.target.value})} />
                                        <input type="password" placeholder="CVV" value={cardData.cvv} onChange={e => setCardData({...cardData, cvv: e.target.value})} maxLength="3" />
                                    </div>
                                    <button type="button" onClick={placeOrder} className="pay-now-btn">Pay ₹{totalPrice}</button>
                                    <button type="button" onClick={() => setShowCardMock(false)} className="cancel-pay">Cancel</button>
                                </div>
                            </div>
                        )}
                    </form>
                </main>

                <aside className="order-summary">
                    <div className="summary-header">
                        <h2>Order Summary</h2>
                        <button className="back-to-market" onClick={() => navigate('/market')}>Keep Shopping</button>
                    </div>
                    
                    <div className="summary-items">
                        {cart.length === 0 ? (
                            <p className="empty-cart-msg">Your cart is empty.</p>
                        ) : (
                            cart.map((item, idx) => (
                                <div key={idx} className="summary-item">
                                    <div className="item-meta">
                                        <span>{item.title}</span>
                                        <button className="remove-item-btn" onClick={() => removeFromCart(idx)}>Remove</button>
                                    </div>
                                    <strong>₹{item.price}</strong>
                                </div>
                            ))
                        )}
                    </div>
                    
                    <div className="summary-total">
                        <span>Total Items: {cart.length}</span>
                        <div className="total-row">
                            <h3>Total Price</h3>
                            <h3>₹{totalPrice}</h3>
                        </div>
                    </div>
                    <button className="place-order-btn" onClick={placeOrder} disabled={loading || cart.length === 0}>
                        {loading ? 'Processing...' : 'Place Order'}
                    </button>
                </aside>
            </div>
        </div>
    );
};

export default CheckoutPage;
