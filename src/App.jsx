import "./App.css";
import { useState } from "react";
import ChatWindow from "./components/ChatWindow";
import Login from "./components/Login";
import ChatList from "./components/ChatList";

function App() {
  const [user, setUser] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);

  // if user not logged in → show login
  if (!user) {
    return <Login onLogin={(u) => setUser(u)} />;
  }

  // if a chat is selected → show chat window
  if (selectedChat) {
    return (
      <ChatWindow
        user={user}
        chatId={selectedChat._id}
        chatName={selectedChat.name || selectedChat.chatName}
        onBack={() => setSelectedChat(null)}
      />
    );
  }

  // otherwise → show chat list
  return <ChatList user={user} onSelectChat={(chat) => setSelectedChat(chat)} />;
}

export default App;
