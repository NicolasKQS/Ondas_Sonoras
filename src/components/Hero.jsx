
import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Music, Aperture, BookOpen } from 'lucide-react';

export function Hero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="text-center py-16 md:py-24 relative overflow-hidden glass-effect-dark rounded-3xl mb-16 shadow-2xl"
    >
      <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-600/30 rounded-full filter blur-3xl opacity-60 animate-pulse"></div>
      <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-purple-600/30 rounded-full filter blur-3xl opacity-60 animate-pulse animation-delay-2000"></div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.3, ease: [0.6, -0.05, 0.01, 0.99] }}
        className="relative z-10 px-4"
      >
        <motion.h1 
          className="text-5xl md:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-green-300 to-purple-400"
          initial={{ letterSpacing: "-0.1em", opacity:0 }}
          animate={{ letterSpacing: "0em", opacity:1 }}
          transition={{ duration: 1, delay: 0.5, ease: "circOut" }}
        >
          ¡Ondas Asombrosas!
        </motion.h1>
        
        <motion.p 
          className="text-xl md:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          Sumérgete en el mundo de las ondas estacionarias. ¡Aprende, experimenta y sorpréndete con la física de forma divertida!
        </motion.p>
        
        <motion.div 
          className="flex flex-wrap justify-center gap-6 text-md text-slate-200"
          initial={{ opacity:0 }}
          animate={{ opacity:1 }}
          transition={{ duration:0.5, delay:1 }}
        >
          {[
            { icon: <BookOpen className="text-blue-400" />, text: "Teoría Clara" },
            { icon: <Music className="text-green-400" />, text: "Analiza Sonidos" },
            { icon: <Zap className="text-purple-400" />, text: "Simula Ondas" },
            { icon: <Aperture className="text-yellow-400" />, text: "Ve Aplicaciones" },
          ].map((item, i) => (
            <motion.div 
              key={item.text}
              className="flex items-center space-x-2 bg-slate-700/50 py-2 px-4 rounded-full shadow-md"
              initial={{ opacity:0, y:10 }}
              animate={{ opacity:1, y:0 }}
              transition={{ duration:0.4, delay: 1 + i*0.15 }}
            >
              {React.cloneElement(item.icon, { className: `${item.icon.props.className} h-6 w-6 animate-bounce-sm` })}
              <span>{item.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
