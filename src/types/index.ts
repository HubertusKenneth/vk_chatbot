export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
}

export interface ChatSettings {
  theme: 'light' | 'dark';
  typingSpeed: 'slow' | 'normal' | 'fast';
  soundEnabled: boolean;
}

export interface QuickAction {
  id: string;
  label: string;
  message: string;
  icon: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}