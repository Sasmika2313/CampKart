import React, { useState } from 'react';
import API from '../api';
import './AuthPage.css';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ name: '', email: '', password: '' });
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? '/auth/login' : '/auth/register';

    try {
      const res = await API.post(endpoint, formData);
      localStorage.setItem('campkart-token', res.data.token);
      localStorage.setItem('campkart-refresh-token', res.data.refreshToken);
      localStorage.setItem('campkart-user', JSON.stringify({
        _id: res.data._id,
        name: res.data.name,
        role: res.data.role
      }));
      navigate('/market');
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong';
      setError(msg);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <p className="auth-brand">🎒 CampKart</p>
        <p className="auth-subtitle">The campus marketplace for students</p>
        <div className="form-box">
          <h2>{isLogin ? 'Welcome back!' : 'Create an account'}</h2>
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            )}
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
          </form>
          <p onClick={toggleForm} className="switch-link">
            {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
