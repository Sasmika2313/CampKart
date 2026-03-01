// ProductForm.js
import React, { useState } from 'react';
import axios from 'axios';
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
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.price) {
      setMessage('Title and price are required');
      setIsSuccess(false);
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('category', formData.category);
    if (image) data.append('image', image);

    // ✅ Send JWT token in the Authorization header
    const token = localStorage.getItem('campkart-token');

    try {
      await axios.post('http://localhost:5000/api/products', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Note: Let axios set Content-Type automatically for FormData
        },
      });
      setMessage('✅ Product uploaded successfully!');
      setIsSuccess(true);
      setFormData({ title: '', description: '', price: '', category: '' });
      setImage(null);
      // Redirect to market after 1.5 seconds
      setTimeout(() => navigate('/market'), 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Upload failed. Please try again.';
      setMessage(`❌ ${msg}`);
      setIsSuccess(false);
    }
  };

  return (
    <div className="product-form">
      <div className="form-header">
        <button className="back-btn" onClick={() => navigate('/market')}>← Back to Market</button>
        <h2>Add New Listing</h2>
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
        <input
          type="text"
          name="category"
          placeholder="Category (e.g. Books, Electronics)"
          value={formData.category}
          onChange={handleChange}
        />
        <label className="file-label">
          📷 Upload Photo
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </label>
        {image && <p className="file-name">Selected: {image.name}</p>}
        <button type="submit">Upload Product</button>
      </form>
    </div>
  );
};

export default ProductForm;
