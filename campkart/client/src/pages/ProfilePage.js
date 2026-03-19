import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';
import './ProfilePage.css';

const ProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    
    const currentUser = JSON.parse(localStorage.getItem('campkart-user') || '{}');
    const isOwnProfile = !id || id === currentUser._id;
    const profileId = id || currentUser._id;

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Fetch basic user info
                const { data: userData } = await API.get(`/auth/profile/${profileId}`);
                setUser(userData);
                setEditData(userData);

                // Fetch their products (including sold ones if on their page)
                const { data: productData } = await API.get(`/products/seller/${profileId}`);
                setProducts(productData);
            } catch (err) {
                console.error('Profile fetch failed');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [profileId]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.put('/auth/profile', editData);
            setUser(data);
            localStorage.setItem('campkart-user', JSON.stringify(data));
            setIsEditing(false);
        } catch (err) {
            alert('Update failed');
        }
    };

    if (loading) return <div className="loading-state">Loading Profile...</div>;

    return (
        <div className="profile-container">
            <aside className="profile-sidebar">
                <div className="profile-card">
                    <div className="profile-avatar">{user?.name ? user.name[0].toUpperCase() : '?'}</div>
                    <div className="profile-info">
                        <h1>{user?.name || 'User'}</h1>
                        <p className="role-chip">{user?.role || 'Member'}</p>
                        <div className="rating-display">
                            <span className="stars">{'⭐'.repeat(Math.round(user?.rating || 5))}</span>
                            <span>({user?.numReviews || 0} reviews)</span>
                        </div>
                    </div>

                    {isOwnProfile && !isEditing && (
                        <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>
                    )}
                </div>

                <div className="address-box">
                    <h3>Shipping Address</h3>
                    {isEditing ? (
                        <form className="edit-form" onSubmit={handleUpdate}>
                            <input placeholder="Street" value={editData.address?.street || ''} onChange={e => setEditData({...editData, address: {...(editData.address || {}), street: e.target.value}})} />
                            <input placeholder="City" value={editData.address?.city || ''} onChange={e => setEditData({...editData, address: {...(editData.address || {}), city: e.target.value}})} />
                            <input placeholder="Zip" value={editData.address?.zip || ''} onChange={e => setEditData({...editData, address: {...(editData.address || {}), zip: e.target.value}})} />
                            <input placeholder="Phone" value={editData.address?.phone || ''} onChange={e => setEditData({...editData, address: {...(editData.address || {}), phone: e.target.value}})} />
                            <div className="edit-actions">
                                <button type="submit" className="save-btn">Save</button>
                                <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                            </div>
                        </form>
                    ) : (
                        <div className="address-display">
                            <p><strong>Street:</strong> {user?.address?.street || 'Not set'}</p>
                            <p><strong>City:</strong> {user?.address?.city || 'Not set'}</p>
                            <p><strong>Zip:</strong> {user?.address?.zip || 'Not set'}</p>
                            <p><strong>Phone:</strong> {user?.address?.phone || 'Not set'}</p>
                        </div>
                    )}
                </div>
            </aside>

            <main className="profile-content">
                <div className="content-tabs">
                    <div className="tab active">{isOwnProfile ? 'My Listings' : 'Seller Store'}</div>
                </div>

                <div className="product-list-compact">
                    {products.length === 0 ? (
                        <div className="empty-products">No listings found.</div>
                    ) : (
                        products.map(p => (
                            <div key={p._id} className={`product-row ${p.status === 'sold' ? 'is-sold' : ''}`}>
                                <div className="row-img">
                                    {p.imageUrl ? <img src={`http://localhost:5000${p.imageUrl}`} alt="" /> : <span>📦</span>}
                                </div>
                                <div className="row-info">
                                    <h3>{p.title}</h3>
                                    <p>{p.category}</p>
                                </div>
                                <div className="row-price">₹{p.price}</div>
                                <div className="row-status">
                                    {p.status === 'sold' ? <span className="badge sold">Sold</span> : <span className="badge active">Available</span>}
                                    {isOwnProfile && <button className="edit-btn-sm" onClick={() => navigate(`/add?edit=${p._id}`)}>Edit</button>}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;
