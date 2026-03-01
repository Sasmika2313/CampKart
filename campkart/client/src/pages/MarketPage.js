// MarketPage.js
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './MarketPage.css';

const MarketPage = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [buyMessage, setBuyMessage] = useState('');
  const navigate = useNavigate();

  const currentUserId = (() => {
    try {
      const token = localStorage.getItem('campkart-token');
      if (!token) return null;
      // Decode JWT payload (base64)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch {
      return null;
    }
  })();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (minPrice !== '') params.minPrice = minPrice;
      if (maxPrice !== '') params.maxPrice = maxPrice;

      const res = await axios.get('http://localhost:5000/api/products', { params });
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, minPrice, maxPrice]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleBuy = async (productId) => {
    const token = localStorage.getItem('campkart-token');
    try {
      const res = await axios.put(
        `http://localhost:5000/api/products/${productId}/buy`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBuyMessage(res.data.message || 'Purchase successful!');
      fetchProducts(); // Refresh listings
    } catch (err) {
      const msg = err.response?.data?.message || 'Purchase failed';
      setBuyMessage(msg);
    }
    setTimeout(() => setBuyMessage(''), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('campkart-token');
    navigate('/');
  };

  return (
    <div className="market-container">
      {/* Navbar */}
      <nav className="market-nav">
        <h1 className="brand">🎒 CampKart</h1>
        <div className="nav-actions">
          <button className="nav-btn add-btn" onClick={() => navigate('/add')}>+ Sell Item</button>
          <button className="nav-btn logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      {buyMessage && <div className="toast">{buyMessage}</div>}

      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="🔍 Search by title…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by category"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        />
        <input
          type="number"
          placeholder="Min ₹"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          min="0"
        />
        <input
          type="number"
          placeholder="Max ₹"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          min="0"
        />
      </div>

      {/* Product Grid */}
      {loading ? (
        <p className="loading-text">Loading products…</p>
      ) : products.length === 0 ? (
        <p className="empty-text">No products found. Be the first to list something! 🛍</p>
      ) : (
        <div className="product-grid">
          {products.map((product) => {
            const isSeller = currentUserId && product.sellerId?._id === currentUserId;
            const isSold = product.status === 'sold';

            return (
              <div key={product._id} className={`product-card ${isSold ? 'sold' : ''}`}>
                {product.imageUrl ? (
                  <img
                    src={`http://localhost:5000${product.imageUrl}`}
                    alt={product.title}
                  />
                ) : (
                  <div className="no-image">📦</div>
                )}
                <div className="card-body">
                  <h3>{product.title}</h3>
                  {product.category && (
                    <span className="category-tag">{product.category}</span>
                  )}
                  <p className="description">{product.description}</p>
                  <p className="price">₹{product.price}</p>
                  {product.sellerId?.name && (
                    <p className="seller">Seller: {product.sellerId.name}</p>
                  )}
                  {isSold ? (
                    <span className="sold-badge">SOLD</span>
                  ) : isSeller ? (
                    <span className="your-listing">Your Listing</span>
                  ) : (
                    <button className="buy-btn" onClick={() => handleBuy(product._id)}>
                      Buy Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MarketPage;
