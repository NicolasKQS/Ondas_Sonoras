
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Settings2, Zap, Sliders, Volume2, VolumeX } from 'lucide-react';

export function WaveSimulator() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isSoundOn, setIsSoundOn] = useState(false);
  const [length, setLength] = useState([1.5]);
  const [tension, setTension] = useState([100]);
  const [density, setDensity] = useState([0.005]);
  const [harmonic, setHarmonic] = useState([1]); 
  const [time, setTime] = useState(0);
  
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);

  const waveSpeed = Math.sqrt(tension[0] / density[0]);
  const fundamentalFrequency = waveSpeed / (2 * length[0]);
  const currentFrequency = fundamentalFrequency * harmonic[0];
  const wavelength = (2 * length[0]) / harmonic[0];

  const initializeAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.setValueAtTime(0, audioContextRef.current.currentTime); 
      gainNodeRef.current.connect(audioContextRef.current.destination);
    }
  }, []);

  const playSound = useCallback(() => {
    if (!audioContextRef.current || !gainNodeRef.current) return;
    if (oscillatorRef.current) {
      try { oscillatorRef.current.stop(); } catch(e) {/*ignore*/}
      oscillatorRef.current.disconnect();
    }
    oscillatorRef.current = audioContextRef.current.createOscillator();
    oscillatorRef.current.type = 'sine'; 
    oscillatorRef.current.frequency.setValueAtTime(currentFrequency, audioContextRef.current.currentTime);
    oscillatorRef.current.connect(gainNodeRef.current);
    try { oscillatorRef.current.start(); } catch(e) {/*ignore*/}
    gainNodeRef.current.gain.linearRampToValueAtTime(isSoundOn ? 0.1 : 0, audioContextRef.current.currentTime + 0.05); 
  }, [currentFrequency, isSoundOn]);

  const stopSound = useCallback(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + 0.05);
    }
    if (oscillatorRef.current) {
      setTimeout(() => { 
        if (oscillatorRef.current) {
          try { oscillatorRef.current.stop(); } catch(e) {/*ignore*/}
          oscillatorRef.current.disconnect();
          oscillatorRef.current = null;
        }
      }, 100);
    }
  }, []);

  useEffect(() => {
    initializeAudio();
    return () => {
      stopSound();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [initializeAudio, stopSound]);

  useEffect(() => {
    if (isSoundOn) {
      playSound();
    } else {
      stopSound();
    }
  }, [isSoundOn, currentFrequency, playSound, stopSound]);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    const drawWave = () => {
      ctx.clearRect(0, 0, width, height);
      
      const amplitude = Math.min(height / 4, 50);
      const centerY = height / 2;
      const waveRenderWidth = width * 0.9; 
      const startX = (width - waveRenderWidth) / 2;
      
      ctx.strokeStyle = 'rgba(156, 163, 175, 0.6)'; 
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(startX, centerY);
      ctx.lineTo(startX + waveRenderWidth, centerY);
      ctx.stroke();
      
      ctx.fillStyle = '#ef4444'; 
      ctx.beginPath(); ctx.arc(startX, centerY, 5, 0, 2 * Math.PI); ctx.fill();
      ctx.beginPath(); ctx.arc(startX + waveRenderWidth, centerY, 5, 0, 2 * Math.PI); ctx.fill();
      
      const gradient = ctx.createLinearGradient(startX, centerY - amplitude, startX, centerY + amplitude);
      gradient.addColorStop(0, '#3b82f6'); 
      gradient.addColorStop(0.5, '#a855f7'); 
      gradient.addColorStop(1, '#ec4899'); 
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      
      for (let xPixel = 0; xPixel <= waveRenderWidth; xPixel++) {
        const positionRatio = xPixel / waveRenderWidth; 
        const spatialPart = Math.sin(harmonic[0] * Math.PI * positionRatio);
        const temporalPart = Math.cos(2 * Math.PI * currentFrequency * time * 0.002); 
        const y = centerY + amplitude * spatialPart * temporalPart;
        
        if (xPixel === 0) ctx.moveTo(startX + xPixel, y);
        else ctx.lineTo(startX + xPixel, y);
      }
      ctx.stroke();
      
      ctx.fillStyle = '#ef4444'; 
      for (let i = 0; i <= harmonic[0]; i++) {
        const x = startX + (i * waveRenderWidth) / harmonic[0];
        ctx.beginPath(); ctx.arc(x, centerY, 5, 0, 2 * Math.PI); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.beginPath(); ctx.arc(x, centerY, 2, 0, 2 * Math.PI); ctx.fill();
        ctx.fillStyle = '#ef4444';
      }
      
      ctx.fillStyle = '#cbd5e1'; 
      ctx.font = `bold ${11}px "Nunito", sans-serif`;
      const textYStart = 18;
      ctx.fillText(`Frecuencia: ${currentFrequency.toFixed(1)} Hz`, 12, textYStart);
      ctx.fillText(`Velocidad: ${waveSpeed.toFixed(1)} m/s`, 12, textYStart + 16);
      ctx.fillText(`λ: ${wavelength.toFixed(2)} m`, 12, textYStart + 32);
    };

    const animate = () => {
      if (isPlaying) {
        setTime(prev => prev + 1);
      }
      drawWave();
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [isPlaying, time, length, tension, density, harmonic, currentFrequency, waveSpeed, wavelength]);

  const resetParameters = () => {
    setLength([1.5]); setTension([100]); setDensity([0.005]); setHarmonic([1]);
    setTime(0); if(!isPlaying) setIsPlaying(true);
    if (isSoundOn) playSound();
  };

  const toggleSound = () => {
    initializeAudio(); 
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    setIsSoundOn(!isSoundOn);
  };

  const ParameterSlider = ({ label, value, onChange, min, max, step, unit, color }) => (
    <div className="space-y-2">
      <label className={`font-semibold neon-text-${color} text-sm`}>{label}</label>
      <Slider
        value={value}
        onValueChange={(val) => { onChange(val); if (isSoundOn) playSound(); }}
        min={min}
        max={max}
        step={step}
        className={`w-full [&>span:nth-child(2)>span]:bg-${color}-600 [&>span:last-child]:border-${color}-500`}
      />
      <div className={`text-${color}-300 text-xs text-right`}>{value[0]}{unit}</div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="glass-effect-dark p-6 md:p-8 rounded-2xl shadow-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
          <h2 className="text-3xl md:text-4xl font-bold neon-text-purple mb-4 sm:mb-0 flex items-center">
            <Zap className="h-8 w-8 mr-3 animate-pulse" />
            ¡Crea Tu Onda!
          </h2>
          <div className="flex space-x-3">
            <Button onClick={toggleSound} className={`button-${isSoundOn ? 'pink' : 'gray'} text-sm px-4 py-2.5`}>
              {isSoundOn ? <Volume2 className="h-5 w-5 mr-2" /> : <VolumeX className="h-5 w-5 mr-2" />}
              {isSoundOn ? 'Sonido ON' : 'Sonido OFF'}
            </Button>
            <Button onClick={() => setIsPlaying(!isPlaying)} className={`button-${isPlaying ? 'red' : 'green'} text-sm px-5 py-2.5`}>
              {isPlaying ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
              {isPlaying ? 'Congelar' : '¡Animar!'}
            </Button>
            <Button onClick={resetParameters} className="button-purple text-sm px-5 py-2.5">
              <Settings2 className="h-5 w-5 mr-2" />
              Valores Cool
            </Button>
          </div>
        </div>

        <div className="canvas-bg-dark h-72 md:h-96 mb-8">
          <canvas ref={canvasRef} className="w-full h-full"/>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
          <ParameterSlider label="Largo Cuerda (m)" value={length} onChange={setLength} min={0.5} max={3} step={0.1} unit=" m" color="blue" />
          <ParameterSlider label="Tensión (N)" value={tension} onChange={setTension} min={10} max={200} step={5} unit=" N" color="yellow" />
          <ParameterSlider label="Densidad (kg/m)" value={density} onChange={setDensity} min={0.001} max={0.02} step={0.001} unit=" kg/m" color="green" />
          <ParameterSlider label="Armónico (n)" value={harmonic} onChange={setHarmonic} min={1} max={5} step={1} unit="" color="pink" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <motion.div initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} transition={{delay:0.2}} className="glass-effect-dark p-6 rounded-2xl shadow-lg">
          <h3 className="text-2xl font-bold neon-text-teal mb-4 flex items-center"><Sliders className="h-6 w-6 mr-2"/>¿Qué Cambia?</h3>
          <ul className="space-y-3 text-sm text-slate-200">
            <li><strong className="neon-text-blue">Largo:</strong> Más largo = sonido más grave (como un trombón vs. trompeta).</li>
            <li><strong className="neon-text-yellow">Tensión:</strong> Más tensa = sonido más agudo (como al apretar una cuerda de guitarra).</li>
            <li><strong className="neon-text-green">Densidad:</strong> Más 'gordita' = sonido más grave (cuerda gruesa vs. delgada).</li>
            <li><strong className="neon-text-pink">Armónico:</strong> Sube el número y ¡la onda se vuelve más compleja y aguda!</li>
          </ul>
        </motion.div>
        <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} transition={{delay:0.4}} className="glass-effect-dark p-6 rounded-2xl shadow-lg">
          <h3 className="text-2xl font-bold neon-text-purple mb-4">Datos Calculados</h3>
           <div className="space-y-2 text-sm">
            {[
              {label:"Velocidad Onda:", value:waveSpeed.toFixed(1) + " m/s", color:"blue"},
              {label:"Frecuencia (nota):", value:currentFrequency.toFixed(1) + " Hz", color:"green"},
              {label:"Tamaño de Onda (λ):", value:wavelength.toFixed(2) + " m", color:"purple"},
              {label:"Tiempo por Ciclo (T):", value:(1/currentFrequency).toFixed(3) + " s", color:"yellow"},
            ].map(item => (
              <div key={item.label} className={`flex justify-between p-2 bg-${item.color}-700/30 rounded-md`}>
                <span className={`text-${item.color}-300`}>{item.label}</span>
                <span className={`font-bold text-${item.color}-200`}>{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
