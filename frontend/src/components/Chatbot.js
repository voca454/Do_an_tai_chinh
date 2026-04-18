// File: src/components/Chatbot.js
import React, { useState } from "react";
import { Sparkles, X, MessageCircle, Send } from "lucide-react";
import { chatAPI } from "../services/apiClient";
import "../assets/App.css";

function Chatbot() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "bot",
      text: "Chào bạn! Mình có thể giúp gì cho việc quản lý tài chính của bạn?",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMessages = [...chatMessages, { sender: "user", text: chatInput }];
    setChatMessages(newMessages);
    setChatInput("");
    setIsChatting(true);

    try {
      const response = await chatAPI.send(chatInput);
      if (response.data.reply) {
        setChatMessages([
          ...newMessages,
          { sender: "bot", text: response.data.reply },
        ]);
      } else if (response.data.error) {
        setChatMessages([
          ...newMessages,
          { sender: "bot", text: "LỖI BACKEND: " + response.data.error },
        ]);
      } else {
        setChatMessages([
          ...newMessages,
          {
            sender: "bot",
            text: "Xin lỗi, tôi đang gặp sự cố khi đọc dữ liệu.",
          },
        ]);
      }
    } catch (error) {
      console.error(">>> Lỗi gọi API Backend:", error);
      setChatMessages([
        ...newMessages,
        { sender: "bot", text: "Lỗi kết nối đến Server!" },
      ]);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="chatbot-wrapper">
      {isChatOpen && (
        <div className="chatbot-window">
          <div className="chat-header">
            <Sparkles size={20} /> AI Financial Advisor
            <button
              onClick={() => setIsChatOpen(false)}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                color: "white",
                cursor: "pointer",
              }}
            >
              <X size={20} />
            </button>
          </div>
          <div className="chat-body">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`chat-msg ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            {isChatting && (
              <div className="chat-msg bot">AI đang suy nghĩ... 🤔</div>
            )}
          </div>
          <form className="chat-footer" onSubmit={handleSendChat}>
            <input
              type="text"
              className="chat-input"
              placeholder="Ví dụ: Tính tổng tiền ăn uống..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={isChatting}
            />
            <button
              type="submit"
              className="chat-send-btn"
              disabled={isChatting}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
      {!isChatOpen && (
        <button
          className="chatbot-toggle-btn"
          onClick={() => setIsChatOpen(true)}
        >
          <MessageCircle size={28} />
        </button>
      )}
    </div>
  );
}

export default Chatbot;
