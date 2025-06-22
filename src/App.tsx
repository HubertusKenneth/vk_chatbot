import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Heart, Sparkles } from 'lucide-react';
import { useChat } from './hooks/useChat';
import { ParticleBackground } from './components/ParticleBackground';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { QuickActions } from './components/QuickActions';
import { Sidebar } from './components/Sidebar';

function App() {
  const {
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
    sendMessage
  } = useChat();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const theme = settings.theme;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Hide welcome when first message is sent
  useEffect(() => {
    if (messages.length > 0) {
      setShowWelcome(false);
    }
  }, [messages]);

  // Show copy confirmation
  useEffect(() => {
    if (copiedMessage) {
      const timer = setTimeout(() => setCopiedMessage(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedMessage]);

  const handleSendMessage = (message: string) => {
    sendMessage(message);
    setShowWelcome(false);
  };

  const handleCopyMessage = (text: string) => {
    setCopiedMessage('Message copied!');
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900'
        : 'bg-gradient-to-br from-rose-50 via-purple-50/30 to-pink-50'
    }`}>
      <ParticleBackground theme={theme} />
      
      {/* Copy notification */}
      <AnimatePresence>
        {copiedMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50 px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-medium shadow-lg"
          >
            {copiedMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        settings={settings}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewConversation={() => {
          createNewConversation();
          setSidebarOpen(false);
        }}
        onSwitchConversation={(id) => {
          switchConversation(id);
          setSidebarOpen(false);
        }}
        onDeleteConversation={deleteConversation}
        onUpdateSettings={setSettings}
        onUpdateConversationTitle={updateConversationTitle}
        theme={theme}
      />

      <div className="flex flex-col h-screen">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`backdrop-blur-xl border-b transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-slate-900/80 border-slate-700/50'
              : 'bg-white/80 border-gray-200/50'
          }`}
        >
          <div className="w-full px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Left side - Menu button */}
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'hover:bg-slate-800 text-slate-300 hover:text-slate-200'
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-700'
                  }`}
                >
                  <Menu size={24} />
                </button>
              </div>

              {/* Center - Logo and Title */}
              <div className="flex items-center gap-4">
                <div className={`p-3 sm:p-4 rounded-full ${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-pink-500 to-rose-500'
                    : 'bg-gradient-to-br from-purple-500 to-pink-500'
                }`}>
                  <Heart size={20} className="text-white sm:w-7 sm:h-7" />
                </div>
                <div className="text-center">
                  <h1 className={`text-lg sm:text-2xl font-bold ${
                    theme === 'dark' ? 'text-slate-100' : 'text-gray-800'
                  }`}>
                    VK Relationship Assistant
                  </h1>
                  <p className={`text-xs sm:text-sm ${
                    theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                  }`}>
                    Storytelling Helper
                  </p>
                </div>
              </div>

              {/* Right side - Status */}
              <div className="flex items-center gap-2">
                <div className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                  theme === 'dark'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-green-100 text-green-700 border border-green-200'
                }`}>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="hidden sm:inline">Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full w-full flex flex-col">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
              <div className="max-w-4xl mx-auto">
                <AnimatePresence mode="wait">
                  {showWelcome && messages.length === 0 ? (
                    <motion.div
                      key="welcome"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="h-full flex flex-col justify-center"
                    >
                      <div className="text-center mb-8">
                        <motion.div
                          animate={{ 
                            rotate: [0, 5, -5, 0],
                            scale: [1, 1.05, 1]
                          }}
                          transition={{ 
                            duration: 3,
                            repeat: Infinity,
                            repeatType: "reverse"
                          }}
                          className={`inline-flex p-6 sm:p-8 rounded-full mb-6 sm:mb-8 ${
                            theme === 'dark'
                              ? 'bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/30'
                              : 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20'
                          }`}
                        >
                          <Sparkles size={40} className={`sm:w-14 sm:h-14 ${
                            theme === 'dark' ? 'text-pink-400' : 'text-purple-600'
                          }`} />
                        </motion.div>
                        
                        <h2 className={`text-2xl sm:text-4xl font-bold mb-4 sm:mb-6 ${
                          theme === 'dark' ? 'text-slate-100' : 'text-gray-800'
                        }`}>
                          Welcome to VK Relationship Assistant!
                        </h2>
                        
                        <p className={`text-base sm:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4 ${
                          theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                        }`}>
                          I am a virtual assistant who is ready to help you with various questions about relationships and storytelling about V and K's relationship. 
                          Ask anything you want to know! ✨
                        </p>

                        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto mb-8 sm:mb-10 text-sm px-4 ${
                          theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                        }`}>
                          <motion.div 
                            whileHover={{ scale: 1.02, y: -2 }}
                            className={`p-4 sm:p-6 rounded-xl backdrop-blur-sm ${
                              theme === 'dark' ? 'bg-slate-800/40 border border-slate-700/30' : 'bg-white/40 border border-gray-200/30'
                            }`}
                          >
                            <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">💕</div>
                            <div className="font-semibold mb-1 sm:mb-2 text-base sm:text-lg">Their Love Story</div>
                            <div className="text-sm">Discover how two hearts became one</div>
                          </motion.div>
                          <motion.div 
                            whileHover={{ scale: 1.02, y: -2 }}
                            className={`p-4 sm:p-6 rounded-xl backdrop-blur-sm ${
                              theme === 'dark' ? 'bg-slate-800/40 border border-slate-700/30' : 'bg-white/40 border border-gray-200/30'
                            }`}
                          >
                            <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">✨</div>
                            <div className="font-semibold mb-1 sm:mb-2 text-base sm:text-lg">Special Moments</div>
                            <div className="text-sm">Learn about their most precious memories</div>
                          </motion.div>
                          <motion.div 
                            whileHover={{ scale: 1.02, y: -2 }}
                            className={`p-4 sm:p-6 rounded-xl backdrop-blur-sm sm:col-span-2 lg:col-span-1 ${
                              theme === 'dark' ? 'bg-slate-800/40 border border-slate-700/30' : 'bg-white/40 border border-gray-200/30'
                            }`}
                          >
                            <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">🔮</div>
                            <div className="font-semibold mb-1 sm:mb-2 text-base sm:text-lg">Future Dreams</div>
                            <div className="text-sm">Explore their plans and aspirations together</div>
                          </motion.div>
                        </div>
                      </div>

                      <QuickActions 
                        onActionClick={handleSendMessage}
                        theme={theme}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="messages"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-1"
                    >
                      {messages.map((message) => (
                        <ChatMessage
                          key={message.id}
                          message={message}
                          theme={theme}
                          onCopy={handleCopyMessage}
                        />
                      ))}
                      <div ref={messagesEndRef} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Input Area */}
            <ChatInput
              onSendMessage={handleSendMessage}
              disabled={isTyping}
              theme={theme}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;