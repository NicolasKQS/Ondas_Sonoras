export async function generateWhiteNoise(audioContext, duration) {
  const bufferSize = audioContext.sampleRate * duration;
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const output = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  return buffer;
}

export async function generatePulsar(audioContext, duration) {
  const offlineCtx = new OfflineAudioContext(1, audioContext.sampleRate * duration, audioContext.sampleRate);
  
  const pulseFreq = 2.5;
  const carrierFreq = 880;

  const pulse = offlineCtx.createOscillator();
  pulse.type = 'square';
  pulse.frequency.value = pulseFreq;
  
  const pulseShaper = offlineCtx.createWaveShaper();
  const curve = new Float32Array(2);
  curve[0] = 0;
  curve[1] = 1;
  pulseShaper.curve = curve;
  
  const pulseGain = offlineCtx.createGain();
  pulseGain.gain.value = 1;
  pulse.connect(pulseShaper);
  pulseShaper.connect(pulseGain.gain);

  const carrier = offlineCtx.createOscillator();
  carrier.type = 'sawtooth';
  carrier.frequency.value = carrierFreq;
  
  const filter = offlineCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1200;
  filter.Q.value = 20;

  const delay = offlineCtx.createDelay(0.5);
  delay.delayTime.value = 0.25;
  const feedback = offlineCtx.createGain();
  feedback.gain.value = 0.6;
  
  const mainGain = offlineCtx.createGain();
  mainGain.gain.value = 0.15;
  
  carrier.connect(pulseGain);
  pulseGain.connect(filter);
  filter.connect(mainGain);

  filter.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay);
  
  delay.connect(mainGain);
  
  mainGain.connect(offlineCtx.destination);
  
  pulse.start(0);
  carrier.start(0);
  
  return await offlineCtx.startRendering();
}

export async function generateQuasar(audioContext, duration) {
    const offlineCtx = new OfflineAudioContext(2, audioContext.sampleRate * duration, audioContext.sampleRate);

    function createShimmer(freq) {
        const osc = offlineCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;

        const lfo = offlineCtx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = Math.random() * 0.2 + 0.05;

        const lfoGain = offlineCtx.createGain();
        lfoGain.gain.value = Math.random() * 5;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.detune);
        
        lfo.start(0);
        return osc;
    }
    
    const freqs = [60, 62, 120, 123, 240, 245];
    const sources = freqs.map(createShimmer);

    const convolver = offlineCtx.createConvolver();
    const impulseSize = offlineCtx.sampleRate * 4;
    const impulse = offlineCtx.createBuffer(2, impulseSize, offlineCtx.sampleRate);
    const impulseL = impulse.getChannelData(0);
    const impulseR = impulse.getChannelData(1);
    for (let i = 0; i < impulseSize; i++) {
        const t = i / impulseSize;
        impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 4);
        impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 4);
    }
    convolver.buffer = impulse;

    sources.forEach(source => {
        const gain = offlineCtx.createGain();
        gain.gain.value = 0.1 / freqs.length;
        const panner = offlineCtx.createStereoPanner();
        panner.pan.value = Math.random() * 2 - 1;

        source.connect(gain);
        gain.connect(panner);
        panner.connect(convolver);
        source.start(0);
    });
    
    convolver.connect(offlineCtx.destination);
  
    return await offlineCtx.startRendering();
}


export async function generateRainSound(audioContext, duration) {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    let output = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
    }
    return buffer;
}


export async function generateBlackHoleSound(audioContext, duration) {
    const offlineCtx = new OfflineAudioContext(2, audioContext.sampleRate * duration, audioContext.sampleRate);

    // Deep, throbbing drone inspired by NASA sonification
    const fundamental = 30; // low audible hum
    const drone = offlineCtx.createOscillator();
    drone.type = 'sine';
    drone.frequency.value = fundamental;

    const tremolo = offlineCtx.createOscillator();
    tremolo.type = 'sine';
    tremolo.frequency.value = 0.05; // Extremely slow, represents pressure waves
    const tremoloGain = offlineCtx.createGain();
    tremoloGain.gain.value = 0.5;
    
    const droneGain = offlineCtx.createGain();
    droneGain.gain.setValueAtTime(0.5, 0);
    
    tremolo.connect(tremoloGain);
    tremoloGain.connect(droneGain.gain);

    // Brown noise for the hot gas of the cluster
    const bufferSize = offlineCtx.sampleRate * duration;
    const noiseBuffer = offlineCtx.createBuffer(1, bufferSize, offlineCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
    }
    const noise = offlineCtx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const noiseFilter = offlineCtx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 150;
    
    const noiseLfo = offlineCtx.createOscillator();
    noiseLfo.type = 'sine';
    noiseLfo.frequency.value = 0.1;
    const noiseLfoGain = offlineCtx.createGain();
    noiseLfoGain.gain.value = 50;
    noiseLfo.connect(noiseLfoGain);
    noiseLfoGain.connect(noiseFilter.frequency);
    
    const noiseGain = offlineCtx.createGain();
    noiseGain.gain.value = 0.2;

    // Massive reverb to simulate the vastness of space
    const convolver = offlineCtx.createConvolver();
    const impulseSize = offlineCtx.sampleRate * 6;
    const impulse = offlineCtx.createBuffer(2, impulseSize, offlineCtx.sampleRate);
    const impulseL = impulse.getChannelData(0);
    const impulseR = impulse.getChannelData(1);
    for (let i = 0; i < impulseSize; i++) {
        const t = i / impulseSize;
        impulseL[i] = (Math.random() - 0.5) * Math.pow(1 - t, 5);
        impulseR[i] = (Math.random() - 0.5) * Math.pow(1 - t, 5);
    }
    convolver.buffer = impulse;
    
    // Connections
    drone.connect(droneGain);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);

    droneGain.connect(convolver);
    noiseGain.connect(convolver);
    
    convolver.connect(offlineCtx.destination);

    // Start everything
    drone.start(0);
    tremolo.start(0);
    noise.start(0);
    noiseLfo.start(0);

    return await offlineCtx.startRendering();
}