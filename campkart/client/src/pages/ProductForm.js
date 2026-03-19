import React, { useState, useEffect } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import './ProductForm.css';

const ProductForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
  });
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const query = new URLSearchParams(window.location.search);
  const editId = query.get('edit');

  useEffect(() => {
    if (editId) {
      const fetchProduct = async () => {
        try {
          const { data } = await API.get(`/products/${editId}`);
          setFormData({
            title: data.title,
            description: data.description,
            price: data.price,
            category: data.category,
          });
        } catch (err) {
          console.error('Fetch failed');
        }
      };
      fetchProduct();
    }
  }, [editId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.title || !formData.price) {
      setMessage('Title and price are required');
      setIsSuccess(false);
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('category', formData.category);
    if (image) data.append('image', image);

    try {
      if (editId) {
        await API.put(`/products/${editId}`, data);
        setMessage('✅ Product updated successfully!');
      } else {
        await API.post('/products', data);
        setMessage('✅ Product uploaded successfully!');
      }
      setIsSuccess(true);
      setTimeout(() => navigate('/market'), 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Action failed. Please try again.';
      setMessage(`❌ ${msg}`);
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-form">
      <div className="form-header">
        <button className="back-btn" onClick={() => navigate('/market')}>← Back to Market</button>
        <h2>{editId ? 'Edit Listing' : 'Add New Listing'}</h2>
      </div>
      {message && <p className={`msg ${isSuccess ? 'success' : 'error'}`}>{message}</p>}
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          type="text"
          name="title"
          placeholder="Item Title *"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Description (condition, details…)"
          value={formData.description}
          onChange={handleChange}
          rows={3}
        />
        <input
          type="number"
          name="price"
          placeholder="Price (₹) *"
          value={formData.price}
          onChange={handleChange}
          required
          min="0"
        />
        <select name="category" value={formData.category} onChange={handleChange} required>
            <option value="">Select Category *</option>
            <option value="Electronics">Electronics</option>
            <option value="Books">Books</option>
            <option value="Stationery">Stationery</option>
            <option value="Clothing">Clothing</option>
            <option value="Furniture">Furniture</option>
            <option value="Other">Other</option>
        </select>
        <label className="file-label">
          📷 Upload Photo
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </label>
        {image && <p className="file-name">Selected: {image.name}</p>}
        <button type="submit" disabled={loading}>
          {loading ? (editId ? 'Updating...' : 'Uploading...') : (editId ? 'Update Product' : 'Upload Product')}
        </button>
      </form>
    </div>
  );
};

export default ProductForm;
