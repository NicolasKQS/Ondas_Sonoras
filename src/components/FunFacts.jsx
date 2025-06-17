
import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Zap, Star, Feather } from 'lucide-react';

const facts = [
  {
    icon: <Lightbulb className="text-yellow-400 h-8 w-8" />,
    text: "Los hornos de microondas utilizan ondas estacionarias para calentar los alimentos de manera uniforme. Es un principio físico aplicado en la cocina.",
    color: "yellow"
  },
  {
    icon: <Zap className="text-sky-400 h-8 w-8" />,
    text: "Los láseres pueden formar ondas estacionarias de luz, lo cual es fundamental para su funcionamiento y precisión.",
    color: "sky"
  },
  {
    icon: <Star className="text-pink-400 h-8 w-8" />,
    text: "Algunos animales, como los delfines, usan ondas sonoras y sus ecos (ondas estacionarias) para la ecolocalización en el agua.",
    color: "pink"
  },
  {
    icon: <Lightbulb className="text-lime-400 h-8 w-8" />,
    text: "Los patrones formados por arena sobre una placa vibrante (figuras de Chladni) son una manifestación visual de las ondas estacionarias.",
    color: "lime"
  },
  {
    icon: <Feather className="text-purple-400 h-8 w-8" />,
    text: "Las ondas estacionarias son clave en la levitación acústica, permitiendo que pequeños objetos floten en el aire mediante sonido.",
    color: "purple"
  }
];

export function FunFacts() {
  const [currentFactIndex, setCurrentFactIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFactIndex((prevIndex) => (prevIndex + 1) % facts.length);
    }, 7000); 
    return () => clearInterval(timer);
  }, []);

  const currentFact = facts[currentFactIndex];

  return (
    <motion.div 
      className="mt-16 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
    >
      <div className={`glass-effect-dark p-6 rounded-2xl shadow-xl border-l-4 border-${currentFact.color}-500`}>
        <div className="flex items-center space-x-4">
          <motion.div
            key={currentFactIndex + "icon"} 
            initial={{ scale: 0.5, rotate: -45, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
            className={`p-3 bg-${currentFact.color}-600/40 rounded-full`}
          >
            {currentFact.icon}
          </motion.div>
          <div>
            <h3 className={`text-xl font-bold neon-text-${currentFact.color} mb-1`}>Dato Relevante</h3>
            <motion.p 
              key={currentFactIndex + "text"} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-slate-200 text-sm leading-relaxed"
            >
              {currentFact.text}
            </motion.p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
