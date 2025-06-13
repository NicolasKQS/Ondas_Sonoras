
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Upload, Square, PlayCircle, PauseCircle } from 'lucide-react';

export function AudioControls({
  isRecording,
  audioBuffer,
  isPlayingAudio,
  onStartRecording,
  onStopRecording,
  onFileUpload,
  onPlayAudio,
  onStopAudio,
  fileInputRef
}) {
  return (
    <div className="space-y-4">
      <Button onClick={isRecording ? onStopRecording : onStartRecording} 
        className={`w-full py-3.5 text-md font-semibold transition-all duration-300 transform hover:scale-102 ${isRecording ? 'button-red' : 'button-green'}`}>
        {isRecording ? <Square className="h-5 w-5 mr-2 animate-pulse" /> : <Mic className="h-5 w-5 mr-2" />}
        {isRecording ? 'Parar Grabación' : 'Grabar Sonido'}
      </Button>
      
      <div className="relative flex items-center py-1">
        <div className="flex-grow border-t border-slate-600/50"></div>
        <span className="flex-shrink mx-4 text-slate-400 text-xs font-semibold">O TAMBIÉN</span>
        <div className="flex-grow border-t border-slate-600/50"></div>
      </div>
      
      <input ref={fileInputRef} type="file" accept="audio/*" onChange={onFileUpload} className="hidden" />
      <Button onClick={() => fileInputRef.current?.click()} variant="outline" 
        className="w-full py-3.5 text-md font-semibold border-2 border-blue-500 text-blue-300 hover:bg-blue-600/30 hover:text-blue-200 transition-all duration-300 transform hover:scale-102">
        <Upload className="h-5 w-5 mr-2" /> Subir un Audio
      </Button>
      
      {audioBuffer && (
        <Button onClick={isPlayingAudio ? onStopAudio : onPlayAudio} 
          className={`w-full py-3.5 text-md font-semibold transition-all duration-300 transform hover:scale-102 ${isPlayingAudio ? 'button-yellow text-gray-800' : 'button-teal'}`}>
          {isPlayingAudio ? <PauseCircle className="h-5 w-5 mr-2" /> : <PlayCircle className="h-5 w-5 mr-2" />}
          {isPlayingAudio ? 'Pausar Audio' : 'Escuchar Audio'}
        </Button>
      )}
    </div>
  );
}
