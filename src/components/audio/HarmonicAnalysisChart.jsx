
import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(...registerables);

export function HarmonicAnalysisChart({ fundamentalFreq, harmonics }) {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Amplitud (dB)',
          data: [],
          backgroundColor: [],
          borderColor: [],
          borderWidth: 1.5,
          borderRadius: 5,
          barPercentage: 0.7,
          categoryPercentage: 0.8,
        }]
      },
      options: {
        animation: {
            duration: 450, 
            easing: 'easeOutQuad'
        },
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'x',
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
                return `Amplitud: ${context.raw.toFixed(1)} dB`;
              }
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Componente de Frecuencia', color: '#a3b8cc', font: {size: 11, weight: '600'} },
            grid: { display: false },
            ticks: { color: '#a3b8cc', font: {size: 9.5} },
          },
          y: {
            title: { display: true, text: 'Amplitud (dBFS)', color: '#a3b8cc', font: {size: 11, weight: '600'} },
            grid: { color: 'rgba(255,255,255,0.08)' },
            ticks: { color: '#a3b8cc', stepSize: 10, font: {size: 9} },
            min: -90, 
            max: 0,
          }
        }
      }
    });
     return () => chartInstanceRef.current?.destroy();
  }, []);

  useEffect(() => {
    if (chartInstanceRef.current) {
      const labels = [];
      const dataPoints = [];
      const backgroundColors = [];
      const borderColors = [];

      if (fundamentalFreq > 0) {
        const fundamentalHarmonic = harmonics.find(h => h.isFundamental);
        
        if (fundamentalHarmonic) {
            labels.push(`Fund. (${fundamentalHarmonic.frequency} Hz)`);
            dataPoints.push(fundamentalHarmonic.amplitude);
            backgroundColors.push('rgba(22, 163, 74, 0.85)'); // green-600
            borderColors.push('rgba(21, 128, 61, 1)'); // green-700
        }

        harmonics.filter(h => !h.isFundamental && h.order > 1).forEach(h => {
          labels.push(`${h.order}° Arm. (${h.frequency} Hz)`);
          dataPoints.push(h.amplitude);
          const hue = (h.order * 50 + 180) % 360; 
          backgroundColors.push(`hsla(${hue}, 80%, 60%, 0.85)`);
          borderColors.push(`hsla(${hue}, 80%, 50%, 1)`);
        });
      }
      
      chartInstanceRef.current.data.labels = labels;
      chartInstanceRef.current.data.datasets[0].data = dataPoints;
      chartInstanceRef.current.data.datasets[0].backgroundColor = backgroundColors;
      chartInstanceRef.current.data.datasets[0].borderColor = borderColors;
      
      if(labels.length > 0 || dataPoints.length > 0) { 
        chartInstanceRef.current.update();
      } else {
        chartInstanceRef.current.data.labels = [];
        chartInstanceRef.current.data.datasets[0].data = [];
        chartInstanceRef.current.update('none');
      }
    }
  }, [fundamentalFreq, harmonics]);

  return <canvas ref={chartRef} className="w-full h-full"></canvas>;
}
