
import { calculateFrequencies } from '@/lib/audio-analysis';

export const analyzeAudioFrame = ({
  analyserNode,
  audioCtx,
  isPlayingAudio,
  setFundamentalFreq,
  setHarmonics,
  setSpectrogramData,
  setTimeDomainDataForPianoRoll,
  spectrogramHistoryRef,
  pianoRollHistoryRef,
  collectedFreqDataRef,
  SPECTROGRAM_HISTORY_SIZE,
  PIANO_ROLL_HISTORY_SIZE,
  animationFrameRef,
  isAnalyzingState,
  animationFrameCounterRef,
  ANALYSIS_FRAME_THROTTLE,
  isMountedRef,
  lastTimeDomainDataRef,
  lastFrequencyDataRef
}) => {
  if (!isMountedRef.current || !isAnalyzingState || !analyserNode || !audioCtx || audioCtx.state !== 'running') {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = null;
    return;
  }

  animationFrameCounterRef.current = (animationFrameCounterRef.current + 1) % ANALYSIS_FRAME_THROTTLE;
  
  if (animationFrameCounterRef.current === 0) {
    const bufferLength = analyserNode.frequencyBinCount;
    const freqDataArray = new Uint8Array(bufferLength);
    const timeDataArray = new Uint8Array(bufferLength);

    analyserNode.getByteFrequencyData(freqDataArray);
    analyserNode.getByteTimeDomainData(timeDataArray);

    const { fundamental, harmonics } = calculateFrequencies(freqDataArray, audioCtx.sampleRate, analyserNode);
    
    if (isMountedRef.current) {
      setFundamentalFreq(fundamental);
      setHarmonics(harmonics);
    }


    if (isPlayingAudio || isAnalyzingState) { 
      if (isPlayingAudio) collectedFreqDataRef.current.push({ fundamental, harmonics });

      const currentFreqData = new Uint8Array(freqDataArray); 
      spectrogramHistoryRef.current.push(currentFreqData);
      if (spectrogramHistoryRef.current.length > SPECTROGRAM_HISTORY_SIZE) {
        spectrogramHistoryRef.current.shift();
      }
      if(isMountedRef.current) setSpectrogramData([...spectrogramHistoryRef.current]);

      pianoRollHistoryRef.current.push({ 
        time: Date.now(), 
        freq: fundamental, 
        amp: timeDataArray.reduce((sum, val) => sum + val, 0) / timeDataArray.length 
      });
      if (pianoRollHistoryRef.current.length > PIANO_ROLL_HISTORY_SIZE) {
        pianoRollHistoryRef.current.shift();
      }
      if(isMountedRef.current) setTimeDomainDataForPianoRoll([...pianoRollHistoryRef.current]);
      
      if (lastTimeDomainDataRef && isMountedRef.current) lastTimeDomainDataRef.current = new Uint8Array(timeDataArray);
      if (lastFrequencyDataRef && isMountedRef.current) lastFrequencyDataRef.current = new Uint8Array(freqDataArray);
    }

    if (window.drawFrequencySpectrum) window.drawFrequencySpectrum(freqDataArray);
    if (window.drawTimeDomainWaveform) window.drawTimeDomainWaveform(timeDataArray);
  }

  animationFrameRef.current = requestAnimationFrame(() => 
    analyzeAudioFrame({
      analyserNode, audioCtx, isPlayingAudio, setFundamentalFreq, setHarmonics,
      setSpectrogramData, setTimeDomainDataForPianoRoll, spectrogramHistoryRef,
      pianoRollHistoryRef, collectedFreqDataRef, SPECTROGRAM_HISTORY_SIZE,
      PIANO_ROLL_HISTORY_SIZE, animationFrameRef, isAnalyzingState,
      animationFrameCounterRef, ANALYSIS_FRAME_THROTTLE, isMountedRef,
      lastTimeDomainDataRef, lastFrequencyDataRef
    })
  );
};

export const resetAnalysisData = (
  setSpectrogramData,
  setTimeDomainDataForPianoRoll,
  spectrogramHistoryRef,
  pianoRollHistoryRef
) => {
  spectrogramHistoryRef.current = [];
  setSpectrogramData([]);
  pianoRollHistoryRef.current = [];
  setTimeDomainDataForPianoRoll([]);
};
