import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/userSlice';
import ThemeToggle from './ThemeToggle';
import UserProfileInfo from './UserProfileInfo';
import './styles.scss';

const UserProfile = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user.user);
  const [showProfileInfo, setShowProfileInfo] = useState(false);
  console.log(user)

  const handleLogout = () => {
    dispatch(logout());
  };

  if (!user) return null;

  return (
    <>
      <div className="user-profile">
        <div 
          className="user-profile__header"
          onClick={() => setShowProfileInfo(true)}
          role="button"
          tabIndex={0}
          style={{ cursor: 'pointer' }}
        >
          <div className="user-profile__avatar">
            {user.avatar ? (
              <img src={user.avatar} alt="User avatar" className="user-profile__avatar-image" />
            ) : (
              /* If no avatar, show first letter of name or email */
              user.name?.charAt(0) || user.email?.charAt(0)
            )}
          </div>
          <div className="user-profile__info">
            <h3 className="user-profile__name">{user.name || 'User'}</h3>
            <p className="user-profile__email">{user.email}</p>
          </div>
        </div>
        
        <div className="user-profile__details">
          <div className="user-profile__status">
            <span className="user-profile__status-dot"></span>
            <span>Online</span>
          </div>
        </div>

        <div className="user-profile__actions">
          <ThemeToggle />
        </div>
      </div>

      {/* User Profile Info Modal */}
      {showProfileInfo && (
        <UserProfileInfo
          user={user}
          onClose={() => setShowProfileInfo(false)}
          onLogout={handleLogout}
        />
      )}
    </>
  );
};

export default UserProfile;