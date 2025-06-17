
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Brain, ArrowLeft, Timer, Award, RotateCcw, HelpCircle, Eye } from 'lucide-react';
import { playFrequencySound } from '@/lib/gameAudio';

const WAVE_TYPES_NORMAL = ['sine', 'square', 'triangle', 'sawtooth'];
const WAVE_TYPES_ADVANCED = ['sine', 'square', 'triangle', 'sawtooth', 'pulse', 'noise']; // Added pulse and noise
const WAVE_COLORS = { 
    sine: '#34d399', square: '#fb923c', triangle: '#a78bfa', sawtooth: '#f87171',
    pulse: '#ec4899', noise: '#60a5fa' 
};

const drawWaveShape = (canvas, waveType, color, animationProgress = 1) => {
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
    ctx.lineWidth = Math.max(2, width / 30); // Responsive line width
    ctx.beginPath();
    
    const amplitude = height / 3;
    const centerY = height / 2;

    if (waveType === 'noise') {
        for (let x = 0; x < width; x++) {
            const y = Math.random() * amplitude * 2 - amplitude;
            ctx.lineTo(x, centerY + y * animationProgress);
        }
    } else {
        for (let x = 0; x < width; x++) {
            const angle = (x / width) * Math.PI * 4 * animationProgress; // Two full cycles
            let yValue = 0;
            switch (waveType) {
                case 'sine': yValue = Math.sin(angle); break;
                case 'square': yValue = Math.sign(Math.sin(angle)); break;
                case 'triangle': yValue = (Math.abs((angle / Math.PI) % 2 - 1) * 2) - 1; break;
                case 'sawtooth': yValue = ((angle / Math.PI) % 2) - 1; break;
                case 'pulse': 
                    const period = Math.PI * 2;
                    const dutyCycle = 0.25; // 25% duty cycle
                    yValue = (angle % period) < (period * dutyCycle) ? 1 : -1;
                    break;
                default: yValue = Math.sin(angle);
            }
            ctx.lineTo(x, centerY + yValue * amplitude);
        }
    }
    ctx.stroke();
};

