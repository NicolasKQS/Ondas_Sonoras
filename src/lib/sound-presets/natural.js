
import { renderWithGain, createPinkNoiseBuffer, createBrownNoiseBuffer, createImpulseResponse } from './helpers';

// --- ADVANCED RAIN SOUND GENERATION ---
async function generateAdvancedRain(offlineCtx, duration) {
    const masterRainGain = offlineCtx.createGain();
    masterRainGain.gain.value = 0; 

    const pinkNoiseBuffer = createPinkNoiseBuffer(offlineCtx, duration);
    const mainRainSource = offlineCtx.createBufferSource();
    mainRainSource.buffer = pinkNoiseBuffer;
    mainRainSource.loop = true;

    const mainRainFilter = offlineCtx.createBiquadFilter();
    mainRainFilter.type = 'highpass';
    mainRainFilter.frequency.value = 1800 + Math.random() * 400; 
    mainRainFilter.Q.value = 1.0 + Math.random() * 0.5;

    const mainRainGain = offlineCtx.createGain();
    mainRainGain.gain.value = 0.025 + Math.random() * 0.01; 

    mainRainSource.connect(mainRainFilter);
    mainRainFilter.connect(mainRainGain);
    mainRainGain.connect(masterRainGain);

    const intensityLfo = offlineCtx.createOscillator();
    intensityLfo.type = 'sine';
    intensityLfo.frequency.value = 0.15 + Math.random() * 0.2; 
    const intensityLfoGain = offlineCtx.createGain();
    intensityLfoGain.gain.value = 0.008 + Math.random() * 0.005; 
    intensityLfo.connect(intensityLfoGain);
    intensityLfoGain.connect(mainRainGain.gain, offlineCtx.currentTime + 0.01);

    const numDropsLayers = 2;
    for(let layer = 0; layer < numDropsLayers; layer++) {
        const dropInterval = 0.05 + Math.random() * 0.15; 
        let currentTime = Math.random() * dropInterval;
        while(currentTime < duration) {
            const dropSource = offlineCtx.createOscillator();
            dropSource.type = 'triangle'; 
            const dropFreq = 1500 + Math.random() * 2000;
            dropSource.frequency.setValueAtTime(dropFreq, currentTime);
            
            const dropEnv = offlineCtx.createGain();
            dropEnv.gain.setValueAtTime(0, currentTime);
            dropEnv.gain.linearRampToValueAtTime(0.003 + Math.random()*0.002, currentTime + 0.005); 
            dropEnv.gain.exponentialRampToValueAtTime(0.00001, currentTime + 0.03 + Math.random() * 0.05); 
            
            const dropPanner = offlineCtx.createStereoPanner();
            dropPanner.pan.value = Math.random() * 1.4 - 0.7; 

            dropSource.connect(dropEnv);
            dropEnv.connect(dropPanner);
            dropPanner.connect(masterRainGain);

            dropSource.start(currentTime);
            dropSource.stop(currentTime + 0.1);
            currentTime += dropInterval + (Math.random() - 0.5) * dropInterval * 0.3;
        }
    }
    
    mainRainSource.start(0);
    intensityLfo.start(0);
    
    masterRainGain.gain.linearRampToValueAtTime(1.0, offlineCtx.currentTime + duration * 0.05); 
    masterRainGain.gain.setValueAtTime(1.0, offlineCtx.currentTime + duration * 0.9);
    masterRainGain.gain.linearRampToValueAtTime(0, offlineCtx.currentTime + duration); 
    
    return masterRainGain;
}

