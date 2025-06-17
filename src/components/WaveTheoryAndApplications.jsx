
import React from 'react';
import { WaveTheory } from '@/components/WaveTheory';
import { RealWorldApplications } from '@/components/RealWorldApplications';
import { motion } from 'framer-motion';
import { BookOpen, Users } from 'lucide-react';

export function WaveTheoryAndApplications() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, staggerChildren: 0.2 }}
      className="space-y-16"
    >
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <WaveTheory />
      </motion.div>
      
      <hr className="border-slate-700 my-16" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay:0.2 }}
      >
        <RealWorldApplications />
      </motion.div>
    </motion.div>
  );
}
