import React, { useEffect, useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import './OrdersPage.css';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await API.get('/orders');
                setOrders(data);
            } catch (err) {
                console.error('Error fetching orders', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) return <div className="loading">Loading your orders...</div>;

    return (
        <div className="orders-container">
            <header className="orders-header">
                <h1>My Orders</h1>
                <p>Track your campus purchases</p>
            </header>

            <div className="orders-list">
                {orders.length === 0 ? (
                    <div className="empty-orders-elite">
                        <div className="empty-icon">📦</div>
                        <h3>No orders found</h3>
                        <p>Items you buy will appear here.</p>
                        <button className="shop-now-btn" onClick={() => navigate('/market')}>Go to Market</button>
                    </div>
                ) : (
                    orders.map(order => (
                        <div key={order._id} className="order-card-elite">
                            <div className="order-card-header">
                                <div className="header-left">
                                    <span className="order-num">Order #{order._id.slice(-6).toUpperCase()}</span>
                                    <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="header-right">
                                    <span className={`status-badge ${order.status.toLowerCase()}`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>

                            <div className="order-timeline">
                                <div className={`timeline-step ${['Ordered', 'Shipped', 'Delivered'].indexOf(order.status) >= 0 ? 'active' : ''}`}>
                                    <div className="dot"></div>
                                    <span>Ordered</span>
                                </div>
                                <div className="line"></div>
                                <div className={`timeline-step ${['Shipped', 'Delivered'].indexOf(order.status) >= 0 ? 'active' : ''}`}>
                                    <div className="dot"></div>
                                    <span>Shipped</span>
                                </div>
                                <div className="line"></div>
                                <div className={`timeline-step ${order.status === 'Delivered' ? 'active' : ''}`}>
                                    <div className="dot"></div>
                                    <span>Delivered</span>
                                </div>
                            </div>

                            <div className="order-body">
                                <div className="order-items-list">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="order-item-row">
                                            <div className="item-preview">
                                                {item.productId?.imageUrl ? (
                                                    <img src={`http://localhost:5000${item.productId.imageUrl}`} alt="" />
                                                ) : <div className="no-img-sm">📦</div>}
                                            </div>
                                            <div className="item-info">
                                                <strong>{item.title}</strong>
                                                <span className="cat-sm">{item.productId?.category || 'CAMPUS ASSET'}</span>
                                            </div>
                                            <div className="item-price">₹{item.price}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="order-meta-grid">
                                    <div className="meta-box">
                                        <h4>Delivery Location</h4>
                                        <p>{order.shippingAddress.address || order.shippingAddress.street}</p>
                                        <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode || order.shippingAddress.zip}</p>
                                    </div>
                                    <div className="meta-box">
                                        <h4>Payment</h4>
                                        <p>{order.paymentMethod}</p>
                                        <p className="payment-status">{order.isPaid ? '✅ Paid' : '⏳ Pending Payment'}</p>
                                    </div>
                                    <div className="meta-box total-box">
                                        <h4>Total Amount</h4>
                                        <p className="big-total">₹{order.totalPrice}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default OrdersPage;
