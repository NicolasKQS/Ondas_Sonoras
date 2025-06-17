
import { calculateLUFS, calculatePeakAmplitude, freqToNote } from '@/lib/audio-analysis';

export const generateReport = (collectedFreqDataRef, collectedBufferDataRef, setAnalysisReport, setFundamentalFreq, setHarmonics) => {
  if (collectedFreqDataRef.current.length === 0 && !collectedBufferDataRef.current) {
    setAnalysisReport({ fundamentalFreq: 0, harmonics: [], estimatedNote: "N/A", loudnessLUFS: null, peakAmplitude: null });
    setFundamentalFreq(0);
    setHarmonics([]);
    return;
  }
  let mainFundamental = 0;
  let mainHarmonics = [];

  if (collectedFreqDataRef.current.length > 0) {
    const fundamentalCandidates = {};
    collectedFreqDataRef.current.forEach(dataPoint => {
        if(dataPoint.fundamental > 0) {
            const fundKey = Math.round(dataPoint.fundamental);
            if(!fundamentalCandidates[fundKey]) fundamentalCandidates[fundKey] = { count: 0, harmonicsSum: [], totalAmp: 0 };
            fundamentalCandidates[fundKey].count++;
            fundamentalCandidates[fundKey].harmonicsSum.push(dataPoint.harmonics);
            let frameAmp = 0;
            dataPoint.harmonics.forEach(h => frameAmp += h.amplitude);
            fundamentalCandidates[fundKey].totalAmp += frameAmp;

        }
    });
    
    let maxOccurrences = 0;
    let bestCandidateKey = 0;

    for (const freqKey in fundamentalCandidates) {
        if (fundamentalCandidates[freqKey].count > maxOccurrences) {
            maxOccurrences = fundamentalCandidates[freqKey].count;
            bestCandidateKey = parseInt(freqKey, 10);
        } else if (fundamentalCandidates[freqKey].count === maxOccurrences) {
            if (fundamentalCandidates[freqKey].totalAmp > fundamentalCandidates[bestCandidateKey].totalAmp) {
                 bestCandidateKey = parseInt(freqKey, 10);
            }
        }
    }
    mainFundamental = bestCandidateKey;

    if(mainFundamental > 0 && fundamentalCandidates[mainFundamental]) {
        const avgHarmonics = {};
        let frameCountForMainFundamental = 0;
        fundamentalCandidates[mainFundamental].harmonicsSum.forEach(frameHarmonics => {
            if(frameHarmonics && frameHarmonics.length > 0) {
                frameCountForMainFundamental++;
                frameHarmonics.forEach(h => {
                    if(!avgHarmonics[h.order]) avgHarmonics[h.order] = { freqSum: 0, ampSum: 0, count: 0, isFundamental: h.isFundamental };
                    avgHarmonics[h.order].freqSum += h.frequency;
                    avgHarmonics[h.order].ampSum += h.amplitude;
                    avgHarmonics[h.order].count++;
                });
            }
        });
        
        for(const order in avgHarmonics) {
            mainHarmonics.push({
                order: parseInt(order),
                frequency: Math.round(avgHarmonics[order].freqSum / avgHarmonics[order].count),
                amplitude: parseFloat((avgHarmonics[order].ampSum / avgHarmonics[order].count).toFixed(1)),
                isFundamental: avgHarmonics[order].isFundamental
            });
        }
        mainHarmonics.sort((a,b) => a.order - b.order);
    }


  }
  
  const loudness = calculateLUFS(collectedBufferDataRef.current);
  const peak = calculatePeakAmplitude(collectedBufferDataRef.current);

  setAnalysisReport({
    fundamentalFreq: mainFundamental,
    harmonics: mainHarmonics,
    estimatedNote: freqToNote(mainFundamental),
    loudnessLUFS: loudness,
    peakAmplitude: peak,
  });
  setFundamentalFreq(mainFundamental); 
  setHarmonics(mainHarmonics);
  
  collectedFreqDataRef.current = []; 
  collectedBufferDataRef.current = null;
};

export const clearReport = (setAnalysisReport, setFundamentalFreq, setHarmonics) => {
  setAnalysisReport(null);
  setFundamentalFreq(0);
  setHarmonics([]);
};
