import React, { useState, useEffect, useRef } from 'react';
import { FiMessageSquare, FiX, FiSend, FiUser } from 'react-icons/fi';
import './ChatBot.css';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! Welcome to Samarasinghe Motors !", sender: 'bot', time: new Date() },
    { id: 2, text: "How can I help you today? (Buy / Rent / Support)", sender: 'bot', time: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const quickActions = [
    { label: "Buy a Car", value: "buy" },
    { label: "Rent a Car", value: "rent" },
    { label: "Location", value: "location" },
    { label: "FAQs", value: "faq" }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e, customValue = null) => {
    if (e) e.preventDefault();
    const text = customValue || input;
    if (!text.trim()) return;

    const userMessage = { id: Date.now(), text: text, sender: 'user', time: new Date() };
    setMessages(prev => [...prev, userMessage]);
    if (!customValue) setInput('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      let botResponse = "";
      const lowerInput = text.toLowerCase();

      // 1. Basic Greeting
      if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
        botResponse = "Hello! Welcome to Samarasinghe Motors ! How can I help you today? (Buy / Rent / Support)";
      }
      // 2. Car Sales
      else if (lowerInput.includes('buy') || lowerInput.includes('sale') || lowerInput.includes('brand')) {
        botResponse = "We have Toyota, BMW, Audi and more. What brand are you looking for? Prices start from LKR 3 million. You can view full details in our 'Vehicle Sales' portal!";
      }
      else if (lowerInput.includes('price')) {
        botResponse = "Our vehicle prices range from LKR 3 million to over 50 million for premium luxury models. Do you have a specific budget in mind?";
      }
      // 3. Rental Info
      else if (lowerInput.includes('rent')) {
        botResponse = "Rental starts from LKR 8,000 per day. We have a wide range of cars, SUVs, and vans available for any duration.";
      }
      // 4. Booking Help
      else if (lowerInput.includes('book') || lowerInput.includes('reserve') || lowerInput.includes('availability')) {
        botResponse = "To check availability and book a car, please select your pickup date and return date in the rental details page of your chosen vehicle.";
      }
      // 5. Payment Info
      else if (lowerInput.includes('payment') || lowerInput.includes('pay') || lowerInput.includes('card')) {
        botResponse = "We accept bank transfers, credit/debit cards, and cash. For online bookings, we currently process payments via bank transfer verification.";
      }
      else if (lowerInput.includes('refund')) {
        botResponse = "Our refund policy allows for full refunds if cancelled 48 hours before the booking time. Please contact support for specific cases.";
      }
      // 6. Location & Contact
      else if (lowerInput.includes('location') || lowerInput.includes('address') || lowerInput.includes('where')) {
        botResponse = "Our showroom is located at No 45, Kandy Road, Colombo 03. We are open from 8:00 AM to 6:00 PM daily!";
      }
      else if (lowerInput.includes('contact') || lowerInput.includes('phone') || lowerInput.includes('number')) {
        botResponse = "You can reach us at +94 77 123 4567 during working hours.";
      }
      // 8. FAQ Section
      else if (lowerInput.includes('test drive')) {
        botResponse = "Yes! You can certainly test drive any vehicle before buying. Please visit our showroom to arrange a session.";
      }
      else if (lowerInput.includes('document')) {
        botResponse = "To rent a car, you'll need a valid driving license, National ID (NIC) or Passport, and a utility bill for address verification.";
      }
      else if (lowerInput.includes('faq') || lowerInput.includes('help')) {
        botResponse = "Common questions: 'How to rent a car?', 'Can I test drive?', 'What documents are needed?'. Ask me anything!";
      }
      // 9. Smart Features (Recommendations)
      else if (lowerInput.includes('recommend') || lowerInput.includes('suggest')) {
        botResponse = "If you're looking for luxury, I recommend our latest BMW series. For family trips, our SUVs are perfect. What is your budget?";
      }
      else {
        botResponse = "I'm here to help! You can ask about our cars, rental prices, location, or how to book a test drive.";
      }

      const botMsg = { id: Date.now() + 1, text: botResponse, sender: 'bot', time: new Date() };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className={`chatbot-wrapper ${isOpen ? 'active' : ''}`}>
      {/* Floating Toggle Button */}
      <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FiX size={24} /> : <FiMessageSquare size={24} />}
        {!isOpen && <span className="notification-dot"></span>}
      </button>

      {/* Chat Window */}
      <div className="chatbot-window">
        <div className="chatbot-header">
          <div className="bot-info">
            <div className="bot-avatar">
              <img src="/logo.png" alt="Bot Logo" />
            </div>
            <div className="bot-name">
              <h3>Samarasinghe Bot</h3>
              <span>Online</span>
            </div>
          </div>
          <button className="close-btn" onClick={() => setIsOpen(false)}><FiX /></button>
        </div>

        <div className="chatbot-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.sender}`}>
              <div className="message-bubble">
                {msg.text}
                <span className="message-time">
                  {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="message bot typing">
              <div className="message-bubble">
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          {quickActions.map(action => (
            <button
              key={action.value}
              onClick={() => handleSend(null, action.label)}
              className="action-chip"
            >
              {action.label}
            </button>
          ))}
        </div>

        <form className="chatbot-input" onSubmit={handleSend}>
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" disabled={!input.trim()}>
            <FiSend />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBot;
