
import React, { createContext, useContext, useState, useRef } from 'react';
import { useAudioProcessor } from '@/hooks/useAudioProcessor';

const AudioProcessorContext = createContext(null);

export function AudioProcessorProvider({ children }) {
  const [activeTab, setActiveTab] = useState('explora'); 
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const lastTimeDomainDataRef = useRef(null);
  const lastFrequencyDataRef = useRef(null);
  const audioProcessor = useAudioProcessor(lastTimeDomainDataRef, lastFrequencyDataRef);

  const value = {
    ...audioProcessor,
    activeTab,
    setActiveTab,
    isAboutModalOpen,
    setIsAboutModalOpen,
    lastTimeDomainDataRef, 
    lastFrequencyDataRef,
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
