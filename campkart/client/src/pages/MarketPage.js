import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import './MarketPage.css';
import ProductModal from '../components/ProductModal';

const MarketPage = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartCount, setCartCount] = useState(JSON.parse(localStorage.getItem('campkart-cart') || '[]').length);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('campkart-user') || '{}');
  const token = localStorage.getItem('campkart-token');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, sort };
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (minPrice !== '') params.minPrice = minPrice;
      if (maxPrice !== '') params.maxPrice = maxPrice;

      const res = await API.get('/products', { params });
      setProducts(res.data.products);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, minPrice, maxPrice, sort, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddToCart = (product, e) => {
    if (e) e.stopPropagation();
    if (!token) {
        navigate('/auth');
        return;
    }
    const cart = JSON.parse(localStorage.getItem('campkart-cart') || '[]');
    if (cart.find(c => c._id === product._id)) {
      setToast('Item already in cart');
      setTimeout(() => setToast(''), 3000);
      return;
    }
    const newCart = [...cart, product];
    localStorage.setItem('campkart-cart', JSON.stringify(newCart));
    setCartCount(newCart.length);
    setToast('Added to Cart! 🛒');
    setTimeout(() => setToast(''), 3000);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="market-container">
      <nav className="market-nav">
        <div className="nav-left">
          <h1 className="brand" onClick={() => navigate('/')}>🎒 CampKart</h1>
        </div>
        <div className="nav-center">
            <div className="search-bar-elite">
                <input 
                    type="text" 
                    placeholder="Find textbooks, gadgets, and more..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button className="search-btn">🔍</button>
            </div>
        </div>
        <div className="nav-right">
          <div className="notif-bell" onClick={() => navigate('/notifications')}>
               <span role="img" aria-label="notifications">🔔</span>
               <span className="notif-dot">{user.notifications?.filter(n => !n.read).length || 0}</span>
          </div>
          <div className="cart-icon-nav" onClick={() => navigate('/checkout')}>
               <span role="img" aria-label="cart">🛒</span>
               <span className="cart-badge">{cartCount}</span>
          </div>
          {token ? (
              <div className="user-profile-nav" onClick={() => navigate('/profile')}>
                  <div className="avatar-sm">{user.name?.[0].toUpperCase()}</div>
                  <span className="user-name-nav">{user.name}</span>
                  <button className="logout-link" onClick={(e) => { e.stopPropagation(); handleLogout(); }}>Logout</button>
              </div>
          ) : (
              <button className="login-nav-btn" onClick={() => navigate('/auth')}>Login</button>
          )}
        </div>
      </nav>

      {toast && <div className="toast-elite">{toast}</div>}

      <div className="market-layout">
        <aside className="filters-sidebar">
          <h3>Categories</h3>
          <div className="category-chips">
            {['', 'Electronics', 'Books', 'Stationery', 'Clothing', 'Furniture'].map(cat => (
                <button 
                    key={cat}
                    className={`cat-btn ${categoryFilter === cat ? 'active' : ''}`}
                    onClick={() => setCategoryFilter(cat)}
                >
                    {cat || 'All Items'}
                </button>
            ))}
          </div>
          
          <h3>Price Range</h3>
          <div className="price-inputs">
             <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
             <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
          </div>

          <h3>Sort Order</h3>
          <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="latest">Newest First</option>
            <option value="cheapest">Price: Low to High</option>
            <option value="expensive">Price: High to Low</option>
          </select>

          <button className="sell-btn-large" onClick={() => navigate('/add')}>+ Sell Your Item</button>
        </aside>

        <main className="market-main-grid">
          {loading ? (
            <div className="pulse-loader">Preparing the marketplace... ✨</div>
          ) : products.length === 0 ? (
            <div className="no-res">No listings found. Be the first to sell!</div>
          ) : (
            <div className="elite-grid">
              {products.map((product) => (
                <div key={product._id} className={`elite-card ${product.status === 'sold' ? 'sold-out' : ''}`} onClick={() => setSelectedProduct(product._id)}>
                  <div className="card-top">
                    {product.imageUrl ? (
                        <img src={`http://localhost:5000${product.imageUrl}`} alt={product.title} />
                    ) : (
                        <div className="no-image-placeholder">📦</div>
                    )}
                    <span className="cat-chip-card">{product.category}</span>
                  </div>
                  <div className="card-bottom">
                    <div className="card-price-row">
                        <span className="price-bold">₹{product.price}</span>
                        {product.status === 'sold' && <span className="sold-flag">SOLD</span>}
                    </div>
                    <h3 className="title-bold">{product.title}</h3>
                    {product.status !== 'sold' && (
                        <button className="add-cart-btn-card" onClick={(e) => handleAddToCart(product, e)}>Add to Cart</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="pagination-elite">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
              <span>{page} / {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          )}
        </main>
      </div>

      {selectedProduct && <ProductModal productId={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={(p) => handleAddToCart(p)} />}
    </div>
  );
};

export default MarketPage;
