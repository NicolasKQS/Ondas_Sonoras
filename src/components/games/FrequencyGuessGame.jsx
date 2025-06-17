
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Volume2, CheckCircle, XCircle, RotateCcw, ArrowLeft, Timer, Zap, ShieldAlert } from 'lucide-react';
import { playFrequencySound } from '@/lib/gameAudio';

const FREQUENCY_GAME_LEVELS = [
  { name: "Novato", range: [400, 600], options: 2, points: 10, livesLost: 1, timeLimit: 20, streakBonus: 2 },
  { name: "Aprendiz", range: [300, 700], options: 3, points: 15, livesLost: 1, timeLimit: 15, streakBonus: 3 },
  { name: "Maestro", range: [200, 800], options: 3, points: 20, livesLost: 1, timeLimit: 10, streakBonus: 5 },
  { name: "Virtuoso", range: [100, 1000], options: 4, points: 30, livesLost: 1, timeLimit: 8, streakBonus: 7 },
  { name: "Leyenda Sónica", range: [50, 1200], options: 4, points: 50, livesLost: 1, timeLimit: 6, streakBonus: 10, isChallenge: true },
];

const generateRandomFrequency = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateOptions = (correctFreq, range, numOptions) => {
  const options = new Set([correctFreq]);
  while (options.size < numOptions) {
    const option = generateRandomFrequency(range[0], range[1]);
    if (option > 0 && Math.abs(option - correctFreq) > 15 && !options.has(option)) options.add(option); // Reduced difference for more challenge
  }
  return Array.from(options).sort(() => Math.random() - 0.5);
};

