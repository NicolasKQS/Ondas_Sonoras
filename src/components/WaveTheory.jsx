
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, BookOpen, Lightbulb, HelpCircle, Volume2, VolumeX } from 'lucide-react';

export function WaveTheory() {
  const [isAnimating, setIsAnimating] = useState(true);
  const [isSoundOn, setIsSoundOn] = useState(false);
  const [time, setTime] = useState(0);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const audioContextRef = useRef(null);
  const oscillatorIncidentRef = useRef(null);
  const oscillatorReflectedRef = useRef(null);
  const gainNodeRef = useRef(null);

  const baseFrequency = 110; 

  const initializeAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      gainNodeRef.current.connect(audioContextRef.current.destination);
    }
  }, []);

  const playSounds = useCallback(() => {
    if (!audioContextRef.current || !gainNodeRef.current) return;

    const stopOscillator = (oscRef) => {
      if (oscRef.current) {
        try { oscRef.current.stop(); } catch(e) {/*ignore*/}
        oscRef.current.disconnect();
        oscRef.current = null;
      }
    };
    stopOscillator(oscillatorIncidentRef);
    stopOscillator(oscillatorReflectedRef);

    oscillatorIncidentRef.current = audioContextRef.current.createOscillator();
    oscillatorIncidentRef.current.type = 'sine';
    oscillatorIncidentRef.current.frequency.setValueAtTime(baseFrequency, audioContextRef.current.currentTime);
    oscillatorIncidentRef.current.connect(gainNodeRef.current);
    try { oscillatorIncidentRef.current.start(); } catch(e) {/*ignore*/}


    oscillatorReflectedRef.current = audioContextRef.current.createOscillator();
    oscillatorReflectedRef.current.type = 'sine';
    oscillatorReflectedRef.current.frequency.setValueAtTime(baseFrequency, audioContextRef.current.currentTime);
    oscillatorReflectedRef.current.connect(gainNodeRef.current);
    try { oscillatorReflectedRef.current.start(); } catch(e) {/*ignore*/}
    
    gainNodeRef.current.gain.linearRampToValueAtTime(isSoundOn ? 0.05 : 0, audioContextRef.current.currentTime + 0.05); 
  }, [isSoundOn, baseFrequency]);

  const stopSounds = useCallback(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + 0.05);
    }
    const stopAndDisconnect = (oscRef) => {
      if (oscRef.current) {
        setTimeout(() => {
          if (oscRef.current) {
            try { oscRef.current.stop(); } catch(e) {/*ignore*/}
            oscRef.current.disconnect();
            oscRef.current = null;
          }
        }, 100);
      }
    };
    stopAndDisconnect(oscillatorIncidentRef);
    stopAndDisconnect(oscillatorReflectedRef);
  }, []);

  useEffect(() => {
    initializeAudio();
    return () => {
      stopSounds();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [initializeAudio, stopSounds]);

  useEffect(() => {
    if (isSoundOn && isAnimating) {
      playSounds();
    } else {
      stopSounds();
    }
  }, [isSoundOn, isAnimating, playSounds, stopSounds]);


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
      
      const amplitude = Math.min(height / 6, 40);
      const waveFrequency = 0.02; 
      const waveLength = width / 2.5; 
      const centerY = height / 2;
      
      const incidentColor = 'rgba(96, 165, 250, 0.7)'; 
      const reflectedColor = 'rgba(74, 222, 128, 0.7)'; 
      const resultantColor = 'rgba(230, 230, 250, 0.9)'; 
      const nodeColor = 'rgba(248, 113, 113, 1)'; 

      ctx.lineWidth = 2;

      ctx.strokeStyle = incidentColor;
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const y = centerY + amplitude * Math.sin(waveFrequency * x + time * 0.05);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      
      ctx.strokeStyle = reflectedColor;
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const y = centerY + amplitude * Math.sin(-waveFrequency * x + time * 0.05 + Math.PI);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      
      ctx.strokeStyle = resultantColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const incidentVal = amplitude * Math.sin(waveFrequency * x + time * 0.05);
        const reflectedVal = amplitude * Math.sin(-waveFrequency * x + time * 0.05 + Math.PI);
        const y = centerY + incidentVal + reflectedVal;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      
      ctx.fillStyle = nodeColor;
      for (let i = 0; i < 5; i++) { 
        const x = (i * waveLength) / 2;
        if (x <= width) {
          ctx.beginPath(); ctx.arc(x, centerY, 4, 0, 2 * Math.PI); ctx.fill();
        }
      }
    };

    const animate = () => {
      if (isAnimating) {
        setTime(prev => prev + 1);
      }
      drawWave(); 
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [isAnimating, time]);

  const toggleAnimation = () => setIsAnimating(!isAnimating);
  const resetAnimation = () => { setTime(0); if(!isAnimating) setIsAnimating(true); };
  const toggleSound = () => {
    initializeAudio();
     if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    setIsSoundOn(!isSoundOn);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, duration: 0.5, ease: "easeOut" }
    })
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-10"
    >
      <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={0} className="glass-effect-dark p-6 md:p-8 rounded-2xl shadow-xl">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 flex items-center neon-text-blue">
          <BookOpen className="h-10 w-10 mr-4" />
          Explora las Ondas Estacionarias
        </h2>
        <p className="text-slate-200 mb-4 text-lg leading-relaxed">
          ¡Hola, futuros científicos! Las ondas estacionarias son como un baile mágico de ondas. Imagina dos olas chocando de frente: en vez de seguir su camino, ¡forman un patrón que se queda quieto!
        </p>
        <p className="text-slate-200 mb-6 text-lg leading-relaxed">
          Estos patrones tienen puntos quietos llamados <strong className="neon-text-pink font-semibold">nodos</strong> (¡nada se mueve ahí!) y puntos de máxima agitación llamados <strong className="neon-text-green font-semibold">antinodos</strong> (¡la fiesta de la onda!).
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {[
            {text: "Onda Azul: Viaja hacia la derecha.", color:"blue", icon:<HelpCircle/>},
            {text: "Onda Verde: Viaja hacia la izquierda (rebotada).", color:"green", icon:<HelpCircle/>},
            {text: "Onda Blanca: ¡La Onda Estacionaria! (azul + verde).", color:"white", icon:<Lightbulb/>},
            {text: "Puntos Rojos: Nodos, ¡aquí no hay movimiento!", color:"pink", icon:<Lightbulb/>},
          ].map((item, idx) => (
            <motion.div key={idx} variants={cardVariants} custom={idx+1} className={`flex items-start space-x-3 p-3 bg-${item.color}-700/30 rounded-lg`}>
              {React.cloneElement(item.icon, {className: `h-6 w-6 text-${item.color}-400 mt-1 flex-shrink-0`})}
              <span className={`text-${item.color === 'white' ? 'slate-100' : item.color + '-300'} text-sm`}>{item.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={1} className="glass-effect-dark p-6 md:p-8 rounded-2xl shadow-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
          <h3 className="text-3xl font-bold neon-text-purple mb-4 sm:mb-0">¡Anímate a Verlo!</h3>
          <div className="flex space-x-3">
            <Button onClick={toggleSound} className={`button-${isSoundOn ? 'pink' : 'gray'} text-sm px-4 py-2.5`}>
              {isSoundOn ? <Volume2 className="h-5 w-5 mr-2" /> : <VolumeX className="h-5 w-5 mr-2" />}
              {isSoundOn ? 'Sonido ON' : 'Sonido OFF'}
            </Button>
            <Button onClick={toggleAnimation} className={`button-${isAnimating ? 'red' : 'teal'} text-sm px-5 py-2.5`}>
              {isAnimating ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
              {isAnimating ? 'Pausar Ola' : '¡Ola Va!'}
            </Button>
            <Button onClick={resetAnimation} className="button-purple text-sm px-5 py-2.5">
              <RotateCcw className="h-5 w-5 mr-2" />
              Reiniciar
            </Button>
          </div>
        </div>
        <div className="canvas-bg-dark h-64 md:h-80">
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>
        <p className="text-slate-300 text-sm mt-6 text-center italic">
          ¡Mira cómo las ondas incidente (azul) y reflejada (verde) se combinan para crear la onda estacionaria (blanca)! Los puntos rojos son los nodos quietecitos.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8">
        <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={2} className="glass-effect-dark p-6 rounded-2xl shadow-xl">
          <h3 className="text-3xl font-bold neon-text-yellow mb-6">Fórmulas Clave (¡Sin Miedo!)</h3>
          <div className="space-y-6">
            {[
              {title: "Frecuencia Mágica (f<sub>n</sub>)", formula: "n × (v / 2L)", color:"green", details: "Calcula qué tan rápido vibra la onda. 'n' es el número del armónico (1, 2, 3...), 'v' la velocidad de la onda, 'L' el largo de la cuerda o tubo."},
              {title: "Tamaño de la Onda (λ<sub>n</sub>)", formula: "2L / n", color:"blue", details: "Mide qué tan larga es una onda completa."},
              {title: "Velocidad en Cuerdas (v)", formula: "√(T / μ)", color:"purple", details: "¡Qué tan rápido va la onda en una cuerda! 'T' es la tensión (qué tan apretada está) y 'μ' la densidad (qué tan 'gordita' es)."},
            ].map((item, idx) => (
              <div key={idx} className={`bg-${item.color}-800/40 p-4 rounded-lg border-l-4 border-${item.color}-500`}>
                <p className={`neon-text-${item.color} text-xl font-semibold mb-1`}>{item.title}</p>
                <p className={`text-${item.color}-300 font-mono text-2xl mb-2 bg-black/30 px-2 py-1 rounded inline-block`}>{item.formula}</p>
                <p className="text-slate-300 text-xs leading-snug">{item.details}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={3} className="glass-effect-dark p-6 rounded-2xl shadow-xl">
          <h3 className="text-3xl font-bold neon-text-pink mb-6">¿Dónde se Queda Quieta?</h3>
          <p className="text-slate-200 mb-4 leading-relaxed">
            Las ondas estacionarias necesitan "paredes" o límites para formarse. ¡Estos límites deciden dónde estarán los nodos!
          </p>
          <div className="space-y-5">
            <div className="bg-red-700/30 p-4 rounded-lg border-l-4 border-red-500">
              <h4 className="neon-text-red font-semibold mb-1 text-lg">Extremos Fijos (Como una guitarra):</h4>
              <p className="text-slate-300 text-sm">Si los extremos están quietos, ¡ahí siempre habrá NODOS! La onda no puede moverse en esos puntos.</p>
            </div>
            <div className="bg-teal-700/30 p-4 rounded-lg border-l-4 border-teal-500">
              <h4 className="neon-text-teal font-semibold mb-1 text-lg">Extremos Libres (Como un tubo abierto):</h4>
              <p className="text-slate-300 text-sm">Si un extremo está libre, ¡ahí la onda se agita al máximo! Se forma un ANTINODO.</p>
            </div>
          </div>
           <p className="text-slate-300 mt-6 text-sm italic">
            ¡Estas reglas ayudan a los músicos a crear diferentes notas!
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
