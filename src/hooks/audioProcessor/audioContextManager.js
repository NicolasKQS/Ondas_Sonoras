
export const initializeAudioContext = async (audioContextRef, analyserRef, fftSize, smoothingTimeConstant, toast) => {
  if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new Ctx();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = fftSize;
      analyserRef.current.smoothingTimeConstant = smoothingTimeConstant;
      analyserRef.current.minDecibels = -100;
      analyserRef.current.maxDecibels = -10;
    } catch (e) {
      toast({ title: "Error de Audio", description: "Tu navegador no soporta la Web Audio API.", variant: "destructive" });
      return null;
    }
  }
  if (audioContextRef.current.state === 'suspended') {
    try { 
        await audioContextRef.current.resume(); 
    } 
    catch (e) {
      toast({ title: "Interacción Requerida", description: "Haz clic en la página para activar el audio y luego intente de nuevo.", variant: "destructive" });
      return null;
    }
  }
  return audioContextRef.current;
};

export const destroyAudioContext = (audioContextRef, mediaRecorderRef, audioSourceNodeRef, analyserRef) => {
  if (mediaRecorderRef.current?.stream) {
    mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
  }
  if (audioSourceNodeRef.current) {
    try {
        audioSourceNodeRef.current.disconnect();
    } catch(e) {}
    audioSourceNodeRef.current = null;
  }
  if (analyserRef.current) {
      try {
          analyserRef.current.disconnect();
      } catch(e) {}
      analyserRef.current = null;
  }
  if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
    audioContextRef.current.close().catch(() => {}); 
    audioContextRef.current = null;
    console.log("AudioContext and associated nodes destroyed");
  }
};
