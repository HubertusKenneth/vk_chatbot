import { QuickAction } from '../types';

const quickActions: QuickAction[] = [
  {
    id: '1',
    label: 'How They Met',
    message: 'Tell me about how Vyone and Hubertus first met',
    icon: '💕'
  },
  {
    id: '2',
    label: 'First Date',
    message: 'What was their first date like?',
    icon: '🌹'
  },
  {
    id: '3',
    label: 'When They Started Dating',
    message: 'When did Vyone and Hubertus officially start dating?',
    icon: '📅'
  },
  {
    id: '4',
    label: 'Special Moments',
    message: 'What are some of their most special moments together?',
    icon: '✨'
  },
  {
    id: '5',
    label: 'Their Personalities',
    message: 'Tell me about Vyone and Hubertus personalities and how they complement each other',
    icon: '🎭'
  },
  {
    id: '6',
    label: 'Future Plans',
    message: 'What are their plans for the future together?',
    icon: '🔮'
  },
  {
    id: '7',
    label: 'Favorite Activities',
    message: 'What do they love doing together?',
    icon: '🎯'
  },
  {
    id: '8',
    label: 'Travel Adventures',
    message: 'Tell me about their travel experiences together',
    icon: '✈️'
  },
  {
    id: '9',
    label: 'Love Language',
    message: 'How do they express love to each other?',
    icon: '💝'
  },
  {
    id: '10',
    label: 'Challenges Overcome',
    message: 'What challenges have they overcome together?',
    icon: '💪'
  },
  {
    id: '11',
    label: 'Family & Friends',
    message: 'How do their families and friends view their relationship?',
    icon: '👨‍👩‍👧‍👦'
  },
  {
    id: '12',
    label: 'Anniversary Celebrations',
    message: 'How do they celebrate their anniversaries?',
    icon: '🎉'
  }
];

export const getFeaturedActions = (): QuickAction[] => {
  return quickActions.slice(0, 6);
};

export const getAllActions = (): QuickAction[] => {
  return quickActions;
};