
import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, Zap, BarChartBig, StickyNote as MusicNote } from 'lucide-react';
import { freqToNote } from '@/lib/audio-analysis';

export function SpectralAnalysisDisplay({ fundamentalFreq, harmonics }) {
  const note = fundamentalFreq > 0 ? freqToNote(fundamentalFreq) : "N/A";
  return (
    <div className="glass-effect-dark p-6 md:p-8 rounded-2xl shadow-xl h-full flex flex-col">
      <h3 className="text-3xl font-bold neon-text-yellow mb-6 flex items-center">
        <Zap className="h-8 w-8 mr-3 animate-pulse"/>Análisis Espectral en Vivo
      </h3>
      {fundamentalFreq > 0 ? (
        <div className="space-y-5 flex-grow">
          <motion.div 
            initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1}} transition={{delay:0.1, type:"spring", stiffness:200}}
            className="bg-green-700/25 rounded-lg p-5 text-center shadow-md border-2 border-green-500/50"
          >
            <p className="text-green-300 text-sm font-semibold tracking-wider">FRECUENCIA PRINCIPAL</p>
            <p className="neon-text-green text-5xl font-bold my-1.5">{fundamentalFreq} <span className="text-3xl">Hz</span></p>
          </motion.div>

          <motion.div 
            initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1}} transition={{delay:0.15, type:"spring", stiffness:200}}
            className="bg-sky-700/25 rounded-lg p-4 text-center shadow-md border-2 border-sky-500/50"
          >
            <p className="text-sky-300 text-xs font-semibold tracking-wider">NOTA ESTIMADA</p>
            <p className="neon-text-sky text-3xl font-bold my-0.5">{note}</p>
          </motion.div>
          
          {harmonics.length > 0 && (
            <motion.div 
              initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.2}}
              className="bg-blue-700/25 rounded-lg p-5"
            >
              <p className="text-blue-300 font-semibold mb-3 text-center text-sm tracking-wider flex items-center justify-center">
                <BarChartBig className="h-5 w-5 mr-2"/> ARMÓNICOS (TOP 6)
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                {harmonics.slice(0,6).map((h, i) => ( 
                  <motion.div 
                    key={i} 
                    initial={{opacity:0, scale:0.7}} animate={{opacity:1, scale:1}} transition={{delay:0.3 + i*0.05}}
                    className="bg-slate-700/50 rounded p-2.5 text-center"
                  >
                    <span className="text-blue-300 block font-bold">{h.order}° Arm.</span>
                    <span className="text-white text-sm">{h.frequency} Hz</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="text-center text-slate-300 py-12 flex-grow flex flex-col items-center justify-center">
          <Volume2 className="h-20 w-20 mx-auto mb-5 opacity-30 animate-bounce-sm" />
          <p className="text-xl font-semibold">¡Sube o graba un sonido!</p>
          <p className="text-sm mt-1">Y te diré qué notas esconde...</p>
        </div>
      )}
    </div>
  );
}
