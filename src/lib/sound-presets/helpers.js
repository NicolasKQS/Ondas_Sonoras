
export async function renderWithGain(audioContext, duration, setupSoundSource, gainValue = 0.15, channels = 2) {
  const offlineCtx = new OfflineAudioContext(channels, audioContext.sampleRate * duration, audioContext.sampleRate);
  const masterGain = offlineCtx.createGain();
  masterGain.gain.value = gainValue;
  masterGain.connect(offlineCtx.destination);
  
  await setupSoundSource(offlineCtx, masterGain);
  
  return await offlineCtx.startRendering();
}

export function createPinkNoiseBuffer(offlineCtx, duration) {
    const bufferSize = offlineCtx.sampleRate * duration;
    const buffer = offlineCtx.createBuffer(1, bufferSize, offlineCtx.sampleRate);
    const output = buffer.getChannelData(0);
    
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11; 
        b6 = white * 0.115926;
    }
    return buffer;
}

export function createBrownNoiseBuffer(offlineCtx, duration) {
    const bufferSize = offlineCtx.sampleRate * duration;
    const buffer = offlineCtx.createBuffer(1, bufferSize, offlineCtx.sampleRate);
    const output = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; 
    }
    return buffer;
}

export function createImpulseResponse(offlineCtx, durationSeconds, decaySeconds, reverse = false) {
    const sampleRate = offlineCtx.sampleRate;
    const length = sampleRate * durationSeconds;
    const impulse = offlineCtx.createBuffer(2, length, sampleRate);
    const impulseL = impulse.getChannelData(0);
    const impulseR = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
        const n = reverse ? length - i : i;
        impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decaySeconds);
        impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decaySeconds);
    }
    return impulse;
}
