
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Volume2, Music, CheckCircle, XCircle, RotateCcw, Lightbulb, Gamepad2, Brain, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const FREQUENCY_GAME_LEVELS = [
  { name: "Fácil", range: [250, 450], options: 2, points: 10 },
  { name: "Medio", range: [150, 600], options: 3, points: 20 },
  { name: "Difícil", range: [100, 1000], options: 4, points: 30 },
];

const WAVE_TYPES = ['sine', 'square', 'triangle', 'sawtooth'];
const WAVE_COLORS = { sine: '#34d399', square: '#fb923c', triangle: '#a78bfa', sawtooth: '#f87171' };

const generateRandomFrequency = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateOptions = (correctFreq, range, numOptions) => {
  const options = new Set([correctFreq]);
  while (options.size < numOptions) {
    const option = generateRandomFrequency(range[0], range[1]);
    if (option > 0 && Math.abs(option - correctFreq) > 30) options.add(option);
  }
  return Array.from(options).sort(() => Math.random() - 0.5);
};

const drawWaveShape = (canvas, waveType, color) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    for (let x = 0; x < width; x++) {
        const angle = (x / width) * Math.PI * 4;
        let y = 0;
        switch (waveType) {
            case 'sine': y = Math.sin(angle); break;
            case 'square': y = Math.sign(Math.sin(angle)); break;
            case 'triangle': y = (Math.abs((angle / Math.PI) % 2 - 1) * 2) - 1; break;
            case 'sawtooth': y = ((angle / Math.PI) % 2) - 1; break;
            default: y = Math.sin(angle);
        }
        ctx.lineTo(x, height / 2 + y * (height / 2.5));
    }
    ctx.stroke();
};

