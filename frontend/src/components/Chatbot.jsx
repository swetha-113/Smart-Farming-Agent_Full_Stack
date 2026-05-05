/**
 * Farming Assistant Chatbot
 * Rule-based chatbot for quick farming queries
 */

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

// Simple rule-based responses
const getResponse = (input) => {
  const q = input.toLowerCase();

  if (q.includes('disease') || q.includes('leaf') || q.includes('spot')) {
    return '🍃 For leaf disease detection, go to the **Disease Detection** page and upload a clear photo of the affected leaf. Our AI will analyze it and provide treatment recommendations.';
  }
  if (q.includes('water') || q.includes('irrigat')) {
    return '💧 Check the **Irrigation** page! Enter your soil moisture, temperature, and humidity to get a personalized irrigation recommendation. Generally, irrigate when soil moisture drops below 40%.';
  }
  if (q.includes('weather') || q.includes('rain') || q.includes('temperature')) {
    return '🌤️ Visit the **Weather** page and enter your city name to get real-time weather data with farming-specific advice based on current conditions.';
  }
  if (q.includes('soil') || q.includes('ph') || q.includes('nitrogen') || q.includes('fertilizer')) {
    return '🌱 The **Soil Analysis** page lets you enter your soil values (pH, NPK, moisture) and get detailed fertilizer recommendations and soil health analysis.';
  }
  if (q.includes('crop') || q.includes('plant') || q.includes('grow')) {
    return '🌾 Use the **Crop Recommendation** page! Enter your soil pH, NPK values, temperature, and humidity to get a list of crops best suited for your conditions.';
  }
  if (q.includes('fungal') || q.includes('mildew') || q.includes('blight')) {
    return '⚠️ Fungal diseases thrive in high humidity (>80%). Apply copper-based fungicide preventively, improve air circulation, and avoid overhead irrigation. Check the Disease Detection page for specific treatment.';
  }
  if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
    return '👋 Hello, farmer! I\'m your Smart Farming Assistant. Ask me about diseases, irrigation, weather, soil, or crops — I\'m here to help!';
  }
  if (q.includes('help') || q.includes('what can you')) {
    return '🤖 I can help you with:\n• 🍃 Leaf disease identification\n• 💧 Irrigation advice\n• 🌤️ Weather-based farming tips\n• 🌱 Soil analysis & fertilizers\n• 🌾 Crop recommendations\n\nJust ask your question!';
  }
  if (q.includes('pest') || q.includes('insect') || q.includes('bug')) {
    return '🐛 For pest control: Use integrated pest management (IPM). Apply neem oil for organic control, or consult local agricultural extension for chemical options. Monitor crops regularly for early detection.';
  }
  if (q.includes('harvest') || q.includes('yield')) {
    return '🌾 For better yield: Ensure balanced NPK fertilization, proper irrigation, pest/disease management, and timely harvesting. Use the Soil and Crop pages for personalized recommendations.';
  }

  return '🤔 I\'m not sure about that specific question. Try asking about: diseases, irrigation, weather, soil analysis, or crop recommendations. Or visit the relevant page for detailed analysis!';
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      text: '🌿 Hi! I\'m your Smart Farming Assistant. Ask me anything about crops, diseases, irrigation, or soil!',
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), role: 'user', text: input, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate typing delay
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));

    const botResponse = getResponse(input);
    setMessages((prev) => [
      ...prev,
      { id: Date.now() + 1, role: 'bot', text: botResponse, time: new Date() },
    ]);
    setIsTyping(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full shadow-lg shadow-purple-500/40 flex items-center justify-center hover:scale-110 transition-transform"
        aria-label="Open farming assistant"
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-dark-900 animate-pulse" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 glass rounded-2xl shadow-2xl shadow-purple-500/20 border border-purple-500/20 flex flex-col overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600/30 to-blue-600/30 px-4 py-3 flex items-center gap-3 border-b border-white/10">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-green-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Farming Assistant</p>
              <p className="text-xs text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                Online
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-80">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs ${
                  msg.role === 'bot'
                    ? 'bg-gradient-to-br from-purple-500 to-blue-500'
                    : 'bg-gradient-to-br from-green-500 to-teal-500'
                }`}>
                  {msg.role === 'bot' ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
                </div>
                <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === 'bot'
                    ? 'bg-white/5 text-gray-200 rounded-tl-sm'
                    : 'bg-purple-600/30 text-white rounded-tr-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white/5 px-4 py-3 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                           style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/10 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about farming..."
              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl hover:opacity-90 disabled:opacity-40 transition-all"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
