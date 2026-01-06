import React, { useState, useEffect } from 'react';
import AvatarUpload from './AvatarUpload';
import ThemeToggle from './ThemeToggle';
import './userProfileInfo.scss';

const UserProfileInfo = ({ user, onClose, onLogout }) => {
  const [localUser, setLocalUser] = useState(user);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Detect mobile resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleAvatarUpdate = (newAvatar) => {
    // Update local user with new avatar
    setLocalUser((prevUser) => ({
      ...prevUser,
      avatar: newAvatar,
    }));
  };

  const displayUser = localUser || user;

  if (!displayUser) {
    return (
      <div className="user-profile-info-modal">
        <div className="user-profile-info-overlay" onClick={onClose}></div>
        <div className="user-profile-info">
          <div className="user-profile-info__header">
            <h2>User Information</h2>
            <button className="user-profile-info__close" onClick={onClose}>×</button>
          </div>
          <div className="user-profile-info__content">
            <p>No user information available</p>
          </div>
        </div>
      </div>
    );
  }

  // Format date
  const formatDate = (date) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  return (
    <div className="user-profile-info-modal">
      {/* Overlay */}
      <div className="user-profile-info-overlay" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="user-profile-info">
        {/* Header */}
        <div className="user-profile-info__header">
          <h2>👤 My Profile</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {isMobile && <ThemeToggle />}
            <button className="user-profile-info__close" onClick={onClose} title="Close">×</button>
          </div>
        </div>

        {/* Content */}
        <div className="user-profile-info__content">
          
          {/* Avatar Upload Section */}
          <AvatarUpload user={displayUser} onAvatarUpdate={handleAvatarUpdate} />
          
          {/* User Details */}
          <div className="user-profile-info__details">
            {/* Email */}
            <div className="user-profile-info__detail-item">
              <span className="user-profile-info__label">📧 Email</span>
              <span className="user-profile-info__value">{displayUser.email || 'Not available'}</span>
            </div>

            {/* Username */}
            {displayUser.username && (
              <div className="user-profile-info__detail-item">
                <span className="user-profile-info__label">👤 Username</span>
                <span className="user-profile-info__value">@{displayUser.username}</span>
              </div>
            )}

            {/* Account Created */}
            {displayUser.createdAt && (
              <div className="user-profile-info__detail-item">
                <span className="user-profile-info__label">📅 Member Since</span>
                <span className="user-profile-info__value">{formatDate(displayUser.createdAt)}</span>
              </div>
            )}

            {/* Phone (if available) */}
            {displayUser.phone && (
              <div className="user-profile-info__detail-item">
                <span className="user-profile-info__label">📱 Phone</span>
                <span className="user-profile-info__value">{displayUser.phone}</span>
              </div>
            )}

            {/* Bio/Status (if available) */}
            {displayUser.bio && (
              <div className="user-profile-info__detail-item">
                <span className="user-profile-info__label">✍️ Bio</span>
                <span className="user-profile-info__value user-profile-info__value--bio">{displayUser.bio}</span>
              </div>
            )}
          </div>

          {/* Account Stats */}
          <div className="user-profile-info__stats">
            <p className="user-profile-info__stats-title">📊 Account Stats</p>
            <div className="user-profile-info__stats-grid">
              <div className="user-profile-info__stat-item">
                <span className="user-profile-info__stat-value">Active</span>
                <span className="user-profile-info__stat-label">Status</span>
              </div>
              <div className="user-profile-info__stat-item">
                <span className="user-profile-info__stat-value">Verified</span>
                <span className="user-profile-info__stat-label">Account</span>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button 
            className="user-profile-info__logout-button"
            onClick={handleLogout}
            title="Logout from your account"
          >
            <span className="user-profile-info__logout-icon">🚪</span>
            Logout
          </button>

          {/* Footer Note */}
          <div className="user-profile-info__footer">
            <p className="user-profile-info__footer-text">
              This is your account information. Keep it secure and up to date.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileInfo;
