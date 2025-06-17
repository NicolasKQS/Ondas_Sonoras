
import React, { useRef, useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Music, BarChart3, SlidersHorizontal, ListMusic as FileMusic, Layers, GitCommit } from 'lucide-react';
import { useAudioContext } from '@/context/AudioProcessorContext';
import { AudioControls } from '@/components/audio/AudioControls';
import { AudioVisualizations } from '@/components/audio/AudioVisualizations';
import { SpectralAnalysisDisplay } from '@/components/audio/SpectralAnalysisDisplay';
import { NodesAntinodesInterpretation } from '@/components/audio/NodesAntinodesInterpretation';
import { AnalysisReport } from '@/components/audio/AnalysisReport';
import { SpectrogramChart } from '@/components/audio/SpectrogramChart';
import { GeneralStaffDisplay } from '@/components/audio/GeneralStaffDisplay';
import { HarmonicAnalysisChart } from '@/components/audio/HarmonicAnalysisChart';
import { StringResonanceDisplay } from '@/components/audio/StringResonanceDisplay';

const drawTimeDomainWaveformGlobal = (dataArray, canvas, dpr, persist = false, lastDataRef = null) => {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const rect = canvas.getBoundingClientRect();
  
  const currentWidth = Math.floor(rect.width * dpr);
  const currentHeight = Math.floor(rect.height * dpr);

  if (canvas.width !== currentWidth || canvas.height !== currentHeight) {
    canvas.width = currentWidth;
    canvas.height = currentHeight;
    ctx.scale(dpr, dpr);
  }
  
  const width = canvas.width / dpr;
  const height = canvas.height / dpr;

  ctx.clearRect(0,0, width, height);
  
  const activeData = (dataArray && dataArray.length > 0) ? dataArray : (lastDataRef && lastDataRef.current && lastDataRef.current.length > 0 ? lastDataRef.current : null);
  if (!activeData || activeData.length === 0) {
    ctx.fillStyle = 'rgba(156, 163, 175, 0.7)';
    ctx.font = '13px "Nunito", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("Esperando audio...", width / 2 , height / 2);
    return;
  }

  if (persist && dataArray && dataArray.length > 0) {
    lastDataRef.current = new Uint8Array(dataArray);
  }


  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(110, 231, 183, 0.9)'; // emerald-300
  ctx.beginPath();
  const sliceWidth = width / activeData.length;
  let x = 0;
  for (let i = 0; i < activeData.length; i++) {
    const v = activeData[i] / 128.0;
    const y = v * (height / 2);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    x += sliceWidth;
  }
  ctx.lineTo(width, height / 2);
  ctx.stroke();
};

const drawFrequencySpectrumGlobal = (dataArray, canvas, dpr, persist = false, lastDataRef = null) => {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const rect = canvas.getBoundingClientRect();

  const currentWidth = Math.floor(rect.width * dpr);
  const currentHeight = Math.floor(rect.height * dpr);

  if (canvas.width !== currentWidth || canvas.height !== currentHeight) {
    canvas.width = currentWidth;
    canvas.height = currentHeight;
    ctx.scale(dpr, dpr);
  }

  const width = canvas.width / dpr;
  const height = canvas.height / dpr;

  ctx.clearRect(0,0, width, height);

  const activeData = (dataArray && dataArray.length > 0) ? dataArray : (lastDataRef && lastDataRef.current && lastDataRef.current.length > 0 ? lastDataRef.current : null);
  if (!activeData || activeData.length === 0) {
      ctx.fillStyle = 'rgba(156, 163, 175, 0.7)';
      ctx.font = '13px "Nunito", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("Esperando audio...", width / 2 , height / 2);
    return;
  }
  
  if (persist && dataArray && dataArray.length > 0) {
    lastDataRef.current = new Uint8Array(dataArray);
  }

  const numBars = activeData.length / 4; 
  const barWidth = width / numBars;
  let x = 0;
  for (let i = 0; i < numBars; i++) {
    const barHeight = (activeData[i] / 255) * height;
    const hue = (i / numBars) * 120 + 120;
    ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
    ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
    x += barWidth;
  }
};


