
import { useToast } from '@/components/ui/use-toast'; // This won't work directly, toast needs to be passed or handled differently

export const processAudioFile = async (audioCtx, dataBlobOrFile, toastInstance) => {
  toastInstance({ title: "Procesando audio...", description: "Un momento, por favor." });
  try {
    const arrayBuffer = await dataBlobOrFile.arrayBuffer();
    if (!audioCtx || audioCtx.state === 'closed') {
        throw new Error("AudioContext no está disponible o está cerrado.");
    }
    const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    return { decodedBuffer, originalData: dataBlobOrFile };
  } catch (e) {
    toastInstance({ title: "Error de Procesamiento", description: `No se pudo procesar el audio: ${e.message}`, variant: "destructive" });
    return null;
  }
};

export const startMicRecording = async (
  audioCtx, 
  analyserNode, 
  mediaRecorderRef, 
  setIsRecording, 
  setIsAnalyzing, 
  toastInstance,
  onStopCallback 
) => {
  if (!audioCtx || audioCtx.state === 'closed') {
    toastInstance({ title: "Error de Audio", description: "El contexto de audio no está disponible.", variant: "destructive" });
    return null;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaStreamSource = audioCtx.createMediaStreamSource(stream);
    mediaStreamSource.connect(analyserNode); 
    
    mediaRecorderRef.current = new MediaRecorder(stream);
    const chunks = [];
    mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorderRef.current.onstop = async () => {
      const blob = new Blob(chunks, { type: 'audio/wav' });
      await onStopCallback(blob); 
      
      if (mediaStreamSource) {
        try { mediaStreamSource.disconnect(); } catch(e) {}
        stream.getTracks().forEach(track => track.stop());
      }
    };
    mediaRecorderRef.current.start();
    setIsRecording(true);
    setIsAnalyzing(true); 
    toastInstance({ title: "Grabación iniciada..." });
    return { mediaStreamSource }; 
  } catch (error) {
    toastInstance({ title: "Error de Micrófono", description: `No se pudo acceder al micrófono: ${error.message}`, variant: "destructive" });
    setIsRecording(false);
    setIsAnalyzing(false);
    return null;
  }
};

export const stopMicRecording = async (mediaRecorderRef, setIsRecording, audioSourceNodeRef, toastInstance, stopMessage = "Grabación detenida") => {
  if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
    mediaRecorderRef.current.stop(); 
    setIsRecording(false);
    toastInstance({ title: stopMessage, description: "Procesando..." });
  } else {
    setIsRecording(false); 
  }
};
