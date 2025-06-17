
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Volume2, CheckCircle, RotateCcw, ArrowLeft, Target, Palette, HelpCircle } from 'lucide-react';
import { playFrequencySound, stopAllGameSounds } from '@/lib/gameAudio'; 

const SPECTRAL_RHYTHM_TARGETS = [
    { name: "Bajo Profundo", freqs: [60, 120, 180], amps: [0.8, 0.5, 0.3], difficulty: 1 },
    { name: "Voz Media Clara", freqs: [250, 500, 750], amps: [0.7, 0.9, 0.6], difficulty: 1 },
    { name: "Agudo Brillante", freqs: [1000, 2000, 3000], amps: [0.5, 0.7, 0.4], difficulty: 2 },
    { name: "Complejo Equilibrado", freqs: [100, 400, 800, 1500], amps: [0.6, 0.5, 0.7, 0.4], difficulty: 2 },
    { name: "Coro Armónico", freqs: [220, 330, 440, 550, 660], amps: [0.8, 0.6, 0.9, 0.5, 0.7], difficulty: 3 },
    { name: "Textura Metálica", freqs: [300, 900, 1200, 2100, 3500], amps: [0.7, 0.4, 0.8, 0.5, 0.6], difficulty: 3 },
];

export function SpectralRhythmGame({ onBack, toast, gameAudioContextPack }) {
  const [spectralTarget, setSpectralTarget] = useState(null);
  const [spectralSliders, setSpectralSliders] = useState([]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(3);
  const [hintsLeft, setHintsLeft] = useState(2);
  const spectralOscillatorsRef = useRef([]);
  const gameScreenVariants = {
    initial: { opacity: 0, x: 300 },
    animate: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100, damping: 20 } },
    exit: { opacity: 0, x: -300, transition: { duration: 0.2 } },
  };

  const setupNewRound = useCallback(() => {
    const targetIndex = Math.floor(Math.random() * SPECTRAL_RHYTHM_TARGETS.length);
    const target = SPECTRAL_RHYTHM_TARGETS[targetIndex];
    setSpectralTarget(target);
    setSpectralSliders(target.freqs.map(() => 0.5)); // Start sliders at midpoint
  }, []);

  useEffect(() => {
    if (attempts > 0) {
      setupNewRound();
    } else {
      toast({ title: "¡Juego Terminado!", description: `Puntaje final en Ritmo Espectral: ${score}`, duration: 5000 });
    }
     return () => {
      if (gameAudioContextPack) stopAllGameSounds(gameAudioContextPack, spectralOscillatorsRef);
    };
  }, [attempts]);

  const handleSliderChange = (index, value) => {
    setSpectralSliders(prev => {
        const newSliders = [...prev];
        newSliders[index] = value[0];
        return newSliders;
    });
  };

  const playPreview = (targetOrUser = 'user') => {
    if (!gameAudioContextPack || !gameAudioContextPack.audioCtx || !spectralTarget) return;
    
    stopAllGameSounds(gameAudioContextPack, spectralOscillatorsRef);
    const ampsToPlay = targetOrUser === 'target' ? spectralTarget.amps : spectralSliders;

    spectralTarget.freqs.forEach((freq, index) => {
        const osc = gameAudioContextPack.audioCtx.createOscillator();
        const ampNode = gameAudioContextPack.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, gameAudioContextPack.audioCtx.currentTime);
        ampNode.gain.setValueAtTime(ampsToPlay[index] * 0.15, gameAudioContextPack.audioCtx.currentTime); // Reduced volume
        
        osc.connect(ampNode);
        ampNode.connect(gameAudioContextPack.gainNode);
        
        try {
            osc.start();
            spectralOscillatorsRef.current.push(osc);
        } catch(e) { console.error("Error starting spectral oscillator:", e); }
    });
    
    setTimeout(() => {
        stopAllGameSounds(gameAudioContextPack, spectralOscillatorsRef);
    }, 1800); // Longer preview
  };

  const useHint = () => {
    if (hintsLeft > 0 && spectralTarget) {
        setHintsLeft(h => h - 1);
        const randomIndex = Math.floor(Math.random() * spectralTarget.freqs.length);
        const targetAmp = spectralTarget.amps[randomIndex];
        setSpectralSliders(prev => {
            const newSliders = [...prev];
            newSliders[randomIndex] = targetAmp;
            return newSliders;
        });
        toast({ title: "¡Pista Usada!", description: `Se reveló la amplitud para ${spectralTarget.freqs[randomIndex]} Hz.`, className: "bg-yellow-500 border-yellow-600 text-white" });
    }
  };

  const checkMatch = () => {
    if (!spectralTarget) return;
    let currentScore = 0;
    const maxPossibleScorePerFreq = 100;
    let allCorrect = true;
    spectralTarget.amps.forEach((targetAmp, index) => {
        const userAmp = spectralSliders[index];
        const diff = Math.abs(targetAmp - userAmp);
        const freqScore = Math.max(0, (1 - diff / 0.6)) * maxPossibleScorePerFreq; // Slightly more lenient
        currentScore += freqScore;
        if (Math.abs(targetAmp - userAmp) > 0.15) allCorrect = false; // Threshold for "correct"
    });
    const averageScore = currentScore / spectralTarget.amps.length;
    const pointsAwarded = Math.round(averageScore * (spectralTarget.difficulty || 1));
    
    if (allCorrect || averageScore > 80) { // More lenient for "excellent"
        setScore(s => s + pointsAwarded);
        toast({ title: "¡Excelente Afinación!", description: `Puntaje: +${pointsAwarded}. ¡Siguiente reto!`, className: "bg-green-600 border-green-700 text-white" });
        setupNewRound();
    } else {
        setAttempts(a => a - 1);
        toast({ title: "Casi...", description: `Inténtalo de nuevo. Te quedan ${attempts-1} intentos. Puntaje de ronda: ${Math.round(averageScore)}/100`, variant: "destructive" });
    }
  };

  const resetGame = () => {
    setScore(0); setAttempts(3); setHintsLeft(2);
    // setupNewRound will be called by useEffect due to attempts change
  };

  return (
    <motion.div
        key="spectralRhythmGame"
        variants={gameScreenVariants}
        initial="initial" animate="animate" exit="exit"
        className="glass-effect-dark p-6 md:p-8 rounded-2xl shadow-xl"
    >
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-3xl font-bold neon-text-sky">Ritmo Espectral</h3>
            <Button onClick={onBack} variant="ghost" className="text-slate-300 hover:text-sky-400"><ArrowLeft className="mr-2"/>Volver</Button>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-lg mb-6 text-center grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
            <p>Objetivo: <span className="font-bold text-sky-300">{spectralTarget?.name || 'Cargando...'}</span></p>
            <p>Puntaje: <span className="font-bold text-green-400">{score}</span></p>
            <p>Intentos: <span className="font-bold text-red-400">{attempts > 0 ? '🔥'.repeat(attempts) : '☠️'}</span></p>
            <p>Pistas: <span className="font-bold text-yellow-400">{hintsLeft > 0 ? '💡'.repeat(hintsLeft) : '🚫'}</span></p>
        </div>

        {spectralTarget && attempts > 0 ? (
            <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6 items-start">
                    <div>
                        <h4 className="text-lg font-semibold text-slate-200 mb-3 text-center">Tu Mezcla Sonora <Palette className="inline h-5 w-5 text-purple-400"/></h4>
                        {spectralTarget.freqs.map((freq, index) => (
                            <div key={index} className="mb-3">
                                <label className="text-xs text-slate-300 block mb-1">Frecuencia: {freq} Hz (Amplitud: {(spectralSliders[index]*100).toFixed(0)}%)</label>
                                <Slider
                                    value={[spectralSliders[index]]}
                                    onValueChange={(value) => handleSliderChange(index, value)}
                                    max={1} step={0.01}
                                    className="[&>span:first-child]:h-3 [&>span:first-child]:w-3 [&_[role=slider]]:bg-sky-400 [&_[role=slider]]:shadow-md"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="bg-slate-800/30 p-4 rounded-lg">
                        <h4 className="text-lg font-semibold text-slate-200 mb-3 text-center">Espectro Objetivo <Target className="inline h-5 w-5 text-yellow-400"/></h4>
                        <div className="space-y-2">
                        {spectralTarget.amps.map((amp, index) => (
                            <div key={index} className="flex items-center">
                                <span className="text-xs text-slate-400 w-20">{spectralTarget.freqs[index]} Hz:</span>
                                <div className="w-full h-4 bg-slate-700 rounded overflow-hidden relative">
                                    <motion.div 
                                        className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                                        initial={{width:0}}
                                        animate={{width: `${amp * 100}%`}}
                                        transition={{duration:0.5, delay: index * 0.1}}
                                    ></motion.div>
                                    {/* Visual indicator for user's slider value */}
                                    <motion.div
                                        className="absolute top-0 left-0 h-full border-r-2 border-sky-300 opacity-70"
                                        animate={{width: `${spectralSliders[index] * 100}%`}}
                                        transition={{duration:0.2}}
                                    ></motion.div>
                                </div>
                            </div>
                        ))}
                        </div>
                        <Button onClick={() => playPreview('target')} className="button-yellow w-full mt-4 text-xs py-1.5" disabled={!gameAudioContextPack || !gameAudioContextPack.audioCtx || gameAudioContextPack.audioCtx.state !== 'running'}><Volume2 className="mr-1 h-4 w-4"/>Escuchar Objetivo</Button>
                    </div>
                </div>
                <div className="flex flex-wrap justify-center items-center gap-3 mt-6">
                    <Button onClick={() => playPreview('user')} className="button-purple" disabled={!gameAudioContextPack || !gameAudioContextPack.audioCtx || gameAudioContextPack.audioCtx.state !== 'running'}><Volume2 className="mr-2 h-5 w-5"/>Mi Mezcla</Button>
                    <Button onClick={checkMatch} className="button-green"><CheckCircle className="mr-2 h-5 w-5"/>Comprobar</Button>
                    <Button onClick={useHint} className="button-orange" disabled={hintsLeft <= 0}><HelpCircle className="mr-2 h-5 w-5"/>Usar Pista ({hintsLeft})</Button>
                </div>
            </div>
        ) : (
             <div className="text-center py-8">
                <p className="text-2xl font-bold text-red-400 mb-4">¡Juego Terminado!</p>
                <p className="text-slate-300 mb-6">Tu puntaje final en Ritmo Espectral fue: {score}</p>
                <Button onClick={resetGame} className="button-orange py-3 text-lg"><RotateCcw className="h-6 w-6 mr-2" /> Jugar de Nuevo</Button>
            </div>
        )}
    </motion.div>
  );
}