const WaveCard = React.memo(({ card, isFlipped, isMatched, onClick, isDisabled }) => {
    const canvasRef = useRef(null);
    
    useEffect(() => {
        if ((isFlipped || isMatched) && canvasRef.current) {
            let progress = 0;
            const animId = requestAnimationFrame(function animate() {
                progress += 0.05;
                if (progress > 1) progress = 1;
                drawWaveShape(canvasRef.current, card.type, WAVE_COLORS[card.type], progress);
                if (progress < 1) requestAnimationFrame(animate);
            });
            return () => cancelAnimationFrame(animId);
        }
    }, [isFlipped, isMatched, card.type]);

    return (
        <motion.div 
            className={`w-full aspect-square rounded-lg overflow-hidden ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            onClick={!isDisabled ? onClick : undefined}
            animate={{ rotateY: (isFlipped || isMatched) ? 180 : 0, scale: (isFlipped || isMatched) ? 1.05 : 1 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 150, damping: 15 }}
            whileHover={{ scale: isDisabled ? 1 : 1.08, transition: { duration: 0.2 } }}
        >
            <div className="relative w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
                <div className="absolute w-full h-full backface-hidden rounded-lg bg-slate-700/50 flex items-center justify-center border-2 border-slate-600">
                    <Brain className="w-1/2 h-1/2 text-slate-500"/>
                </div>
                <motion.div 
                    className="absolute w-full h-full backface-hidden rounded-lg bg-slate-800 p-1 md:p-2 border-2" 
                    style={{ transform: 'rotateY(180deg)' }}
                    animate={{ borderColor: isMatched ? WAVE_COLORS[card.type] : '#475569' }}
                >
                    <canvas ref={canvasRef} className="w-full h-full"></canvas>
                </motion.div>
            </div>
        </motion.div>
    );
});

export function WaveMemoryGame({ onBack, toast, gameAudioContextPack }) {
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isCheckingPair, setIsCheckingPair] = useState(false);
  const [gameMode, setGameMode] = useState('normal'); // 'normal' or 'advanced'
  const [hintsLeft, setHintsLeft] = useState(1); // Hints for advanced mode
  const currentWaveTypes = gameMode === 'advanced' ? WAVE_TYPES_ADVANCED : WAVE_TYPES_NORMAL;

  const gameScreenVariants = {
    initial: { opacity: 0, x: 300 },
    animate: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100, damping: 20 } },
    exit: { opacity: 0, x: -300, transition: { duration: 0.2 } },
  };

  const setupGame = useCallback(() => {
    const types = gameMode === 'advanced' ? WAVE_TYPES_ADVANCED : WAVE_TYPES_NORMAL;
    const wavePairs = types.flatMap(type => [{id: `${type}1`, type}, {id: `${type}2`, type}]);
    setCards(wavePairs.sort(() => Math.random() - 0.5));
    setFlippedIndices([]);
    setMatchedPairs([]);
    setMoves(0);
    setTimeLeft(gameMode === 'advanced' ? 90 : 60); // More time for advanced
    setHintsLeft(gameMode === 'advanced' ? 2 : 1);
    setIsCheckingPair(false);
  }, [gameMode]);

  useEffect(setupGame, [setupGame]);

  useEffect(() => {
    if (timeLeft > 0 && matchedPairs.length < currentWaveTypes.length) {
      const timerId = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (timeLeft === 0 && matchedPairs.length < currentWaveTypes.length) {
      toast({ title: "¡Tiempo Agotado!", description: `No encontraste todos los pares. Movimientos: ${moves}`, variant: "destructive", duration: 4000 });
    }
  }, [timeLeft, matchedPairs, moves, toast, currentWaveTypes.length]);

  useEffect(() => {
      if (flippedIndices.length === 2) {
          setIsCheckingPair(true);
          const [firstIndex, secondIndex] = flippedIndices;
          if (cards[firstIndex].type === cards[secondIndex].type) {
              setMatchedPairs(prev => [...prev, cards[firstIndex].type]);
              if (gameAudioContextPack) playFrequencySound(gameAudioContextPack, 200 + currentWaveTypes.indexOf(cards[firstIndex].type) * 100, 0.2, 'triangle');
              setFlippedIndices([]); 
              setIsCheckingPair(false);
          } else {
              if (gameAudioContextPack) playFrequencySound(gameAudioContextPack, 100, 0.2, 'square');
              setTimeout(() => {
                setFlippedIndices([]);
                setIsCheckingPair(false);
              }, 1000); 
          }
      }
  }, [flippedIndices, cards, gameAudioContextPack, currentWaveTypes]);

  const handleCardClick = (index) => {
      if (isCheckingPair || flippedIndices.includes(index) || matchedPairs.includes(cards[index].type) || timeLeft === 0) {
          return;
      }
      setMoves(m => m + 1);
      setFlippedIndices(prev => [...prev, index]);
  };

  const useHint = () => {
    if (hintsLeft > 0 && matchedPairs.length < currentWaveTypes.length) {
        setHintsLeft(h => h - 1);
        const unMatchedCards = cards.filter(card => !matchedPairs.includes(card.type) && !flippedIndices.some(idx => cards[idx].id === card.id));
        if (unMatchedCards.length >= 2) {
            // Find a pair
            const firstCardOfPair = unMatchedCards[0];
            const secondCardOfPairIndex = cards.findIndex(c => c.type === firstCardOfPair.type && c.id !== firstCardOfPair.id && !matchedPairs.includes(c.type));
            const firstCardIndex = cards.findIndex(c => c.id === firstCardOfPair.id);

            if (firstCardIndex !== -1 && secondCardOfPairIndex !== -1) {
                 setFlippedIndices([firstCardIndex, secondCardOfPairIndex]);
                 toast({title: "¡Pista Usada!", description: `Se revelaron dos cartas.`, className: "bg-yellow-500 border-yellow-600 text-white"});
            }
        }
    }
  };
  
  const switchGameMode = (newMode) => {
    setGameMode(newMode);
    // setupGame will be called by useEffect due to gameMode change
  };

  if (matchedPairs.length === currentWaveTypes.length || (timeLeft === 0 && matchedPairs.length < currentWaveTypes.length)) {
    return (
        <motion.div 
            key="memoryGameOver"
            variants={gameScreenVariants} 
            initial="initial" animate="animate" exit="exit"
            className="glass-effect-dark p-6 md:p-8 rounded-2xl shadow-xl text-center"
        >
            {matchedPairs.length === currentWaveTypes.length ? (
                <>
                    <Award className="h-16 w-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
                    <p className="text-2xl font-bold text-green-400 mb-4">¡Felicidades! ¡Encontraste todos los pares!</p>
                    <p className="text-slate-300">Modo: <span className="font-semibold text-sky-400">{gameMode === 'advanced' ? 'Avanzado' : 'Normal'}</span></p>
                    <p className="text-slate-300">Movimientos: <span className="font-semibold">{moves}</span></p>
                    <p className="text-slate-300 mb-6">Tiempo restante: <span className="font-semibold">{timeLeft}s</span></p>
                </>
            ) : (
                <>
                    <Timer className="h-16 w-16 text-red-400 mx-auto mb-4" />
                    <p className="text-2xl font-bold text-red-400 mb-4">¡Se acabó el tiempo!</p>
                    <p className="text-slate-300">Modo: <span className="font-semibold text-sky-400">{gameMode === 'advanced' ? 'Avanzado' : 'Normal'}</span></p>
                    <p className="text-slate-300">Encontraste {matchedPairs.length} de {currentWaveTypes.length} pares.</p>
                    <p className="text-slate-300 mb-6">Movimientos: {moves}</p>
                </>
            )}
            <div className="flex justify-center space-x-3 mt-4">
                <Button onClick={() => switchGameMode('normal')} className="button-green py-3 text-md"><RotateCcw className="h-5 w-5 mr-2" /> Normal</Button>
                <Button onClick={() => switchGameMode('advanced')} className="button-orange py-3 text-md"><Brain className="h-5 w-5 mr-2" /> Avanzado</Button>
                <Button onClick={onBack} variant="ghost" className="text-slate-300 hover:text-emerald-400"><ArrowLeft className="mr-2"/>Volver</Button>
            </div>
        </motion.div>
    );
  }


  return (
    <motion.div 
        key="memoryGameActive"
        variants={gameScreenVariants} 
        initial="initial" animate="animate" exit="exit"
        className="glass-effect-dark p-6 md:p-8 rounded-2xl shadow-xl"
    >
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-3xl font-bold neon-text-green">Memory de Ondas <span className="text-lg text-sky-300">({gameMode})</span></h3>
            <Button onClick={onBack} variant="ghost" className="text-slate-300 hover:text-emerald-400"><ArrowLeft className="mr-2"/>Volver</Button>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-lg mb-6 text-center grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <p>Movimientos: <span className="font-bold text-yellow-400">{moves}</span></p>
            <p>Pares: <span className="font-bold text-green-400">{matchedPairs.length} / {currentWaveTypes.length}</span></p>
            <p><Timer className="inline h-4 w-4 mr-1 text-red-400"/> {timeLeft > 0 ? `${timeLeft}s` : "¡Tiempo!"}</p>
            <p>Pistas: <span className="font-bold text-orange-400">{hintsLeft > 0 ? '💡'.repeat(hintsLeft) : '🚫'}</span></p>
        </div>
        
        <div className={`grid ${gameMode === 'advanced' ? 'grid-cols-4 md:grid-cols-6' : 'grid-cols-4'} gap-1.5 md:gap-2.5`}>
            {cards.map((card, index) => (
                <WaveCard 
                    key={card.id} 
                    card={card} 
                    isFlipped={flippedIndices.includes(index)} 
                    isMatched={matchedPairs.includes(card.type)} 
                    onClick={() => handleCardClick(index)}
                    isDisabled={isCheckingPair && flippedIndices.length === 2 && !flippedIndices.includes(index)}
                />
            ))}
        </div>
        <div className="mt-6 flex justify-center space-x-4">
            <Button onClick={useHint} className="button-yellow" disabled={hintsLeft <= 0 || gameMode !== 'advanced'}><HelpCircle className="mr-2 h-5 w-5"/>Usar Pista ({hintsLeft})</Button>
            <Button onClick={() => switchGameMode(gameMode === 'normal' ? 'advanced' : 'normal')} className="button-purple">
                <Eye className="mr-2 h-5 w-5"/> Cambiar a {gameMode === 'normal' ? 'Avanzado' : 'Normal'}
            </Button>
        </div>
    </motion.div>
  );
}
