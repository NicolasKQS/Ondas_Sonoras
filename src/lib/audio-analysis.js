
export const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
export const A4 = 440;
export const MIN_FREQ_FOR_NOTE = 20; 
export const MAX_FREQ_FOR_NOTE = 5000; 
const FUNDAMENTAL_MIN_DB_THRESHOLD_RATIO = 0.35; // Relative to minDecibels
const HARMONIC_MIN_DB_THRESHOLD_RATIO = 0.20; // Relative to minDecibels, for harmonics
const HARMONIC_MAX_ORDER = 8;


export function freqToNote(frequency) {
    if (frequency <= MIN_FREQ_FOR_NOTE || frequency > MAX_FREQ_FOR_NOTE) return "N/A";
    const noteNum = 12 * (Math.log2(frequency / A4));
    const roundedNoteNum = Math.round(noteNum);
    const noteIndex = (roundedNoteNum % 12 + 12) % 12;
    const octave = Math.floor((roundedNoteNum + 69) / 12) -1; 
    return NOTES[noteIndex] + octave;
}

export function noteToFreq(noteName) {
    const noteParts = noteName.match(/([A-G]#?)([0-9])/);
    if (!noteParts) return 0;
    const note = noteParts[1];
    const octave = parseInt(noteParts[2], 10);
    
    const noteIndex = NOTES.indexOf(note);
    if (noteIndex === -1) return 0;

    const midiNote = 12 * (octave + 1) + noteIndex;
    return A4 * Math.pow(2, (midiNote - 69) / 12);
}


export function calculateLUFS(buffer) {
    if (!buffer) return null;
    const data = buffer.getChannelData(0); 
    let sumOfSquares = 0;
    for (let i = 0; i < data.length; i++) {
        sumOfSquares += data[i] * data[i];
    }
    const rms = Math.sqrt(sumOfSquares / data.length);
    if (rms === 0) return -Infinity; 
    const lufs = 20 * Math.log10(rms); 
    return parseFloat(lufs.toFixed(1));
}

export function calculatePeakAmplitude(buffer) {
    if (!buffer) return null;
    const data = buffer.getChannelData(0); 
    let peak = 0;
    for (let i = 0; i < data.length; i++) {
        const absValue = Math.abs(data[i]);
        if (absValue > peak) {
            peak = absValue;
        }
    }
    if (peak === 0) return -Infinity;
    return parseFloat((20 * Math.log10(peak)).toFixed(1)); // dBFS
}

export function calculateFrequencies(freqDataArray, sampleRate, analyserNode) {
    if (!analyserNode || !freqDataArray || !freqDataArray.length) return { fundamental: 0, harmonics: [] };
    
    const bufferLength = analyserNode.frequencyBinCount;
    let maxAmp = -Infinity;
    let fundamentalIndex = 0;

    // Convert minDecibels (negative) to a positive threshold relative to 0 dBFS
    // e.g., if minDecibels = -100, threshold is -100 * 0.35 = -35 dB
    const fundamentalMinAmpThreshold = analyserNode.minDecibels * (1 - FUNDAMENTAL_MIN_DB_THRESHOLD_RATIO);
    const harmonicMinAmpThreshold = analyserNode.minDecibels * (1 - HARMONIC_MIN_DB_THRESHOLD_RATIO);


    for (let i = 1; i < bufferLength; i++) {
        if (freqDataArray[i] > maxAmp) {
            maxAmp = freqDataArray[i];
            fundamentalIndex = i;
        }
    }
    
    const fundamentalFrequency = (fundamentalIndex * sampleRate) / analyserNode.fftSize;
    
    if (fundamentalFrequency < MIN_FREQ_FOR_NOTE || maxAmp < fundamentalMinAmpThreshold) {
        return { fundamental: 0, harmonics: [] };
    }

    const harmonicsList = [];
    // Add fundamental to harmonics list with amplitude
    harmonicsList.push({
        order: 1,
        frequency: Math.round(fundamentalFrequency),
        amplitude: parseFloat(maxAmp.toFixed(1)),
        isFundamental: true,
    });

    for (let order = 2; order <= HARMONIC_MAX_ORDER; order++) {
        const expectedFreq = fundamentalFrequency * order;
        if (expectedFreq > sampleRate / 2) break; // Nyquist limit

        const expectedIndex = Math.round((expectedFreq * analyserNode.fftSize) / sampleRate);
        
        if (expectedIndex < bufferLength) {
            let harmonicPeakAmp = -Infinity;
            let harmonicPeakIndex = expectedIndex;
            const searchRadius = Math.max(2, Math.floor(expectedIndex * 0.035)); // Increased radius slightly

            for (let j = Math.max(1, expectedIndex - searchRadius); j <= Math.min(bufferLength - 1, expectedIndex + searchRadius); j++) {
                if (freqDataArray[j] > harmonicPeakAmp) {
                    harmonicPeakAmp = freqDataArray[j];
                    harmonicPeakIndex = j;
                }
            }

            if (harmonicPeakAmp > harmonicMinAmpThreshold) {
                const preciseHarmonicFreq = (harmonicPeakIndex * sampleRate) / analyserNode.fftSize;
                harmonicsList.push({
                    order: order,
                    frequency: Math.round(preciseHarmonicFreq),
                    amplitude: parseFloat(harmonicPeakAmp.toFixed(1)),
                    isFundamental: false,
                });
            }
        }
    }
    return { fundamental: Math.round(fundamentalFrequency), harmonics: harmonicsList };
}
