
import { playAudioBuffer } from '@/lib/audioPlayback';
import { 
    generateWhiteNoise, 
    generatePulsar, 
    generateQuasar, 
    generateRainforestSound,
    generateSecureThunderstormSound,
    generateBlackHoleSound,
    generateJupiterRadio,
    generateCMBSound,
    generateMarsQuakeSounds
} from '@/lib/sound-presets';

export const manageAudioPlayback = async ({
    bufferToPlay, presetName,
    stopCurrentAudio, setAnalysisReport,
    spectrogramHistoryRef, pianoRollHistoryRef, collectedFreqDataRef,
    getAudioContext, collectedBufferDataRef,
    audioSourceNodeRef, analyserRef,
    setIsPlayingAudio, setIsAnalyzing, setPlayingPreset,
    toast, generateAndSetReport,
    setSpectrogramData, setTimeDomainDataForPianoRoll, persistedSpectrogramDataRef, persistedPianoRollDataRef
}) => {
    if (!bufferToPlay) return;
    stopCurrentAudio(false); // Pass false to not clear visualizations immediately
    setAnalysisReport(null);
    
    spectrogramHistoryRef.current = [];
    pianoRollHistoryRef.current = [];
    collectedFreqDataRef.current = [];
    
    const audioCtx = await getAudioContext();
    if (!audioCtx) return;

    collectedBufferDataRef.current = bufferToPlay;
    
    const onEnded = () => {
      stopCurrentAudio(true); // Pass true to persist and update visualizations
      generateAndSetReport();
      toast({ title: "Análisis Completado", description: "Revisa el reporte con los resultados." });
    };

    const sourceNode = await playAudioBuffer(audioCtx, analyserRef.current, bufferToPlay, onEnded);
    if (sourceNode) {
      audioSourceNodeRef.current = sourceNode;
      setIsPlayingAudio(true);
      setIsAnalyzing(true); 
      if (presetName) setPlayingPreset(presetName);
      toast({ title: "Reproduciendo y Analizando...", description: presetName || "Audio cargado" });
    } else {
      toast({ title: "Error al reproducir", description: "No se pudo iniciar el audio.", variant: "destructive" });
      stopCurrentAudio(true);
    }
};

export const manageUploadedAudioPlayback = async (audioBuffer, playDecodedAudio, toast) => {
    if (audioBuffer) {
      await playDecodedAudio(audioBuffer);
    } else {
      toast({title: "No hay audio cargado", description: "Sube un archivo o graba con tu micrófono primero.", variant: "destructive"});
    }
};

export const managePresetPlayback = async ({
    presetType, audioContextRef, stopCurrentAudio, toast,
    setAudioBuffer, playDecodedAudio, getAudioContext
}) => {
    const audioCtx = await getAudioContext();
    if (!audioCtx) return;
    stopCurrentAudio(false);
    toast({ title: `Generando ${presetType}...`, description: "¡Disfruta el viaje sónico!" });
    let generatedBuffer;
    try {
        let duration = 10;
        if (['ruidoBlanco', 'pulsarCosmico', 'radioJupiter'].includes(presetType)) duration = 7;
        if (['ecoAgujeroNegro', 'fondoCosmico', 'meteoritosMarte'].includes(presetType)) duration = 12;
        if (['bosqueLluvioso', 'tormentaLejanaSegura'].includes(presetType)) duration = 15;

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
            default: throw new Error("Preset de sonido desconocido");
        }
        setAudioBuffer(generatedBuffer); 
        await playDecodedAudio(generatedBuffer, presetType);
    } catch (error) {
        toast({ title: "Error de Generación", description: `No se pudo crear el sonido: ${error.message}`, variant: "destructive" });
        stopCurrentAudio(true);
    }
};