// --- ADVANCED BIRD SOUNDS ---
async function generateForestAmbiance(offlineCtx, duration, masterGainNode) {
    const numBirdCallTypes = 2 + Math.floor(Math.random()*2); 

    for (let type = 0; type < numBirdCallTypes; type++) {
        const callsInDuration = Math.floor(duration / (5 + Math.random() * 7)); 
        const baseBirdFreq = 1200 + Math.random() * 2000;
        const chirpPatternLength = 2 + Math.floor(Math.random()*3); 

        for (let i = 0; i < callsInDuration; i++) {
            const callStartTime = Math.random() * (duration - 2) + 1; 
            let currentChirpTime = callStartTime;

            for (let chirp = 0; chirp < chirpPatternLength; chirp++) {
                if (currentChirpTime > duration - 0.5) break; 

                const birdOsc = offlineCtx.createOscillator();
                const birdEnv = offlineCtx.createGain();
                const panner = offlineCtx.createStereoPanner();
                panner.pan.value = Math.random() * 1.8 - 0.9; 

                birdOsc.type = Math.random() > 0.4 ? 'sine' : 'triangle';
                const freqVariation = (Math.random() * 800 - 400) * (type + 1) * 0.5; 
                const chirpPitch = baseBirdFreq + freqVariation;
                const chirpDur = 0.08 + Math.random() * 0.15;

                birdOsc.frequency.setValueAtTime(chirpPitch, currentChirpTime);
                birdOsc.frequency.linearRampToValueAtTime(chirpPitch + (Math.random() * 300 - 150), currentChirpTime + chirpDur * 0.6);
                birdOsc.frequency.setValueAtTime(chirpPitch, currentChirpTime + chirpDur);

                birdEnv.gain.setValueAtTime(0, currentChirpTime);
                birdEnv.gain.linearRampToValueAtTime(0.008 + Math.random() * 0.005, currentChirpTime + chirpDur * 0.1); 
                birdEnv.gain.exponentialRampToValueAtTime(0.00005, currentChirpTime + chirpDur);
                
                birdOsc.connect(birdEnv);
                birdEnv.connect(panner);
                panner.connect(masterGainNode); 
                
                birdOsc.start(currentChirpTime);
                birdOsc.stop(currentChirpTime + chirpDur + 0.05);
                currentChirpTime += chirpDur + (0.1 + Math.random() * 0.3); 
            }
        }
    }

    const insectNoiseBuffer = createPinkNoiseBuffer(offlineCtx, duration);
    const insectSource = offlineCtx.createBufferSource();
    insectSource.buffer = insectNoiseBuffer;
    insectSource.loop = true;

    const insectFilter = offlineCtx.createBiquadFilter();
    insectFilter.type = 'bandpass';
    insectFilter.frequency.value = 3000 + Math.random()*1000;
    insectFilter.Q.value = 10 + Math.random()*5;

    const insectGain = offlineCtx.createGain();
    insectGain.gain.value = 0.0008 + Math.random()*0.0005; 

    const insectLfo = offlineCtx.createOscillator(); 
    insectLfo.type = 'square';
    insectLfo.frequency.value = 4 + Math.random()*3;
    const insectLfoGain = offlineCtx.createGain();
    insectLfoGain.gain.value = 0.0003;
    insectLfo.connect(insectLfoGain);
    insectLfoGain.connect(insectGain.gain, offlineCtx.currentTime + 0.02);

    insectSource.connect(insectFilter);
    insectFilter.connect(insectGain);
    insectGain.connect(masterGainNode);
    insectSource.start(0);
    insectLfo.start(0);
}


