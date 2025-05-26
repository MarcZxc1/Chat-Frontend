import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import "./Chat.css";

const socket = io("http://localhost:3001");

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Fetch previous messages
    fetch("http://localhost:3001/messages")
      .then((response) => response.json())
      .then((data) => setMessages(data))
      .catch((error) => console.error("Error fetching messages:", error));

    // Listen for new messages
    socket.on("message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("message");
    };
  }, []);

  useEffect(() => {
    // Auto-scroll to the latest message
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (input.trim()) {
      socket.emit("message", { content: input });
      setInput("");
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <span className="timestamp">
              {new Date(msg.created_at).toLocaleTimeString()}
            </span>
            <span className="content">{msg.content}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Chat;
