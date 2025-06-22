import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getFeaturedActions, getAllActions } from '../data/quickActions';

interface QuickActionsProps {
  onActionClick: (message: string) => void;
  theme: 'light' | 'dark';
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onActionClick, theme }) => {
  const [showAll, setShowAll] = useState(false);
  
  const featuredActions = getFeaturedActions();
  const allActions = getAllActions();
  const displayedActions = showAll ? allActions : featuredActions;

  return (
    <div className="space-y-6 px-4">
      {/* Featured Quick Actions */}
      <div>
        <h3 className={`text-lg sm:text-xl font-semibold mb-4 ${
          theme === 'dark' ? 'text-slate-200' : 'text-gray-700'
        }`}>
          💕 Ask About Our Love Story
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          {displayedActions.map((action) => (
            <motion.button
              key={action.id}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onActionClick(action.message)}
              className={`p-3 sm:p-4 rounded-xl text-left transition-all duration-300 backdrop-blur-sm ${
                theme === 'dark'
                  ? 'bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 hover:border-pink-500/50 text-slate-200 shadow-lg hover:shadow-pink-500/10'
                  : 'bg-white/60 hover:bg-white/80 border border-gray-200/50 hover:border-purple-500/50 text-gray-700 shadow-lg hover:shadow-purple-500/10'
              }`}
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <span className="text-lg sm:text-2xl">{action.icon}</span>
                <div>
                  <div className="font-medium text-xs sm:text-sm leading-tight">{action.label}</div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {!showAll && allActions.length > featuredActions.length && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAll(true)}
            className={`text-sm flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              theme === 'dark' 
                ? 'text-pink-400 hover:text-pink-300 hover:bg-pink-500/10' 
                : 'text-purple-600 hover:text-purple-700 hover:bg-purple-500/10'
            }`}
          >
            Show all questions <ChevronDown size={16} />
          </motion.button>
        )}

        {showAll && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAll(false)}
            className={`text-sm flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              theme === 'dark' 
                ? 'text-pink-400 hover:text-pink-300 hover:bg-pink-500/10' 
                : 'text-purple-600 hover:text-purple-700 hover:bg-purple-500/10'
            }`}
          >
            Show less <ChevronUp size={16} />
          </motion.button>
        )}
      </div>
    </div>
  );
};