
import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { freqToNote, NOTES } from '@/lib/audio-analysis';
import 'chartjs-adapter-date-fns';

Chart.register(...registerables);

const STAFF_NOTE_RANGE = (() => {
    const notes = [];
    const startOctave = 1; 
    const endOctave = 7;   
    for (let octave = startOctave; octave <= endOctave; octave++) {
        NOTES.forEach(note => {
            notes.push(`${note}${octave}`);
        });
    }
    return notes;
})();

const NOTE_DURATION_THRESHOLD_FRAMES = 2; 
const MIN_NOTE_AMPLITUDE_THRESHOLD = 55; 
const NOTE_GROUPING_TIME_WINDOW_MS = 180; 

export function GeneralStaffDisplay({ data }) { 
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    chartInstanceRef.current = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Notas Musicales',
          data: [],
          pointStyle: 'rectRot',
          radius: (context) => {
            const duration = context.raw?.durationFrames || 1;
            return 3.5 + Math.min(duration, 5) * 1.8; 
          },
          backgroundColor: (context) => {
            const freq = context.raw?.freq;
            if (!freq) return 'rgba(200, 200, 200, 0.25)';
            const note = freqToNote(freq);
            if (note === "N/A") return 'rgba(200, 200, 200, 0.25)';
            const hue = (NOTES.indexOf(note.slice(0, -1)) / 12) * 360;
            const amp = context.raw?.avgAmp || 0;
            const saturation = 70 + Math.min(amp / 100, 1) * 30; // Saturation based on amplitude
            return `hsla(${hue}, ${saturation}%, 68%, 0.9)`;
          },
          borderColor: 'rgba(255, 255, 255, 0.7)',
          borderWidth: 1.5,
        }]
      },
      options: {
        animation: {
            duration: 120, 
            easing: 'linear'
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            titleFont: { size: 0 },
            bodyFont: { size: 11, weight: '600' },
            bodyColor: '#e2e8f0',
            padding: 8,
            cornerRadius: 4,
            displayColors: false,
            callbacks: {
              label: function(context) {
                const item = context.raw;
                return `${item.note} (${item.freq.toFixed(0)} Hz), Dur: ${item.durationFrames} fr, Amp: ${item.avgAmp.toFixed(0)}`;
              }
            }
          }
        },
        scales: {
          x: {
            type: 'linear',
            title: { display: true, text: 'Tiempo (Frames)', color: '#a3b8cc', font: {size: 11, weight: '600'} },
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: '#a3b8cc', stepSize: Math.max(1, Math.floor((data?.length || 200) / 10)), font: {size: 9} },
            min: 0,
            max: data?.length > 0 ? data.length -1 : 200,
          },
          y: {
            type: 'category',
            labels: STAFF_NOTE_RANGE.slice().reverse(), 
            title: { display: true, text: 'Notas', color: '#a3b8cc', font: {size: 11, weight: '600'} },
            grid: {
              drawOnChartArea: true,
              color: (context) => {
                const label = context.tick.label;
                if (label.startsWith('E') || label.startsWith('G') || label.startsWith('B') || label.startsWith('D') || label.startsWith('F')) {
                    if (!label.includes('#')) return 'rgba(156, 163, 175, 0.5)'; 
                }
                return 'rgba(100, 116, 139, 0.15)'; 
              },
              lineWidth: 1,
            },
            ticks: { 
                color: '#a3b8cc',
                font: { size: 8.5 }
            },
          }
        }
      }
    });
    return () => chartInstanceRef.current?.destroy();
  }, []);

  useEffect(() => {
    if (chartInstanceRef.current && data && data.length > 0) {
      const detectedNotes = [];
      let currentNoteCandidate = null;
      let candidateFrames = 0;
      let candidateTotalAmp = 0;
      let candidateStartTime = 0;

      data.forEach((point, frameIndex) => {
        const noteName = freqToNote(point.freq);
        const avgAmp = point.amp;

        if (noteName !== "N/A" && STAFF_NOTE_RANGE.includes(noteName) && avgAmp > MIN_NOTE_AMPLITUDE_THRESHOLD) {
          if (currentNoteCandidate && currentNoteCandidate.note === noteName && (frameIndex - candidateStartTime) * (1000/60) < NOTE_GROUPING_TIME_WINDOW_MS) {
            candidateFrames++;
            candidateTotalAmp += avgAmp;
          } else {
            if (currentNoteCandidate && candidateFrames >= NOTE_DURATION_THRESHOLD_FRAMES) {
              detectedNotes.push({ 
                x: candidateStartTime, 
                y: currentNoteCandidate.note, 
                freq: currentNoteCandidate.freq,
                note: currentNoteCandidate.note,
                durationFrames: candidateFrames,
                avgAmp: candidateTotalAmp / candidateFrames 
              });
            }
            currentNoteCandidate = { note: noteName, freq: point.freq };
            candidateFrames = 1;
            candidateTotalAmp = avgAmp;
            candidateStartTime = frameIndex;
          }
        } else {
          if (currentNoteCandidate && candidateFrames >= NOTE_DURATION_THRESHOLD_FRAMES) {
             detectedNotes.push({ 
                x: candidateStartTime, 
                y: currentNoteCandidate.note, 
                freq: currentNoteCandidate.freq,
                note: currentNoteCandidate.note,
                durationFrames: candidateFrames,
                avgAmp: candidateTotalAmp / candidateFrames
              });
          }
          currentNoteCandidate = null;
        }
      });

      if (currentNoteCandidate && candidateFrames >= NOTE_DURATION_THRESHOLD_FRAMES) {
        detectedNotes.push({ 
            x: candidateStartTime, 
            y: currentNoteCandidate.note, 
            freq: currentNoteCandidate.freq,
            note: currentNoteCandidate.note,
            durationFrames: candidateFrames,
            avgAmp: candidateTotalAmp / candidateFrames
        });
      }
      
      chartInstanceRef.current.data.datasets[0].data = detectedNotes;
      chartInstanceRef.current.options.scales.x.max = data.length > 0 ? data.length -1 : 200;
      chartInstanceRef.current.update('none');
    } else if (chartInstanceRef.current) {
        chartInstanceRef.current.data.datasets[0].data = [];
        chartInstanceRef.current.update('none');
    }
  }, [data]);

  return <canvas ref={chartRef} className="w-full h-full"></canvas>;
}
