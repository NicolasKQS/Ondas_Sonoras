
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAudioContext } from '@/context/AudioProcessorContext';
import { Sparkles, BrainCircuit, BarChartHorizontal, Waves, Wind, CloudRain, Star, PauseCircle, PlayCircle, Zap as ThunderIcon, Radio, CircleDotDashed, TestTube2, Leaf, Bird, Sun, Droplets, MountainSnow } from 'lucide-react';

const soundPresets = [
  {
    type: 'ruidoBlanco',
    title: 'Ruido Blanco Suave',
    icon: <Wind className="h-8 w-8 text-cyan-300" />,
    description: 'Sonido constante que contiene todas las frecuencias a igual intensidad, suavizado para reducir estridencia.',
    explanation: 'Utilizado para enmascarar ruidos ambientales, facilitando la concentración y el sueño.',
    color: 'cyan'
  },
  {
    type: 'bosqueLluvioso',
    title: 'Bosque Lluvioso Sereno',
    icon: <Leaf className="h-8 w-8 text-green-300" />,
    description: 'Lluvia suave combinada con cantos de aves y el murmullo del entorno boscoso.',
    explanation: 'Combinación natural que promueve la calma y reduce el estrés, evocando un ambiente pacífico.',
    color: 'green'
  },
  {
    type: 'tormentaLejanaSegura',
    title: 'Tormenta Distante',
    icon: <ThunderIcon className="h-8 w-8 text-slate-300" />,
    description: 'Sonido de truenos lejanos y lluvia calmante, con el susurro del viento.',
    explanation: 'Evoca una sensación de refugio y seguridad, ideal para la relajación o concentración. Elementos equilibrados.',
    color: 'slate'
  },
  {
    type: 'pulsarCosmico',
    title: 'Púlsar Estelar',
    icon: <Waves className="h-8 w-8 text-purple-300" />,
    description: 'Sonificación rítmica de las señales de radio emitidas por una estrella de neutrones en rotación.',
    explanation: 'Los púlsares son objetos astronómicos que emiten radiación periódica. Esta es una interpretación sonora de su pulso.',
    color: 'purple'
  },
  {
    type: 'murmulloQuasar',
    title: 'Susurro de Cuásar',
    icon: <Sparkles className="h-8 w-8 text-yellow-300" />,
    description: 'Interpretación atmosférica de la energía emitida por un agujero negro supermasivo distante.',
    explanation: 'Los cuásares son núcleos galácticos activos extremadamente luminosos. Este sonido evoca su vastedad.',
    color: 'yellow'
  },
   {
    type: 'ecoAgujeroNegro',
    title: 'Eco del Abismo (Perseo)',
    icon: <Star className="h-8 w-8 text-red-300" />,
    description: 'Sonificación inspirada en las ondas de presión de un agujero negro, como el del cúmulo de Perseo.',
    explanation: 'Datos de la NASA convertidos en sonido, revelando "notas" graves. Interpretación artística de este eco cósmico.',
    color: 'red'
  },
  {
    type: 'radioJupiter',
    title: 'Radio Júpiter (NASA)',
    icon: <Radio className="h-8 w-8 text-orange-300" />,
    description: 'Sonidos generados a partir de emisiones de radio reales detectadas en Júpiter.',
    explanation: 'Permite escuchar las emisiones electromagnéticas del gigante gaseoso, capturadas por misiones espaciales.',
    color: 'orange'
  },
  {
    type: 'fondoCosmico',
    title: 'Radiación de Fondo (CMB)',
    icon: <CircleDotDashed className="h-8 w-8 text-teal-300" />,
    description: 'Sonificación del Fondo Cósmico de Microondas, el eco remanente del Big Bang.',
    explanation: 'Convierte el patrón de temperatura del universo primitivo (datos del satélite Planck) en una experiencia auditiva.',
    color: 'teal'
  },
  {
    type: 'meteoritosMarte',
    title: 'Sismos de Meteoritos (Marte)',
    icon: <TestTube2 className="h-8 w-8 text-amber-300" />,
    description: 'Ritmos creados a partir de datos sísmicos de impactos de meteoritos en Marte (misión InSight).',
    explanation: 'Permite sentir los temblores del planeta rojo convertidos en patrones rítmicos y analizar su firma espectral.',
    color: 'amber'
  },
  {
    type: 'auroraSintetizada',
    title: 'Aurora Sintetizada',
    icon: <Sun className="h-8 w-8 text-pink-300" />,
    description: 'Sonido etéreo y brillante que simula las variaciones luminosas de las auroras boreales.',
    explanation: 'Capas de tonos ascendentes y descendentes para crear una atmósfera relajante, inspirada en las auroras.',
    color: 'pink'
  },
  {
    type: 'cantoBallenasProfundo',
    title: 'Canto de Ballenas',
    icon: <Waves className="h-8 w-8 text-blue-300" />,
    description: 'Sonido grave y resonante que evoca la comunicación de estos mamíferos marinos.',
    explanation: 'Sumérjase en las profundidades oceánicas con ecos y reverberaciones que imitan el canto de las ballenas.',
    color: 'blue'
  },
  {
    type: 'vientoSolarSutil',
    title: 'Viento Solar Sutil',
    icon: <Wind className="h-8 w-8 text-rose-300" />,
    description: 'Murmullo agudo y fluctuante que representa el flujo de partículas emitidas por el Sol.',
    explanation: 'Pequeñas variaciones y silbidos se combinan para evocar la sensación del viento solar en el espacio.',
    color: 'rose'
  },
  {
    type: 'geiserRitmico',
    title: 'Géiser Rítmico',
    icon: <Droplets className="h-8 w-8 text-sky-300" />,
    description: 'Sonidos de agua y vapor que emergen en pulsos, creando un ritmo natural y potente.',
    explanation: 'Experimente la fuerza de la naturaleza con este sonido que combina la potencia del agua y el vapor en erupción.',
    color: 'sky'
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
        <h2 className="text-4xl font-bold neon-text-indigo">Universo Sonoro y Cósmico</h2>
        <p className="text-slate-300 mt-2 max-w-2xl mx-auto">Explore sonidos relajantes de la Tierra y las melodías del espacio. Escuche, analice y descubra la ciencia detrás de cada onda.</p>
      </div>

      <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {soundPresets.map((preset, index) => {
          const isCurrentlyPlaying = isPlayingAudio && playingPreset === preset.type;
          return (
            <motion.div
              key={preset.type}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.08, duration: 0.5, ease: 'easeOut' }}
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
                <h4 className="font-semibold text-white mb-1 flex items-center"><BrainCircuit className="h-5 w-5 mr-2 text-slate-300"/>Fundamento Científico</h4>
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
