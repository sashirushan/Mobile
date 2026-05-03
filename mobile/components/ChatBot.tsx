import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Modal, KeyboardAvoidingView, Platform, Animated, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ChatBot({ visible, onClose }) {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! Welcome to Samarasinghe Motors!", sender: 'bot', time: new Date() },
    { id: 2, text: "How can I help you today? (Buy / Rent / Support)", sender: 'bot', time: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef(null);
  
  // Animation for typing dots
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isTyping) {
      const animateDot = (dot, delay) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(dot, { toValue: -5, duration: 300, useNativeDriver: true }),
            Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true })
          ])
        ).start();
      };
      setTimeout(() => animateDot(dot1), 0);
      setTimeout(() => animateDot(dot2), 200);
      setTimeout(() => animateDot(dot3), 400);
    } else {
      dot1.setValue(0);
      dot2.setValue(0);
      dot3.setValue(0);
    }
  }, [isTyping]);

  const quickActions = [
    { label: "Buy a Car", value: "buy" },
    { label: "Rent a Car", value: "rent" },
    { label: "Location", value: "location" },
    { label: "FAQs", value: "faq" }
  ];

  const handleSend = (customValue = null) => {
    const text = customValue || input;
    if (!text.trim()) return;

    const userMessage = { id: Date.now(), text: text.trim(), sender: 'user', time: new Date() };
    setMessages(prev => [...prev, userMessage]);
    if (!customValue) setInput('');
    setIsTyping(true);

    // Scroll to bottom immediately
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    // Simulate bot response
    setTimeout(() => {
      let botResponse = "";
      const lowerInput = text.toLowerCase();

      // 1. Basic Greeting
      if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
        botResponse = "Hello! Welcome to Samarasinghe Motors! How can I help you today? (Buy / Rent / Support)";
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
      
      // Scroll to bottom after response
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }, 1200);
  };

  const formatTime = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return hours + ':' + minutes + ' ' + ampm;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.modalContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.chatWindow}>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.botInfo}>
              <View style={styles.botAvatar}>
                <Image source={require('../assets/images/logo.png')} style={{width: 30, height: 30}} resizeMode="contain" />
              </View>
              <View>
                <Text style={styles.botName}>Samarasinghe Bot</Text>
                <Text style={styles.botStatus}>Online</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <ScrollView 
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((msg) => (
              <View key={msg.id} style={[styles.messageWrapper, msg.sender === 'user' ? styles.messageWrapperUser : styles.messageWrapperBot]}>
                <View style={[styles.messageBubble, msg.sender === 'user' ? styles.messageBubbleUser : styles.messageBubbleBot]}>
                  <Text style={[styles.messageText, msg.sender === 'user' ? styles.messageTextUser : styles.messageTextBot]}>
                    {msg.text}
                  </Text>
                  <Text style={[styles.messageTime, msg.sender === 'user' ? styles.messageTimeUser : styles.messageTimeBot]}>
                    {formatTime(msg.time)}
                  </Text>
                </View>
              </View>
            ))}
            
            {isTyping && (
              <View style={[styles.messageWrapper, styles.messageWrapperBot]}>
                <View style={[styles.messageBubble, styles.messageBubbleBot, styles.typingBubble]}>
                  <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot1 }] }]} />
                  <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot2 }] }]} />
                  <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot3 }] }]} />
                </View>
              </View>
            )}
          </ScrollView>

          {/* Quick Actions */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.quickActionsContainer}
            contentContainerStyle={styles.quickActionsContent}
          >
            {quickActions.map(action => (
              <TouchableOpacity 
                key={action.value} 
                style={styles.actionChip}
                onPress={() => handleSend(action.label)}
              >
                <Text style={styles.actionChipText}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Input Area */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type your message..."
              placeholderTextColor="#888"
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => handleSend()}
            />
            <TouchableOpacity 
              style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
              onPress={() => handleSend()}
              disabled={!input.trim()}
            >
              <Ionicons name="send" size={20} color={input.trim() ? "#fff" : "#666"} />
            </TouchableOpacity>
          </View>
          
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  chatWindow: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: '#222',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  botInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  botAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  botName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  botStatus: {
    color: '#34d399',
    fontSize: 12,
  },
  closeButton: {
    padding: 5,
  },
  messagesContainer: {
    flex: 1,
    padding: 15,
  },
  messagesContent: {
    paddingBottom: 10,
  },
  messageWrapper: {
    marginBottom: 15,
    flexDirection: 'row',
  },
  messageWrapperUser: {
    justifyContent: 'flex-end',
  },
  messageWrapperBot: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 15,
  },
  messageBubbleUser: {
    backgroundColor: '#d32f2f',
    borderBottomRightRadius: 5,
  },
  messageBubbleBot: {
    backgroundColor: '#333',
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTextUser: {
    color: '#fff',
  },
  messageTextBot: {
    color: '#eee',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  messageTimeUser: {
    color: 'rgba(255,255,255,0.7)',
  },
  messageTimeBot: {
    color: '#888',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    gap: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#888',
  },
  quickActionsContainer: {
    maxHeight: 50,
    minHeight: 50,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  quickActionsContent: {
    paddingHorizontal: 15,
    alignItems: 'center',
    gap: 10,
  },
  actionChip: {
    backgroundColor: 'rgba(211, 47, 47, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d32f2f',
  },
  actionChipText: {
    color: '#d32f2f',
    fontSize: 13,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#222',
    borderTopWidth: 1,
    borderTopColor: '#333',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#111',
    color: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#333',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#d32f2f',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: '#333',
  }
});
