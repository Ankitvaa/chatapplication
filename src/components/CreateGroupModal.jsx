import React, { useState } from "react";
import API from "../api/api";
import "./removeUserModal.scss";

const CreateGroupModal = ({ user, onClose, onGroupCreated }) => {
    const [groupName, setGroupName] = useState("");
    const [memberEmails, setMemberEmails] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleCreateGroup = async () => {
        if (!groupName.trim()) {
            setError("Group name is required.");
            return;
        }

        // Parse emails from input (comma-separated)
        const emails = memberEmails
            .split(",")
            .map((email) => email.trim())
            .filter((email) => email.length > 0);

        setLoading(true);
        setError("");

        try {
            const payload = {
                chatName: groupName.trim(),
                memberEmails: emails,
                createdBy: user._id,
                creatorEmail: user.email,
            };

            console.log("📤 Sending payload:", payload);
            const { data } = await API.post("/chats", payload);

            console.log("✅ Group created:", data);
            onGroupCreated(data.chat);
            onClose();
        } catch (err) {
            console.error("❌ Failed to create group:", err);
            console.error("Response data:", err.response?.data);
            setError(
                err.response?.data?.error || "Failed to create group. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="remove-user-modal">
                <div className="modal-header">
                    <h2>Create New Group</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    <label className="input-label">Group Name</label>
                    <input
                        type="text"
                        placeholder="Enter group name"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        className="input-field"
                    />

                    <label className="input-label">Member Emails (comma-separated)</label>
                    <textarea
                        placeholder="email1@example.com, email2@example.com"
                        value={memberEmails}
                        onChange={(e) => setMemberEmails(e.target.value)}
                        className="input-field"
                        style={{ minHeight: "80px" }}
                    />

                    {error && <p className="error-message">{error}</p>}
                </div>

                <div className="modal-footer">
                    <button className="btn btn-cancel" onClick={onClose} disabled={loading}>
                        Cancel
                    </button>
                    <button
                        type="button"           // ← explicitly set type
                        className="btn btn-primary"
                        onClick={(e) => {
                            e.preventDefault();   // ← prevent default page refresh
                            handleCreateGroup();  // call your async function
                        }}
                        disabled={loading}
                    >
                        {loading ? "Creating..." : "Create Group"}
                    </button>

                </div>
            </div>
        </div>
    );
};

export default CreateGroupModal;
