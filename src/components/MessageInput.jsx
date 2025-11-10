import React, { useState } from "react";
import "./styles.scss";

const MessageInput = ({ onSend }) => {
    const [text, setText] = useState("");

    const handleSend = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSend(text);
        setText("");
    };

    return (
        <div className="message-input">
            <form onSubmit={handleSend} className="message-input__form">
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
