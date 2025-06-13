
import React, { createContext, useContext, useState } from 'react';
import { useAudioProcessor } from '@/hooks/useAudioProcessor';

const AudioProcessorContext = createContext(null);

export function AudioProcessorProvider({ children }) {
  const [activeTab, setActiveTab] = useState('teoria');
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const audioProcessor = useAudioProcessor();

  const value = {
    ...audioProcessor,
    activeTab,
    setActiveTab,
    isAboutModalOpen,
    setIsAboutModalOpen,
  };

  return (
    <AudioProcessorContext.Provider value={value}>
      {children}
    </AudioProcessorContext.Provider>
  );
}

export const useAudioContext = () => {
  const context = useContext(AudioProcessorContext);
  if (!context) {
    throw new Error('useAudioContext must be used within an AudioProcessorProvider');
  }
  return context;
};
