import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-container">
            <nav className="landing-nav">
                <div className="landing-brand">🎒 CampKart</div>
                <div className="landing-nav-links">
                    <button onClick={() => navigate('/auth')} className="landing-login-btn">Login / Signup</button>
                    <button onClick={() => navigate('/market')} className="landing-cta-sm">Explore Market</button>
                </div>
            </nav>

            <header className="hero-section">
                <div className="hero-content">
                    <h1>Your Campus, Your Marketplace.</h1>
                    <p>Buy and sell everything from textbooks to tech with your fellow students. Safe, fast, and local.</p>
                    <div className="hero-btns">
                        <button onClick={() => navigate('/market')} className="landing-cta-lg">Start Shopping</button>
                        <button onClick={() => navigate('/add')} className="landing-secondary-lg">Sell an Item</button>
                    </div>
                </div>
                <div className="hero-stats">
                    <div className="stat-card">
                        <h3>📚 500+</h3>
                        <p>Books Listed</p>
                    </div>
                    <div className="stat-card">
                        <h3>💻 200+</h3>
                        <p>Gadgets Sold</p>
                    </div>
                    <div className="stat-card">
                        <h3>🛡️ 100%</h3>
                        <p>Student Verified</p>
                    </div>
                </div>
            </header>

            <section className="how-it-works">
                <div className="section-intro">
                    <h2>How CampKart Works</h2>
                    <p>Designed by students, for students. The simplest way to trade on campus.</p>
                </div>
                <div className="steps-grid">
                    <div className="step">
                        <div className="step-icon-bg">📸</div>
                        <h3>Snap & List</h3>
                        <p>Take a few photos of your item, set a student-friendly price, and list it in seconds.</p>
                    </div>
                    <div className="step">
                        <div className="step-icon-bg">💬</div>
                        <h3>Chat & Deal</h3>
                        <p>Instantly message sellers. Ask about condition or negotiate prices securely on our platform.</p>
                    </div>
                    <div className="step">
                        <div className="step-icon-bg">🤝</div>
                        <h3>Safe Meetup</h3>
                        <p>Exchange items at the library or dorm. No shipping costs, no anonymous delivery drivers.</p>
                    </div>
                </div>
            </section>

            <section className="features-highlight">
                <div className="feature-item">
                    <span className="feat-icon">🏫</span>
                    <h4>Exclusively Campus</h4>
                    <p>Trade only with verified students from your university community.</p>
                </div>
                <div className="feature-item">
                    <span className="feat-icon">💳</span>
                    <h4>Secure Simulated Pay</h4>
                    <p>Experience realistic digital transactions with our Safe Campus Pay module.</p>
                </div>
                <div className="feature-item">
                    <span className="feat-icon">✨</span>
                    <h4>Eco-Friendly</h4>
                    <p>Reduce waste by giving pre-loved campus essentials a second life.</p>
                </div>
            </section>

            <footer className="landing-footer">
                <p>© 2026 CampKart - Exclusively for Campus Communities.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
