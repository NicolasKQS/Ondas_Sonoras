
export const playAudioBuffer = async (audioCtx, analyserNode, bufferToPlay, onEndedCallback) => {
  if (!audioCtx || audioCtx.state === 'closed' || !analyserNode) {
      console.error("AudioContext o AnalyserNode no están disponibles para la reproducción.");
      if (onEndedCallback) onEndedCallback(); // Call onEnded to prevent hangs
      return null;
  }
  try {
    const sourceNode = audioCtx.createBufferSource();
    sourceNode.buffer = bufferToPlay;
    sourceNode.connect(analyserNode);
    analyserNode.connect(audioCtx.destination); 
    
    let endedNaturally = false;
    sourceNode.onended = () => {
      if (sourceNode.buffer === bufferToPlay && endedNaturally) { 
        onEndedCallback();
      }
    };

    sourceNode.start(0);
    endedNaturally = true; // Set flag after successful start
    return sourceNode;
  } catch (e) {
    console.error("Error playing audio buffer:", e);
    if (onEndedCallback) onEndedCallback(); // Call onEnded if start fails
    return null;
  }
};

export const stopAudioPlayback = (audioSourceNodeRef, analyserRef, audioContextRef) => {
  if (audioSourceNodeRef.current) {
    audioSourceNodeRef.current.onended = null; 
    try { 
        // To prevent onEnded being called by stop(), we need to ensure it's not the "natural" end.
        // However, the sourceNode.onended handler above already checks if it's the same buffer.
        // For manual stop, we mostly want to ensure cleanup.
        if(audioSourceNodeRef.current.playbackState === AudioBufferSourceNode.PLAYING_STATE || audioSourceNodeRef.current.playbackState === AudioBufferSourceNode.SCHEDULED_STATE){
            audioSourceNodeRef.current.stop(); 
        }
    } catch (e) { /* ignore */ }
    try { audioSourceNodeRef.current.disconnect(); } catch(e) {}
    audioSourceNodeRef.current = null;
  }
  
  if (analyserRef.current && audioContextRef.current?.destination && analyserRef.current.numberOfOutputs > 0) {
     try { analyserRef.current.disconnect(audioContextRef.current.destination); } catch(e) {}
  }
};
