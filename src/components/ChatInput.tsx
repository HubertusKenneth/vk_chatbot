import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  theme: 'light' | 'dark';
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  disabled = false, 
  theme
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={`border-t backdrop-blur-sm ${
      theme === 'dark' 
        ? 'bg-slate-900/80 border-slate-700/50' 
        : 'bg-white/80 border-gray-200/50'
    }`}>
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="flex items-end gap-3 sm:gap-4">
          <div className={`flex-1 relative rounded-3xl transition-all duration-200 ${
            theme === 'dark'
              ? 'bg-slate-800/60 border border-slate-700/50 focus-within:border-pink-500/50 focus-within:shadow-lg focus-within:shadow-pink-500/10'
              : 'bg-white/60 border border-gray-200/50 focus-within:border-purple-500/50 focus-within:shadow-lg focus-within:shadow-purple-500/10'
          }`}>
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about Vyone and Hubertus love story..."
              disabled={disabled}
              className={`w-full p-3 sm:p-4 rounded-3xl resize-none outline-none transition-colors min-h-[48px] sm:min-h-[56px] max-h-[120px] text-sm sm:text-base ${
                theme === 'dark'
                  ? 'bg-transparent text-slate-100 placeholder-slate-400'
                  : 'bg-transparent text-gray-800 placeholder-gray-500'
              }`}
              rows={1}
            />
          </div>

          <motion.button
            type="submit"
            disabled={!message.trim() || disabled}
            whileHover={{ scale: message.trim() && !disabled ? 1.05 : 1 }}
            whileTap={{ scale: message.trim() && !disabled ? 0.95 : 1 }}
            className={`p-3 sm:p-4 rounded-full transition-all duration-200 ${
              message.trim() && !disabled
                ? theme === 'dark'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg hover:shadow-pink-500/25'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-purple-500/25'
                : theme === 'dark'
                  ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                  : 'bg-gray-200/50 text-gray-400 cursor-not-allowed'
            }`}
            title="Send message"
          >
            {disabled ? (
              <Loader size={18} className="animate-spin sm:w-5 sm:h-5" />
            ) : (
              <Send size={18} className="sm:w-5 sm:h-5" />
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
};