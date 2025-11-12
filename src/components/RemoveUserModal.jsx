import React, { useState } from "react";
import API from "../api/api";
import "./removeUserModal.scss";

const RemoveUserModal = ({ user, chatId, onClose, onUserRemoved }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRemove = async () => {
    setLoading(true);
    setError("");

    try {
      console.log("Removing user with ID:", user._id);
      console.log("From chat ID:", chatId);
      console.log("Payload:", { userId: user._id });

      await API.post(`/chats/${chatId}/remove`, {
        userId: user._id,
      });
      onUserRemoved(user._id);
      onClose();
    } catch (err) {
      console.error("Error response:", err.response?.data);
      setError(err.response?.data?.error || "Failed to remove user. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="remove-user-modal">
        <div className="modal-header">
          <h2>Remove User</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <p className="warning-message">
            Are you sure you want to remove <strong>{user.name || user.email}</strong> from this group?
          </p>
          {error && <p className="error-message">{error}</p>}
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-cancel"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="btn btn-danger"
            onClick={handleRemove}
            disabled={loading}
          >
            {loading ? "Removing..." : "Remove User"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoveUserModal;
