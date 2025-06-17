
import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { freqToNote, noteToFreq, NOTES, MIN_FREQ_FOR_NOTE, MAX_FREQ_FOR_NOTE } from '@/lib/audio-analysis';
import 'chartjs-adapter-date-fns';

Chart.register(...registerables);

const OCTAVES_TO_DISPLAY = 4; // Display 4 octaves
const START_OCTAVE = 2; // Start from C2

export function PianoRollDisplay({ data, fundamentalFreq }) {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const generatePianoKeys = () => {
    const keys = [];
    for (let octave = START_OCTAVE; octave < START_OCTAVE + OCTAVES_TO_DISPLAY; octave++) {
      NOTES.forEach(note => {
        keys.push(`${note}${octave}`);
      });
    }
    return keys;
  };
  const pianoKeys = generatePianoKeys();

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    chartInstanceRef.current = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Notas Detectadas',
          data: [],
          backgroundColor: (context) => {
            const freq = context.raw?.yVal;
            if (!freq) return 'rgba(255, 255, 255, 0.1)';
            const note = freqToNote(freq);
            const hue = (NOTES.indexOf(note.slice(0, -1)) / 12) * 360;
            return `hsla(${hue}, 80%, 60%, 0.7)`;
          },
          borderColor: 'rgba(255, 255, 255, 0.3)',
          borderWidth: 1,
          pointRadius: 5,
          pointHoverRadius: 7,
        }]
      },
      options: {
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                const freq = context.raw.yVal;
                const note = freqToNote(freq);
                return `${note} (${freq.toFixed(0)} Hz)`;
              }
            }
          }
        },
        scales: {
          x: {
            type: 'linear',
            title: { display: true, text: 'Tiempo (Frames)', color: '#94a3b8' },
            grid: { color: 'rgba(255,255,255,0.1)' },
            ticks: { color: '#94a3b8', stepSize: 20 },
            min: 0,
            max: data.length > 0 ? data.length -1 : 200,
          },
          y: {
            type: 'category',
            labels: pianoKeys.reverse(), // Reverse for piano layout (low to high)
            title: { display: true, text: 'Notas Musicales', color: '#94a3b8' },
            grid: { 
                drawOnChartArea: true,
                color: (context) => {
                    const label = context.tick.label;
                    return label.includes('#') ? 'rgba(100, 116, 139, 0.5)' : 'rgba(156, 163, 175, 0.5)'; // Darker for sharps
                },
                lineWidth: (context) => {
                    const label = context.tick.label;
                    return label.includes('C') && !label.includes('#') ? 1.5 : 0.5; // Thicker for C notes
                }
            },
            ticks: { 
                color: '#94a3b8',
                font: { size: 8 }
            },
          }
        }
      }
    });
    return () => chartInstanceRef.current?.destroy();
  }, []);

  useEffect(() => {
    if (chartInstanceRef.current && data && data.length > 0) {
      const processedData = data.map((point, index) => {
        const note = freqToNote(point.freq);
        if (note !== "N/A" && pianoKeys.includes(note)) {
          return { x: index, y: note, yVal: point.freq };
        }
        return null;
      }).filter(p => p !== null);

      chartInstanceRef.current.data.datasets[0].data = processedData;
      chartInstanceRef.current.options.scales.x.max = data.length > 0 ? data.length -1 : 200;
      chartInstanceRef.current.update('none');
    }
  }, [data, pianoKeys]);

  return <canvas ref={chartRef} className="w-full h-full"></canvas>;
}
