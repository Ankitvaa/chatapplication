import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import API from "../api/api";
import AvatarUpload from "./AvatarUpload";
import GroupAvatarPicker from "./GroupAvatarPicker";
import { setActiveChat, setChats, selectChats } from "../store/chatSlice";
import "./removeUserModal.scss";

const CreateGroupModal = ({ user, onClose, onGroupCreated }) => {
    const dispatch = useDispatch();
    const chats = useSelector(selectChats);
    const [groupName, setGroupName] = useState("");
    const [memberEmails, setMemberEmails] = useState("");
    const [groupAvatarFile, setGroupAvatarFile] = useState(null);
    const [groupAvatarPreview, setGroupAvatarPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [groupDescription, setGroupDescription] = useState(""); // New state

    const handleAvatarSelect = (file, preview) => {
        setGroupAvatarFile(file);
        setGroupAvatarPreview(preview);
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim()) {
            setError("Group name is required.");
            return;
        }

        const emails = memberEmails
            .split(",")
            .map((email) => email.trim())
            .filter((email) => email.length > 0);

        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");
            console.log("🔑 Token exists:", token ? "✅ Yes" : "❌ No");
            if (!token) {
                setError("Session expired. Please log in again.");
                return;
            }

            const payload = {
                chatName: groupName.trim(),
                memberEmails: emails,
                description: groupDescription.trim(), // Add this line
                createdBy: user._id,
                creatorEmail: user.email,
            };

            console.log("📤 Step 1: Creating group...", payload);
            const { data } = await API.post("/chats", payload);
            console.log("✅ Group creation response:", data);
            const newChat = data.chat;

            console.log("✅ Group created:", newChat);

            if (groupAvatarFile && newChat._id) {
                console.log("📸 Step 2: Uploading avatar to chat:", newChat._id);

                const reader = new FileReader();

                reader.onload = async (e) => {
                    const base64Avatar = e.target.result;
                    console.log("📸 Avatar base64 length:", base64Avatar.length);

                    try {
                        const avatarResponse = await API.put(`/chats/${newChat._id}/avatar`, {
                            avatar: base64Avatar
                        });

                        console.log("✅ Avatar uploaded successfully");

                        let updatedChat = newChat;

                        if (avatarResponse.data?.chat) {
                            updatedChat = avatarResponse.data.chat;
                            console.log("📝 Chat from response:", updatedChat);
                        } else {
                            updatedChat = { ...newChat, avatar: base64Avatar };
                            console.log("📝 Using base64 as fallback");
                        }

                        console.log("🖼️ Chat avatar:", updatedChat.avatar);
                        dispatch(setActiveChat(updatedChat));

                        try {
                            const { data: allChats } = await API.get(`/chats/${user._id}`);
                            dispatch(setChats(allChats));
                            console.log("✅ Refreshed all chats");
                        } catch (refreshErr) {
                            console.warn("Could not refresh chats");
                        }

                        onGroupCreated(updatedChat);
                    } catch (avatarErr) {
                        console.error("⚠️ Avatar upload error:", avatarErr.response?.data);
                        console.log("Group created, proceeding without avatar");
                        onGroupCreated(newChat);
                    }
                };

                reader.onerror = () => {
                    console.error("⚠️ Error reading file");
                    onGroupCreated(newChat);
                };

                reader.readAsDataURL(groupAvatarFile);
            } else {
                onGroupCreated(newChat);
            }

            onClose();
        } catch (err) {
            console.error("❌ Failed to create group:", err);
            setError(err.response?.data?.error || "Failed to create group. Please try again.");
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
                    <GroupAvatarPicker
                        preview={groupAvatarPreview}
                        onSelect={handleAvatarSelect}
                    />

                    <label className="input-label">Group Name</label>
                    <input
                        type="text"
                        placeholder="Enter group name"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        className="input-field"
                    />

                    {/* --- NEW FIELD: Group Description --- */}
                    <label className="input-label">Group Description (Optional)</label>
                    <textarea
                        placeholder="What is this group about?"
                        value={groupDescription}
                        onChange={(e) => setGroupDescription(e.target.value)}
                        className="input-field"
                        style={{ minHeight: "60px", marginBottom: "15px" }}
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
                        type="button"
                        className="btn btn-primary"
                        onClick={(e) => {
                            e.preventDefault();
                            handleCreateGroup();
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
