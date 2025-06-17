
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { GitCommit } from 'lucide-react';

export function StringResonanceDisplay({ fundamentalFreq, harmonics }) {
  const canvasRef = useRef(null);
  const DEMO_WAVE_SPEED = 343; 

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    const resizeCanvas = () => {
        if (!canvasRef.current) return;
        canvas.width = canvas.offsetWidth * dpr;
        canvas.height = canvas.offsetHeight * dpr;
        ctx.scale(dpr, dpr);
    };
    resizeCanvas();

    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    ctx.clearRect(0, 0, width, height);

    const currentFundamentalFreq = fundamentalFreq || 0;

    if (currentFundamentalFreq <= 0) {
      ctx.fillStyle = 'rgba(156, 163, 175, 0.7)';
      ctx.font = '14px "Nunito", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("Analice un sonido para ver la resonancia.", width / 2 , height / 2);
      return;
    }

    let harmonicN = 1; 
    const currentHarmonics = harmonics || [];
    const fundamentalHarmonic = currentHarmonics.find(h => h.isFundamental);

    if (fundamentalHarmonic && fundamentalHarmonic.order) {
        harmonicN = fundamentalHarmonic.order;
    } else if (currentHarmonics.length > 0) {
        let strongestHarmonic = currentHarmonics.reduce((prev, current) => (prev.amplitude > current.amplitude) ? prev : current, {amplitude:0});
        if (strongestHarmonic && strongestHarmonic.order) harmonicN = strongestHarmonic.order;
    }
    harmonicN = Math.max(1, harmonicN); // Ensure harmonicN is at least 1

    const waveAmplitude = Math.min(height / 3.5, 55) / Math.sqrt(harmonicN); 

    const padding = 35;
    const drawableWidth = width - 2 * padding;
    const centerY = height / 2;

    ctx.fillStyle = '#c026d3'; // fuchsia-600
    ctx.beginPath(); ctx.arc(padding, centerY, 7, 0, 2 * Math.PI); ctx.fill();
    ctx.beginPath(); ctx.arc(padding + drawableWidth, centerY, 7, 0, 2 * Math.PI); ctx.fill();

    ctx.strokeStyle = 'rgba(128, 128, 128, 0.6)'; 
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(padding, centerY); ctx.lineTo(padding + drawableWidth, centerY); ctx.stroke();

    const waveGradient = ctx.createLinearGradient(0, centerY - waveAmplitude, 0, centerY + waveAmplitude);
    waveGradient.addColorStop(0, '#0ea5e9'); // sky-500
    waveGradient.addColorStop(0.5, '#8b5cf6'); // violet-500
    waveGradient.addColorStop(1, '#ec4899'); // pink-500
    ctx.strokeStyle = waveGradient;
    ctx.lineWidth = 3;
    
    ctx.beginPath();
    for (let x = 0; x <= drawableWidth; x++) {
      const stringPos = x / drawableWidth; 
      const y = waveAmplitude * Math.sin(harmonicN * Math.PI * stringPos);
      if (x === 0) ctx.moveTo(padding + x, centerY - y);
      else ctx.lineTo(padding + x, centerY - y);
    }
    ctx.stroke();
    
    ctx.beginPath(); // Draw the mirrored wave for thickness/envelope effect
    for (let x = 0; x <= drawableWidth; x++) {
      const stringPos = x / drawableWidth;
      const y = waveAmplitude * Math.sin(harmonicN * Math.PI * stringPos);
      if (x === 0) ctx.moveTo(padding + x, centerY + y);
      else ctx.lineTo(padding + x, centerY + y);
    }
    ctx.stroke();


    ctx.fillStyle = '#dc2626'; // red-600
    for (let i = 0; i <= harmonicN; i++) {
      const nodeX = padding + (i / harmonicN) * drawableWidth;
      ctx.beginPath(); ctx.arc(nodeX, centerY, 5, 0, 2 * Math.PI); ctx.fill();
    }

    ctx.fillStyle = '#2563eb'; // blue-600
     for (let i = 0; i < harmonicN; i++) {
      const antinodeX = padding + ((i + 0.5) / harmonicN) * drawableWidth;
      const yOffset = waveAmplitude * Math.sin(harmonicN * Math.PI * ((i + 0.5) / harmonicN));
      ctx.beginPath(); ctx.arc(antinodeX, centerY - yOffset , 4, 0, 2 * Math.PI); ctx.fill();
      if (yOffset !== 0) { // Draw mirrored antinode if not on center line
          ctx.beginPath(); ctx.arc(antinodeX, centerY + yOffset , 4, 0, 2 * Math.PI); ctx.fill();
      }
    }
    
    ctx.fillStyle = 'rgba(226, 232, 240, 0.95)'; // slate-200
    ctx.font = 'bold 13px "Nunito", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Armónico N°: ${harmonicN}`, width / 2, padding - 8);
    ctx.font = '12px "Nunito", sans-serif';
    ctx.fillText(`Frec: ${currentFundamentalFreq.toFixed(0)} Hz`, width / 2, height - padding + 18 );

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(canvas);
    return () => resizeObserver.unobserve(canvas);

  }, [fundamentalFreq, harmonics]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full"></canvas>
    </div>
  );
}
