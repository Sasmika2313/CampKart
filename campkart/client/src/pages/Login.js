import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      // Save token & redirect
      localStorage.setItem('campkartToken', res.data.token);
      navigate('/'); // Redirect to homepage or dashboard
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-semibold text-pink-500 text-center mb-4">CampKart Login</h2>

        {error && (
          <div className="bg-red-100 text-red-700 text-sm px-4 py-2 mb-4 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="block mb-2 text-sm text-gray-700">Email</label>
          <input
            type="email"
            className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-pink-200"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="block mb-2 text-sm text-gray-700">Password</label>
          <input
            type="password"
            className="w-full px-4 py-2 border rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-pink-200"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition"
          >
            Log In
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don’t have an account? <a href="/register" className="text-pink-500 font-semibold">Register</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
