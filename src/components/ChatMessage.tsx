import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User, Copy } from 'lucide-react';
import { Message } from '../types';
import { format } from 'date-fns';

interface ChatMessageProps {
  message: Message;
  theme: 'light' | 'dark';
  onCopy?: (text: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, theme, onCopy }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    onCopy?.(message.content);
  };

  if (message.isTyping) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-4 mb-6"
      >
        <div className={`p-3 rounded-full ${
          theme === 'dark' 
            ? 'bg-gradient-to-br from-pink-500 to-rose-500' 
            : 'bg-gradient-to-br from-purple-500 to-pink-500'
        }`}>
          <Bot size={20} className="text-white" />
        </div>
        
        <div className={`flex-1 max-w-3xl p-4 rounded-2xl rounded-tl-sm ${
          theme === 'dark'
            ? 'bg-gray-800/80 backdrop-blur-sm border border-gray-700/50'
            : 'bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg'
        }`}>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    theme === 'dark' ? 'bg-pink-400' : 'bg-purple-500'
                  }`}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.4, 1, 0.4]
                  }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
            <span className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              VK is typing...
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-4 mb-6 ${message.isUser ? 'flex-row-reverse' : ''}`}
    >
      <div className={`p-3 rounded-full ${
        message.isUser
          ? theme === 'dark'
            ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
            : 'bg-gradient-to-br from-indigo-500 to-purple-500'
          : theme === 'dark'
            ? 'bg-gradient-to-br from-pink-500 to-rose-500'
            : 'bg-gradient-to-br from-purple-500 to-pink-500'
      }`}>
        {message.isUser ? (
          <User size={20} className="text-white" />
        ) : (
          <Bot size={20} className="text-white" />
        )}
      </div>
      
      <div className={`flex-1 max-w-3xl group ${message.isUser ? 'flex justify-end' : ''}`}>
        <div className={`relative p-4 rounded-2xl ${
          message.isUser 
            ? `rounded-tr-sm ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-blue-600 to-cyan-600 text-white'
                  : 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white'
              }`
            : `rounded-tl-sm ${
                theme === 'dark'
                  ? 'bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 text-gray-100'
                  : 'bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg text-gray-800'
              }`
        }`}>
          <div className="whitespace-pre-wrap leading-relaxed">
            {message.content}
          </div>
          
          <div className={`flex items-center justify-between mt-3 pt-2 border-t ${
            message.isUser
              ? 'border-white/20'
              : theme === 'dark'
                ? 'border-gray-700/50'
                : 'border-gray-200/50'
          }`}>
            <span className={`text-xs ${
              message.isUser
                ? 'text-white/70'
                : theme === 'dark'
                  ? 'text-gray-400'
                  : 'text-gray-500'
            }`}>
              {format(message.timestamp, 'HH:mm')}
            </span>
            
            {!message.isUser && (
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={handleCopy}
                  className={`p-1 rounded hover:bg-gray-100/20 transition-colors ${
                    theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'
                  }`}
                  title="Copy message"
                >
                  <Copy size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};