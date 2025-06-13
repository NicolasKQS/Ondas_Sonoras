
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAudioContext } from '@/context/AudioProcessorContext';
import { Sparkles, BrainCircuit, BarChartHorizontal, Headphones, Waves, Wind, CloudRain, Star, PauseCircle, PlayCircle } from 'lucide-react';

const soundPresets = [
  {
    type: 'ruidoBlanco',
    title: 'Ruido Blanco',
    icon: <Wind className="h-8 w-8 text-cyan-300" />,
    description: 'Sonido con todas las frecuencias a igual intensidad, como una radio sin sintonizar.',
    explanation: 'Enmascara sonidos molestos, creando un ambiente sonoro constante que ayuda al cerebro a relajarse y no distraerse. Ideal para dormir o estudiar.',
    color: 'cyan'
  },
  {
    type: 'lluvia',
    title: 'Lluvia Relajante',
    icon: <CloudRain className="h-8 w-8 text-blue-300" />,
    description: 'El sonido calmante de una lluvia suave y constante.',
    explanation: 'El cerebro interpreta los sonidos de lluvia como no amenazantes y predecibles, lo que reduce el estrés y promueve la calma. Es un tipo de ruido rosa.',
    color: 'blue'
  },
  {
    type: 'pulsar',
    title: 'Púlsar Rítmico',
    icon: <Waves className="h-8 w-8 text-purple-300" />,
    description: 'Simulación de las señales de radio de una estrella de neutrones que gira rápidamente.',
    explanation: 'Los púlsares son faros cósmicos. Convertimos sus señales de radio en audio para estudiarlos. ¡Estás escuchando el ritmo del universo!',
    color: 'purple'
  },
  {
    type: 'quasar',
    title: 'Murmullo de Cuásar',
    icon: <Sparkles className="h-8 w-8 text-yellow-300" />,
    description: 'Interpretación sónica de la energía de un agujero negro supermasivo.',
    explanation: 'Un cuásar es uno de los objetos más lejanos del universo. Este sonido de baja frecuencia representa la inmensa energía en el corazón de una galaxia.',
    color: 'yellow'
  },
   {
    type: 'agujeroNegro',
    title: 'Sonido de Agujero Negro',
    icon: <Star className="h-8 w-8 text-red-300" />,
    description: 'Sonificación de las ondas de presión detectadas desde un agujero negro en el cúmulo de Perseo.',
    explanation: '¡Los agujeros negros no están en silencio! La NASA sonificó datos reales de un agujero negro, revelando una "nota" millones de billones de veces más grave que la que podemos oír.',
    color: 'red'
  },
];

export function RelaxingSounds() {
  const { loadPresetForAnalysis, setActiveTab, playPreset, stopCurrentAudioPlayback, isPlayingAudio, playingPreset } = useAudioContext();
  
  const handleAnalyze = (type) => {
    loadPresetForAnalysis(type);
    setActiveTab('analizador');
  };
  
  const handlePlayToggle = (type) => {
    if (isPlayingAudio && playingPreset === type) {
      stopCurrentAudioPlayback();
    } else {
      playPreset(type);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ staggerChildren: 0.1 }}
      className="space-y-12"
    >
      <div className="text-center">
        <h2 className="text-4xl font-bold neon-text-indigo">Universo Sonoro</h2>
        <p className="text-slate-300 mt-2 max-w-2xl mx-auto">Explora sonidos relajantes y cósmicos. Escúchalos, analízalos y descubre la ciencia detrás de ellos.</p>
      </div>

      <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {soundPresets.map((preset, index) => {
          const isCurrentlyPlaying = isPlayingAudio && playingPreset === preset.type;
          return (
            <motion.div
              key={preset.type}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.15, duration: 0.5, ease: 'easeOut' }}
              className={`glass-effect-dark p-6 rounded-2xl shadow-xl flex flex-col border-2 ${isCurrentlyPlaying ? `border-${preset.color}-500` : 'border-transparent'} transition-all duration-300`}
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className={`p-3 rounded-lg bg-${preset.color}-500/20`}>{preset.icon}</div>
                <div>
                  <h3 className={`text-2xl font-bold text-${preset.color}-300`}>{preset.title}</h3>
                  <p className="text-sm text-slate-400">{preset.description}</p>
                </div>
              </div>
              
              <div className={`my-4 p-4 rounded-lg bg-slate-900/50 border-l-4 border-${preset.color}-500`}>
                <h4 className="font-semibold text-white mb-1 flex items-center"><BrainCircuit className="h-5 w-5 mr-2 text-slate-300"/>¿Por qué funciona?</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{preset.explanation}</p>
              </div>
              
              <div className="mt-auto grid grid-cols-2 gap-3 pt-4">
                <Button onClick={() => handlePlayToggle(preset.type)} className={`w-full button-${preset.color}`}>
                  {isCurrentlyPlaying ? <PauseCircle className="mr-2 h-5 w-5"/> : <PlayCircle className="mr-2 h-5 w-5"/>}
                  {isCurrentlyPlaying ? 'Detener' : 'Escuchar'}
                </Button>
                <Button onClick={() => handleAnalyze(preset.type)} variant="outline" className={`w-full border-2 border-${preset.color}-500 text-${preset.color}-300 hover:bg-${preset.color}-600/30 hover:text-${preset.color}-200`}>
                  <BarChartHorizontal className="mr-2 h-5 w-5"/> Analizar
                </Button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  );
}
