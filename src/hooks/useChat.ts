import { useState, useCallback, useEffect } from 'react';
import { Message, Conversation, ChatSettings } from '../types';
import { storage } from '../utils/storage';

export const useChat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [settings, setSettings] = useState<ChatSettings>(storage.getSettings());

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

  useEffect(() => {
    if (conversations.length > 0) {
      storage.saveConversations(conversations);
    }
  }, [conversations]);

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

    if (currentConversationId && !isTyping) {
      setConversations(prev => prev.map(conv => {
        if (conv.id === currentConversationId) {
          const updatedMessages = [...conv.messages, newMessage];
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

    const delays = { slow: 3000, normal: 1500, fast: 800 };
    const delay = delays[settings.typingSpeed];

    await new Promise(resolve => setTimeout(resolve, delay + Math.random() * 1000));

    removeMessage(typingMessageId);
    setIsTyping(false);
    addMessage(response, false);
  }, [addMessage, removeMessage, settings]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    let convId = currentConversationId;
    if (!convId) {
      convId = createNewConversation();
    }

    addMessage(content, true);

    try {
      const response = await getSmartResponse(content);
      await simulateTyping(response);
    } catch (error) {
      console.error('Failed to get response:', error);
      await simulateTyping('Sorry, I encountered an error processing your question. Please try again.');
    }
  }, [currentConversationId, createNewConversation, addMessage, simulateTyping]);

  const getSmartResponse = async (message: string): Promise<string> => {
    const lowerMessage = message.toLowerCase();
    const isIndonesian = /apa|bagaimana|kamu|bertemu|kencan|jadian|hubungan|vyone|hubertus|mereka|terima kasih|kenalan/.test(lowerMessage);

    if (/(hi|hello|hai|halo)/.test(lowerMessage)) {
      return isIndonesian
        ? 'Hai! Saya adalah asisten virtual yang siap membantu Anda dengan berbagai pertanyaan tentang kisah cinta Vyone dan Hubertus. Ada yang ingin Anda ketahui tentang mereka? 😊'
        : 'Hi! I’m a virtual assistant ready to help you with any questions about the love story of Vyone and Hubertus. What would you like to know about them? 😊';
    }

    if (/(how are you|apa kabar|bagaimana kabar)/.test(lowerMessage)) {
      return isIndonesian
        ? 'Saya baik-baik saja, terima kasih! Saya selalu siap membantu Anda mengetahui lebih banyak tentang kisah cinta Vyone dan Hubertus.'
        : "I'm doing great, thank you! I'm always here to help you learn more about Vyone and Hubertus' beautiful love story.";
    }

    if (/(what can you do|apa yang bisa|kemampuan)/.test(lowerMessage)) {
      return isIndonesian
        ? 'Saya bisa membantu Anda dengan berbagai informasi tentang hubungan Vyone dan Hubertus...'
        : "I can help you explore all about Vyone and Hubertus' relationship! You can ask me about:\n\n• How they met\n• Their first date\n• Special moments\n• Their personalities\n• Future plans\n• And more!";
    }

    if (/(thank|terima kasih|thanks)/.test(lowerMessage)) {
      return isIndonesian
        ? 'Sama-sama! Senang bisa membantu Anda mengetahui lebih banyak tentang kisah cinta Vyone dan Hubertus. 😊'
        : "You're welcome! I'm glad I could help you learn more about Vyone and Hubertus' relationship. 😊";
    }

    if (/bertemu|meet|kenal/.test(lowerMessage)) {
      return isIndonesian
        ? 'Vyone dan Hubertus bertemu di Universitas Bina Nusantara saat semester 2... 💕'
        : 'Vyone and Hubertus met at Bina Nusantara University during their second semester... 💕';
    }

    if (/first date|kencan pertama|date pertama/.test(lowerMessage)) {
      return isIndonesian
        ? 'Kencan pertama mereka adalah di Mall of Alam Sutera setelah jadian pada 15 Mei 2025. 🌹'
        : 'Their first date was at Mall of Alam Sutera after they officially became a couple on May 15, 2025. 🌹';
    }

    if (/jadian|official|resmi/.test(lowerMessage)) {
      return isIndonesian
        ? 'Mereka resmi jadian pada tanggal 15 Mei 2025! 💕'
        : 'They officially became a couple on May 15, 2025! 💕';
    }

    if (/kepribadian|personalit|sifat/.test(lowerMessage)) {
      return isIndonesian
        ? 'Hubertus penyayang dan sabar, Vyone penyayang dan perhatian walaupun sedikit cemburuan. 🎭'
        : 'Hubertus is caring and patient, and Vyone is also loving and sweet—though a bit jealous at times. 🎭';
    }

    if (/future|masa depan|rencana/.test(lowerMessage)) {
      return isIndonesian
        ? 'Mereka ingin menikah dan hidup bahagia bersama, bahkan punya impian menikah di Florida! 🔮💍'
        : 'They dream of a happy life together and even plan to get married in Florida one day! 🔮💍';
    }

    if (/vyone|hubertus|mereka|relationship|hubungan/.test(lowerMessage)) {
      const responsesID = [
        'Vyone dan Hubertus memiliki kisah cinta yang sangat indah...'
      ];
      const responsesEN = [
        'Vyone and Hubertus have a beautiful love story...'
      ];
      return isIndonesian
        ? responsesID[Math.floor(Math.random() * responsesID.length)]
        : responsesEN[Math.floor(Math.random() * responsesEN.length)];
    }

    return isIndonesian
      ? 'Saya khusus menjawab pertanyaan tentang kisah cinta Vyone dan Hubertus. Coba tanya tentang bagaimana mereka bertemu, kencan pertama, atau momen spesial lainnya! 💕'
      : "I'm here to answer questions about the love story of Vyone and Hubertus. You can ask how they met, their first date, or other special moments! 💕";
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