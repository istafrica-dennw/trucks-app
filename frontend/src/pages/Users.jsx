import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import MobileHeader from '../components/MobileHeader';
import './Users.css';

const Users = () => {
  const { user, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    phone: '',
    password: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [updatingRoles, setUpdatingRoles] = useState({});

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get user initials for avatar
  const getUserInitials = (email) => {
    if (!email) return 'U';
    // Extract the part before @ and use first two characters
    const namePart = email.split('@')[0];
    return namePart
      .split(/[._-]/) // Split on common separators
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get display name from email
  const getDisplayName = (email) => {
    if (!email) return 'Unknown User';
    const namePart = email.split('@')[0];
    // Convert to title case and replace separators with spaces
    return namePart
      .split(/[._-]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  };

  // Format last login date
  const formatLastLogin = (lastLogin) => {
    if (!lastLogin) return 'Never';
    
    const date = new Date(lastLogin);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    
    return date.toLocaleDateString();
  };

  // Handle add user button click
  const handleAddUserClick = () => {
    setShowAddModal(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Basic client-side validation
    if (!newUser.email || !newUser.phone || !newUser.password) {
      setError('All fields are required');
      setSubmitting(false);
      return;
    }

    if (newUser.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setSubmitting(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      setError('Please enter a valid email address');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle Joi validation errors
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const errorMessages = errorData.errors.map(err => err.message).join('\n');
          throw new Error(errorMessages);
        }
        
        // Handle other API errors
        throw new Error(errorData.message || 'Failed to create user');
      }

      // Reset form and close modal
      setNewUser({ email: '', phone: '', password: '' });
      setShowAddModal(false);
      
      // Refresh users list
      await fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowAddModal(false);
    setNewUser({ email: '', phone: '', password: '' });
    setError(null);
  };

  // Handle role change
  const handleRoleChange = async (userId, newRole) => {
    // Prevent admin from changing their own role
    if (userId === user?.id) {
      setError('You cannot change your own role');
      return;
    }

    setUpdatingRoles(prev => ({ ...prev, [userId]: true }));
    setError(null);

    try {
      const response = await fetch(`http://localhost:5001/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user role');
      }

      // Refresh users list
      await fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingRoles(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Handle menu toggle for mobile
  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (loading) {
    return (
      <div className="users-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="users-page">
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <MobileHeader onMenuToggle={handleMenuToggle} isMenuOpen={isMenuOpen} />
      
      <main className="users-main">
        <div className="users-content">
          {/* Header Section */}
          <div className="users-header">
            <div className="users-title-section">
              <h1 className="users-title">Users</h1>
              <p className="users-subtitle">Manage system users and permissions</p>
            </div>
            
            <div className="users-actions">
              <div className="search-container">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              
              <button className="add-user-btn-new" onClick={handleAddUserClick}>
                <svg className="add-icon-new" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div className="add-user-text-new">
                  <div className="add-text-new">Add User</div>
                  {/* <div className="user-text-new">User</div> */}
                </div>
              </button>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="error-message">
              <p>Error loading users: {error}</p>
              <button onClick={fetchUsers} className="retry-btn">Retry</button>
            </div>
          )}

          {/* Users Grid */}
          <div className="users-grid">
            {filteredUsers.length === 0 ? (
              <div className="no-users">
                <p>No users found</p>
              </div>
            ) : (
              filteredUsers.map((userData) => (
                <div key={userData._id} className={`user-card ${userData._id === user?.id ? 'current-user' : ''}`}>
                  <div className="user-avatar">
                    {getUserInitials(userData.email)}
                  </div>
                  
                  <div className="user-info">
                    <h3 className="user-name">{getDisplayName(userData.email)}</h3>
                    <p className="user-email">{userData.email}</p>
                  </div>
                  
                  <div className="user-meta">
                    <div className="user-role">
                      <select
                        value={userData.role}
                        onChange={(e) => handleRoleChange(userData._id, e.target.value)}
                        disabled={updatingRoles[userData._id] || userData._id === user?.id}
                        className={`role-select ${userData.role}`}
                        title={userData._id === user?.id ? "You cannot change your own role" : "Change user role"}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                      {updatingRoles[userData._id] && (
                        <span className="role-updating">Updating...</span>
                      )}
                    </div>
                    
                    <div className="user-status">
                      <span className={`status-tag ${userData.isActive ? 'active' : 'inactive'}`}>
                        {userData.isActive ? 'active' : 'inactive'}
                      </span>
                    </div>
                    
                    <div className="user-last-login">
                      <span className="last-login-label">Last login:</span>
                      <span className="last-login-value">
                        {formatLastLogin(userData.lastLogin)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New User</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={newUser.email}
                  onChange={handleInputChange}
                  required
                  placeholder="user@example.com"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={newUser.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="+1234567890"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={newUser.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter password"
                  minLength="6"
                />
              </div>
              
              {error && (
                <div className="form-error">
                  {error}
                </div>
              )}
              
              <div className="modal-actions">
                <button type="button" onClick={handleCloseModal} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;