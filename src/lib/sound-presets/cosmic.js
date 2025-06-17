
import { renderWithGain, createBrownNoiseBuffer, createImpulseResponse, createPinkNoiseBuffer } from './helpers';

export async function generatePulsar(audioContext, duration) {
  return renderWithGain(audioContext, duration, (offlineCtx, masterGain) => {
    const pulseFreq = 0.8 + Math.random() * 1.0; 
    const carrierFreq = 400 + Math.random() * 200; 

    const pulseEnv = offlineCtx.createGain();
    pulseEnv.gain.setValueAtTime(0, 0);
    
    const pulseOsc = offlineCtx.createOscillator();
    pulseOsc.type = 'sine'; 
    pulseOsc.frequency.value = pulseFreq;
    
    const envelopeShaper = offlineCtx.createWaveShaper();
    const curve = new Float32Array([0, 0.6, 1, 0.6, 0]); 
    envelopeShaper.curve = curve;
    pulseOsc.connect(envelopeShaper);
    envelopeShaper.connect(pulseEnv.gain);
    
    const carrier = offlineCtx.createOscillator();
    carrier.type = 'triangle'; 
    carrier.frequency.value = carrierFreq;
    carrier.connect(pulseEnv);

    const filter = offlineCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = carrierFreq;
    filter.Q.value = 15 + Math.random() * 10; 
    pulseEnv.connect(filter);

    const delay = offlineCtx.createDelay(1.2); 
    delay.delayTime.value = 0.5 + Math.random() * 0.4;
    const feedback = offlineCtx.createGain();
    feedback.gain.value = 0.35 + Math.random() * 0.15; 
    
    filter.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    
    filter.connect(masterGain);
    delay.connect(masterGain);
    
    pulseOsc.start(0);
    carrier.start(0);
  }, 0.09); 
}

export async function generateQuasar(audioContext, duration) {
    return renderWithGain(audioContext, duration, (offlineCtx, masterGain) => {
        function createDroneLayer(baseFreq, numPartials, detuneRange, pan) {
            const layerGain = offlineCtx.createGain();
            layerGain.gain.setValueAtTime(0,0);
            layerGain.gain.linearRampToValueAtTime(1 / numPartials * 0.35, duration * 0.5); 
            layerGain.gain.setValueAtTime(1 / numPartials * 0.35, duration * 0.85);
            layerGain.gain.linearRampToValueAtTime(0, duration);

            const pannerNode = offlineCtx.createStereoPanner();
            pannerNode.pan.value = pan;
            pannerNode.connect(layerGain);

            for (let i = 0; i < numPartials; i++) {
                const osc = offlineCtx.createOscillator();
                osc.type = 'sine';
                const freq = baseFreq * (i + 1);
                osc.frequency.value = freq;
                osc.detune.value = (Math.random() * 2 - 1) * detuneRange * freq * 0.8; 

                const lfo = offlineCtx.createOscillator();
                lfo.type = 'sine';
                lfo.frequency.value = Math.random() * 0.06 + 0.005; 
                const lfoGain = offlineCtx.createGain();
                lfoGain.gain.value = Math.random() * 10 + 3; 
                lfo.connect(lfoGain);
                lfoGain.connect(osc.detune);
                
                osc.connect(pannerNode);
                osc.start(0);
                lfo.start(0);
            }
            return layerGain;
        }
        
        const layer1 = createDroneLayer(25, 5, 0.01, -0.6); 
        const layer2 = createDroneLayer(100, 3, 0.006, 0.6); 
        
        const convolver = offlineCtx.createConvolver();
        convolver.buffer = createImpulseResponse(offlineCtx, 7 + Math.random() * 3, 4.5, true); 


        layer1.connect(convolver);
        layer2.connect(convolver);
        convolver.connect(masterGain);
    }, 0.07); 
}

export async function generateBlackHoleSound(audioContext, duration) {
    return renderWithGain(audioContext, duration, (offlineCtx, masterGain) => {
        const fundamental = 12 + Math.random() * 6; 
        const drone = offlineCtx.createOscillator();
        drone.type = 'sine';
        drone.frequency.value = fundamental;

        const subHarmonic = offlineCtx.createOscillator();
        subHarmonic.type = 'sine';
        subHarmonic.frequency.value = fundamental / (2.5 + Math.random()*0.5); 
        const subGain = offlineCtx.createGain();
        subGain.gain.value = 0.5; 
        subHarmonic.connect(subGain);

        const tremolo = offlineCtx.createOscillator();
        tremolo.type = 'sine';
        tremolo.frequency.value = 0.015 + Math.random() * 0.02; 
        const tremoloGainMod = offlineCtx.createGain();
        tremoloGainMod.gain.value = 0.25 + Math.random() * 0.1; 
        
        const droneGain = offlineCtx.createGain();
        droneGain.gain.setValueAtTime(0.2, 0); 
        
        tremolo.connect(tremoloGainMod);
        tremoloGainMod.connect(droneGain.gain);
       
        const noiseSource = offlineCtx.createBufferSource();
        noiseSource.buffer = createBrownNoiseBuffer(offlineCtx, duration);
        noiseSource.loop = true;

        const noiseFilter = offlineCtx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.value = 50 + Math.random() * 25; 
        
        const noiseLfo = offlineCtx.createOscillator();
        noiseLfo.type = 'sine';
        noiseLfo.frequency.value = 0.025 + Math.random() * 0.03;
        const noiseLfoGain = offlineCtx.createGain();
        noiseLfoGain.gain.value = 15 + Math.random() * 10;
        noiseLfo.connect(noiseLfoGain);
        noiseLfoGain.connect(noiseFilter.Q); 
        
        const noiseSourceGain = offlineCtx.createGain();
        noiseSourceGain.gain.value = 0.035; 

        const convolver = offlineCtx.createConvolver();
        convolver.buffer = createImpulseResponse(offlineCtx, 9 + Math.random() * 5, 5.0 + Math.random() * 2.0, true); 
        
        drone.connect(droneGain);
        subGain.connect(droneGain); 
        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseSourceGain);

        droneGain.connect(convolver);
        noiseSourceGain.connect(convolver);
        
        convolver.connect(masterGain);

        drone.start(0);
        subHarmonic.start(0);
        tremolo.start(0);
        noiseSource.start(0);
        noiseLfo.start(0);
    }, 0.18); 
}

