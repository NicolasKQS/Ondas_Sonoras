
import React from 'react';
import { HelpCircle, TrendingUp, TrendingDown } from 'lucide-react';

export function NodesAntinodesInterpretation({ fundamentalFreq, harmonics }) {
  return (
    <div className="glass-effect-dark p-6 md:p-8 rounded-2xl shadow-xl">
      <h3 className="text-2xl md:text-3xl font-bold neon-text-purple mb-6 flex items-center">
        <HelpCircle className="h-8 w-8 mr-3"/>¿Qué son Nodos y Antinodos?
      </h3>
      {fundamentalFreq > 0 ? (
        <div className="space-y-6">
          <p className="text-slate-200 leading-relaxed">
            Imagina que tu sonido es una cuerda vibrando. Si la frecuencia fundamental (<strong className="neon-text-green font-semibold">{fundamentalFreq} Hz</strong>) es la nota principal de una cuerda de <strong className="text-white font-semibold">1 metro</strong>:
          </p>
          <div className="grid sm:grid-cols-2 gap-6 text-sm">
            <div className="bg-red-700/30 p-4 rounded-lg border-l-4 border-red-500">
              <h4 className="font-bold text-red-400 mb-2 text-lg flex items-center"><TrendingDown className="mr-2"/>Nodos (¡Puntos quietos!):</h4>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                <li>Inicio: <strong className="text-white">0 m</strong></li>
                <li>Medio: <strong className="text-white">0.50 m</strong></li>
                <li>Final: <strong className="text-white">1.00 m</strong></li>
              </ul>
            </div>
            <div className="bg-blue-700/30 p-4 rounded-lg border-l-4 border-blue-500">
              <h4 className="font-bold text-blue-300 mb-2 text-lg flex items-center"><TrendingUp className="mr-2"/>Antinodos (¡Máxima vibración!):</h4>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                <li>Entre nodo 1 y 2: <strong className="text-white">0.25 m</strong></li>
                <li>Entre nodo 2 y 3: <strong className="text-white">0.75 m</strong></li>
              </ul>
            </div>
          </div>
          <p className="text-slate-300 text-xs italic leading-relaxed">
            Psst... ¡Esto es una idea teórica! En la vida real es más complejo. Si hay armónicos (<strong className="neon-text-yellow">{harmonics.map(h => `${h.order}°`).join(', ')}</strong>), ¡el sonido es más rico e interesante!
          </p>
        </div>
      ) : (
        <div className="text-center text-slate-300 py-8">
          <HelpCircle className="h-16 w-16 mx-auto mb-4 opacity-30 animate-bounce-sm" />
          <p className="text-lg">Analiza un sonido para ver dónde estarían sus puntos quietos y de máxima vibración.</p>
        </div>
      )}
    </div>
  );
}
