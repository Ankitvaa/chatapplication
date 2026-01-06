import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import API from '../api/api';
import { setActiveChat } from '../store/chatSlice';
import './groupInfo.scss';

const GroupInfo = ({ chat, participants, user, onClose, onDeleteChat, onLeaveChat }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [expandedSection, setExpandedSection] = useState('participants');
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState(null);
  console.log(participants)

  if (!chat || !participants) {
    return (
      <div className="group-info-modal">
        <div className="group-info-overlay" onClick={onClose}></div>
        <div className="group-info">
          <div className="group-info__header">
            <h2>Group Information</h2>
            <button className="group-info__close" onClick={onClose}>×</button>
          </div>
          <div className="group-info__content">
            <p>No group information available</p>
          </div>
        </div>
      </div>
    );
  }

  // Find admin user
  const admin = participants.find(p => p._id === chat.admin);
  const isCurrentUserAdmin = user?._id === chat.admin;

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

  const handleAvatarSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setAvatarError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      setTimeout(() => setAvatarError(null), 5000);
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setAvatarError('Image size must be less than 5MB');
      setTimeout(() => setAvatarError(null), 5000);
      return;
    }

    setIsUpdatingAvatar(true);
    setAvatarError(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const base64Avatar = e.target.result;
        
        try {
          // Upload avatar as base64 string in JSON
          const response = await API.put(`/chats/${chat._id}/avatar`, {
            avatar: base64Avatar
          });

          console.log("✅ Avatar uploaded successfully");

          // The response contains the updated chat with avatar
          if (response.data?.chat) {
            const updatedChat = response.data.chat;
            console.log("📝 Updated chat from response:", updatedChat);
            // Dispatch to update both activeChat and chats array
            dispatch(setActiveChat(updatedChat));
          }

          setAvatarError(null);
        } catch (err) {
          console.error("Error updating avatar:", err);
          setAvatarError(err.response?.data?.message || 'Failed to update avatar');
        } finally {
          setIsUpdatingAvatar(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      };

      reader.onerror = () => {
        setAvatarError('Error reading file');
        setIsUpdatingAvatar(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Error:", err);
      setAvatarError('Failed to update avatar');
      setIsUpdatingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!window.confirm('Are you sure you want to remove the group avatar?')) {
      return;
    }

    setIsUpdatingAvatar(true);
    setAvatarError(null);

    try {
      const response = await API.put(`/chats/${chat._id}/avatar`, {
        avatar: null
      });

      // Update local chat object
      if (response.data?.chat) {
        const updatedChat = response.data.chat;
        dispatch(setActiveChat(updatedChat));
      }

      setAvatarError(null);
    } catch (err) {
      console.error("Error removing avatar:", err);
      setAvatarError(err.response?.data?.message || 'Failed to remove avatar');
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="group-info-modal">
      {/* Overlay */}
      <div className="group-info-overlay" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="group-info">
        {/* Header */}
        <div className="group-info__header">
          <h2>ℹ️ Group Information</h2>
          <button className="group-info__close" onClick={onClose} title="Close">×</button>
        </div>

        {/* Content */}
        <div className="group-info__content">
        
        {/* Group Name & Icon */}
        <div className="group-info__section group-info__section--icon">
          <div className="group-info__avatar-container">
            {chat.avatar ? (
              <img 
                src={chat.avatar} 
                alt={chat.chatName} 
                className="group-info__avatar-image"
              />
            ) : (
              <div className="group-info__icon">
                {chat.chatName?.charAt(0).toUpperCase() || 'G'}
              </div>
            )}
            {isCurrentUserAdmin && (
              <div className="group-info__avatar-actions">
                <button
                  className="group-info__avatar-button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUpdatingAvatar}
                  title="Update group avatar"
                >
                  📸
                </button>
                {chat.avatar && (
                  <button
                    className="group-info__avatar-button group-info__avatar-button--danger"
                    onClick={handleRemoveAvatar}
                    disabled={isUpdatingAvatar}
                    title="Remove group avatar"
                  >
                    🗑️
                  </button>
                )}
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarSelect}
              accept="image/*"
              style={{ display: 'none' }}
              disabled={isUpdatingAvatar}
            />
          </div>
          <div className="group-info__name-section">
            <h3 className="group-info__name">{chat.chatName || 'Unnamed Group'}</h3>
            <p className="group-info__type">
              {chat.isGroupChat ? '👥 Group Chat' : '👤 Direct Message'}
            </p>
            {avatarError && (
              <p className="group-info__error">{avatarError}</p>
            )}
            {isUpdatingAvatar && (
              <p className="group-info__loading">Updating avatar...</p>
            )}
          </div>
        </div>

        {/* Group Details */}
        <div className="group-info__details">
          {/* Created Date */}
          <div className="group-info__detail-item">
            <span className="group-info__label">📅 Created On</span>
            <span className="group-info__value">{formatDate(chat.createdAt)}</span>
          </div>

          {/* Total Participants */}
          <div className="group-info__detail-item">
            <span className="group-info__label">👥 Total Members</span>
            <span className="group-info__value">{participants.length}</span>
          </div>

          {/* Group ID */}
          {/* <div className="group-info__detail-item">
            <span className="group-info__label">🔐 Group ID</span>
            <span className="group-info__value group-info__value--code">{chat._id}</span>
          </div> */}
        </div>

        {/* Admin Section */}
        {chat.isGroupChat && admin && (
          <div className="group-info__section group-info__section--collapsible">
            <button 
              className="group-info__section-toggle"
              onClick={() => toggleSection('admin')}
            >
              <span className="group-info__section-title">👨‍💼 Admin</span>
              <span className={`group-info__toggle-icon ${expandedSection === 'admin' ? 'expanded' : ''}`}>
                ▼
              </span>
            </button>
            
            {expandedSection === 'admin' && (
              <div className="group-info__section-content">
                <div className="group-info__participant-card group-info__participant-card--admin">
                  <div className="group-info__participant-avatar">
                    {admin.name?.charAt(0).toUpperCase() || admin.email?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div className="group-info__participant-info">
                    <h4 className="group-info__participant-name">
                      {admin.name || 'Unknown'}
                      <span className="group-info__badge group-info__badge--admin">Admin</span>
                    </h4>
                    <p className="group-info__participant-email">{admin.email || 'No email'}</p>
                    {admin._id === user?._id && (
                      <p className="group-info__you-badge">That's you!</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Participants Section */}
        <div className="group-info__section group-info__section--collapsible">
          <button 
            className="group-info__section-toggle"
            onClick={() => toggleSection('participants')}
          >
            <span className="group-info__section-title">
              👥 Members ({participants.length})
            </span>
            <span className={`group-info__toggle-icon ${expandedSection === 'participants' ? 'expanded' : ''}`}>
              ▼
            </span>
          </button>

          {expandedSection === 'participants' && (
            <div className="group-info__section-content">
              <div className="group-info__participants-list">
                {participants.map((participant) => {
                  const isAdmin = participant._id === chat.admin;
                  const isCurrentUser = participant._id === user?._id;

                  return (
                    <div 
                      key={participant._id} 
                      className={`group-info__participant-card ${isAdmin ? 'group-info__participant-card--admin' : ''}`}
                    >
                      <div className="group-info__participant-avatar">
                        {participant.name?.charAt(0).toUpperCase() || participant.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="group-info__participant-info">
                        <h4 className="group-info__participant-name">
                          {participant.name || 'Unknown'}
                          {isAdmin && <span className="group-info__badge group-info__badge--admin">Admin</span>}
                          {isCurrentUser && <span className="group-info__badge group-info__badge--you">You</span>}
                        </h4>
                        <p className="group-info__participant-email">{participant.email || 'No email'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {chat.isGroupChat && isCurrentUserAdmin && (
          <div className="group-info__actions">
            <p className="group-info__actions-title">⚙️ Admin Actions</p>
            <p className="group-info__actions-hint">You have admin privileges in this group</p>
          </div>
        )}

        {/* Info Footer */}
        <div className="group-info__footer">
          <p className="group-info__footer-text">
            Created: {formatDate(chat.createdAt)}
          </p>
        </div>

        {/* Action Buttons: Delete (admin/1:1) or Leave (member) */}
        <div className="group-info__action-buttons">
          {chat.isGroupChat ? (
            // Group chat: Show delete if admin, leave if member
            isCurrentUserAdmin ? (
              <button
                className="group-info__button group-info__button--danger"
                onClick={() => {
                  onDeleteChat();
                  onClose();
                }}
                title="Delete entire group (admin only)"
              >
                🗑️ Delete Group
              </button>
            ) : (
              <button
                className="group-info__button group-info__button--warning"
                onClick={() => {
                  onLeaveChat();
                  onClose();
                }}
                title="Leave this group"
              >
                👋 Leave Group
              </button>
            )
          ) : (
            // 1:1 chat: Any member can delete
            <button
              className="group-info__button group-info__button--danger"
              onClick={() => {
                onDeleteChat();
                onClose();
              }}
              title="Delete chat"
            >
              🗑️ Delete Chat
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
  );
};

export default GroupInfo;
