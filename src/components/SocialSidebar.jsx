import React, { useState, useEffect } from "react";
import { ref, onValue, push, set } from "firebase/database";
import { db } from "../FirebaseConfig/firebaseConfig";
import "../styles/ChatBox/ChatBox.css";
import { toast } from "react-toastify";

const ChatWindow = ({ onClose }) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const sender = localStorage.getItem("accountName") || "Khách";

  useEffect(() => {
    const chatRef = ref(db, `chat/conversations/${sender}`);
    const unsubscribe = onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.values(data).sort(
          (a, b) => a.timestamp - b.timestamp
        );
        setMessages(list);
        scrollToBottom();
      } else setMessages([]);
    });
    return () => unsubscribe();
  }, [sender]);

  const scrollToBottom = () => {
    setTimeout(() => {
      const chatBody = document.querySelector(".chat-body");
      if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;
    }, 100);
  };

  const handleSend = async () => {
    if (!message.trim()) {
      toast.warning("Vui lòng nhập tin nhắn!");
      return;
    }
    setSending(true);
    try {
      const chatRef = ref(db, `chat/conversations/${sender}`);
      const newMsg = push(chatRef);
      await set(newMsg, {
        sender,
        content: message,
        timestamp: Date.now(),
      });
      setMessage("");
      scrollToBottom();
    } catch (err) {
      console.error("Lỗi gửi chat:", err);
      alert("⚠️ Không thể gửi tin nhắn");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3>Hỗ trợ trực tuyến</h3>
        <button onClick={onClose} className="chat-close-btn">
          &times;
        </button>
      </div>
      <div className="chat-body">
        {messages.length === 0 ? (
          <p className="text-muted">
            Hãy bắt đầu trò chuyện với nhân viên hỗ trợ...
          </p>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`chat-message ${m.sender === sender ? "me" : "admin"}`}
            >
              <strong>{m.sender}: </strong>
              <span>{m.content}</span>
            </div>
          ))
        )}
      </div>
      <div className="chat-footer">
        <input
          type="text"
          placeholder="Nhập tin nhắn..."
          className="form-control"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={sending}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend} disabled={sending}>
          {sending ? "Đang gửi..." : "GỬI"}
        </button>
      </div>
    </div>
  );
};

const SocialSidebar = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <div className="chat-bubble-container">
        <div className="chat-bubble-label">Nhắn tới nhân viên</div>
        <div className="chat-bubble" onClick={() => setIsChatOpen(!isChatOpen)}>
          <i className="fas fa-comments"></i>
        </div>
      </div>
      {isChatOpen && <ChatWindow onClose={() => setIsChatOpen(false)} />}
    </>
  );
};

export default SocialSidebar;
