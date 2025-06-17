
import React, { lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { AudioProcessorProvider, useAudioContext } from '@/context/AudioProcessorContext';
import { WaveTheoryAndApplications } from '@/components/WaveTheoryAndApplications';
import { AudioAnalyzer } from '@/components/AudioAnalyzer';
import { WaveSimulator } from '@/components/WaveSimulator';
import { FunFacts } from '@/components/FunFacts';
import { InteractiveGames } from '@/components/InteractiveGames';
import { RelaxingSounds } from '@/components/RelaxingSounds';
import { Navigation } from '@/components/Navigation';
import { Hero } from '@/components/Hero';
import { BookOpen, Music, Atom, Microscope as Telescope, Gamepad2, Info, Moon, BarChart3 } from 'lucide-react';

const AboutModal = lazy(() => import('@/components/AboutModal'));

function App() {
  return (
    <AudioProcessorProvider>
      <AppContent />
    </AudioProcessorProvider>
  );
}

function AppContent() {
  const { activeTab, setActiveTab, isAboutModalOpen, setIsAboutModalOpen } = useAudioContext();

  const tabInfo = {
    explora: { icon: <BookOpen className="mr-2 h-5 w-5 text-blue-400" />, color: 'blue', label: 'Exploración de Ondas' },
    analizador: { icon: <BarChart3 className="mr-2 h-5 w-5 text-green-400" />, color: 'green', label: 'Análisis Profesional' },
    simulador: { icon: <Atom className="mr-2 h-5 w-5 text-purple-400" />, color: 'purple', label: 'Simulador Interactivo' },
    universo: { icon: <Moon className="mr-2 h-5 w-5 text-indigo-400" />, color: 'indigo', label: 'Universo Sonoro' },
    juegos: { icon: <Gamepad2 className="mr-2 h-5 w-5 text-pink-400" />, color: 'pink', label: 'Juegos Educativos' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-black text-slate-100 font-rounded">
      <Navigation onAboutClick={() => setIsAboutModalOpen(true)} />
      
      <main className="container mx-auto px-4 py-8">
        <Hero />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
          className="mt-16"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex flex-wrap items-center justify-center gap-3 mb-10 p-2 rounded-xl bg-slate-900/50 backdrop-blur-md">
              {Object.entries(tabInfo).map(([value, { icon, color, label }]) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className={`
                    text-sm font-semibold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-white
                    hover:bg-${color}-600/40
                    data-[state=active]:bg-${color}-600 data-[state=active]:text-white data-[state=active]:shadow-xl 
                    data-[state=active]:scale-105
                    flex items-center justify-center
                  `}
                >
                  {icon}
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <TabsContent value="explora" forceMount={activeTab === 'explora'}><WaveTheoryAndApplications /></TabsContent>
                <TabsContent value="analizador" forceMount={activeTab === 'analizador'}><AudioAnalyzer /></TabsContent>
                <TabsContent value="simulador" forceMount={activeTab === 'simulador'}><WaveSimulator /></TabsContent>
                <TabsContent value="universo" forceMount={activeTab === 'universo'}><RelaxingSounds /></TabsContent>
                <TabsContent value="juegos" forceMount={activeTab === 'juegos'}><InteractiveGames /></TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </motion.div>
        
        <FunFacts />
      </main>
      
      <Toaster />
      <footer className="py-8 text-center text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Física II: Ondas Estacionarias. Proyecto Educativo.</p>
        <Button variant="link" className="text-slate-400 hover:text-sky-400 mt-2" onClick={() => setIsAboutModalOpen(true)}>
          <Info className="mr-2 h-4 w-4" /> Acerca de este Proyecto
        </Button>
      </footer>
      
      <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center"><p className="text-white">Cargando...</p></div>}>
        {isAboutModalOpen && <AboutModal isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} />}
      </Suspense>
    </div>
  );
}

export default App;
