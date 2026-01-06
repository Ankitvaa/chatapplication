import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../store/userSlice';
import API from '../api/api';
import './avatarUpload.scss';

const AvatarUpload = ({ user, onAvatarUpdate }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.avatar || null);

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      setTimeout(() => setError(null), 5000);
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('Image size must be less than 5MB');
      setTimeout(() => setError(null), 5000);
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);

    // Upload file
    await uploadAvatar(file);
  };

  const uploadAvatar = async (file) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      // Upload to backend using PUT endpoint
      // Pattern: PUT /users/:userId/avatar
      const response = await API.put(`/users/${user._id}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.user) {
        // Update Redux store with new user data
        dispatch(setUser(response.data.user));
        setPreviewUrl(response.data.user.avatar);
        onAvatarUpdate?.(response.data.user.avatar);
      }
    } catch (err) {
      console.error('Avatar upload error:', err);
      
      // Check if endpoint doesn't exist (404)
      if (err.response?.status === 404) {
        setError('⏳ User avatar endpoint coming soon. Group avatars are ready!');
        // Reset preview on error
        setPreviewUrl(user?.avatar || null);
        setTimeout(() => setError(null), 6000);
      } else {
        setError(err.response?.data?.message || 'Failed to upload avatar. Please try again.');
        setPreviewUrl(user?.avatar || null);
        setTimeout(() => setError(null), 5000);
      }
    } finally {
      setIsLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (!window.confirm('Are you sure you want to remove your avatar?')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use DELETE endpoint with user ID pattern
      const response = await API.delete(`/users/${user._id}/avatar`);

      if (response.data?.user) {
        dispatch(setUser(response.data.user));
        setPreviewUrl(null);
        onAvatarUpdate?.(null);
      }
    } catch (err) {
      console.error('Avatar removal error:', err);
      
      // Check if endpoint doesn't exist (404)
      if (err.response?.status === 404) {
        setError('⏳ User avatar endpoint coming soon.');
        setTimeout(() => setError(null), 4000);
      } else {
        setError(err.response?.data?.message || 'Failed to remove avatar. Please try again.');
        setTimeout(() => setError(null), 5000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getAvatarDisplay = () => {
    if (previewUrl) {
      return <img src={previewUrl} alt="User avatar" className="avatar-upload__preview-image" />;
    }
    return (
      <div className="avatar-upload__placeholder">
        {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
      </div>
    );
  };

  return (
    <div className="avatar-upload">
      <div className="avatar-upload__container">
        <div className="avatar-upload__preview">
          {getAvatarDisplay()}
        </div>

        {isLoading && (
          <div className="avatar-upload__loading">
            <div className="avatar-upload__spinner"></div>
            <span>Uploading...</span>
          </div>
        )}

        {error && (
          <div className="avatar-upload__error">
            <span className="avatar-upload__error-icon">⚠️</span>
            <span className="avatar-upload__error-message">{error}</span>
          </div>
        )}
      </div>

      <div className="avatar-upload__actions">
        <button
          className="avatar-upload__button avatar-upload__button--upload"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          title="Upload a new avatar"
        >
          <span className="avatar-upload__button-icon">📸</span>
          {isLoading ? 'Uploading...' : 'Upload Avatar'}
        </button>

        {previewUrl && (
          <button
            className="avatar-upload__button avatar-upload__button--remove"
            onClick={handleRemoveAvatar}
            disabled={isLoading}
            title="Remove your avatar"
          >
            <span className="avatar-upload__button-icon">🗑️</span>
            Remove
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="avatar-upload__input"
        disabled={isLoading}
      />

      <p className="avatar-upload__hint">
        Supported formats: JPEG, PNG, GIF, WebP • Max size: 5MB
      </p>
    </div>
  );
};

export default AvatarUpload;