const WaveCard = React.memo(({ card, isFlipped, isMatched, onClick }) => {
    const canvasRef = useRef(null);
    
    useEffect(() => {
        if (isFlipped || isMatched) {
            drawWaveShape(canvasRef.current, card.type, WAVE_COLORS[card.type]);
        }
    }, [isFlipped, isMatched, card.type]);

    return (
        <motion.div 
            className="w-full aspect-video cursor-pointer"
            onClick={onClick}
            animate={{ rotateY: (isFlipped || isMatched) ? 180 : 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="relative w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
                <div className="absolute w-full h-full backface-hidden rounded-lg bg-slate-700/50 flex items-center justify-center">
                    <Brain className="w-1/2 h-1/2 text-slate-500"/>
                </div>
                <div className="absolute w-full h-full backface-hidden rounded-lg bg-slate-800 p-2" style={{ transform: 'rotateY(180deg)' }}>
                    <canvas ref={canvasRef} className="w-full h-full"></canvas>
                </div>
            </div>
        </motion.div>
    );
});


export function InteractiveGames() {
  const { toast } = useToast();
  const [activeGame, setActiveGame] = useState(null); 
  
  // Frequency Game State
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [targetFrequency, setTargetFrequency] = useState(null);
  const [frequencyOptions, setFrequencyOptions] = useState([]);
  const [freqScore, setFreqScore] = useState(0);
  const [attempts, setAttempts] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [isPlayingSample, setIsPlayingSample] = useState(false);

  // Memory Game State
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [memoryMoves, setMemoryMoves] = useState(0);

  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);

  const initializeAudio = useCallback(async () => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      try {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.connect(audioContextRef.current.destination);
      } catch (e) { console.error("Could not create AudioContext for game"); }
    }
    if (audioContextRef.current?.state === 'suspended') {
      try { await audioContextRef.current.resume(); } catch (e) { console.error("Error resuming AudioContext for game:", e); }
    }
  }, []);

  const playFrequency = useCallback((freq, duration = 0.7) => {
    initializeAudio().then(() => {
        if (!audioContextRef.current || !gainNodeRef.current || audioContextRef.current.state !== 'running') {
          console.warn("AudioContext not ready for game sound playback."); setIsPlayingSample(false); return;
        }
        if (oscillatorRef.current) { try { oscillatorRef.current.stop(); } catch(e) {} oscillatorRef.current.disconnect(); }
        
        oscillatorRef.current = audioContextRef.current.createOscillator();
        oscillatorRef.current.type = 'sine';
        oscillatorRef.current.frequency.setValueAtTime(freq, audioContextRef.current.currentTime);
        gainNodeRef.current.gain.setValueAtTime(0.2, audioContextRef.current.currentTime);
        gainNodeRef.current.gain.exponentialRampToValueAtTime(0.00001, audioContextRef.current.currentTime + duration);

        oscillatorRef.current.connect(gainNodeRef.current);
        
        try {
            oscillatorRef.current.start(); setIsPlayingSample(true);
            oscillatorRef.current.onended = () => setIsPlayingSample(false);
            oscillatorRef.current.stop(audioContextRef.current.currentTime + duration);
        } catch (e) { console.error("Error playing frequency:", e); setIsPlayingSample(false); }
    });
  }, [initializeAudio]);

  const setupFrequencyGame = useCallback(() => {
    const level = FREQUENCY_GAME_LEVELS[currentLevelIndex];
    const freq = generateRandomFrequency(level.range[0], level.range[1]);
    setTargetFrequency(freq);
    setFrequencyOptions(generateOptions(freq, level.range, level.options));
    setFeedback('');
    playFrequency(freq);
  }, [currentLevelIndex, playFrequency]);

  const setupMemoryGame = useCallback(() => {
    const wavePairs = WAVE_TYPES.flatMap(type => [{id: `${type}1`, type}, {id: `${type}2`, type}]);
    setCards(wavePairs.sort(() => Math.random() - 0.5));
    setFlippedIndices([]);
    setMatchedPairs([]);
    setMemoryMoves(0);
  }, []);

  useEffect(() => {
    if (activeGame === 'frequencyGuess' && attempts > 0) setupFrequencyGame();
    else if (activeGame === 'frequencyGuess' && attempts === 0) setFeedback(`¡Juego Terminado! Puntaje Final: ${freqScore}`);
    if (activeGame === 'waveMemory') setupMemoryGame();
  }, [activeGame, currentLevelIndex, attempts, setupFrequencyGame, setupMemoryGame, freqScore]);
  
  useEffect(() => {
      if(flippedIndices.length === 2) {
          const [firstIndex, secondIndex] = flippedIndices;
          if (cards[firstIndex].type === cards[secondIndex].type) {
              setMatchedPairs(prev => [...prev, cards[firstIndex].type]);
          }
          setTimeout(() => setFlippedIndices([]), 1200);
      }
  }, [flippedIndices, cards]);

  const handleFrequencyGuess = (guessedFreq) => {
    if (!targetFrequency || isPlayingSample) return; 
    if (guessedFreq === targetFrequency) {
      const points = FREQUENCY_GAME_LEVELS[currentLevelIndex].points;
      setFreqScore(freqScore + points);
      setFeedback(`¡Correcto! +${points} puntos. Siguiente sonido...`);
      toast({ title: "¡Genial!", description: `Adivinaste ${targetFrequency} Hz.`, className: "bg-green-600 border-green-700 text-white" });
      if (currentLevelIndex < FREQUENCY_GAME_LEVELS.length - 1 && freqScore + points > (currentLevelIndex + 1) * 50) { 
        setCurrentLevelIndex(currentLevelIndex + 1);
         toast({ title: "¡Subiste de Nivel!", description: `Ahora en ${FREQUENCY_GAME_LEVELS[currentLevelIndex + 1].name}.`, className: "bg-purple-600 border-purple-700 text-white" });
      }
      setTimeout(setupFrequencyGame, 1500);
    } else {
      const newAttempts = attempts - 1;
      setAttempts(newAttempts);
      setFeedback(`Incorrecto. Quedan ${newAttempts} intentos.`);
      toast({ title: "¡Uy!", description: `No era ${guessedFreq} Hz. Intenta de nuevo.`, variant: "destructive" });
      if (newAttempts === 0) {
         toast({ title: "¡Juego Terminado!", description: `Tu puntaje fue ${freqScore}. ¡Vuelve a intentarlo!`, duration: 5000 });
      }
    }
  };

  const handleCardClick = (index) => {
      if (flippedIndices.length === 2 || flippedIndices.includes(index) || matchedPairs.includes(cards[index].type)) {
          return;
      }
      setMemoryMoves(m => m + 1);
      setFlippedIndices(prev => [...prev, index]);
  };

  const resetGame = (game) => {
    if (game === 'frequencyGuess') {
      setCurrentLevelIndex(0); setFreqScore(0); setAttempts(5); setupFrequencyGame();
    } else if (game === 'waveMemory') {
      setupMemoryGame();
    }
  };

  const cardVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1, duration: 0.5 } } };
  const itemVariants = { hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 260, damping: 20 } } };

  const renderGameMenu = () => (
    <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-8">
      <button onClick={() => { initializeAudio(); setActiveGame('frequencyGuess'); resetGame('frequencyGuess'); }} className="glass-effect-dark p-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-left focus:outline-none focus:ring-2 ring-pink-500">
        <Music className="h-12 w-12 text-pink-400 mb-4" />
        <h3 className="text-2xl font-bold neon-text-pink mb-2">Adivina la Frecuencia</h3>
        <p className="text-slate-300 text-sm">Escucha un sonido y adivina cuál es su frecuencia. ¡Afina ese oído!</p>
      </button>
      <button onClick={() => setActiveGame('waveMemory')} className="glass-effect-dark p-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-left focus:outline-none focus:ring-2 ring-emerald-500">
        <Brain className="h-12 w-12 text-emerald-400 mb-4" />
        <h3 className="text-2xl font-bold neon-text-green mb-2">Memory de Ondas</h3>
        <p className="text-slate-300 text-sm">Encuentra los pares de ondas iguales. ¡Un desafío para tu memoria visual!</p>
      </button>
    </motion.div>
  );

  const renderFrequencyGame = () => (
    <motion.div variants={itemVariants} className="glass-effect-dark p-6 md:p-8 rounded-2xl shadow-xl">
      <div className="flex justify-between items-center mb-6"><h3 className="text-3xl font-bold neon-text-pink">Adivina la Frecuencia</h3><Button onClick={() => setActiveGame(null)} variant="ghost" className="text-slate-300 hover:text-pink-400"><ArrowLeft className="mr-2"/>Volver</Button></div>
      <div className="bg-slate-800/50 p-4 rounded-lg mb-6 text-center flex justify-around"><p>Nivel: <span className="font-bold text-pink-400">{FREQUENCY_GAME_LEVELS[currentLevelIndex].name}</span></p><p>Puntaje: <span className="font-bold text-green-400">{freqScore}</span></p><p>Vidas: <span className="font-bold text-red-400">{'❤️'.repeat(attempts)}</span></p></div>
      {attempts > 0 ? ( <>
        <Button onClick={() => targetFrequency && playFrequency(targetFrequency)} disabled={isPlayingSample || !targetFrequency} className="button-teal w-full mb-6 py-3 text-lg"><Volume2 className="h-6 w-6 mr-2" /> {isPlayingSample ? 'Escuchando...' : 'Escuchar Sonido'}</Button>
        <div className={`grid grid-cols-2 gap-4 mb-6`}><Button key={frequencyOptions[0]} onClick={() => handleFrequencyGuess(frequencyOptions[0])} className="button-purple py-4 text-md">{frequencyOptions[0]} Hz</Button><Button key={frequencyOptions[1]} onClick={() => handleFrequencyGuess(frequencyOptions[1])} className="button-purple py-4 text-md">{frequencyOptions[1]} Hz</Button>{frequencyOptions.length > 2 && <Button key={frequencyOptions[2]} onClick={() => handleFrequencyGuess(frequencyOptions[2])} className="button-purple py-4 text-md col-span-2 md:col-span-1">{frequencyOptions[2]} Hz</Button>}</div>
        {feedback && <p className={`text-center font-semibold ${feedback.includes('Correcto') ? 'text-green-400' : 'text-red-400'}`}>{feedback.includes('Correcto') ? <CheckCircle className="inline mr-2 h-5 w-5" /> : <XCircle className="inline mr-2 h-5 w-5" />}{feedback}</p>}
      </> ) : (
        <div className="text-center"><p className="text-2xl font-bold text-red-400 mb-4">{feedback || `¡Juego Terminado! Puntaje Final: ${freqScore}`}</p><Button onClick={() => resetGame('frequencyGuess')} className="button-green py-3 text-lg"><RotateCcw className="h-6 w-6 mr-2" /> Jugar de Nuevo</Button></div>
      )}
    </motion.div>
  );

  const renderMemoryGame = () => (
    <motion.div variants={itemVariants} className="glass-effect-dark p-6 md:p-8 rounded-2xl shadow-xl">
        <div className="flex justify-between items-center mb-6"><h3 className="text-3xl font-bold neon-text-green">Memory de Ondas</h3><Button onClick={() => setActiveGame(null)} variant="ghost" className="text-slate-300 hover:text-emerald-400"><ArrowLeft className="mr-2"/>Volver</Button></div>
        <div className="bg-slate-800/50 p-4 rounded-lg mb-6 text-center flex justify-around"><p>Movimientos: <span className="font-bold text-yellow-400">{memoryMoves}</span></p><p>Pares Encontrados: <span className="font-bold text-green-400">{matchedPairs.length} / {WAVE_TYPES.length}</span></p></div>
        {matchedPairs.length === WAVE_TYPES.length ? (
            <div className="text-center py-8"><p className="text-2xl font-bold text-green-400 mb-4">¡Felicidades! ¡Encontraste todos los pares en {memoryMoves} movimientos!</p><Button onClick={() => resetGame('waveMemory')} className="button-green py-3 text-lg"><RotateCcw className="h-6 w-6 mr-2" /> Jugar de Nuevo</Button></div>
        ) : (
            <div className="grid grid-cols-4 gap-4">
                {cards.map((card, index) => (
                    <WaveCard key={card.id} card={card} isFlipped={flippedIndices.includes(index)} isMatched={matchedPairs.includes(card.type)} onClick={() => handleCardClick(index)} />
                ))}
            </div>
        )}
    </motion.div>
  );

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible" className="space-y-10" onClick={initializeAudio}>
      <motion.div variants={itemVariants} className="text-center glass-effect-dark p-8 md:p-12 rounded-3xl shadow-xl">
        <h2 className="text-4xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 flex items-center justify-center"><Gamepad2 className="h-12 w-12 mr-4 animate-bounce-sm" />¡Zona de Juegos!</h2>
        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">¡Pon a prueba tu oído y memoria! (Haz clic para activar el sonido si es necesario)</p>
      </motion.div>
      <AnimatePresence mode="wait">
        <motion.div key={activeGame || 'menu'} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            {!activeGame && renderGameMenu()}
            {activeGame === 'frequencyGuess' && renderFrequencyGame()}
            {activeGame === 'waveMemory' && renderMemoryGame()}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
