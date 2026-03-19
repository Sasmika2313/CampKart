import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import './ProductModal.css';

const ProductModal = ({ productId, onClose, onAddToCart }) => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('campkart-user') || '{}');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await API.get(`/products/${productId}`);
                setProduct(data);
            } catch (err) {
                console.error('Fetch detail failed');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

    if (loading) return <div className="modal-overlay"><div className="modal-loader">Loading details...</div></div>;
    if (!product) return null;

    const startChat = async () => {
        if (!product?.sellerId?._id) return;
        try {
            await API.post('/chat', {
                receiverId: product.sellerId._id,
                productId: product._id,
                message: `Hi ${product.sellerId.name}, I am interested in your ${product.title}`
            });
            navigate('/chat');
        } catch (err) {
            alert('Failed to start chat');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>×</button>
                
                <div className="modal-grid">
                    <div className="modal-gallery">
                        {product.imageUrl ? (
                            <img src={`http://localhost:5000${product.imageUrl}`} alt={product.title} />
                        ) : (
                            <div className="modal-placeholder">📸</div>
                        )}
                    </div>

                    <div className="modal-info">
                        <header className="modal-header">
                            <span className="category-tag">{product.category}</span>
                            <h1>{product.title}</h1>
                            <div className="price-tag">₹{product.price}</div>
                        </header>

                        <div className="modal-description">
                            <h3>Product Description</h3>
                            <p>{product.description}</p>
                        </div>

                        <div className="seller-card" onClick={() => product.sellerId?._id && navigate(`/profile/${product.sellerId._id}`)}>
                            <div className="seller-avatar">{product.sellerId?.name?.[0] || '?'}</div>
                            <div className="seller-details">
                                <strong>{product.sellerId?.name || 'Loading...'} <span>(Seller)</span></strong>
                                <p>View profile & reviews</p>
                            </div>
                            <div className="seller-rating">⭐ 4.8</div>
                        </div>

                        <div className="modal-actions">
                            {product.status === 'sold' ? (
                                <button className="sold-btn" disabled>Already Sold</button>
                            ) : (
                                <>
                                    <button className="btn-primary" onClick={() => onAddToCart(product)}>Add to Cart</button>
                                    {product.sellerId?._id !== user._id && (
                                        <button className="btn-secondary" onClick={startChat}>Contact Seller</button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <section className="modal-reviews">
                    <h3>Customer Reviews ({product.reviews?.length || 0})</h3>
                    {product.reviews?.length === 0 ? (
                        <p className="empty-reviews">No reviews yet for this product.</p>
                    ) : (
                        product.reviews.map((r, i) => (
                            <div key={i} className="review-item">
                                <div className="review-meta">
                                    <strong>{r.name}</strong>
                                    <span className="stars">{'⭐'.repeat(r.rating)}</span>
                                </div>
                                <p>{r.comment}</p>
                            </div>
                        ))
                    )}
                </section>
            </div>
        </div>
    );
};

export default ProductModal;