export async function generateRainforestSound(audioContext, duration) {
  return renderWithGain(audioContext, duration, async (offlineCtx, masterGain) => {
    const rainNode = await generateAdvancedRain(offlineCtx, duration); 
    const rainMasterGain = offlineCtx.createGain();
    rainMasterGain.gain.value = 0.55; 
    rainNode.connect(rainMasterGain);
    rainMasterGain.connect(masterGain);

    await generateForestAmbiance(offlineCtx, duration, masterGain); 

    const windNoiseBuffer = createPinkNoiseBuffer(offlineCtx, duration);
    const windSource = offlineCtx.createBufferSource();
    windSource.buffer = windNoiseBuffer;
    windSource.loop = true;
    
    const windFilter = offlineCtx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.value = 500 + Math.random()*200;
    windFilter.Q.value = 1.5 + Math.random();

    const windLfo = offlineCtx.createOscillator();
    windLfo.type = 'sine';
    windLfo.frequency.value = 0.08 + Math.random()*0.07; 
    const windLfoGain = offlineCtx.createGain();
    windLfoGain.gain.value = 150 + Math.random()*100;
    windLfo.connect(windLfoGain);
    windLfoGain.connect(windFilter.frequency);

    const windGain = offlineCtx.createGain();
    windGain.gain.value = 0.003 + Math.random()*0.002; 

    windSource.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(masterGain);

    windSource.start(0);
    windLfo.start(0);

  }, 0.3); 
}


export async function generateSecureThunderstormSound(audioContext, duration) {
    return renderWithGain(audioContext, duration, async (offlineCtx, masterGain) => {
        const rainNode = await generateAdvancedRain(offlineCtx, duration); 
        const rainMasterGain = offlineCtx.createGain();
        rainMasterGain.gain.value = 0.7; 
        rainNode.connect(rainMasterGain);
        rainMasterGain.connect(masterGain);

        const numThunders = Math.floor(duration / (7 + Math.random()*5)) + 2; 
        for (let i = 0; i < numThunders; i++) {
            const thunderStartTime = Math.random() * (duration - 4) + 2; 
            const thunderDuration = 2.5 + Math.random() * 2.5; 

            const rumbleSource = offlineCtx.createBufferSource();
            rumbleSource.buffer = createBrownNoiseBuffer(offlineCtx, thunderDuration);
            const rumbleFilter = offlineCtx.createBiquadFilter();
            rumbleFilter.type = 'lowpass';
            rumbleFilter.frequency.setValueAtTime(40 + Math.random() * 30, thunderStartTime);
            rumbleFilter.frequency.linearRampToValueAtTime(20, thunderStartTime + thunderDuration * 0.7);
            rumbleFilter.Q.value = 0.5 + Math.random() * 0.5;
            const rumbleGain = offlineCtx.createGain();
            rumbleGain.gain.setValueAtTime(0, thunderStartTime);
            rumbleGain.gain.linearRampToValueAtTime(0.12 + Math.random() * 0.08, thunderStartTime + 0.3 + Math.random() * 0.3); 
            rumbleGain.gain.exponentialRampToValueAtTime(0.0001, thunderStartTime + thunderDuration); 
            
            rumbleSource.connect(rumbleFilter);
            rumbleFilter.connect(rumbleGain);
            
            if (Math.random() > 0.4) {
                const clapSource = offlineCtx.createOscillator();
                clapSource.type = 'sawtooth'; 
                const clapFreq = 100 + Math.random() * 150;
                clapSource.frequency.setValueAtTime(clapFreq, thunderStartTime);
                clapSource.frequency.exponentialRampToValueAtTime(clapFreq * 0.3, thunderStartTime + 0.05);

                const clapFilter = offlineCtx.createBiquadFilter();
                clapFilter.type = 'bandpass';
                clapFilter.frequency.value = 800 + Math.random()*400;
                clapFilter.Q.value = 1 + Math.random();

                const clapEnv = offlineCtx.createGain();
                clapEnv.gain.setValueAtTime(0, thunderStartTime);
                clapEnv.gain.linearRampToValueAtTime(0.05 + Math.random()*0.03, thunderStartTime + 0.005 + Math.random()*0.005); 
                clapEnv.gain.exponentialRampToValueAtTime(0.00001, thunderStartTime + 0.15 + Math.random()*0.1); 

                clapSource.connect(clapFilter);
                clapFilter.connect(clapEnv);
                clapEnv.connect(masterGain); 
                clapSource.start(thunderStartTime);
                clapSource.stop(thunderStartTime + 0.3);
            }

            const panner = offlineCtx.createStereoPanner();
            panner.pan.value = Math.random() * 1.0 - 0.5; 

            rumbleGain.connect(panner);
            panner.connect(masterGain);
            rumbleSource.start(thunderStartTime);
        }

        const windNoiseBuffer = createPinkNoiseBuffer(offlineCtx, duration);
        const windSource = offlineCtx.createBufferSource();
        windSource.buffer = windNoiseBuffer;
        windSource.loop = true;
        
        const windFilterHigh = offlineCtx.createBiquadFilter(); 
        windFilterHigh.type = 'bandpass';
        windFilterHigh.frequency.value = 1500;
        windFilterHigh.Q.value = 3 + Math.random();
        const windFilterLow = offlineCtx.createBiquadFilter(); 
        windFilterLow.type = 'lowpass';
        windFilterLow.frequency.value = 300;
        
        const windLfo = offlineCtx.createOscillator();
        windLfo.type = 'sine';
        windLfo.frequency.value = 0.1 + Math.random()*0.15; 
        const windLfoGainHigh = offlineCtx.createGain();
        windLfoGainHigh.gain.value = 800 + Math.random()*400;
        windLfo.connect(windLfoGainHigh);
        windLfoGainHigh.connect(windFilterHigh.frequency);

        const windLfoGainLow = offlineCtx.createGain();
        windLfoGainLow.gain.value = 100 + Math.random()*50;
        windLfo.connect(windLfoGainLow); 
        windLfoGainLow.connect(windFilterLow.frequency);


        const windGain = offlineCtx.createGain();
        windGain.gain.value = 0; 
        windGain.gain.linearRampToValueAtTime(0.015 + Math.random()*0.01, offlineCtx.currentTime + duration * 0.2); 
        windGain.gain.setValueAtTime(0.015 + Math.random()*0.01, offlineCtx.currentTime + duration * 0.8);
        windGain.gain.linearRampToValueAtTime(0, offlineCtx.currentTime + duration);


        windSource.connect(windFilterHigh);
        windSource.connect(windFilterLow); 
        windFilterHigh.connect(windGain);
        windFilterLow.connect(windGain);
        windGain.connect(masterGain);

        windSource.start(0);
        windLfo.start(0);

    }, 0.25); 
}

