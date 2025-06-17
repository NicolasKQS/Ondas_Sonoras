
import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(...registerables);

const MAX_FREQ_DISPLAY_SPECTROGRAM = 10000; 
const MIN_DB_THRESHOLD_SPECTROGRAM = -100; 
const MAX_DB_THRESHOLD_SPECTROGRAM = -10;  
const SPECTROGRAM_POINT_SIZE = 2.8; 
const SPECTROGRAM_MAX_POINTS_PER_FRAME = 70; 

export function SpectrogramChart({ data }) {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    chartInstanceRef.current = new Chart(ctx, {
      type: 'scatter', 
      data: {
        datasets: [{
          label: 'Espectrograma',
          data: [],
          pointRadius: SPECTROGRAM_POINT_SIZE,
          pointHoverRadius: SPECTROGRAM_POINT_SIZE + 1.2,
          pointBackgroundColor: (context) => {
            const value = context.raw?.v;
            if (value === undefined || value === null || value < MIN_DB_THRESHOLD_SPECTROGRAM) {
              return 'rgba(30, 41, 59, 0.02)'; 
            }
            const intensity = (Math.max(MIN_DB_THRESHOLD_SPECTROGRAM, Math.min(MAX_DB_THRESHOLD_SPECTROGRAM, value)) - MIN_DB_THRESHOLD_SPECTROGRAM) / (MAX_DB_THRESHOLD_SPECTROGRAM - MIN_DB_THRESHOLD_SPECTROGRAM);
            const hue = 270 - intensity * 240; 
            return `hsla(${hue}, 100%, ${55 + intensity * 25}%, ${intensity * 0.6 + 0.25})`; 
          },
        }]
      },
      options: {
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            mode: 'nearest',
            intersect: false,
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
                if (!item) return '';
                return `Tiempo: ${item.x}, Freq: ${item.y.toFixed(0)} Hz, Amp: ${item.v.toFixed(1)} dB`;
              }
            }
          }
        },
        scales: {
          x: {
            type: 'linear',
            title: { display: true, text: 'Tiempo (Frames)', color: '#a3b8cc', font: {size: 11, weight: '600'} },
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: '#a3b8cc', stepSize: Math.max(10, Math.floor((data?.length || 100) / 8)), font: {size: 9} },
            min: 0,
            max: data?.length > 0 ? data.length -1 : 128,
          },
          y: {
            type: 'logarithmic', 
            title: { display: true, text: 'Frecuencia (Hz) - Log', color: '#a3b8cc', font: {size: 11, weight: '600'} },
            min: 20, // Start y-axis at a common audible frequency
            max: MAX_FREQ_DISPLAY_SPECTROGRAM,
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { 
              color: '#a3b8cc', 
              font: {size: 9},
              callback: function(value, index, values) {
                if (value === 100 || value === 1000 || value === 5000 || value === 10000 || value === 20) return value + ' Hz';
                return null; // Hide other ticks for clarity on log scale
              }
            },
          }
        },
        parsing: false, 
        normalized: true, 
        datasets: {
            scatter: {
                showLine: false 
            }
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, []); 

  useEffect(() => {
    if (chartInstanceRef.current && data) {
      const processedData = [];
      const sampleRate = 44100; 
      const fftSize = 2048; 
      const freqBinResolution = sampleRate / fftSize;
      const displayThresholdDBAdjusted = MIN_DB_THRESHOLD_SPECTROGRAM + 15; 

      if (data.length > 0) {
        data.forEach((fftFrame, timeIndex) => {
          let pointsInFrame = 0;
          for (let freqIndex = 1; (freqIndex * freqBinResolution) < MAX_FREQ_DISPLAY_SPECTROGRAM && pointsInFrame < SPECTROGRAM_MAX_POINTS_PER_FRAME ; freqIndex++) {
            if (freqIndex < fftFrame.length) {
              const amplitude01 = fftFrame[freqIndex] / 255; 
              const amplitudeDB = MIN_DB_THRESHOLD_SPECTROGRAM + amplitude01 * (MAX_DB_THRESHOLD_SPECTROGRAM - MIN_DB_THRESHOLD_SPECTROGRAM);
              
              if (amplitudeDB > displayThresholdDBAdjusted) { 
                   processedData.push({
                    x: timeIndex,
                    y: freqIndex * freqBinResolution,
                    v: amplitudeDB 
                  });
                  pointsInFrame++;
              }
            }
          }
        });
      }
      
      if (processedData.length > 0 || chartInstanceRef.current.data.datasets[0].data.length > 0) {
        chartInstanceRef.current.data.datasets[0].data = processedData;
        chartInstanceRef.current.options.scales.x.max = data.length > 0 ? data.length -1 : 128;
        chartInstanceRef.current.update('none'); 
      } else if (data.length === 0 && chartInstanceRef.current.data.datasets[0].data.length > 0) {
        chartInstanceRef.current.data.datasets[0].data = [];
        chartInstanceRef.current.update('none'); 
      }

    }
  }, [data]);

  return <canvas ref={chartRef} className="w-full h-full"></canvas>;
}
