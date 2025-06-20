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
      // Simulate API call to get response about Vyone & Hubertus
      const response = await simulateAPICall(content);
      await simulateTyping(response);
    } catch (error) {
      console.error('Failed to get response:', error);
      await simulateTyping('Sorry, I encountered an error while processing your question. Please try again.');
    }
  }, [currentConversationId, createNewConversation, addMessage, simulateTyping]);

  // Simulate API call with responses about Vyone & Hubertus relationship
  const simulateAPICall = async (message: string): Promise<string> => {
    // This would normally call your PHP backend with Gemini API
    // For demo purposes, we'll simulate responses about their relationship
    const responses = [
      "Vyone and Hubertus have such a beautiful love story! They first met through mutual friends at a coffee shop in downtown. It was love at first sight - Hubertus was immediately drawn to Vyone's warm smile and infectious laughter, while Vyone was captivated by Hubertus's genuine kindness and thoughtful nature. Would you like to know more about their first conversation?",
      
      "Their relationship officially began on May 15th, 2025. After weeks of getting to know each other through long conversations and shared interests, Hubertus finally asked Vyone to be his girlfriend during a romantic sunset walk by the lake. Vyone said yes without hesitation! They both knew they had found something special in each other.",
      
      "What makes their relationship so special is how they complement each other perfectly. Vyone brings out Hubertus's adventurous side, encouraging him to try new things and step out of his comfort zone. Meanwhile, Hubertus provides the stability and emotional support that Vyone cherishes. They share a love for traveling, cooking together, and deep meaningful conversations that can last for hours.",
      
      "One of their most memorable moments was their first trip together to Bali last summer. They spent a week exploring the beautiful beaches, trying local cuisine, and creating memories that would last a lifetime. It was during this trip that they both realized how deeply they had fallen for each other. Hubertus even surprised Vyone with a handwritten letter expressing his feelings, which she still keeps as a treasured keepsake.",
      
      "Looking towards the future, Vyone and Hubertus have many exciting plans together. They're currently saving up for their dream home and talking about adopting a rescue dog. They both share the same values about family, career goals, and making a positive impact in their community. Their love continues to grow stronger each day, built on a foundation of trust, respect, and genuine friendship."
    ];
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return responses[Math.floor(Math.random() * responses.length)];
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