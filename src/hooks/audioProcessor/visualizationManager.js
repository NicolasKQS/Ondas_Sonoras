
export const updateVisualizations = (
  setSpectrogramData, 
  setTimeDomainDataForPianoRoll,
  spectrogramHistoryRef,
  pianoRollHistoryRef
) => {
  setSpectrogramData([...spectrogramHistoryRef.current]);
  setTimeDomainDataForPianoRoll([...pianoRollHistoryRef.current]);
};

export const clearVisualizations = (
  setSpectrogramData, 
  setTimeDomainDataForPianoRoll, 
  persistedSpectrogramDataRef, 
  persistedPianoRollDataRef,
  spectrogramHistoryRef,
  pianoRollHistoryRef,
  lastTimeDomainDataRef,
  lastFrequencyDataRef
) => {
  persistedSpectrogramDataRef.current = [];
  persistedPianoRollDataRef.current = [];
  spectrogramHistoryRef.current = [];
  pianoRollHistoryRef.current = [];
  setSpectrogramData([]);
  setTimeDomainDataForPianoRoll([]);
  if(lastTimeDomainDataRef) lastTimeDomainDataRef.current = null;
  if(lastFrequencyDataRef) lastFrequencyDataRef.current = null;

  if (window.drawFrequencySpectrum) window.drawFrequencySpectrum(null);
  if (window.drawTimeDomainWaveform) window.drawTimeDomainWaveform(null);
};
