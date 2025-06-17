
import { startMicRecording as startMic, stopMicRecording as stopMic } from '@/lib/audioInput';

export const manageRecording = {
  start: async ({
    stopCurrentAudio, setAudioBuffer, setAudioData, setAnalysisReport,
    clearVisualizations, getAudioContext, analyserRef, mediaRecorderRef,
    setIsRecording, setIsAnalyzing, toast, processAndSetAudio,
    audioSourceNodeRef
  }) => {
    stopCurrentAudio();
    setAudioBuffer(null);
    setAudioData(null);
    setAnalysisReport(null);
    clearVisualizations();

    const audioCtx = await getAudioContext();
    if (!audioCtx) return;

    const recordingResult = await startMic(audioCtx, analyserRef.current, mediaRecorderRef, setIsRecording, setIsAnalyzing, toast, processAndSetAudio);
    if (recordingResult) {
      audioSourceNodeRef.current = recordingResult.mediaStreamSource; 
    }
  },
  stop: async ({
    mediaRecorderRef, setIsRecording, audioSourceNodeRef, toast, 
    isPlayingAudio, setIsAnalyzing,
    setSpectrogramData, setTimeDomainDataForPianoRoll,
    persistedSpectrogramDataRef, persistedPianoRollDataRef,
    spectrogramHistoryRef, pianoRollHistoryRef,
  }) => {
    await stopMic(mediaRecorderRef, setIsRecording, audioSourceNodeRef, toast);
    if (!isPlayingAudio) {
        setIsAnalyzing(false);
        // Persist data from mic input if not auto-played
        persistedSpectrogramDataRef.current = [...spectrogramHistoryRef.current];
        persistedPianoRollDataRef.current = [...pianoRollHistoryRef.current];
        setSpectrogramData([...persistedSpectrogramDataRef.current]);
        setTimeDomainDataForPianoRoll([...persistedPianoRollDataRef.current]);
    }
  }
};