export async function generateWhaleSong(audioContext, duration) {
    return renderWithGain(audioContext, duration, (offlineCtx, masterGain) => {
        const numCalls = Math.floor(duration / (4 + Math.random() * 4)); // Calls every 4-8 seconds
        for (let i = 0; i < numCalls; i++) {
            const callTime = Math.random() * (duration - 3) + 1; // Ensure call finishes
            const callDuration = 1.5 + Math.random() * 2.5;

            const osc = offlineCtx.createOscillator();
            osc.type = Math.random() > 0.3 ? 'sine' : 'triangle'; // Mostly sine for smoothness

            const startFreq = 50 + Math.random() * 100; // Low frequencies
            const endFreq = startFreq + (Math.random() * 100 - 50); // Slight pitch bend up or down
            osc.frequency.setValueAtTime(startFreq, callTime);
            osc.frequency.linearRampToValueAtTime(endFreq, callTime + callDuration * 0.7);
            osc.frequency.setValueAtTime(startFreq * (0.8 + Math.random()*0.4), callTime + callDuration); // End with a slight variation

            const env = offlineCtx.createGain();
            env.gain.setValueAtTime(0, callTime);
            env.gain.linearRampToValueAtTime(0.1 + Math.random() * 0.05, callTime + callDuration * 0.2); // Slow attack
            env.gain.setValueAtTime(env.gain.value, callTime + callDuration * 0.8);
            env.gain.linearRampToValueAtTime(0, callTime + callDuration);

            const panner = offlineCtx.createStereoPanner();
            panner.pan.value = Math.random() * 1.2 - 0.6; // Moderate panning

            osc.connect(env);
            env.connect(panner);
            panner.connect(masterGain);

            osc.start(callTime);
            osc.stop(callTime + callDuration + 0.2);
        }

        const convolver = offlineCtx.createConvolver();
        convolver.buffer = createImpulseResponse(offlineCtx, 4 + Math.random() * 3, 3 + Math.random() * 2, false); // Long, spacious reverb
        masterGain.connect(convolver);
        const reverbGain = offlineCtx.createGain();
        reverbGain.gain.value = 0.6; // More reverb
        convolver.connect(reverbGain);
        reverbGain.connect(offlineCtx.destination);
        masterGain.connect(offlineCtx.destination); // Dry signal

    }, 0.1); // Overall gain
}

