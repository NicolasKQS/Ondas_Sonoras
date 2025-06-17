
import { useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { 
    generateWhiteNoise, 
    generatePulsar, 
    generateQuasar, 
    generateRainforestSound,
    generateSecureThunderstormSound,
    generateBlackHoleSound,
    generateJupiterRadio,
    generateCMBSound,
    generateMarsQuakeSounds,
    generateSynthesizedAurora,
    generateWhaleSong,
    generateSolarWind,
    generateGeyserRhythm
} from '@/lib/sound-presets';
import { calculateLUFS, calculatePeakAmplitude, freqToNote } from '@/lib/audio-analysis';
import { processAudioFile, startMicRecording, stopMicRecording } from '@/lib/audioInput';
import { playAudioBuffer, stopAudioPlayback } from '@/lib/audioPlayback';
import { analyzeAudioFrame } from '@/lib/audioAnalysisLoop';
import { initializeAudioContext, destroyAudioContext } from '@/hooks/audioProcessor/audioContextManager';
import { manageAudioPlayback, managePresetPlayback, manageUploadedAudioPlayback } from '@/hooks/audioProcessor/playbackManager';
import { manageRecording } from '@/hooks/audioProcessor/recordingManager';
import { generateReport, clearReport } from '@/hooks/audioProcessor/reportManager';
import { updateVisualizations, clearVisualizations as clearVizFunc } from '@/hooks/audioProcessor/visualizationManager';

const FFT_SIZE = 2048; 
const SMOOTHING_TIME_CONSTANT = 0.75; 
const SPECTROGRAM_HISTORY_SIZE = 90; 
const PIANO_ROLL_HISTORY_SIZE = 120; 
const ANALYSIS_FRAME_THROTTLE = 1; 

export function useAudioProcessor(lastTimeDomainDataRef, lastFrequencyDataRef) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioData, setAudioData] = useState(null); 
  const [audioBuffer, setAudioBuffer] = useState(null); 
  const [fundamentalFreq, setFundamentalFreq] = useState(0);
  const [harmonics, setHarmonics] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [analysisReport, setAnalysisReport] = useState(null);
  const [playingPreset, setPlayingPreset] = useState(null);
  const [spectrogramData, setSpectrogramData] = useState([]);
  const [timeDomainDataForPianoRoll, setTimeDomainDataForPianoRoll] = useState([]);
  const isMountedRef = useRef(false);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const audioSourceNodeRef = useRef(null); 
  const mediaRecorderRef = useRef(null); 
  
  const animationFrameRef = useRef(null);
  const animationFrameCounterRef = useRef(0);
  const collectedFreqDataRef = useRef([]);
  const collectedBufferDataRef = useRef(null); 
  const spectrogramHistoryRef = useRef([]);
  const pianoRollHistoryRef = useRef([]);
  const persistedSpectrogramDataRef = useRef([]);
  const persistedPianoRollDataRef = useRef([]);

  const { toast } = useToast();

  const getAudioContext = useCallback(async () => {
    const context = await initializeAudioContext(audioContextRef, analyserRef, FFT_SIZE, SMOOTHING_TIME_CONSTANT, toast);
    return context;
  }, [toast]);
  
  const commonStopAudioActions = useCallback((persistAndShowVisualizations) => {
    setIsPlayingAudio(false);
    setPlayingPreset(null);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (persistAndShowVisualizations) {
        persistedSpectrogramDataRef.current = [...spectrogramHistoryRef.current];
        persistedPianoRollDataRef.current = [...pianoRollHistoryRef.current];
        setSpectrogramData([...persistedSpectrogramDataRef.current]);
        setTimeDomainDataForPianoRoll([...persistedPianoRollDataRef.current]);
    }
    if (!isRecording) {
      setIsAnalyzing(false);
    }
  }, [isRecording]);

  const stopCurrentAudio = useCallback((persistVisuals = true) => {
    stopAudioPlayback(audioSourceNodeRef, analyserRef, audioContextRef);
    commonStopAudioActions(persistVisuals);
  }, [commonStopAudioActions]);
  
  const generateAndSetReport = useCallback(() => {
    generateReport(collectedFreqDataRef, collectedBufferDataRef, setAnalysisReport, setFundamentalFreq, setHarmonics);
  }, []);
  
  const clearAnalysisReportHandler = useCallback(() => {
    clearReport(setAnalysisReport, setFundamentalFreq, setHarmonics);
    clearVizFunc(
        setSpectrogramData, 
        setTimeDomainDataForPianoRoll, 
        persistedSpectrogramDataRef, 
        persistedPianoRollDataRef,
        spectrogramHistoryRef,
        pianoRollHistoryRef,
        lastTimeDomainDataRef,
        lastFrequencyDataRef
    );
  }, [lastTimeDomainDataRef, lastFrequencyDataRef]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      destroyAudioContext(audioContextRef, mediaRecorderRef, audioSourceNodeRef, analyserRef);
    };
  }, []);


  useEffect(() => { 
    if (isAnalyzing && audioContextRef.current && analyserRef.current && isMountedRef.current) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = requestAnimationFrame(() => 
        analyzeAudioFrame({
          analyserNode: analyserRef.current,
          audioCtx: audioContextRef.current,
          isPlayingAudio, 
          setFundamentalFreq, setHarmonics,
          setSpectrogramData, setTimeDomainDataForPianoRoll,
          spectrogramHistoryRef, pianoRollHistoryRef,
          collectedFreqDataRef,
          SPECTROGRAM_HISTORY_SIZE, PIANO_ROLL_HISTORY_SIZE,
          animationFrameRef, isAnalyzingState: isAnalyzing,
          animationFrameCounterRef, ANALYSIS_FRAME_THROTTLE,
          isMountedRef,
          lastTimeDomainDataRef,
          lastFrequencyDataRef
        })
      );
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (!isPlayingAudio && isMountedRef.current) { 
          setSpectrogramData([...persistedSpectrogramDataRef.current]);
          setTimeDomainDataForPianoRoll([...persistedPianoRollDataRef.current]);
          if (window.drawTimeDomainWaveform && lastTimeDomainDataRef.current) {
            window.drawTimeDomainWaveform(lastTimeDomainDataRef.current);
          }
          if (window.drawFrequencySpectrum && lastFrequencyDataRef.current) {
            window.drawFrequencySpectrum(lastFrequencyDataRef.current);
          }
      }
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isAnalyzing, isPlayingAudio, lastTimeDomainDataRef, lastFrequencyDataRef]);

  const playDecodedAudio = useCallback(async (bufferToPlay, presetName = null) => {
    if(!isMountedRef.current) return;
    await manageAudioPlayback({
        bufferToPlay, presetName,
        stopCurrentAudio, setAnalysisReport,
        spectrogramHistoryRef, pianoRollHistoryRef, collectedFreqDataRef,
        getAudioContext, collectedBufferDataRef,
        audioSourceNodeRef, analyserRef,
        setIsPlayingAudio, setIsAnalyzing, setPlayingPreset,
        toast, generateAndSetReport,
        setSpectrogramData, setTimeDomainDataForPianoRoll, persistedSpectrogramDataRef, persistedPianoRollDataRef
    });
  }, [getAudioContext, stopCurrentAudio, generateAndSetReport, toast]);

  const playUploadedAudioHandler = useCallback(async () => {
    if(!isMountedRef.current) return;
    await manageUploadedAudioPlayback(audioBuffer, playDecodedAudio, toast);
  }, [audioBuffer, playDecodedAudio, toast]);

  const playPresetHandler = useCallback(async (presetType) => {
    if(!isMountedRef.current) return;
    
    const audioCtx = await getAudioContext();
    if (!audioCtx) return;
    stopCurrentAudio(false);
    toast({ title: `Generando ${presetType}...`, description: "¡Disfruta el viaje sónico!" });
    let generatedBuffer;
    try {
        let duration = 10;
        if (['ruidoBlanco', 'pulsarCosmico', 'radioJupiter'].includes(presetType)) duration = 7;
        if (['ecoAgujeroNegro', 'fondoCosmico', 'meteoritosMarte', 'auroraSintetizada', 'vientoSolarSutil'].includes(presetType)) duration = 12;
        if (['bosqueLluvioso', 'tormentaLejanaSegura', 'cantoBallenasProfundo', 'geiserRitmico'].includes(presetType)) duration = 15;


        switch (presetType) {
            case 'ruidoBlanco': generatedBuffer = await generateWhiteNoise(audioCtx, duration); break;
            case 'bosqueLluvioso': generatedBuffer = await generateRainforestSound(audioCtx, duration); break;
            case 'tormentaLejanaSegura': generatedBuffer = await generateSecureThunderstormSound(audioCtx, duration); break;
            case 'pulsarCosmico': generatedBuffer = await generatePulsar(audioCtx, duration); break;
            case 'murmulloQuasar': generatedBuffer = await generateQuasar(audioCtx, duration); break;
            case 'ecoAgujeroNegro': generatedBuffer = await generateBlackHoleSound(audioCtx, duration); break;
            case 'radioJupiter': generatedBuffer = await generateJupiterRadio(audioCtx, duration); break;
            case 'fondoCosmico': generatedBuffer = await generateCMBSound(audioCtx, duration); break;
            case 'meteoritosMarte': generatedBuffer = await generateMarsQuakeSounds(audioCtx, duration); break;
            case 'auroraSintetizada': generatedBuffer = await generateSynthesizedAurora(audioCtx, duration); break;
            case 'cantoBallenasProfundo': generatedBuffer = await generateWhaleSong(audioCtx, duration); break;
            case 'vientoSolarSutil': generatedBuffer = await generateSolarWind(audioCtx, duration); break;
            case 'geiserRitmico': generatedBuffer = await generateGeyserRhythm(audioCtx, duration); break;
            default: throw new Error("Preset de sonido desconocido: " + presetType);
        }
        if (!isMountedRef.current) return;
        setAudioBuffer(generatedBuffer); 
        await playDecodedAudio(generatedBuffer, presetType);
    } catch (error) {
        if (!isMountedRef.current) return;
        console.error("Error playing preset:", error);
        toast({ title: "Error de Generación", description: `No se pudo crear el sonido ${presetType}: ${error.message}`, variant: "destructive" });
        stopCurrentAudio(true);
    }
  }, [getAudioContext, playDecodedAudio, toast, stopCurrentAudio]);

  const processAndSetAudio = useCallback(async (dataBlobOrFile) => { 
    if(!isMountedRef.current) return;
    stopCurrentAudio(false);
    setAudioBuffer(null); 
    setAnalysisReport(null);
    clearVizFunc(
        setSpectrogramData, 
        setTimeDomainDataForPianoRoll, 
        persistedSpectrogramDataRef, 
        persistedPianoRollDataRef,
        spectrogramHistoryRef,
        pianoRollHistoryRef,
        lastTimeDomainDataRef,
        lastFrequencyDataRef
    );
    
    const audioCtx = await getAudioContext();
    if (!audioCtx || !isMountedRef.current) return;

    const result = await processAudioFile(audioCtx, dataBlobOrFile, toast);
    if (result && isMountedRef.current) {
      setAudioBuffer(result.decodedBuffer);
      setAudioData(result.originalData); 
      toast({ title: "Audio Listo", description: "Presione 'Escuchar Audio' para iniciar el análisis.", className: "bg-green-600 border-green-700 text-white" });
    } else if (isMountedRef.current) {
      setAudioBuffer(null);
      setAudioData(null);
    }
  }, [stopCurrentAudio, getAudioContext, toast, lastTimeDomainDataRef, lastFrequencyDataRef]);

  const handleFileUploadHandler = useCallback(async (event) => {
    if(!isMountedRef.current) return;
    stopCurrentAudio(false);
    setAnalysisReport(null);
    if (isRecording) await stopRecordingHandler("Grabación detenida por carga de archivo.");
    
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('audio/')) {
      toast({ title: "Archivo Inválido", description: "Por favor, seleccione un archivo de audio.", variant: "destructive" });
      return;
    }
    await processAndSetAudio(file);
    if (event.target && isMountedRef.current) event.target.value = null; 
  }, [stopCurrentAudio, isRecording, processAndSetAudio, toast]);

  const startRecordingHandler = useCallback(async () => {
    if(!isMountedRef.current) return;
    await manageRecording.start({
        stopCurrentAudio: () => stopCurrentAudio(false), 
        setAudioBuffer, setAudioData, setAnalysisReport,
        clearVisualizations: () => clearVizFunc(
            setSpectrogramData, setTimeDomainDataForPianoRoll, 
            persistedSpectrogramDataRef, persistedPianoRollDataRef,
            spectrogramHistoryRef, pianoRollHistoryRef,
            lastTimeDomainDataRef, lastFrequencyDataRef
        ),
        getAudioContext, analyserRef, mediaRecorderRef,
        setIsRecording, setIsAnalyzing, toast, processAndSetAudio,
        audioSourceNodeRef
    });
  }, [stopCurrentAudio, getAudioContext, processAndSetAudio, toast, lastTimeDomainDataRef, lastFrequencyDataRef]);

  const stopRecordingHandler = useCallback(async (stopMessage) => {
    if(!isMountedRef.current) return;
    await manageRecording.stop({
        mediaRecorderRef, setIsRecording, audioSourceNodeRef, toast, 
        isPlayingAudio, setIsAnalyzing, stopMessage,
        setSpectrogramData, setTimeDomainDataForPianoRoll,
        persistedSpectrogramDataRef, persistedPianoRollDataRef,
        spectrogramHistoryRef, pianoRollHistoryRef,
        lastTimeDomainDataRef, lastFrequencyDataRef
    });
  }, [toast, isPlayingAudio, lastTimeDomainDataRef, lastFrequencyDataRef]);
  
  const loadPresetForAnalysisHandler = useCallback(async (presetType) => {
    if(!isMountedRef.current) return;
    stopCurrentAudio(false);
    const audioCtx = await getAudioContext();
    if (!audioCtx || !isMountedRef.current) return;
    toast({ title: `Cargando ${presetType} para análisis...`, description: "Por favor, espere." });
    let generatedBuffer;
    try {
        let duration = 5; 
        if (['ecoAgujeroNegro', 'fondoCosmico', 'meteoritosMarte', 'auroraSintetizada', 'vientoSolarSutil'].includes(presetType)) duration = 8;
        if (['radioJupiter', 'cantoBallenasProfundo', 'geiserRitmico'].includes(presetType)) duration = 7;
        if (['bosqueLluvioso', 'tormentaLejanaSegura'].includes(presetType)) duration = 10;


        switch (presetType) {
            case 'ruidoBlanco': generatedBuffer = await generateWhiteNoise(audioCtx, 3); break;
            case 'bosqueLluvioso': generatedBuffer = await generateRainforestSound(audioCtx, duration); break;
            case 'tormentaLejanaSegura': generatedBuffer = await generateSecureThunderstormSound(audioCtx, duration); break;
            case 'pulsarCosmico': generatedBuffer = await generatePulsar(audioCtx, 3); break;
            case 'murmulloQuasar': generatedBuffer = await generateQuasar(audioCtx, duration); break;
            case 'ecoAgujeroNegro': generatedBuffer = await generateBlackHoleSound(audioCtx, duration); break;
            case 'radioJupiter': generatedBuffer = await generateJupiterRadio(audioCtx, duration); break;
            case 'fondoCosmico': generatedBuffer = await generateCMBSound(audioCtx, duration); break;
            case 'meteoritosMarte': generatedBuffer = await generateMarsQuakeSounds(audioCtx, duration); break;
            case 'auroraSintetizada': generatedBuffer = await generateSynthesizedAurora(audioCtx, duration); break;
            case 'cantoBallenasProfundo': generatedBuffer = await generateWhaleSong(audioCtx, duration); break;
            case 'vientoSolarSutil': generatedBuffer = await generateSolarWind(audioCtx, duration); break;
            case 'geiserRitmico': generatedBuffer = await generateGeyserRhythm(audioCtx, duration); break;
            default: throw new Error("Preset de sonido desconocido: " + presetType);
        }
        if (!isMountedRef.current) return;
        setAudioBuffer(generatedBuffer);
        setAudioData(null); 
        clearVizFunc(
            setSpectrogramData, 
            setTimeDomainDataForPianoRoll, 
            persistedSpectrogramDataRef, 
            persistedPianoRollDataRef,
            spectrogramHistoryRef,
            pianoRollHistoryRef,
            lastTimeDomainDataRef,
            lastFrequencyDataRef
        );
        toast({ title: `Preset ${presetType} cargado.`, description: "Vaya al Analizador y presione 'Escuchar Audio'.", className: "bg-indigo-600 border-indigo-700 text-white" });
    } catch (error) {
        if (!isMountedRef.current) return;
        console.error("Error loading preset:", error);
        toast({ title: "Error de Carga", description: `No se pudo cargar el preset ${presetType}: ${error.message}`, variant: "destructive" });
    }
  }, [getAudioContext, stopCurrentAudio, toast, lastTimeDomainDataRef, lastFrequencyDataRef]);


  return {
    isRecording, audioBuffer, audioData, fundamentalFreq, harmonics, isAnalyzing, isPlayingAudio, analysisReport, playingPreset,
    spectrogramData, timeDomainDataForPianoRoll,
    startRecording: startRecordingHandler, 
    stopRecording: stopRecordingHandler, 
    playUploadedAudio: playUploadedAudioHandler, 
    stopCurrentAudioPlayback: stopCurrentAudio, 
    handleFileUpload: handleFileUploadHandler, 
    clearAnalysisReport: clearAnalysisReportHandler,
    loadPresetForAnalysis: loadPresetForAnalysisHandler, 
    playPreset: playPresetHandler,
    lastTimeDomainDataRef,
    lastFrequencyDataRef,
  };
}
