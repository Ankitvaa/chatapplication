import React, { useState, useRef } from "react";
import "./styles.scss";

const MessageInput = ({ onSend, onSendMedia }) => {
    const [text, setText] = useState("");
    const fileInputRef = useRef(null);

    const handleSend = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSend(text);
        setText("");
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Optional: Basic client-side size validation (e.g., 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert("File is too large. Max limit is 5MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            // Send the file details and the binary buffer to the parent
            onSendMedia({
                fileName: file.name,
                fileType: file.type,
                fileBuffer: reader.result, // This is the ArrayBuffer
            });
        };
        reader.readAsArrayBuffer(file);
        
        // Reset input so the same file can be selected again if needed
        e.target.value = null;
    };

    return (
        <div className="message-input">
            <form onSubmit={handleSend} className="message-input__form">
                {/* 📎 Attachment Button */}
                <button 
                    type="button" 
                    className="message-input__attach-btn"
                    onClick={() => fileInputRef.current.click()}
                >
                    📎
                </button>

                {/* Hidden File Input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                    accept="image/*,video/*" // Restrict to images and videos
                />

                <input
                    type="text"
                    placeholder="Type a message..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="message-input__input"
                />
                <button type="submit" className="message-input__button">Send</button>
            </form>
        </div>
    );
};

export default MessageInput;