export const initializeGameAudioContext = async () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const gainNode = audioCtx.createGain();
    gainNode.connect(audioCtx.destination);
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }
    return { audioCtx, gainNode, activeOscillators: [] };
  } catch (e) {
    console.error("Could not create AudioContext for game:", e);
    return null;
  }
};

export const playFrequencySound = (audioContextPack, freq, duration = 0.6, type = 'sine', onEndedCallback = null) => {
  if (!audioContextPack || !audioContextPack.audioCtx || audioContextPack.audioCtx.state !== 'running') {
    console.warn("Game AudioContext not ready for playFrequencySound.");
    if (onEndedCallback) onEndedCallback();
    return;
  }

  const { audioCtx, gainNode, activeOscillators } = audioContextPack;
  
  // Stop previous single oscillator if it exists
  if (activeOscillators.length === 1 && activeOscillators[0].customType === 'singleTone') {
    try { activeOscillators[0].stop(); } catch (e) {}
    activeOscillators[0].disconnect();
    activeOscillators.shift();
  }

  const oscillator = audioCtx.createOscillator();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
  
  const localGain = audioCtx.createGain(); // Use a local gain for individual control
  localGain.gain.setValueAtTime(0.2, audioCtx.currentTime); // Start with some volume
  localGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration * 0.9);
  
  oscillator.connect(localGain);
  localGain.connect(gainNode); // Connect local gain to master game gain

  oscillator.customType = 'singleTone'; // Mark it for potential cleanup
  activeOscillators.push(oscillator);
  
  try {
    oscillator.start();
    oscillator.onended = () => {
      const index = activeOscillators.indexOf(oscillator);
      if (index > -1) activeOscillators.splice(index, 1);
      localGain.disconnect(); // Disconnect local gain when done
      if (onEndedCallback) onEndedCallback();
    };
    oscillator.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.error("Error playing frequency:", e);
    const index = activeOscillators.indexOf(oscillator);
    if (index > -1) activeOscillators.splice(index, 1);
    localGain.disconnect();
    if (onEndedCallback) onEndedCallback();
  }
};

export const stopAllGameSounds = (audioContextPack, specificOscillatorArrayRef = null) => {
  if (!audioContextPack) return;
  const oscillatorsToStop = specificOscillatorArrayRef ? specificOscillatorArrayRef.current : audioContextPack.activeOscillators;
  
  oscillatorsToStop.forEach(osc => {
    try { osc.stop(); } catch (e) {}
    osc.disconnect();
  });

  if (specificOscillatorArrayRef) {
    specificOscillatorArrayRef.current = [];
  } else {
    audioContextPack.activeOscillators = [];
  }
};