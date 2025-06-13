
import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Navigation({ onAboutClick }) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50 shadow-lg"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05, rotate: -2 }}
          >
            <div className="p-3 bg-gradient-to-tr from-blue-500 to-green-500 rounded-xl shadow-md">
              <Activity className="h-7 w-7 text-slate-900" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white">Física II</span>
              <p className="text-sm text-blue-300 tracking-wider">Ondas Divertidas</p>
            </div>
          </motion.div>
          
          <div className="flex items-center space-x-2">
             <Button variant="ghost" onClick={onAboutClick} className="text-slate-300 hover:text-sky-400 hidden md:flex items-center">
              <Info className="mr-2 h-5 w-5" /> Acerca de
            </Button>
            {['🚀', '💡', '🔬', '🎉'].map((emoji, i) => (
              <motion.span 
                key={i}
                className="text-2xl"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
                whileHover={{ scale: 1.5, rotate: Math.random() > 0.5 ? 20 : -20 }}
              >
                {emoji}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
