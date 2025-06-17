
import React from 'react';
import { LineChart, BarChart2 } from 'lucide-react';

export function AudioVisualizations({ canvasTimeRef, canvasFreqRef }) {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="glass-effect-dark p-6 rounded-2xl shadow-xl">
        <h3 className="text-2xl font-bold neon-text-blue mb-4 flex items-center">
          <LineChart className="h-7 w-7 mr-3"/>Forma de Onda (Dominio del Tiempo)
        </h3>
        <div className="canvas-bg-dark h-48 md:h-56 rounded-lg overflow-hidden">
            <canvas ref={canvasTimeRef} className="w-full h-full" />
        </div>
        <p className="text-xs text-slate-300 mt-3 text-center">Representación visual de la amplitud del sonido a lo largo del tiempo.</p>
      </div>
      <div className="glass-effect-dark p-6 rounded-2xl shadow-xl">
        <h3 className="text-2xl font-bold neon-text-green mb-4 flex items-center">
            <BarChart2 className="h-7 w-7 mr-3"/>Espectro de Frecuencias (Dominio de la Frecuencia)
        </h3>
        <div className="canvas-bg-dark h-48 md:h-56 rounded-lg overflow-hidden">
            <canvas ref={canvasFreqRef} className="w-full h-full" />
        </div>
        <p className="text-xs text-slate-300 mt-3 text-center">Muestra la intensidad de las diferentes frecuencias presentes en el sonido.</p>
      </div>
    </div>
  );
}