export function AudioAnalyzer() {
  const {
    isRecording,
    audioBuffer,
    fundamentalFreq,
    harmonics,
    isAnalyzing,
    isPlayingAudio,
    analysisReport,
    startRecording,
    stopRecording,
    playUploadedAudio,
    stopCurrentAudioPlayback,
    handleFileUpload,
    clearAnalysisReport,
    spectrogramData,
    timeDomainDataForPianoRoll,
    lastTimeDomainDataRef,
    lastFrequencyDataRef,
  } = useAudioContext();

  const canvasTimeRef = useRef(null);
  const canvasFreqRef = useRef(null);
  const fileInputRef = useRef(null);
  const reportRef = useRef(null);
  const spectrogramChartRef = useRef(null);
  const generalStaffChartRef = useRef(null);
  const harmonicChartRef = useRef(null);


  const memoizedDrawTime = useCallback((dataArray) => {
    const dpr = window.devicePixelRatio || 1;
    drawTimeDomainWaveformGlobal(dataArray, canvasTimeRef.current, dpr, !isPlayingAudio && !isAnalyzing, lastTimeDomainDataRef);
  }, [isPlayingAudio, isAnalyzing, lastTimeDomainDataRef]);

  const memoizedDrawFreq = useCallback((dataArray) => {
    const dpr = window.devicePixelRatio || 1;
    drawFrequencySpectrumGlobal(dataArray, canvasFreqRef.current, dpr, !isPlayingAudio && !isAnalyzing, lastFrequencyDataRef);
  }, [isPlayingAudio, isAnalyzing, lastFrequencyDataRef]);


  useEffect(() => {
    window.drawTimeDomainWaveform = memoizedDrawTime;
    window.drawFrequencySpectrum = memoizedDrawFreq;
    
    if (!isPlayingAudio && !isAnalyzing) {
        if (lastTimeDomainDataRef.current) memoizedDrawTime(lastTimeDomainDataRef.current);
        if (lastFrequencyDataRef.current) memoizedDrawFreq(lastFrequencyDataRef.current);
    }

    return () => {
      delete window.drawTimeDomainWaveform;
      delete window.drawFrequencySpectrum;
    };
  }, [memoizedDrawTime, memoizedDrawFreq, isPlayingAudio, isAnalyzing, lastTimeDomainDataRef, lastFrequencyDataRef]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, x: -15 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease:"easeOut" }}
  };

  return (
    <motion.div 
      variants={cardVariants} initial="hidden" animate="visible"
      className="space-y-10"
    >
      <div className="grid md:grid-cols-2 gap-8">
        <motion.div variants={itemVariants} className="glass-effect-dark p-6 rounded-2xl shadow-xl">
          <h2 className="text-3xl font-bold neon-text-green mb-6 flex items-center">
            <SlidersHorizontal className="h-8 w-8 mr-3" />
            Control de Audio
          </h2>
          <AudioControls
            isRecording={isRecording}
            audioBuffer={audioBuffer}
            isPlayingAudio={isPlayingAudio}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            onFileUpload={handleFileUpload}
            onPlayAudio={playUploadedAudio}
            onStopAudio={stopCurrentAudioPlayback}
            fileInputRef={fileInputRef}
          />
          <div className="mt-5 text-center text-xs h-4">
            {isRecording && <p className="text-red-400 font-semibold">Grabando audio...</p>}
            {isPlayingAudio && <p className="text-teal-400 font-semibold">Analizando audio en reproducción...</p>}
          </div>
           <div className="mt-6 p-4 bg-blue-700/20 rounded-lg border-l-4 border-blue-500">
            <h4 className="text-md font-semibold text-blue-300 mb-2 flex items-center"><Info className="h-5 w-5 mr-2"/>Nota sobre Micrófonos:</h4>
            <p className="text-xs text-slate-300 leading-snug">
              Un micrófono de buena calidad permite capturar más detalles del sonido, resultando en un análisis más preciso.
            </p>
          </div>
        </motion.div>
        <motion.div variants={itemVariants}>
          <SpectralAnalysisDisplay fundamentalFreq={fundamentalFreq} harmonics={harmonics} />
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <AudioVisualizations canvasTimeRef={canvasTimeRef} canvasFreqRef={canvasFreqRef} />
      </motion.div>

      <motion.div variants={itemVariants} className="glass-effect-dark p-6 rounded-2xl shadow-xl visualization-for-pdf" data-chart-title="Espectrograma">
        <h3 className="text-2xl font-bold neon-text-purple mb-4 flex items-center">
          <Layers className="h-7 w-7 mr-3"/>Espectrograma (Frecuencias vs. Tiempo)
        </h3>
        <div ref={spectrogramChartRef} className="canvas-bg-dark h-64 md:h-80 rounded-lg overflow-hidden chart-container-pdf">
          <SpectrogramChart data={spectrogramData} />
        </div>
        <p className="text-xs text-slate-300 mt-3 text-center">Visualización de la evolución temporal de las frecuencias del sonido. Los colores más intensos indican mayor amplitud.</p>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-effect-dark p-6 rounded-2xl shadow-xl visualization-for-pdf" data-chart-title="Partitura General">
        <h3 className="text-2xl font-bold neon-text-pink mb-4 flex items-center">
          <FileMusic className="h-7 w-7 mr-3"/>Visualización de Partitura General
        </h3>
        <div ref={generalStaffChartRef} className="canvas-bg-dark h-64 md:h-80 rounded-lg overflow-hidden chart-container-pdf">
          <GeneralStaffDisplay data={timeDomainDataForPianoRoll} />
        </div>
        <p className="text-xs text-slate-300 mt-3 text-center">Representación visual de las notas musicales detectadas en el audio en tiempo real.</p>
      </motion.div>
      
      <motion.div variants={itemVariants} className="glass-effect-dark p-6 rounded-2xl shadow-xl visualization-for-pdf" data-chart-title="Análisis de Armónicos">
        <h3 className="text-2xl font-bold neon-text-orange mb-4 flex items-center">
          <BarChart3 className="h-7 w-7 mr-3"/>Análisis Detallado de Armónicos
        </h3>
        <div ref={harmonicChartRef} className="canvas-bg-dark h-64 md:h-80 rounded-lg overflow-hidden chart-container-pdf">
          <HarmonicAnalysisChart fundamentalFreq={fundamentalFreq} harmonics={harmonics} />
        </div>
        <p className="text-xs text-slate-300 mt-3 text-center">Comparación de la amplitud de la frecuencia fundamental con sus armónicos.</p>
      </motion.div>
      
      <AnimatePresence>
        {analysisReport && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto', transition: { duration: 0.5, ease: 'easeInOut' } }}
              exit={{ opacity: 0, height: 0, transition: { duration: 0.3, ease: 'easeInOut' } }}
            >
              <AnalysisReport 
                reportData={analysisReport} 
                onClose={clearAnalysisReport} 
                reportRef={reportRef}
                chartRefs={{
                  spectrogram: spectrogramChartRef,
                  generalStaff: generalStaffChartRef,
                  harmonic: harmonicChartRef,
                }}
              />
            </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={itemVariants}>
        <NodesAntinodesInterpretation 
          fundamentalFreq={analysisReport ? analysisReport.fundamentalFreq : fundamentalFreq} 
          harmonics={analysisReport ? analysisReport.harmonics : harmonics} 
        />
      </motion.div>

      <motion.div variants={itemVariants} className="glass-effect-dark p-6 rounded-2xl shadow-xl visualization-for-pdf" data-chart-title="Resonancia de Cuerda">
        <h3 className="text-2xl font-bold neon-text-cyan mb-4 flex items-center">
          <GitCommit className="h-7 w-7 mr-3"/>Visualización de Resonancia de Cuerda
        </h3>
        <div className="canvas-bg-dark h-64 md:h-80 rounded-lg overflow-hidden chart-container-pdf">
           <StringResonanceDisplay 
             fundamentalFreq={isPlayingAudio || isAnalyzing ? fundamentalFreq : (analysisReport?.fundamentalFreq || 0)} 
             harmonics={isPlayingAudio || isAnalyzing ? harmonics : (analysisReport?.harmonics || [])} 
           />
        </div>
        <p className="text-xs text-slate-300 mt-3 text-center">Representación de cómo vibraría una cuerda ideal con la frecuencia fundamental detectada.</p>
      </motion.div>

    </motion.div>
  );
}
