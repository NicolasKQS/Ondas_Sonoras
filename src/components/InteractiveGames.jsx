
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Volume2, Music, CheckCircle, XCircle, RotateCcw, Gamepad2, Brain, ArrowLeft, Timer, Award, Palette, Target } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAudioContext as useAppAudioContext } from '@/context/AudioProcessorContext';
import { FrequencyGuessGame } from '@/components/games/FrequencyGuessGame';
import { WaveMemoryGame } from '@/components/games/WaveMemoryGame';
import { SpectralRhythmGame } from '@/components/games/SpectralRhythmGame';
import { initializeGameAudioContext, playFrequencySound, stopAllGameSounds } from '@/lib/gameAudio';

export function InteractiveGames() {
  const { toast } = useToast();
  const appAudioContext = useAppAudioContext();
  const [activeGame, setActiveGame] = useState(null);
  const gameAudioContextPack = useRef(null);

  const initializeGameAudio = useCallback(async () => {
    if (appAudioContext.stopCurrentAudioPlayback) {
      appAudioContext.stopCurrentAudioPlayback();
    }
    if (!gameAudioContextPack.current || !gameAudioContextPack.current.audioCtx || gameAudioContextPack.current.audioCtx.state === 'closed') {
      gameAudioContextPack.current = await initializeGameAudioContext();
    }
    if (gameAudioContextPack.current?.audioCtx?.state === 'suspended') {
      try { await gameAudioContextPack.current.audioCtx.resume(); } catch (e) { console.error("Error al resumir el contexto de audio del juego:", e); }
    }
  }, [appAudioContext]);

  useEffect(() => {
    return () => {
      if (gameAudioContextPack.current) {
        stopAllGameSounds(gameAudioContextPack.current);
        if (gameAudioContextPack.current.audioCtx && gameAudioContextPack.current.audioCtx.state !== 'closed') {
          try { gameAudioContextPack.current.audioCtx.close(); gameAudioContextPack.current = null; } catch (e) {}
        }
      }
    };
  }, []);

  const handleGameSelection = (gameType) => {
    initializeGameAudio().then(() => {
      setActiveGame(gameType);
    });
  };

  const playSoundFeedback = useCallback((freq, duration, type) => {
    if (gameAudioContextPack.current) {
      playFrequencySound(gameAudioContextPack.current, freq, duration, type);
    }
  }, []);

  const cardVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1, duration: 0.5 } } };
  const itemVariants = { hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 260, damping: 20 } } };
  
  const renderGameMenu = () => (
    <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-6">
      <button onClick={() => handleGameSelection('frequencyGuess')} className="glass-effect-dark p-6 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-left focus:outline-none focus:ring-2 ring-pink-500">
        <Music className="h-10 w-10 text-pink-400 mb-3" />
        <h3 className="text-xl font-bold neon-text-pink mb-1.5">Adivinar Frecuencia</h3>
        <p className="text-slate-300 text-xs">Escuche y adivine la frecuencia. Perfeccione su audición.</p>
      </button>
      <button onClick={() => handleGameSelection('waveMemory')} className="glass-effect-dark p-6 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-left focus:outline-none focus:ring-2 ring-emerald-500">
        <Brain className="h-10 w-10 text-emerald-400 mb-3" />
        <h3 className="text-xl font-bold neon-text-green mb-1.5">Memoria de Ondas</h3>
        <p className="text-slate-300 text-xs">Encuentre los pares de ondas. Un desafío visual.</p>
      </button>
      <button onClick={() => handleGameSelection('spectralRhythm')} className="glass-effect-dark p-6 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-left focus:outline-none focus:ring-2 ring-sky-500">
        <Palette className="h-10 w-10 text-sky-400 mb-3" />
        <h3 className="text-xl font-bold neon-text-sky mb-1.5">Ritmo Espectral</h3>
        <p className="text-slate-300 text-xs">Ajuste las amplitudes para igualar el espectro objetivo.</p>
      </button>
    </motion.div>
  );

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible" className="space-y-10" onClick={initializeGameAudio}>
      <motion.div variants={itemVariants} className="text-center glass-effect-dark p-8 md:p-12 rounded-3xl shadow-xl">
        <h2 className="text-4xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 flex items-center justify-center"><Gamepad2 className="h-12 w-12 mr-4" />Sección de Juegos Interactivos</h2>
        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">Ponga a prueba su oído, memoria y habilidad para modelar sonidos. (Haga clic aquí para activar el audio si es necesario).</p>
      </motion.div>
      <AnimatePresence mode="wait">
        {!activeGame && renderGameMenu()}
        {activeGame === 'frequencyGuess' && 
          <FrequencyGuessGame 
            onBack={() => setActiveGame(null)} 
            toast={toast} 
            playSound={playSoundFeedback}
            gameAudioContextPack={gameAudioContextPack.current}
          />
        }
        {activeGame === 'waveMemory' && 
          <WaveMemoryGame 
            onBack={() => setActiveGame(null)} 
            toast={toast} 
            playSound={playSoundFeedback}
            gameAudioContextPack={gameAudioContextPack.current}
          />
        }
        {activeGame === 'spectralRhythm' && 
          <SpectralRhythmGame 
            onBack={() => setActiveGame(null)} 
            toast={toast}
            gameAudioContextPack={gameAudioContextPack.current}
          />
        }
      </AnimatePresence>
    </motion.div>
  );
}
