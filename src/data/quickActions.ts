import { QuickAction } from '../types';

export const quickActions: QuickAction[] = [
  {
    id: 'how-they-met',
    label: 'How They Met',
    message: 'How did Vyone and Hubertus first meet?',
    icon: '✨'
  },
  {
    id: 'first-date',
    label: 'First Date',
    message: 'Tell me about Vyone and Hubertus first date',
    icon: '💕'
  },
  {
    id: 'relationship-start',
    label: 'When They Started Dating',
    message: 'When did Vyone and Hubertus officially start dating?',
    icon: '📅'
  },
  {
    id: 'love-story',
    label: 'Their Love Story',
    message: 'Tell me the complete love story of Vyone and Hubertus',
    icon: '💖'
  },
  {
    id: 'special-moments',
    label: 'Special Moments',
    message: 'What are some special moments in Vyone and Hubertus relationship?',
    icon: '🌟'
  },
  {
    id: 'how-they-fell-in-love',
    label: 'How They Fell in Love',
    message: 'How did Vyone and Hubertus fall in love with each other?',
    icon: '💘'
  },
  {
    id: 'relationship-milestones',
    label: 'Relationship Milestones',
    message: 'What are the important milestones in Vyone and Hubertus relationship?',
    icon: '🎯'
  },
  {
    id: 'what-they-love',
    label: 'What They Love About Each Other',
    message: 'What do Vyone and Hubertus love most about each other?',
    icon: '💝'
  },
  {
    id: 'future-plans',
    label: 'Future Plans',
    message: 'What are Vyone and Hubertus future plans together?',
    icon: '🔮'
  }
];

export const getFeaturedActions = () => {
  return quickActions.slice(0, 6);
};

export const getAllActions = () => {
  return quickActions;
};