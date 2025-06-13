
import React, { useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Music } from 'lucide-react';
import { useAudioContext } from '@/context/AudioProcessorContext';
import { AudioControls } from '@/components/audio/AudioControls';
import { AudioVisualizations } from '@/components/audio/AudioVisualizations';
import { SpectralAnalysisDisplay } from '@/components/audio/SpectralAnalysisDisplay';
import { NodesAntinodesInterpretation } from '@/components/audio/NodesAntinodesInterpretation';
import { AnalysisReport } from '@/components/audio/AnalysisReport';

const drawTimeDomainWaveformGlobal = (dataArray, canvas, dpr) => {
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
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(110, 231, 183, 0.9)'; // emerald-300
  ctx.beginPath();
  const sliceWidth = width / dataArray.length;
  let x = 0;
  for (let i = 0; i < dataArray.length; i++) {
    const v = dataArray[i] / 128.0;
    const y = v * (height / 2);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    x += sliceWidth;
  }
  ctx.lineTo(width, height / 2);
  ctx.stroke();
};

const drawFrequencySpectrumGlobal = (dataArray, canvas, dpr) => {
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
  const numBars = dataArray.length / 4; 
  const barWidth = width / numBars;
  let x = 0;
  for (let i = 0; i < numBars; i++) {
    const barHeight = (dataArray[i] / 255) * height;
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
  } = useAudioContext();

  const canvasTimeRef = useRef(null);
  const canvasFreqRef = useRef(null);
  const fileInputRef = useRef(null);
  const reportRef = useRef(null);

  const memoizedDrawTime = useCallback((dataArray) => {
    const dpr = window.devicePixelRatio || 1;
    drawTimeDomainWaveformGlobal(dataArray, canvasTimeRef.current, dpr);
  }, []);

  const memoizedDrawFreq = useCallback((dataArray) => {
    const dpr = window.devicePixelRatio || 1;
    drawFrequencySpectrumGlobal(dataArray, canvasFreqRef.current, dpr);
  }, []);


  useEffect(() => {
    window.drawTimeDomainWaveform = memoizedDrawTime;
    window.drawFrequencySpectrum = memoizedDrawFreq;
    
    return () => {
      delete window.drawTimeDomainWaveform;
      delete window.drawFrequencySpectrum;
    };
  }, [memoizedDrawTime, memoizedDrawFreq]);

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
            <Music className="h-8 w-8 mr-3 animate-pulse" />
            Controla el Sonido
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
            {isRecording && <p className="text-red-400 animate-pulse font-semibold">¡Grabando... 🎤</p>}
            {isPlayingAudio && <p className="text-teal-400 animate-pulse font-semibold">¡Analizando en vivo! 🎧</p>}
          </div>
           <div className="mt-6 p-4 bg-blue-700/20 rounded-lg border-l-4 border-blue-500">
            <h4 className="text-md font-semibold text-blue-300 mb-2 flex items-center"><Info className="h-5 w-5 mr-2"/>Dato Curioso del Micrófono:</h4>
            <p className="text-xs text-slate-300 leading-snug">
              Un buen micrófono es como tener súper-oídos para la compu. ¡Capta más detalles del sonido para un análisis más pro!
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
    </motion.div>
  );
}
