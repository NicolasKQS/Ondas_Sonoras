
import { renderWithGain, createPinkNoiseBuffer } from './helpers';

export async function generateJupiterRadio(audioContext, duration) {
  return renderWithGain(audioContext, duration, (offlineCtx, masterGain) => {
    const numEvents = Math.floor(duration * 2); 
    for (let i = 0; i < numEvents; i++) {
      const eventTime = Math.random() * duration;
      const isWhistler = Math.random() > 0.4;

      const osc = offlineCtx.createOscillator();
      const env = offlineCtx.createGain();
      
      const panner = offlineCtx.createStereoPanner();
      panner.pan.value = Math.random() * 1.4 - 0.7; // Add panning

      osc.connect(env);
      env.connect(panner);
      panner.connect(masterGain);


      env.gain.setValueAtTime(0, eventTime);
      env.gain.linearRampToValueAtTime(0.25 + Math.random() * 0.15, eventTime + 0.01); 

      if (isWhistler) { 
        osc.type = 'sine';
        const startFreq = 1000 + Math.random() * 2000;
        const endFreq = 100 + Math.random() * 500;
        osc.frequency.setValueAtTime(startFreq, eventTime);
        osc.frequency.exponentialRampToValueAtTime(endFreq, eventTime + 0.3 + Math.random() * 0.4);
        env.gain.exponentialRampToValueAtTime(0.001, eventTime + 0.4 + Math.random() * 0.5);
      } else { 
        osc.type = 'sawtooth';
        const burstFreq = 500 + Math.random() * 1500;
        osc.frequency.setValueAtTime(burstFreq, eventTime);
        osc.frequency.setValueAtTime(burstFreq * (1 + (Math.random()-0.5)*0.2) , eventTime + 0.05); 
        env.gain.exponentialRampToValueAtTime(0.001, eventTime + 0.05 + Math.random() * 0.05);
      }
      osc.start(eventTime);
      osc.stop(eventTime + 1.0); 
    }
  }, 0.08); 
}

export async function generateCMBSound(audioContext, duration) {
  return renderWithGain(audioContext, duration, (offlineCtx, masterGain) => {
    const noise = offlineCtx.createBufferSource();
    noise.buffer = createPinkNoiseBuffer(offlineCtx, duration); // Use helper for pink noise
    noise.loop = true;

    const filter = offlineCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 250; 
    filter.Q.value = 0.6;

    const lfo = offlineCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.015; 
    const lfoGain = offlineCtx.createGain();
    lfoGain.gain.value = 40;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    noise.connect(filter);
    filter.connect(masterGain);
    noise.start(0);
    lfo.start(0);
  }, 0.05); 
}

export async function generateMarsQuakeSounds(audioContext, duration) {
  return renderWithGain(audioContext, duration, (offlineCtx, masterGain) => {
    const numRumbles = Math.floor(duration / 2.5); // Slightly more frequent
    for (let i = 0; i < numRumbles; i++) {
      const rumbleTime = Math.random() * (duration - 1.5) + 0.5;
      
      const rumbleOsc = offlineCtx.createOscillator();
      rumbleOsc.type = 'sine';
      const baseFreq = 15 + Math.random() * 15;
      rumbleOsc.frequency.setValueAtTime(baseFreq, rumbleTime);
      rumbleOsc.frequency.linearRampToValueAtTime(baseFreq * 0.6, rumbleTime + 1.2 + Math.random()*0.5);

      const rumbleEnv = offlineCtx.createGain();
      rumbleEnv.gain.setValueAtTime(0, rumbleTime);
      rumbleEnv.gain.linearRampToValueAtTime(0.35 + Math.random() * 0.15, rumbleTime + 0.25 + Math.random()*0.15);
      rumbleEnv.gain.exponentialRampToValueAtTime(0.001, rumbleTime + 1.8 + Math.random() * 1.2);
      
      const panner = offlineCtx.createStereoPanner();
      panner.pan.value = Math.random() * 0.8 - 0.4;

      rumbleOsc.connect(rumbleEnv);
      rumbleEnv.connect(panner);
      panner.connect(masterGain);
      rumbleOsc.start(rumbleTime);
      rumbleOsc.stop(rumbleTime + 3.5);

      if (Math.random() > 0.5) { // Increased chance of pings
        const pingTime = rumbleTime + Math.random() * 0.3;
        const pingOsc = offlineCtx.createOscillator();
        pingOsc.type = 'triangle';
        pingOsc.frequency.value = 600 + Math.random() * 1000;
        
        const pingEnv = offlineCtx.createGain();
        pingEnv.gain.setValueAtTime(0, pingTime);
        pingEnv.gain.linearRampToValueAtTime(0.08 + Math.random() * 0.07, pingTime + 0.004);
        pingEnv.gain.exponentialRampToValueAtTime(0.001, pingTime + 0.08 + Math.random() * 0.08);
        
        const pingPanner = offlineCtx.createStereoPanner();
        pingPanner.pan.value = Math.random() * 1.2 - 0.6;

        pingOsc.connect(pingEnv);
        pingEnv.connect(pingPanner);
        pingPanner.connect(masterGain);
        pingOsc.start(pingTime);
        pingOsc.stop(pingTime + 0.25);
      }
    }
  }, 0.12);
}