export async function generateSynthesizedAurora(audioContext, duration) {
    return renderWithGain(audioContext, duration, (offlineCtx, masterGain) => {
        const numLayers = 3 + Math.floor(Math.random() * 3); // 3-5 layers
        for (let i = 0; i < numLayers; i++) {
            const osc = offlineCtx.createOscillator();
            osc.type = 'sine';
            
            const baseFreq = 400 + Math.random() * 800; // Higher frequencies for shimmering
            const freqLfo = offlineCtx.createOscillator();
            freqLfo.type = 'sine';
            freqLfo.frequency.value = 0.1 + Math.random() * 0.3; // Slow frequency modulation
            const freqLfoGain = offlineCtx.createGain();
            freqLfoGain.gain.value = baseFreq * (0.2 + Math.random() * 0.3); // Modulation depth
            freqLfo.connect(freqLfoGain);
            freqLfoGain.connect(osc.frequency);
            osc.frequency.value = baseFreq;

            const ampEnv = offlineCtx.createGain();
            ampEnv.gain.setValueAtTime(0, 0);
            const attackTime = duration * (0.1 + Math.random() * 0.2);
            const sustainTime = duration * (0.4 + Math.random() * 0.3);
            const releaseTime = duration - attackTime - sustainTime;
            ampEnv.gain.linearRampToValueAtTime(0.03 + Math.random() * 0.02, offlineCtx.currentTime + attackTime); // Low gain per layer
            ampEnv.gain.setValueAtTime(ampEnv.gain.value, offlineCtx.currentTime + attackTime + sustainTime);
            ampEnv.gain.linearRampToValueAtTime(0, offlineCtx.currentTime + duration);

            const panner = offlineCtx.createStereoPanner();
            panner.pan.value = Math.random() * 2 - 1; // Full stereo panning

            osc.connect(ampEnv);
            ampEnv.connect(panner);
            panner.connect(masterGain);

            osc.start(0);
            freqLfo.start(0);
        }
        const reverb = offlineCtx.createConvolver();
        reverb.buffer = createImpulseResponse(offlineCtx, 3 + Math.random() * 2, 2 + Math.random(), false);
        masterGain.connect(reverb); // Connect original masterGain to reverb input
        
        const reverbGain = offlineCtx.createGain(); // New gain for reverb output
        reverbGain.gain.value = 0.4; // Adjust reverb wetness
        reverb.connect(reverbGain);
        reverbGain.connect(offlineCtx.destination); // Reverb output to final destination
        masterGain.connect(offlineCtx.destination); // Dry signal also to destination

    }, 0.05); // Overall gain is low because layers add up
}

export async function generateSolarWind(audioContext, duration) {
    return renderWithGain(audioContext, duration, (offlineCtx, masterGain) => {
        const noiseSource = offlineCtx.createBufferSource();
        noiseSource.buffer = createPinkNoiseBuffer(offlineCtx, duration);
        noiseSource.loop = true;

        const bandpassFilter = offlineCtx.createBiquadFilter();
        bandpassFilter.type = 'bandpass';
        bandpassFilter.frequency.value = 2000 + Math.random() * 2000; // High frequency focus
        bandpassFilter.Q.value = 10 + Math.random() * 10; // High Q for whistling

        const filterLfo = offlineCtx.createOscillator();
        filterLfo.type = 'sine';
        filterLfo.frequency.value = 0.2 + Math.random() * 0.5; // Fluctuations
        const filterLfoGain = offlineCtx.createGain();
        filterLfoGain.gain.value = 800 + Math.random() * 500; // Modulation depth for filter freq
        filterLfo.connect(filterLfoGain);
        filterLfoGain.connect(bandpassFilter.frequency);

        const crackleEnv = offlineCtx.createGain();
        crackleEnv.gain.value = 0;
        const numCrackles = Math.floor(duration * 5);
        for (let i = 0; i < numCrackles; i++) {
            const t = Math.random() * duration;
            crackleEnv.gain.setValueAtTime(0.005 + Math.random() * 0.005, t); // Tiny gain for crackles
            crackleEnv.gain.setValueAtTime(0, t + 0.01 + Math.random() * 0.02);
        }
        
        noiseSource.connect(bandpassFilter);
        bandpassFilter.connect(crackleEnv); // Noise through crackle envelope
        crackleEnv.connect(masterGain);

        noiseSource.start(0);
        filterLfo.start(0);
    }, 0.06);
}
