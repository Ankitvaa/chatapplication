import React, { useState } from "react";

const MessageInput = ({ onSend }) => {
    const [text, setText] = useState("");

    const handleSend = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSend(text);
        setText("");
    };

    return (
        <form onSubmit={handleSend} style={{ marginTop: "1rem" }}>
            <input
                type="text"
                placeholder="Type a message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                style={{ width: "80%" }}
            />
            <button type="submit">Send</button>
        </form>
    );
};

export default MessageInput;
