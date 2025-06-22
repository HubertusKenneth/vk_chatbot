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
      await simulateTyping('Maaf, saya mengalami kesalahan saat memproses pertanyaan Anda. Silakan coba lagi.');
    }
  }, [currentConversationId, createNewConversation, addMessage, simulateTyping]);

  // Smart response system that handles both general and specific questions
  const getSmartResponse = async (message: string): Promise<string> => {
    const lowerMessage = message.toLowerCase();
    
    // General greetings and common questions
    if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hai') || lowerMessage.includes('halo')) {
      return 'Hai! Saya adalah asisten virtual yang siap membantu Anda dengan berbagai pertanyaan tentang kisah cinta Vyone dan Hubertus. Ada yang ingin Anda ketahui tentang mereka? 😊';
    }
    
    if (lowerMessage.includes('how are you') || lowerMessage.includes('apa kabar') || lowerMessage.includes('bagaimana kabar')) {
      return 'Saya baik-baik saja, terima kasih! Saya selalu siap membantu Anda mengetahui lebih banyak tentang kisah cinta yang indah antara Vyone dan Hubertus. Ada yang ingin Anda tanyakan tentang mereka?';
    }
    
    if (lowerMessage.includes('what can you do') || lowerMessage.includes('apa yang bisa') || lowerMessage.includes('kemampuan')) {
      return 'Saya bisa membantu Anda dengan berbagai informasi tentang hubungan Vyone dan Hubertus! Saya bisa menceritakan tentang:\n\n• Bagaimana mereka bertemu\n• Kencan pertama mereka\n• Momen-momen spesial\n• Kepribadian mereka\n• Rencana masa depan\n• Dan masih banyak lagi!\n\nSilakan tanyakan apa saja yang ingin Anda ketahui tentang kisah cinta mereka! 💕';
    }
    
    if (lowerMessage.includes('thank') || lowerMessage.includes('terima kasih') || lowerMessage.includes('thanks')) {
      return 'Sama-sama! Senang bisa membantu Anda mengetahui lebih banyak tentang kisah cinta Vyone dan Hubertus. Jangan ragu untuk bertanya lagi kapan saja! 😊';
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
        'Vyone dan Hubertus memiliki kisah cinta yang sangat indah! Mereka bertemu di kampus dan sekarang menjalani hubungan yang penuh kasih sayang. Ada aspek khusus dari hubungan mereka yang ingin Anda ketahui lebih lanjut?',
        'Hubungan Vyone dan Hubertus dibangun atas dasar saling pengertian dan kasih sayang. Mereka selalu mendukung satu sama lain dalam setiap langkah. Apa yang ingin Anda ketahui tentang mereka?',
        'Kisah cinta Vyone dan Hubertus dimulai dari pertemuan sederhana di kampus dan berkembang menjadi hubungan yang sangat indah. Mereka adalah contoh pasangan yang saling melengkapi. Ada yang spesifik yang ingin Anda tanyakan?'
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // If the question doesn't match any pattern, provide a helpful response
    return 'Saya khusus membantu menjawab pertanyaan tentang kisah cinta Vyone dan Hubertus. Anda bisa bertanya tentang bagaimana mereka bertemu, kencan pertama, momen spesial, kepribadian mereka, atau rencana masa depan mereka. Ada yang ingin Anda ketahui tentang kisah cinta mereka? 💕';
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