export function FrequencyGuessGame({ onBack, toast, gameAudioContextPack }) {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [targetFrequency, setTargetFrequency] = useState(null);
  const [frequencyOptions, setFrequencyOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [isPlayingSample, setIsPlayingSample] = useState(false);
  const [timeLeft, setTimeLeft] = useState(FREQUENCY_GAME_LEVELS[0].timeLimit);
  const [streak, setStreak] = useState(0);
  const [gameMode, setGameMode] = useState('normal'); // 'normal' or 'challenge'

  const gameScreenVariants = {
    initial: { opacity: 0, x: 300 },
    animate: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100, damping: 20 } },
    exit: { opacity: 0, x: -300, transition: { duration: 0.2 } },
  };

  const playCurrentTargetFrequency = useCallback(() => {
    if (targetFrequency && gameAudioContextPack) {
      setIsPlayingSample(true);
      playFrequencySound(gameAudioContextPack, targetFrequency, 0.5, 'sine', () => setIsPlayingSample(false)); // Shorter duration
    }
  }, [targetFrequency, gameAudioContextPack]);

  const setupNewRound = useCallback((levelChange = false) => {
    const level = FREQUENCY_GAME_LEVELS[currentLevelIndex];
    setTimeLeft(level.timeLimit);
    const freq = generateRandomFrequency(level.range[0], level.range[1]);
    setTargetFrequency(freq);
    const opts = generateOptions(freq, level.range, level.options);
    setFrequencyOptions(opts);
    setFeedback('');
    if (!levelChange) {
      playCurrentTargetFrequency();
    }
  }, [currentLevelIndex, playCurrentTargetFrequency]);

  useEffect(() => {
    if (attempts > 0) {
      setupNewRound();
    } else {
      setFeedback(`¡Juego Terminado! Puntaje Final: ${score}`);
    }
  }, [attempts, currentLevelIndex, gameMode]); 

   useEffect(() => {
    if (timeLeft > 0 && attempts > 0 && targetFrequency) {
      const timerId = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (timeLeft === 0 && attempts > 0 && targetFrequency) {
      handleGuess(null); 
    }
  }, [timeLeft, attempts, targetFrequency]);

  const handleGuess = (guessedFreq) => {
    if (!targetFrequency || isPlayingSample) return;
    setTimeLeft(FREQUENCY_GAME_LEVELS[currentLevelIndex].timeLimit);
    const currentLevel = FREQUENCY_GAME_LEVELS[currentLevelIndex];

    if (guessedFreq === targetFrequency) {
      const basePoints = currentLevel.points;
      const streakBonusPoints = streak * currentLevel.streakBonus;
      const totalPoints = basePoints + streakBonusPoints;
      setScore(s => s + totalPoints);
      setStreak(s => s + 1);
      setFeedback(`¡Correcto! +${basePoints} ${streakBonusPoints > 0 ? `(+${streakBonusPoints} racha!)` : ''}`);
      toast({ title: "¡Genial!", description: `Adivinaste ${targetFrequency} Hz. Racha: ${streak + 1}`, className: "bg-green-600 border-green-700 text-white" });
      if (gameAudioContextPack) playFrequencySound(gameAudioContextPack, targetFrequency + 400, 0.2, 'sawtooth');
      
      const nextLevelThreshold = (currentLevelIndex + 1) * (gameMode === 'challenge' ? 70 : 50) + (gameMode === 'challenge' ? 30 : 20);
      if (currentLevelIndex < FREQUENCY_GAME_LEVELS.length - 1 && score + totalPoints >= nextLevelThreshold && 
          (gameMode === 'normal' && !FREQUENCY_GAME_LEVELS[currentLevelIndex+1].isChallenge || gameMode === 'challenge')) {
        setCurrentLevelIndex(i => i + 1);
        setFeedback(`¡Nivel Superado! +${totalPoints} pts. Avanzas a ${FREQUENCY_GAME_LEVELS[currentLevelIndex + 1].name}.`);
        setTimeout(() => setupNewRound(true), 1500);
        toast({ title: "¡Subiste de Nivel!", description: `Ahora en ${FREQUENCY_GAME_LEVELS[currentLevelIndex + 1].name}.`, className: "bg-purple-600 border-purple-700 text-white" });
      } else {
        setTimeout(setupNewRound, 1500);
      }
    } else {
      setStreak(0);
      const livesToLose = currentLevel.livesLost;
      const newAttempts = attempts - livesToLose;
      setAttempts(newAttempts);
      setFeedback(guessedFreq === null ? `¡Tiempo agotado! Quedan ${newAttempts > 0 ? newAttempts : 0} vidas.` : `Incorrecto. Quedan ${newAttempts > 0 ? newAttempts : 0} vidas.`);
      toast({ title: "¡Uy!", description: guessedFreq === null ? `Se acabó el tiempo.` : `No era ${guessedFreq} Hz. Intenta de nuevo.`, variant: "destructive" });
      if (gameAudioContextPack) playFrequencySound(gameAudioContextPack, targetFrequency - 200 > 50 ? targetFrequency - 200 : 50, 0.3, 'square');
      
      if (newAttempts <= 0) {
        toast({ title: "¡Juego Terminado!", description: `Tu puntaje fue ${score}. ¡Vuelve a intentarlo!`, duration: 5000 });
        setFeedback(`¡Juego Terminado! Puntaje Final: ${score}`);
      } else {
        setTimeout(setupNewRound, 1500);
      }
    }
  };

  const resetGame = (mode = 'normal') => {
    setGameMode(mode);
    setCurrentLevelIndex(mode === 'challenge' ? FREQUENCY_GAME_LEVELS.findIndex(l => l.isChallenge) : 0); 
    setScore(0); 
    setAttempts(mode === 'challenge' ? 3 : 5); // Fewer attempts for challenge
    setStreak(0);
    // setupNewRound will be called by useEffect due to attempts/currentLevelIndex/gameMode change
  };

  if (attempts <= 0) {
    return (
      <motion.div 
        key="frequencyGameOver" 
        variants={gameScreenVariants} 
        initial="initial" animate="animate" exit="exit"
        className="glass-effect-dark p-6 md:p-8 rounded-2xl shadow-xl text-center"
      >
        <h3 className="text-3xl font-bold neon-text-red mb-4">¡Juego Terminado!</h3>
        <p className="text-xl text-slate-300 mb-2">Modo: <span className="font-semibold text-yellow-400">{gameMode === 'challenge' ? 'Desafío Leyenda' : 'Normal'}</span></p>
        <p className="text-2xl text-slate-200 mb-6">Puntaje Final: <span className="font-bold text-green-400">{score}</span></p>
        <div className="flex justify-center space-x-4">
          <Button onClick={() => resetGame('normal')} className="button-green py-3 text-lg"><RotateCcw className="h-6 w-6 mr-2" /> Jugar Normal</Button>
          <Button onClick={() => resetGame('challenge')} className="button-orange py-3 text-lg"><Zap className="h-6 w-6 mr-2" /> Modo Desafío</Button>
          <Button onClick={onBack} variant="ghost" className="text-slate-300 hover:text-pink-400"><ArrowLeft className="mr-2"/>Volver al Menú</Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
        key="frequencyGameActive" 
        variants={gameScreenVariants} 
        initial="initial" animate="animate" exit="exit"
        className="glass-effect-dark p-6 md:p-8 rounded-2xl shadow-xl"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-3xl font-bold neon-text-pink">Adivina la Frecuencia</h3>
        <Button onClick={onBack} variant="ghost" className="text-slate-300 hover:text-pink-400"><ArrowLeft className="mr-2"/>Volver</Button>
      </div>
      <div className="bg-slate-800/50 p-4 rounded-lg mb-6 text-center grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
        <p>Nivel: <span className="font-bold text-pink-400">{FREQUENCY_GAME_LEVELS[currentLevelIndex].name}</span></p>
        <p>Puntaje: <span className="font-bold text-green-400">{score}</span></p>
        <p>Vidas: <span className="font-bold text-red-400">{attempts > 0 ? '❤️'.repeat(attempts) : '💔'}</span></p>
        <p><Timer className="inline h-4 w-4 mr-1 text-yellow-400"/> {timeLeft}s</p>
        <p>Racha: <span className="font-bold text-orange-400">{streak} <Zap className="inline h-4 w-4"/></span></p>
      </div>
      {targetFrequency ? ( <>
        <Button onClick={playCurrentTargetFrequency} disabled={isPlayingSample || !targetFrequency || !gameAudioContextPack || !gameAudioContextPack.audioCtx || gameAudioContextPack.audioCtx.state !== 'running'} className="button-teal w-full mb-6 py-3 text-lg"><Volume2 className="h-6 w-6 mr-2" /> {isPlayingSample ? 'Escuchando...' : 'Escuchar Sonido'}</Button>
        <div className={`grid grid-cols-2 ${FREQUENCY_GAME_LEVELS[currentLevelIndex].options > 3 ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-3 mb-6`}>
            {frequencyOptions.map(opt => <Button key={opt} onClick={() => handleGuess(opt)} disabled={isPlayingSample} className="button-purple py-4 text-md transform hover:scale-105 transition-transform">{opt} Hz</Button>)}
        </div>
        {feedback && <p className={`text-center font-semibold ${feedback.includes('Correcto') || feedback.includes('Nivel Superado') ? 'text-green-400' : 'text-red-400'}`}>{feedback.includes('Correcto') || feedback.includes('Nivel Superado') ? <CheckCircle className="inline mr-2 h-5 w-5" /> : <XCircle className="inline mr-2 h-5 w-5" />}{feedback}</p>}
      </> ) : (
        <div className="text-center py-8"><p className="text-xl text-slate-300">Cargando siguiente ronda...</p></div>
      )}
       {gameMode === 'normal' && currentLevelIndex === FREQUENCY_GAME_LEVELS.findIndex(l => l.isChallenge) -1 && attempts > 0 && (
         <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="mt-6 text-center">
            <Button onClick={() => resetGame('challenge')} className="button-orange animate-pulse py-3 text-lg">
                <ShieldAlert className="mr-2 h-6 w-6"/> ¡Activar Modo Desafío Leyenda!
            </Button>
         </motion.div>
       )}
    </motion.div>
  );
}