export async function generateGeyserRhythm(audioContext, duration) {
    return renderWithGain(audioContext, duration, (offlineCtx, masterGain) => {
        const baseInterval = 3 + Math.random() * 3; // Time between main eruptions
        let currentTime = 1 + Math.random();

        while (currentTime < duration - 2) {
            // Steam hiss build-up
            const hissDuration = 0.5 + Math.random() * 1;
            const hissSource = offlineCtx.createBufferSource();
            hissSource.buffer = createPinkNoiseBuffer(offlineCtx, hissDuration);
            const hissFilter = offlineCtx.createBiquadFilter();
            hissFilter.type = 'highpass';
            hissFilter.frequency.value = 1500 + Math.random() * 1000;
            const hissEnv = offlineCtx.createGain();
            hissEnv.gain.setValueAtTime(0, currentTime);
            hissEnv.gain.linearRampToValueAtTime(0.02 + Math.random() * 0.01, currentTime + hissDuration * 0.3);
            hissEnv.gain.setValueAtTime(hissEnv.gain.value, currentTime + hissDuration * 0.7);
            hissEnv.gain.linearRampToValueAtTime(0, currentTime + hissDuration);
            
            hissSource.connect(hissFilter);
            hissFilter.connect(hissEnv);
            hissEnv.connect(masterGain);
            hissSource.start(currentTime);
            
            // Main eruption burst
            const burstTime = currentTime + hissDuration * (0.6 + Math.random()*0.2);
            const burstDuration = 0.3 + Math.random() * 0.4;
            const burstSource = offlineCtx.createBufferSource();
            burstSource.buffer = createBrownNoiseBuffer(offlineCtx, burstDuration); // Use brown for deeper rumble
            const burstFilter = offlineCtx.createBiquadFilter();
            burstFilter.type = 'lowpass';
            burstFilter.frequency.value = 300 + Math.random() * 200;
            burstFilter.Q.value = 1 + Math.random();
            const burstEnv = offlineCtx.createGain();
            burstEnv.gain.setValueAtTime(0, burstTime);
            burstEnv.gain.linearRampToValueAtTime(0.25 + Math.random() * 0.1, burstTime + burstDuration * 0.1); // Quick attack
            burstEnv.gain.exponentialRampToValueAtTime(0.001, burstTime + burstDuration);

            const panner = offlineCtx.createStereoPanner();
            panner.pan.value = Math.random() * 0.6 - 0.3; // Slightly panned

            burstSource.connect(burstFilter);
            burstFilter.connect(burstEnv);
            burstEnv.connect(panner);
            panner.connect(masterGain);
            burstSource.start(burstTime);

            currentTime += baseInterval + (Math.random() - 0.5) * baseInterval * 0.3;
        }
        const reverb = offlineCtx.createConvolver();
        reverb.buffer = createImpulseResponse(offlineCtx, 1.5 + Math.random(), 1 + Math.random()*0.5, false); // Shorter, more percussive reverb
        masterGain.connect(reverb);
        const reverbGain = offlineCtx.createGain();
        reverbGain.gain.value = 0.25;
        reverb.connect(reverbGain);
        reverbGain.connect(offlineCtx.destination);
        masterGain.connect(offlineCtx.destination);

    }, 0.2);
}
