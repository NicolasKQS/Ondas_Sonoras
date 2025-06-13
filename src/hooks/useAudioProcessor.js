import { useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { generateWhiteNoise, generatePulsar, generateQuasar, generateRainSound, generateBlackHoleSound } from '@/lib/sound-presets';

const FFT_SIZE = 4096;
const SMOOTHING_TIME_CONSTANT = 0.8;

export function useAudioProcessor() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioData, setAudioData] = useState(null);
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [fundamentalFreq, setFundamentalFreq] = useState(0);
  const [harmonics, setHarmonics] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [analysisReport, setAnalysisReport] = useState(null);
  const [playingPreset, setPlayingPreset] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const audioBufferSourceRef = useRef(null);
  const mediaStreamSourceRef = useRef(null);
  const animationFrameRef = useRef(null);
  const collectedFreqData = useRef([]);

  const { toast } = useToast();

  const getAudioContext = useCallback(async () => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new Ctx();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = FFT_SIZE;
        analyserRef.current.smoothingTimeConstant = SMOOTHING_TIME_CONSTANT;
      } catch (e) {
        toast({ title: "Error de Audio", description: "Tu navegador no soporta la Web Audio API.", variant: "destructive" });
        return null;
      }
    }
    if (audioContextRef.current.state === 'suspended') {
      try { await audioContextRef.current.resume(); } 
      catch (e) {
        toast({ title: "Error de Audio", description: "Haz clic en la página para activar el audio.", variant: "destructive" });
        return null;
      }
    }
    return audioContextRef.current;
  }, [toast]);

  const stopCurrentAudioPlayback = useCallback(() => {
    if (audioBufferSourceRef.current) {
      audioBufferSourceRef.current.onended = null;
      try { audioBufferSourceRef.current.stop(); } catch(e) {}
      audioBufferSourceRef.current.disconnect();
      audioBufferSourceRef.current = null;
    }
    if (analyserRef.current && audioContextRef.current?.destination) {
      try { analyserRef.current.disconnect(); } catch(e) {}
    }
    setIsPlayingAudio(false);
    setIsAnalyzing(false);
    setPlayingPreset(null);
  }, []);

  const calculateFrequencies = useCallback((dataArray, sampleRate) => {
    if (!analyserRef.current || !dataArray || !dataArray.length) return { fundamental: 0, harmonics: [] };
    const bufferLength = analyserRef.current.frequencyBinCount;
    let maxIndex = 0;
    let maxValue = -Infinity;
    for (let i = 1; i < bufferLength; i++) {
      if (dataArray[i] > maxValue) {
        maxValue = dataArray[i];
        maxIndex = i;
      }
    }
    const fundamental = (maxIndex * sampleRate) / analyserRef.current.fftSize;
    if (fundamental > 20 && maxValue > 10) {
      const harmonicsList = [];
      for (let i = 2; i <= 8; i++) {
        const hFreq = fundamental * i;
        const hIndex = Math.round((hFreq * analyserRef.current.fftSize) / sampleRate);
        if (hIndex < bufferLength && dataArray[hIndex] > 5) {
          harmonicsList.push({ order: i, frequency: Math.round(hFreq), amplitude: dataArray[hIndex] });
        }
      }
      return { fundamental: Math.round(fundamental), harmonics: harmonicsList };
    }
    return { fundamental: 0, harmonics: [] };
  }, []);
  
  const generateReport = useCallback(() => {
    if (collectedFreqData.current.length === 0) {
      setAnalysisReport({ fundamentalFreq: 0, harmonics: [], peakFrequency: 0 });
      return;
    }
    const aggregatedFrequencies = {};
    collectedFreqData.current.forEach(dataPoint => {
        if(dataPoint.fundamental > 0) {
            if(!aggregatedFrequencies[dataPoint.fundamental]) aggregatedFrequencies[dataPoint.fundamental] = 0;
            aggregatedFrequencies[dataPoint.fundamental]++;
        }
    });
    let mainFundamental = 0;
    let maxOccurrences = 0;
    for (const freq in aggregatedFrequencies) {
        if (aggregatedFrequencies[freq] > maxOccurrences) {
            maxOccurrences = aggregatedFrequencies[freq];
            mainFundamental = parseInt(freq, 10);
        }
    }
    const finalFrame = collectedFreqData.current.length > 0 ? collectedFreqData.current[collectedFreqData.current.length - 1] : {harmonics:[]};
    setAnalysisReport({
      fundamentalFreq: mainFundamental,
      harmonics: mainFundamental > 0 ? finalFrame.harmonics.filter(h => h.frequency/h.order - mainFundamental < 10) : [],
    });
    collectedFreqData.current = []; 
  }, []);

  useEffect(() => {
    let animationFrameId;
    if (isAnalyzing) {
      const bufferLength = analyserRef.current.frequencyBinCount;
      const freqDataArray = new Uint8Array(bufferLength);
      const timeDataArray = new Uint8Array(bufferLength);
      
      const analyze = () => {
        if(!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(freqDataArray);
        analyserRef.current.getByteTimeDomainData(timeDataArray);
        
        const { fundamental, harmonics } = calculateFrequencies(freqDataArray, audioContextRef.current.sampleRate);
        setFundamentalFreq(fundamental);
        setHarmonics(harmonics);

        if(isPlayingAudio) {
          collectedFreqData.current.push({ fundamental, harmonics });
        }

        if (window.drawFrequencySpectrum) window.drawFrequencySpectrum(freqDataArray);
        if (window.drawTimeDomainWaveform) window.drawTimeDomainWaveform(timeDataArray);

        animationFrameId = requestAnimationFrame(analyze);
        animationFrameRef.current = animationFrameId;
      };
      analyze();
    }
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameRef.current = null;
      }
    };
  }, [isAnalyzing, isPlayingAudio, calculateFrequencies]);


  const playAudio = useCallback(async (bufferToPlay, presetName = null) => {
    if (!bufferToPlay) return;
    if (isPlayingAudio) stopCurrentAudioPlayback();
    
    setAnalysisReport(null);
    const audioCtx = await getAudioContext();
    if (!audioCtx) return;

    audioBufferSourceRef.current = audioCtx.createBufferSource();
    audioBufferSourceRef.current.buffer = bufferToPlay;
    audioBufferSourceRef.current.connect(analyserRef.current);
    analyserRef.current.connect(audioCtx.destination);
    
    collectedFreqData.current = [];
    setIsPlayingAudio(true);
    setIsAnalyzing(true);
    if (presetName) setPlayingPreset(presetName);
    
    audioBufferSourceRef.current.onended = () => {
      if(audioBufferSourceRef.current) { 
        stopCurrentAudioPlayback();
        generateReport();
        toast({ title: "Análisis Completado", description: "Revisa el reporte con los resultados." });
      }
    };
    
    audioBufferSourceRef.current.start(0);
    toast({ title: "Reproduciendo y Analizando...", description: presetName || "Audio cargado" });
  }, [getAudioContext, stopCurrentAudioPlayback, generateReport, toast, isPlayingAudio]);
  
  const playUploadedAudio = useCallback(() => {
    if (audioBuffer) playAudio(audioBuffer);
    else toast({title: "No hay audio cargado", description: "Sube un archivo o graba con tu micrófono primero.", variant: "destructive"});
  }, [audioBuffer, playAudio, toast]);
  
  const playPreset = useCallback(async (presetType) => {
    const audioCtx = await getAudioContext();
    if (!audioCtx) return;
    toast({ title: `Generando ${presetType}...`, description: "¡Disfruta el viaje sónico!" });
    let generatedBuffer;
    try {
        let duration = presetType.includes('ruido') || presetType.includes('pulsar') ? 5 : 10;
        switch (presetType) {
            case 'ruidoBlanco': generatedBuffer = await generateWhiteNoise(audioCtx, duration); break;
            case 'lluvia': generatedBuffer = await generateRainSound(audioCtx, duration); break;
            case 'pulsar': generatedBuffer = await generatePulsar(audioCtx, duration); break;
            case 'quasar': generatedBuffer = await generateQuasar(audioCtx, duration); break;
            case 'agujeroNegro': generatedBuffer = await generateBlackHoleSound(audioCtx, duration); break;
            default: throw new Error("Preset de sonido desconocido");
        }
        await playAudio(generatedBuffer, presetType);
    } catch (error) {
        toast({ title: "Error de Generación", description: `No se pudo crear el sonido: ${error.message}`, variant: "destructive" });
    }
  }, [getAudioContext, playAudio, toast]);
  
  const processAudioData = useCallback(async (data) => {
    stopCurrentAudioPlayback();
    setAudioBuffer(null);
    setAnalysisReport(null);
    const audioCtx = await getAudioContext();
    if (!audioCtx) return;
    try {
      toast({ title: "Procesando audio...", description: "Un momento, por favor." });
      const arrayBuffer = await data.arrayBuffer();
      const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      setAudioBuffer(decodedBuffer);
      toast({ title: "¡Listo para Analizar!", description: "Presiona 'Escuchar Audio' para empezar.", className: "bg-green-600 border-green-700 text-white" });
    } catch (e) {
      toast({ title: "Error de Procesamiento", description: `No se pudo procesar el audio: ${e.message}`, variant: "destructive" });
      setAudioBuffer(null);
    }
  }, [stopCurrentAudioPlayback, getAudioContext, toast]);

  const handleFileUpload = useCallback(async (event) => {
    stopCurrentAudioPlayback();
    setAnalysisReport(null);
    if (isRecording) mediaRecorderRef.current?.stop();
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('audio/')) {
      toast({ title: "Archivo Inválido", description: "Por favor, sube un archivo de audio.", variant: "destructive" });
      return;
    }
    setAudioData(file);
    await processAudioData(file);
    if (event.target) event.target.value = null;
  }, [stopCurrentAudioPlayback, isRecording, processAudioData, toast]);

  const startRecording = useCallback(async () => {
    stopCurrentAudioPlayback();
    setAudioBuffer(null);
    setAudioData(null);
    setAnalysisReport(null);
    const audioCtx = await getAudioContext();
    if (!audioCtx) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamSourceRef.current = audioCtx.createMediaStreamSource(stream);
      mediaStreamSourceRef.current.connect(analyserRef.current);
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks = [];
      mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioData(blob);
        await processAudioData(blob);
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsAnalyzing(true);
      toast({ title: "Grabación iniciada..." });
    } catch (error) {
      toast({ title: "Error de Micrófono", description: `No se pudo acceder al micrófono: ${error.message}`, variant: "destructive" });
      setIsRecording(false);
      setIsAnalyzing(false);
    }
  }, [stopCurrentAudioPlayback, getAudioContext, processAudioData, toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsAnalyzing(false);
      if (mediaStreamSourceRef.current) {
        mediaStreamSourceRef.current.mediaStream.getTracks().forEach(track => track.stop());
        mediaStreamSourceRef.current.disconnect();
        mediaStreamSourceRef.current = null;
      }
      toast({ title: "Grabación detenida", description: "Procesando..." });
    }
  }, [isRecording, toast]);
  
  const clearAnalysisReport = useCallback(() => {
    setAnalysisReport(null);
    setFundamentalFreq(0);
    setHarmonics([]);
  }, []);

  const loadPresetForAnalysis = useCallback(async (presetType) => {
    stopCurrentAudioPlayback();
    const audioCtx = await getAudioContext();
    if (!audioCtx) return;
    toast({ title: `Generando ${presetType}...`, description: "Esto es ciencia en acción, ¡un momento!" });
    let generatedBuffer;
    try {
        switch (presetType) {
            case 'ruidoBlanco': generatedBuffer = await generateWhiteNoise(audioCtx, 3); break;
            case 'lluvia': generatedBuffer = await generateRainSound(audioCtx, 5); break;
            case 'pulsar': generatedBuffer = await generatePulsar(audioCtx, 3); break;
            case 'quasar': generatedBuffer = await generateQuasar(audioCtx, 5); break;
            case 'agujeroNegro': generatedBuffer = await generateBlackHoleSound(audioCtx, 6); break;
            default: throw new Error("Preset de sonido desconocido");
        }
        setAudioBuffer(generatedBuffer);
        toast({ title: "¡Sonido Cósmico Listo!", description: "Ve al Analizador y presiona 'Escuchar Audio'.", className: "bg-indigo-600 border-indigo-700 text-white" });
    } catch (error) {
        toast({ title: "Error de Generación", description: `No se pudo crear el sonido: ${error.message}`, variant: "destructive" });
    }
  }, [getAudioContext, stopCurrentAudioPlayback, toast]);

  useEffect(() => {
    return () => {
      stopCurrentAudioPlayback();
      if (mediaRecorderRef.current?.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [stopCurrentAudioPlayback]);

  return {
    isRecording, audioBuffer, audioData, fundamentalFreq, harmonics, isAnalyzing, isPlayingAudio, analysisReport, playingPreset,
    startRecording, stopRecording, playUploadedAudio, stopCurrentAudioPlayback, handleFileUpload, clearAnalysisReport,
    loadPresetForAnalysis, playPreset,
  };
}