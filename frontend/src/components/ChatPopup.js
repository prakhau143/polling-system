import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import socketService from '../services/socket';
import './ChatPopup.css';

const ChatPopup = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const { userType, studentName, students } = useSelector((state) => state.poll);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Listen for new messages
    const handleNewMessage = (data) => {
      setMessages(prev => [...prev, data]);
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
    };

    if (socketService.socket) {
      socketService.socket.on('new-message', handleNewMessage);
    }

    return () => {
      if (socketService.socket) {
        socketService.socket.off('new-message', handleNewMessage);
      }
    };
  }, [isOpen]);

  const handleSend = () => {
    if (input.trim()) {
      socketService.sendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`chat-popup ${isOpen ? 'open' : ''}`}>
      <button className="toggle-button" onClick={handleToggle}>
        💬 Chat
        {unreadCount > 0 && (
          <span className="unread-badge">{unreadCount}</span>
        )}
      </button>
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h4>Group Chat</h4>
            <button className="close-button" onClick={() => setIsOpen(false)}>
              ×
            </button>
          </div>
          
          <div className="messages">
            {messages.length === 0 ? (
              <div className="empty-chat">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className={`message-item ${msg.senderType}`}>
                  <div className="message-header">
                    <span className="sender-name">
                      {msg.senderName}
                      {msg.senderType === 'teacher' && <span className="teacher-badge">👨‍🏫</span>}
                    </span>
                    <span className="message-time">{formatTime(msg.timestamp)}</span>
                  </div>
                  <div className="message-content">{msg.message}</div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="chat-input-container">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message as ${userType === 'teacher' ? 'Teacher' : studentName}`}
              maxLength={500}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim()}
              className="send-button"
            >
              Send
            </button>
          </div>
          
          <div className="chat-info">
            <small>
              {userType === 'teacher' ? 
                `${students.length} student${students.length !== 1 ? 's' : ''} online` :
                'Connected to group chat'
              }
            </small>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPopup;

