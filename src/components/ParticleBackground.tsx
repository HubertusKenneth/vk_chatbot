import React from 'react';

interface ParticleBackgroundProps {
  theme: 'light' | 'dark';
}

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ theme }) => {
  // Return empty component - no particles
  return null;
};