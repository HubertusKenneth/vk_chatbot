import { useState, useCallback, useEffect } from 'react';
import { Message, Conversation, ChatSettings } from '../types';
import { storage } from '../utils/storage';

export const useChat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [settings, setSettings] = useState<ChatSettings>(storage.getSettings());

  // Load conversations on mount
  useEffect(() => {
    const savedConversations = storage.getConversations();
    setConversations(savedConversations);
    
    const currentId = storage.getCurrentConversation();
    if (currentId) {
      const current = savedConversations.find(conv => conv.id === currentId);
      if (current) {
        setCurrentConversationId(currentId);
        setMessages(current.messages);
      }
    }
  }, []);

  // Save conversations when they change
  useEffect(() => {
    if (conversations.length > 0) {
      storage.saveConversations(conversations);
    }
  }, [conversations]);

  // Save settings when they change
  useEffect(() => {
    storage.saveSettings(settings);
  }, [settings]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const createNewConversation = useCallback((): string => {
    const newConv: Conversation = {
      id: generateId(),
      title: 'New Conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setConversations(prev => [newConv, ...prev]);
    setCurrentConversationId(newConv.id);
    setMessages([]);
    storage.setCurrentConversation(newConv.id);

    return newConv.id;
  }, []);

  const switchConversation = useCallback((conversationId: string) => {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      setCurrentConversationId(conversationId);
      setMessages(conversation.messages);
      storage.setCurrentConversation(conversationId);
    }
  }, [conversations]);

  const updateConversationTitle = useCallback((conversationId: string, title: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, title, updatedAt: new Date() }
        : conv
    ));
  }, []);

  const deleteConversation = useCallback((conversationId: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    
    if (currentConversationId === conversationId) {
      const remaining = conversations.filter(conv => conv.id !== conversationId);
      if (remaining.length > 0) {
        switchConversation(remaining[0].id);
      } else {
        createNewConversation();
      }
    }
  }, [currentConversationId, conversations, switchConversation, createNewConversation]);

  const addMessage = useCallback((content: string, isUser: boolean, isTyping: boolean = false) => {
    const newMessage: Message = {
      id: generateId(),
      content,
      isUser,
      timestamp: new Date(),
      isTyping
    };

    setMessages(prev => [...prev, newMessage]);

    // Update conversation
    if (currentConversationId && !isTyping) {
      setConversations(prev => prev.map(conv => {
        if (conv.id === currentConversationId) {
          const updatedMessages = [...conv.messages, newMessage];
          
          // Auto-generate title from first user message
          let title = conv.title;
          if (title === 'New Conversation' && isUser) {
            title = content.substring(0, 30) + (content.length > 30 ? '...' : '');
          }

          return {
            ...conv,
            messages: updatedMessages,
            title,
            updatedAt: new Date()
          };
        }
        return conv;
      }));
    }

    return newMessage.id;
  }, [currentConversationId]);

  const removeMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    
    if (currentConversationId) {
      setConversations(prev => prev.map(conv => 
        conv.id === currentConversationId
          ? { ...conv, messages: conv.messages.filter(msg => msg.id !== messageId) }
          : conv
      ));
    }
  }, [currentConversationId]);

  const simulateTyping = useCallback(async (response: string) => {
    const typingMessageId = addMessage('', false, true);
    setIsTyping(true);

    // Simulate typing delay based on settings
    const delays = { slow: 3000, normal: 1500, fast: 800 };
    const delay = delays[settings.typingSpeed];
    
    await new Promise(resolve => setTimeout(resolve, delay + Math.random() * 1000));

    // Remove typing indicator
    removeMessage(typingMessageId);
    setIsTyping(false);

    // Add actual response
    addMessage(response, false);
  }, [addMessage, removeMessage, settings]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Ensure we have a conversation
    let convId = currentConversationId;
    if (!convId) {
      convId = createNewConversation();
    }

    // Add user message
    addMessage(content, true);

    try {
      // Get response based on message content
      const response = await getSmartResponse(content);
      await simulateTyping(response);
    } catch (error) {
      console.error('Failed to get response:', error);
      await simulateTyping('Sorry, I encountered an error while processing your question. Please try again.');
    }
  }, [currentConversationId, createNewConversation, addMessage, simulateTyping]);

  // Smart response system that handles both general and specific questions
  const getSmartResponse = async (message: string): Promise<string> => {
    const lowerMessage = message.toLowerCase();
    
    // General greetings and common questions
    if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hai') || lowerMessage.includes('halo')) {
      return 'Hi! I am a virtual assistant ready to help you with various questions about relationships and storytelling about V and K\'s relationship. What would you like to know about them? 😊';
    }
    
    if (lowerMessage.includes('how are you') || lowerMessage.includes('apa kabar') || lowerMessage.includes('bagaimana kabar')) {
      return 'I\'m doing great, thank you! I\'m always ready to help you learn more about the beautiful love story between Vyone and Hubertus. Is there anything you\'d like to ask about them?';
    }
    
    if (lowerMessage.includes('what can you do') || lowerMessage.includes('apa yang bisa') || lowerMessage.includes('kemampuan')) {
      return 'I can help you with various information about Vyone and Hubertus\'s relationship! I can tell you about:\n\n• How they met\n• Their first date\n• Special moments\n• Their personalities\n• Future plans\n• And much more!\n\nFeel free to ask anything you want to know about their love story! 💕';
    }
    
    if (lowerMessage.includes('thank') || lowerMessage.includes('terima kasih') || lowerMessage.includes('thanks')) {
      return 'You\'re welcome! I\'m happy to help you learn more about Vyone and Hubertus\'s love story. Don\'t hesitate to ask again anytime! 😊';
    }

    // Specific relationship questions
    if (lowerMessage.includes('bertemu') || lowerMessage.includes('meet') || lowerMessage.includes('kenal')) {
      return 'Vyone dan Hubertus bertemu di Universitas Bina Nusantara saat semester 2. Pada saat kelas mata kuliah Calculus, Hubertus mengajak kenalan Vyone karena Vyone merupakan teman dari temannya Hubertus, yaitu Jeisen. Saat semester 2, mereka memang tidak banyak ngobrol. Dan ketika semester 3, mereka berada di 1 kelas yang sama lagi dan mulai dari tanggal 3 Oktober 2024 mereka chatting setiap hari sampai sekarang! 💕';
    }
    
    if (lowerMessage.includes('first date') || lowerMessage.includes('kencan pertama') || lowerMessage.includes('date pertama')) {
      return 'Ketika mereka sudah jadian pada tanggal 15 Mei 2025, mereka Date di Mall of Alam Sutera (walaupun hampir setiap hari mereka dating dan main di sana). Tempat yang sangat spesial bagi mereka berdua! 🌹';
    }
    
    if (lowerMessage.includes('started dating') || lowerMessage.includes('mulai jalan') || lowerMessage.includes('jalan berdua')) {
      return 'Pertama kali mereka pergi jalan berdua adalah pada tanggal 7 Februari 2025, dimana mereka pergi ke Jakarta untuk makan bareng di restoran bernama Nagabi di Citra 8, Jakarta Barat. Momen yang sangat berkesan untuk mereka berdua! 📅';
    }
    
    if (lowerMessage.includes('special moment') || lowerMessage.includes('momen spesial') || lowerMessage.includes('kenangan')) {
      return 'Mereka memiliki banyak momen spesial! Salah satunya adalah pada tanggal 24 Maret 2025, mereka pergi ke Lippo Mall Puri berdua untuk bermain bareng. Dan ada juga pada tanggal 25 April 2025, mereka pergi bareng ke PIK (Pantai Indah Kapuk) untuk bermain bersama hingga malam hari. Setiap momen bersama adalah spesial bagi mereka! ✨';
    }
    
    if (lowerMessage.includes('personalit') || lowerMessage.includes('kepribadian') || lowerMessage.includes('sifat')) {
      return 'Hubertus adalah orang yang sangat penyabar, penyayang, dan pengertian terhadap pasangannya (Vyone). Vyone juga merupakan orang yang sangat baik hati dan juga penyayang terhadap pasangannya walaupun sedikit gampang cemburu dan tidak peka. Mereka saling melengkapi dengan sempurna! 🎭';
    }
    
    if (lowerMessage.includes('future') || lowerMessage.includes('masa depan') || lowerMessage.includes('rencana')) {
      return 'Mereka ingin hubungan mereka berjalan dengan baik dan lancar sampai maut memisahkan. Mereka ingin selalu ada untuk satu sama lain dalam suka maupun duka, agar mereka bisa menjadi pasangan yang saling melengkapi. Mereka juga punya impian untuk menikah di Florida! 🔮💍';
    }
    
    if (lowerMessage.includes('jadian') || lowerMessage.includes('official') || lowerMessage.includes('resmi')) {
      return 'Mereka resmi menjadi pasangan pada tanggal 15 Mei 2025! Hari yang sangat berkesan dan menjadi awal dari perjalanan cinta mereka yang indah. 💕';
    }

    // Default response for relationship-related questions
    if (lowerMessage.includes('vyone') || lowerMessage.includes('hubertus') || lowerMessage.includes('mereka') || lowerMessage.includes('relationship') || lowerMessage.includes('hubungan')) {
      const responses = [
        'Vyone and Hubertus have such a beautiful love story! They met at university and are now in a loving relationship. Is there a specific aspect of their relationship you\'d like to know more about?',
        'Vyone and Hubertus\'s relationship is built on mutual understanding and love. They always support each other in every step. What would you like to know about them?',
        'The love story of Vyone and Hubertus started from a simple meeting at university and developed into a beautiful relationship. They are an example of a couple who complement each other. Is there something specific you\'d like to ask?'
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // If the question doesn't match any pattern, provide a helpful response
    return 'I specialize in helping answer questions about Vyone and Hubertus\'s love story. You can ask about how they met, their first date, special moments, their personalities, or their future plans. What would you like to know about their love story? 💕';
  };

  return {
    conversations,
    currentConversationId,
    messages,
    isTyping,
    settings,
    setSettings,
    createNewConversation,
    switchConversation,
    updateConversationTitle,
    deleteConversation,
    sendMessage,
    addMessage
  };
};