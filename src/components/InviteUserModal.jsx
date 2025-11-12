import React, { useState } from "react";
import API from "../api/api";


const InviteUserModal = ({ chatId, onClose }) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const sendInvite = async () => {
    if (!email) return setStatus("Please enter an email address.");
    setLoading(true);
    setStatus("");
    try {
      const user = JSON.parse(localStorage.getItem("user")); // current logged user
      const { data } = await API.post(`/chats/${chatId}/invite`, {
        email,
        invitedBy: user?._id,
      });
      setStatus(data.message || "Invitation sent successfully!");
      setEmail("");
    } catch (error) {
      setStatus(error.response?.data?.error || "Failed to send invite.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#2f3136",
          padding: "2rem",
          borderRadius: "10px",
          width: "400px",
          color: "#fff",
        }}
      >
        <h2 style={{ marginBottom: "1rem", fontSize: "1.2rem" }}>Invite User</h2>
        <input
          type="email"
          placeholder="Enter user email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "0.6rem",
            borderRadius: "6px",
            border: "1px solid #40444b",
            background: "#202225",
            color: "#fff",
            marginBottom: "1rem",
          }}
        />
        <button
          onClick={sendInvite}
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.7rem",
            borderRadius: "6px",
            background: "#5865f2",
            color: "#fff",
            fontWeight: "bold",
            border: "none",
            cursor: "pointer",
          }}
        >
          {loading ? "Sending..." : "Send Invite"}
        </button>
        {status && (
          <p style={{ marginTop: "1rem", color: "#b9bbbe", fontSize: "0.9rem" }}>
            {status}
          </p>
        )}
        <button
          onClick={onClose}
          style={{
            marginTop: "1rem",
            width: "100%",
            background: "transparent",
            border: "1px solid #40444b",
            color: "#b9bbbe",
            borderRadius: "6px",
            padding: "0.6rem",
            cursor: "pointer",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default InviteUserModal;
