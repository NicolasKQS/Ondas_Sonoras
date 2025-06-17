
import React from 'react';
import { HelpCircle, TrendingUp, TrendingDown, GitCommit } from 'lucide-react';

export function NodesAntinodesInterpretation({ fundamentalFreq, harmonics }) {
  // Assuming a standard wave speed for demonstration if not calculable from app context directly.
  // This could be enhanced by passing a calculated wave speed if available.
  const DEMO_WAVE_SPEED = 343; // m/s (speed of sound in air)
  let stringLength = 1; // Default length in meters for conceptual display
  let harmonicNumber = 1; // By default, show for fundamental (n=1)

  if (fundamentalFreq > 0) {
    // Calculate a conceptual string length based on the fundamental
    // L = (n * v) / (2 * f_n). For fundamental n=1.
    stringLength = (1 * DEMO_WAVE_SPEED) / (2 * fundamentalFreq);
    stringLength = Math.min(Math.max(stringLength, 0.1), 2); // Clamp length for display
    
    // Determine which harmonic is most prominent or stick to fundamental
    const primaryHarmonic = harmonics.find(h => h.isFundamental) || 
                           (harmonics.length > 0 ? harmonics.sort((a,b) => b.amplitude - a.amplitude)[0] : null);
    if (primaryHarmonic && primaryHarmonic.order > 0) {
        harmonicNumber = primaryHarmonic.order;
    }
  }
  
  const nodes = [];
  const antinodes = [];

  if (fundamentalFreq > 0) {
    for (let i = 0; i <= harmonicNumber; i++) {
      nodes.push(((i / harmonicNumber) * stringLength).toFixed(2));
    }
    for (let i = 0; i < harmonicNumber; i++) {
      antinodes.push((((i + 0.5) / harmonicNumber) * stringLength).toFixed(2));
    }
  }

  return (
    <div className="glass-effect-dark p-6 md:p-8 rounded-2xl shadow-xl">
      <h3 className="text-2xl md:text-3xl font-bold neon-text-teal mb-6 flex items-center">
        <GitCommit className="h-8 w-8 mr-3 transform rotate-90"/>Nodos y Antinodos en una Cuerda
      </h3>
      {fundamentalFreq > 0 ? (
        <div className="space-y-6">
          <p className="text-slate-200 leading-relaxed">
            Para una frecuencia fundamental de <strong className="neon-text-green font-semibold">{fundamentalFreq.toFixed(0)} Hz</strong>,
            visualizamos una cuerda vibrando en su armónico N°<strong className="neon-text-yellow">{harmonicNumber}</strong>.
            La longitud conceptual de esta cuerda sería de aproximadamente <strong className="text-white font-semibold">{stringLength.toFixed(2)} m</strong> (asumiendo v={DEMO_WAVE_SPEED}m/s).
          </p>
          <div className="grid sm:grid-cols-2 gap-6 text-sm">
            <div className="bg-red-700/30 p-4 rounded-lg border-l-4 border-red-500">
              <h4 className="font-bold text-red-400 mb-2 text-lg flex items-center"><TrendingDown className="mr-2"/>Nodos (Puntos de Reposo):</h4>
              {nodes.length > 0 ? (
                <ul className="list-disc list-inside text-slate-300 space-y-1">
                  {nodes.map((node, i) => <li key={i}>A <strong className="text-white">{node} m</strong></li>)}
                </ul>
              ) : <p className="text-slate-400">No hay datos de nodos.</p>}
            </div>
            <div className="bg-blue-700/30 p-4 rounded-lg border-l-4 border-blue-500">
              <h4 className="font-bold text-blue-300 mb-2 text-lg flex items-center"><TrendingUp className="mr-2"/>Antinodos (Máxima Vibración):</h4>
              {antinodes.length > 0 ? (
                <ul className="list-disc list-inside text-slate-300 space-y-1">
                  {antinodes.map((antinode, i) => <li key={i}>A <strong className="text-white">{antinode} m</strong></li>)}
                </ul>
              ): <p className="text-slate-400">No hay datos de antinodos.</p>}
            </div>
          </div>
          <p className="text-slate-300 text-xs italic leading-relaxed">
            Esta es una representación idealizada. Los armónicos adicionales enriquecen el sonido real.
          </p>
        </div>
      ) : (
        <div className="text-center text-slate-300 py-8">
          <GitCommit className="h-16 w-16 mx-auto mb-4 opacity-30 transform rotate-90 animate-pulse" />
          <p className="text-lg">Analice un sonido para visualizar sus puntos de resonancia.</p>
        </div>
      )}
    </div>
  );
}
