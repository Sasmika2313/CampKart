import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);
      localStorage.setItem('campkartToken', res.data.token);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-100 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-semibold text-pink-500 text-center mb-4">Create Account</h2>

        {error && (
          <div className="bg-red-100 text-red-700 text-sm px-4 py-2 mb-4 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="block mb-2 text-sm text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            required
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-pink-200"
          />

          <label className="block mb-2 text-sm text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            required
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-pink-200"
          />

          <label className="block mb-2 text-sm text-gray-700">Password</label>
          <input
            type="password"
            name="password"
            required
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-pink-200"
          />

          <button
            type="submit"
            className="w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition"
          >
            Register
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? <a href="/login" className="text-pink-500 font-semibold">Login</a>
        </p>
      </div>
    </div>
  );
}

export default Register;
