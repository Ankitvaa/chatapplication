import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/userSlice';
import './styles.scss';

const UserProfile = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user.user);

  const handleLogout = () => {
    dispatch(logout());
  };

  if (!user) return null;

  return (
    <div className="user-profile">
      <div className="user-profile__header">
        <div className="user-profile__avatar">
          {/* If no avatar, show first letter of name or email */}
          {user.name?.charAt(0) || user.email?.charAt(0)}
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

      <button className="user-profile__logout" onClick={handleLogout}>
        <span className="user-profile__logout-icon">🚪</span>
        Logout
      </button>
    </div>
  );
};

export default UserProfile;