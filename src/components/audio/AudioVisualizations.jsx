
import React from 'react';
import { LineChart, BarChart2 } from 'lucide-react';

export function AudioVisualizations({ canvasTimeRef, canvasFreqRef }) {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="glass-effect-dark p-6 rounded-2xl shadow-xl">
        <h3 className="text-2xl font-bold neon-text-blue mb-4 flex items-center">
          <LineChart className="h-7 w-7 mr-3"/>Forma de Onda
        </h3>
        <div className="canvas-bg-dark h-48 md:h-56"><canvas ref={canvasTimeRef} className="w-full h-full rounded-lg" /></div>
        <p className="text-xs text-slate-300 mt-3 text-center italic">Así se ve la 'huella' de tu sonido en el tiempo.</p>
      </div>
      <div className="glass-effect-dark p-6 rounded-2xl shadow-xl">
        <h3 className="text-2xl font-bold neon-text-green mb-4 flex items-center">
            <BarChart2 className="h-7 w-7 mr-3"/>Espectro Sonoro
        </h3>
        <div className="canvas-bg-dark h-48 md:h-56"><canvas ref={canvasFreqRef} className="w-full h-full rounded-lg" /></div>
        <p className="text-xs text-slate-300 mt-3 text-center italic">Las barritas muestran qué tan fuertes son las diferentes frecuencias (notas).</p>
      </div>
    </div>
  );
}
