import { Conversation, ChatSettings } from '../types';

const STORAGE_KEYS = {
  CONVERSATIONS: 'vh_conversations',
  CURRENT_CONVERSATION: 'vh_current_conversation',
  SETTINGS: 'vh_settings',
} as const;

export const storage = {
  // Conversations
  getConversations: (): Conversation[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      if (!data) return [];
      const conversations = JSON.parse(data);
      return conversations.map((conv: any) => ({
        ...conv,
        createdAt: new Date(conv.createdAt),
        updatedAt: new Date(conv.updatedAt),
        messages: conv.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
    } catch (error) {
      console.error('Error loading conversations:', error);
      return [];
    }
  },

  saveConversations: (conversations: Conversation[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    } catch (error) {
      console.error('Error saving conversations:', error);
    }
  },

  getCurrentConversation: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_CONVERSATION);
  },

  setCurrentConversation: (id: string): void => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_CONVERSATION, id);
  },

  // Settings
  getSettings: (): ChatSettings => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) {
        return {
          theme: 'light',
          typingSpeed: 'normal',
          soundEnabled: true
        };
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading settings:', error);
      return {
        theme: 'light',
        typingSpeed: 'normal',
        soundEnabled: true
      };
    }
  },

  saveSettings: (settings: ChatSettings): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  },

  // Clear all data
  clearAll: (): void => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
};