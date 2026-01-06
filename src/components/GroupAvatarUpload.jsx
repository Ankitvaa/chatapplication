import React, { useRef, useState } from 'react';
import './groupAvatarUpload.scss';

const GroupAvatarUpload = ({ groupName, onAvatarSelect, previewAvatar }) => {
  const fileInputRef = useRef(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = (event) => {
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

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      onAvatarSelect(file, e.target.result);
    };
    reader.readAsDataURL(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = () => {
    onAvatarSelect(null, null);
    setError(null);
  };

  const getAvatarDisplay = () => {
    if (previewAvatar) {
      return <img src={previewAvatar} alt="Group avatar preview" className="group-avatar-upload__preview-image" />;
    }
    if (groupName) {
      return (
        <div className="group-avatar-upload__placeholder">
          {groupName.charAt(0).toUpperCase()}
        </div>
      );
    }
    return (
      <div className="group-avatar-upload__placeholder group-avatar-upload__placeholder--empty">
        👥
      </div>
    );
  };

  return (
    <div className="group-avatar-upload">
      <div className="group-avatar-upload__container">
        <div className="group-avatar-upload__preview">
          {getAvatarDisplay()}
        </div>

        {error && (
          <div className="group-avatar-upload__error">
            <span className="group-avatar-upload__error-icon">⚠️</span>
            <span className="group-avatar-upload__error-message">{error}</span>
          </div>
        )}
      </div>

      <div className="group-avatar-upload__actions">
        <button
          type="button"
          className="group-avatar-upload__button group-avatar-upload__button--upload"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          title="Upload a group avatar"
        >
          <span className="group-avatar-upload__button-icon">📸</span>
          Upload Avatar
        </button>

        {previewAvatar && (
          <button
            type="button"
            className="group-avatar-upload__button group-avatar-upload__button--remove"
            onClick={handleRemoveAvatar}
            disabled={isLoading}
            title="Remove group avatar"
          >
            <span className="group-avatar-upload__button-icon">🗑️</span>
            Remove
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="group-avatar-upload__input"
        disabled={isLoading}
      />

      <p className="group-avatar-upload__hint">
        Supported formats: JPEG, PNG, GIF, WebP • Max size: 5MB
      </p>
    </div>
  );
};

export default GroupAvatarUpload;
