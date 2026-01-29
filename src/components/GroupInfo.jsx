import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import API from '../api/api';
import { setActiveChat } from '../store/chatSlice';
import './groupInfo.scss';
import './groupInfo-media.scss';

const GroupInfo = ({ chat, participants, user, onClose, onDeleteChat, onLeaveChat }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  // --- UI States ---
  const [activeTab, setActiveTab] = useState('overview');
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState(null);

  // --- NEW: Add Member States ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(chat.chatName);
  const [editedDescription, setEditedDescription] = useState(chat.description || "");
  const [isSaving, setIsSaving] = useState(false);

  // --- NEW: Media States ---
  const [media, setMedia] = useState([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [mediaError, setMediaError] = useState(null);

  // Fetch media when tab is clicked
  const handleMediaTabClick = async () => {
    setActiveTab('media');
    if (media.length === 0 && !isLoadingMedia) {
      setIsLoadingMedia(true);
      try {
        const response = await API.get(`/messages/${chat._id}`);
        const allMessages = response.data.messages || [];
        // Filter only media messages
        const mediaMessages = allMessages.filter(m => m.fileUrl && m.fileType);
        setMedia(mediaMessages);
      } catch (err) {
        console.error("Error fetching media:", err);
        setMediaError("Failed to load media");
      } finally {
        setIsLoadingMedia(false);
      }
    }
  };

  if (!chat || !participants) return null;

  console.log("chat", chat);

  const isCurrentUserAdmin = user?._id === chat.admin;

  // --- UPDATED: Add Member Logic ---
  const handleAddMemberSubmit = async (e) => {
    e.preventDefault(); // Prevent page refresh if used in a form
    if (!emailInput) return;

    setIsAdding(true);
    try {
      const response = await API.post(`/chats/${chat._id}/members`, {
        email: emailInput
      });

      if (response.status === 200) {
        alert(`Successfully added ${response.data.addedUser.email} to the group!`);

        // Reset and close
        setEmailInput("");
        setShowAddModal(false);

        // Refresh parent data if applicable
        if (onClose) onClose();
      }
    } catch (err) {
      console.error("Error adding member:", err);
      alert(err.response?.data?.error || "Failed to add member");
    } finally {
      setIsAdding(false);
    }
  };

  // --- NEW: Update Group Logic ---
  const handleUpdateGroup = async () => {
    if (!editedName.trim()) {
      alert("Group name cannot be empty");
      return;
    }

    setIsSaving(true);
    try {
      const response = await API.put(`/chats/${chat._id}`, {
        chatName: editedName,
        description: editedDescription
      });

      if (response.status === 200) {
        // Update Redux state so the UI reflects changes globally
        if (response.data?.chat) {
          dispatch(setActiveChat(response.data.chat));
        }
        setIsEditing(false); // Switch back to view mode
      }
    } catch (err) {
      console.error("Error updating group:", err);
      alert(err.response?.data?.error || "Failed to update group");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const handleAvatarSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setAvatarError('Please select a valid image file');
      setTimeout(() => setAvatarError(null), 5000);
      return;
    }
    setIsUpdatingAvatar(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const response = await API.put(`/chats/${chat._id}/avatar`, { avatar: e.target.result });
        if (response.data?.chat) dispatch(setActiveChat(response.data.chat));
      } catch (err) {
        setAvatarError('Failed to update avatar');
      } finally {
        setIsUpdatingAvatar(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = async () => {
    if (!window.confirm('Are you sure you want to remove the group avatar?')) return;
    setIsUpdatingAvatar(true);
    try {
      const response = await API.delete(`/chats/${chat._id}/avatar`);
      if (response.data?.chat) dispatch(setActiveChat(response.data.chat));
    } catch (err) {
      setAvatarError('Failed to remove avatar');
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  return (
    <div className="group-info-modal">
      <div className="group-info-overlay" onClick={onClose}></div>

      <div className="group-info-card">
        <button className="group-info__close-top" onClick={onClose}>×</button>

        {/* --- Add Member Modal Overlay --- */}
        {showAddModal && (
          <div className="inner-modal-overlay">
            <div className="inner-modal-content">
              <h3>Add Member</h3>
              <p>Invite someone via email address</p>
              <input
                type="email"
                placeholder="user@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                autoFocus
              />
              <div className="inner-modal-actions">
                <button
                  onClick={() => setShowAddModal(false)}
                  disabled={isAdding}
                >Cancel</button>
                <button
                  className="confirm-btn"
                  onClick={handleAddMemberSubmit}
                  disabled={isAdding || !emailInput}
                >
                  {isAdding ? "Adding..." : "Add User"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="group-info__hero">
          <div className="group-info__avatar-container">
            {chat.avatar ? (
              <img src={chat.avatar} alt={chat.chatName} className="group-info__avatar-image" />
            ) : (
              <div className="group-info__icon">{chat.chatName?.charAt(0).toUpperCase() || 'G'}</div>
            )}

            {isCurrentUserAdmin && (
              <div className="group-info__avatar-actions">
                <button
                  className="group-info__avatar-button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUpdatingAvatar}
                >📸</button>
                {chat.avatar && (
                  <button
                    type="button"
                    className="group-info__avatar-button group-info__avatar-button--danger"
                    onClick={handleRemoveAvatar}
                    disabled={isUpdatingAvatar}
                  >🗑️</button>
                )}
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleAvatarSelect} accept="image/*" style={{ display: 'none' }} />
          </div>

          {isEditing ? (
            <input
              className="group-info__name-input"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              autoFocus
            />
          ) : (
            <h2 className="group-info__name-hero">{chat.chatName || 'Unnamed Group'}</h2>
          )}          <div className="group-info__badges">
            <span className="group-info__badge-pill">{chat.isGroupChat ? '👥 Group Chat' : '👤 DM'}</span>
            <span className="group-info__badge-pill">{participants.length} Members</span>
          </div>
          {avatarError && <p className="group-info__error">{avatarError}</p>}
        </div>

        <div className="group-info__tabs">
          {['overview', 'members', 'media'].map((tab) => (
            <button
              key={tab}
              className={`group-info__tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => tab === 'media' ? handleMediaTabClick() : setActiveTab(tab)}
            >{tab}</button>
          ))}
        </div>

        <div className="group-info__scroll-content">
          {activeTab === 'overview' && (
            <div className="group-info__overview-pane">
              {/* <div className="group-info__description-card">
                <p>{chat.description || "No description provided."}</p>
                <span className="group-info__date-label">Created: {formatDate(chat.createdAt)}</span>
              </div> */}

              <div className="group-info__description-card">
                {isEditing ? (
                  <textarea
                    className="group-info__description-textarea"
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    placeholder="Enter group description..."
                  />
                ) : (
                  <p>{chat.description || "No description provided."}</p>
                )}
                <span className="group-info__date-label">Created: {formatDate(chat.createdAt)}</span>
              </div>

              {/* Show Save/Cancel buttons only when editing */}
              {isEditing && (
                <div className="group-info__edit-actions">
                  <button className="save-btn" onClick={handleUpdateGroup} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                  <button className="cancel-btn" onClick={() => setIsEditing(false)} disabled={isSaving}>
                    Cancel
                  </button>
                </div>
              )}

              {/*  */}

              {chat.isGroupChat && isCurrentUserAdmin && (
                <div className="group-info__admin-grid">
                  <p className="section-label">Admin Actions</p>
                  <div className="grid-container">
                    <button
                      className="grid-item"
                      onClick={() => setShowAddModal(true)}
                    >
                      <span>👤+</span>Add Member
                    </button>
                    <button className="grid-item"><span>🔔</span>Mute</button>
                    <button className="grid-item"><span>🔕</span>Silent</button>
                    <button
                      className={`grid-item ${isEditing ? 'active' : ''}`}
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      <span>📝</span>{isEditing ? 'Cancel Edit' : 'Edit'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'members' && (
            <div className="group-info__participants-list">
              {participants.map((participant) => (
                <div key={participant._id} className="group-info__participant-card">
                  <img src={participant.avatar || 'https://via.placeholder.com/40'} alt="" />
                  <div className="info">
                    <p>
                      {participant.name}
                      {participant._id === chat.admin && <span className="admin-tag">Admin</span>}
                      {participant._id === user?._id && <span className="you-tag">You</span>}
                    </p>
                    <span>{participant.email}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'media' && (
            <div className="group-info__media-pane">
              {isLoadingMedia && <p className="loading-text">Loading media...</p>}
              {mediaError && <p className="error-text">{mediaError}</p>}
              {!isLoadingMedia && media.length === 0 && (
                <p className="empty-text">No media shared in this group yet.</p>
              )}
              {media.length > 0 && (
                <div className="group-info__media-grid">
                  {media.map((m) => (
                    <div key={m._id} className="group-info__media-item">
                      {m.fileType.startsWith('image/') ? (
                        <img
                          src={`http://localhost:8080${m.fileUrl}`}
                          alt="shared"
                          className="group-info__media-thumbnail"
                        />
                      ) : (
                        <div className="group-info__video-placeholder">
                          <span>🎬</span>
                        </div>
                      )}
                      <div className="group-info__media-info">
                        <p className="media-sender">{m.senderName}</p>
                        <p className="media-date">
                          {new Date(m.uploadedAt || m.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="group-info__danger-zone">
          <p className="section-label">Danger Zone</p>
          <button
            className="group-info__button-outline"
            onClick={() => {
              isCurrentUserAdmin ? onDeleteChat() : onLeaveChat();
              onClose();
            }}
          >
            {isCurrentUserAdmin ? '🗑️ Delete Group' : '👋 Leave Group'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupInfo;