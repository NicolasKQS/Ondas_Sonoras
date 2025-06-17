
import { renderWithGain } from './helpers';

export async function generateWhiteNoise(audioContext, duration) {
  return renderWithGain(audioContext, duration, (offlineCtx, masterGain) => {
    const bufferSize = offlineCtx.sampleRate * duration;
    const buffer = offlineCtx.createBuffer(1, bufferSize, offlineCtx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const source = offlineCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(masterGain);
    source.start(0);
  }, 0.06, 1); // Quieter white noise, mono
}
