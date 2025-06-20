import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Plus, 
  Settings, 
  Download, 
  Trash2, 
  Search,
  Moon,
  Sun,
  Zap,
  X,
  Edit3
} from 'lucide-react';
import { Conversation, ChatSettings } from '../types';
import { exportConversation, downloadFile } from '../utils/export';
import { format } from 'date-fns';

interface SidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  settings: ChatSettings;
  isOpen: boolean;
  onClose: () => void;
  onNewConversation: () => void;
  onSwitchConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onUpdateSettings: (settings: ChatSettings) => void;
  onUpdateConversationTitle: (id: string, title: string) => void;
  theme: 'light' | 'dark';
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  currentConversationId,
  settings,
  isOpen,
  onClose,
  onNewConversation,
  onSwitchConversation,
  onDeleteConversation,
  onUpdateSettings,
  onUpdateConversationTitle,
  theme
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.messages.some(msg => 
      msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleExport = (conversation: Conversation, format: 'txt' | 'json' | 'html') => {
    const timestamp = format(new Date(), 'yyyy-MM-dd-HHmm');
    const filename = `${conversation.title.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}`;
    
    let content: string;
    let mimeType: string;
    let extension: string;

    switch (format) {
      case 'txt':
        content = exportConversation.toText(conversation);
        mimeType = 'text/plain';
        extension = 'txt';
        break;
      case 'json':
        content = exportConversation.toJSON(conversation);
        mimeType = 'application/json';
        extension = 'json';
        break;
      case 'html':
        content = exportConversation.toHTML(conversation);
        mimeType = 'text/html';
        extension = 'html';
        break;
      default:
        return;
    }

    downloadFile(content, `${filename}.${extension}`, mimeType);
  };

  const startEditTitle = (conv: Conversation) => {
    setEditingTitle(conv.id);
    setEditTitle(conv.title);
  };

  const saveTitle = () => {
    if (editingTitle && editTitle.trim()) {
      onUpdateConversationTitle(editingTitle, editTitle.trim());
    }
    setEditingTitle(null);
    setEditTitle('');
  };

  const cancelEdit = () => {
    setEditingTitle(null);
    setEditTitle('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            className={`fixed left-0 top-0 bottom-0 w-80 z-50 ${
              theme === 'dark'
                ? 'bg-gray-900/95 border-r border-gray-700/50'
                : 'bg-white/95 border-r border-gray-200/50'
            } backdrop-blur-xl flex flex-col`}
          >
            {/* Header */}
            <div className={`p-6 border-b ${
              theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200/50'
            } flex items-center justify-between`}>
              <div>
                <h2 className={`font-bold text-lg font-serif ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                }`}>
                  💕 VK Relationship Assistant
                </h2>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Vyone & Hubertus
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-300'
                      : 'hover:bg-gray-100 text-gray-500 hover:text-gray-600'
                  }`}
                >
                  <Settings size={18} />
                </button>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-lg transition-colors lg:hidden ${
                    theme === 'dark'
                      ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-300'
                      : 'hover:bg-gray-100 text-gray-500 hover:text-gray-600'
                  }`}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Settings Panel */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`border-b overflow-hidden ${
                    theme === 'dark' ? 'border-gray-700/50 bg-gray-800/30' : 'border-gray-200/50 bg-gray-50/30'
                  }`}
                >
                  <div className="p-4 space-y-4">
                    {/* Theme Toggle */}
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Theme
                      </span>
                      <button
                        onClick={() => onUpdateSettings({
                          ...settings,
                          theme: settings.theme === 'dark' ? 'light' : 'dark'
                        })}
                        className={`p-2 rounded-lg transition-colors ${
                          theme === 'dark'
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                        }`}
                      >
                        {settings.theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                      </button>
                    </div>

                    {/* Typing Speed */}
                    <div>
                      <span className={`text-sm font-medium block mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Typing Speed
                      </span>
                      <div className="flex gap-1">
                        {(['slow', 'normal', 'fast'] as const).map((speed) => (
                          <button
                            key={speed}
                            onClick={() => onUpdateSettings({
                              ...settings,
                              typingSpeed: speed
                            })}
                            className={`flex-1 py-2 px-3 text-xs rounded-lg transition-colors capitalize ${
                              settings.typingSpeed === speed
                                ? theme === 'dark'
                                  ? 'bg-pink-600 text-white'
                                  : 'bg-purple-600 text-white'
                                : theme === 'dark'
                                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                          >
                            {speed}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* New Chat Button */}
            <div className="p-4">
              <button
                onClick={onNewConversation}
                className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all duration-200 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'
                } shadow-lg hover:shadow-xl`}
              >
                <Plus size={20} />
                <span className="font-medium">New Conversation</span>
              </button>
            </div>

            {/* Search */}
            <div className="px-4 pb-4">
              <div className={`relative rounded-lg ${
                theme === 'dark'
                  ? 'bg-gray-800/60 border border-gray-700/50'
                  : 'bg-white/60 border border-gray-200/50'
              }`}>
                <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg outline-none transition-colors ${
                    theme === 'dark'
                      ? 'bg-transparent text-gray-100 placeholder-gray-400'
                      : 'bg-transparent text-gray-800 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              <div className="space-y-2">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`group relative rounded-lg transition-all duration-200 ${
                      conversation.id === currentConversationId
                        ? theme === 'dark'
                          ? 'bg-pink-600/20 border border-pink-500/30'
                          : 'bg-purple-600/10 border border-purple-500/30'
                        : theme === 'dark'
                          ? 'hover:bg-gray-800/60 border border-transparent'
                          : 'hover:bg-white/60 border border-transparent'
                    }`}
                  >
                    {editingTitle === conversation.id ? (
                      <div className="p-3">
                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveTitle();
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          onBlur={saveTitle}
                          className={`w-full p-2 rounded border ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-gray-100'
                              : 'bg-white border-gray-300 text-gray-800'
                          }`}
                          autoFocus
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => onSwitchConversation(conversation.id)}
                        className="w-full p-3 text-left"
                      >
                        <div className="flex items-start gap-3">
                          <MessageSquare size={18} className={`mt-0.5 flex-shrink-0 ${
                            conversation.id === currentConversationId
                              ? theme === 'dark' ? 'text-pink-400' : 'text-purple-600'
                              : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium truncate ${
                              theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                            }`}>
                              {conversation.title}
                            </div>
                            <div className={`text-xs mt-1 ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {format(conversation.updatedAt, 'dd/MM/yyyy HH:mm')}
                            </div>
                          </div>
                        </div>
                      </button>
                    )}

                    {/* Action Menu */}
                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEditTitle(conversation)}
                          className={`p-1.5 rounded transition-colors ${
                            theme === 'dark'
                              ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300'
                              : 'hover:bg-gray-200 text-gray-500 hover:text-gray-600'
                          }`}
                          title="Edit title"
                        >
                          <Edit3 size={14} />
                        </button>
                        
                        <div className="relative group/export">
                          <button
                            className={`p-1.5 rounded transition-colors ${
                              theme === 'dark'
                                ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300'
                                : 'hover:bg-gray-200 text-gray-500 hover:text-gray-600'
                            }`}
                            title="Export conversation"
                          >
                            <Download size={14} />
                          </button>
                          
                          <div className={`absolute right-0 top-full mt-1 py-1 rounded-lg shadow-lg opacity-0 group-hover/export:opacity-100 transition-opacity pointer-events-none group-hover/export:pointer-events-auto z-10 ${
                            theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                          }`}>
                            <button
                              onClick={() => handleExport(conversation, 'txt')}
                              className={`block w-full px-3 py-1 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                              }`}
                            >
                              Export TXT
                            </button>
                            <button
                              onClick={() => handleExport(conversation, 'json')}
                              className={`block w-full px-3 py-1 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                              }`}
                            >
                              Export JSON
                            </button>
                            <button
                              onClick={() => handleExport(conversation, 'html')}
                              className={`block w-full px-3 py-1 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                              }`}
                            >
                              Export HTML
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={() => onDeleteConversation(conversation.id)}
                          className={`p-1.5 rounded transition-colors ${
                            theme === 'dark'
                              ? 'hover:bg-red-900/50 text-gray-400 hover:text-red-400'
                              : 'hover:bg-red-100 text-gray-500 hover:text-red-600'
                          }`}
                          title="Delete conversation"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredConversations.length === 0 && (
                  <div className={`text-center py-8 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {searchQuery ? 'No conversations found' : 'No conversations yet'}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};