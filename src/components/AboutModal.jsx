
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Users, X, Award, Sparkles } from 'lucide-react';

const AboutModal = ({ isOpen, onClose }) => {
  const teamMembers = [
    "Kevin Quisbert",
    "Adalit Ticona",
    "David Uruchi",
    "Jhoel Contreras",
    "Javier Patzi"
  ];

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, y: -50, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit: { opacity: 0, y: 50, scale: 0.9, transition: { duration: 0.2 } },
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
        >
          <motion.div
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
            className="glass-effect-dark p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-md relative border border-sky-500/50"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-3 right-3 text-slate-400 hover:text-sky-300"
            >
              <X className="h-6 w-6" />
            </Button>

            <div className="text-center mb-6">
              <Sparkles className="h-12 w-12 mx-auto text-sky-400 mb-3 animate-pulse" />
              <h2 className="text-3xl font-bold neon-text-blue">Acerca de Física II</h2>
              <p className="text-slate-300 mt-1 text-sm">Una aventura interactiva en el mundo de las ondas.</p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-sky-300 mb-3 flex items-center">
                <Award className="h-6 w-6 mr-2 text-yellow-400" />
                Agradecimientos Especiales
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Este proyecto fue creado con pasión para hacer el aprendizaje de la física más divertido y accesible. 
                ¡Esperamos que disfrutes explorando las maravillas de las ondas!
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-sky-300 mb-3 flex items-center">
                <Users className="h-6 w-6 mr-2 text-green-400" />
                Equipo de Desarrollo
              </h3>
              <ul className="space-y-1.5">
                {teamMembers.map((name, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.3 }}
                    className="text-sm text-slate-200 bg-slate-700/50 p-2.5 rounded-md shadow-sm"
                  >
                    {name}
                  </motion.li>
                ))}
              </ul>
            </div>

            <Button onClick={onClose} className="button-blue w-full mt-8 py-2.5">
              ¡Entendido!
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AboutModal;
