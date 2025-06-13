
import React from 'react';
import { motion } from 'framer-motion';
import { Beaker, Music, Waves, Ear, Stethoscope, Radio, Lightbulb, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const applicationData = [
  {
    icon: Music,
    title: "Instrumentos Musicales",
    description: "¡Las guitarras, flautas y tambores usan ondas estacionarias para hacer música! Cambiar el largo o la tensión de una cuerda cambia la nota. ¡Es física en acción!",
    problemSolved: "Crear sonidos bonitos y diferentes notas musicales.",
    color: "pink",
    emoji: "🎸🎷🥁"
  },
  {
    icon: Ear,
    title: "Audífonos con Cancelación de Ruido",
    description: "Estos audífonos 'escuchan' el ruido de afuera y crean una 'anti-onda' que lo cancela. ¡Es como magia para tus oídos, usando la interferencia de ondas!",
    problemSolved: "¡Poder escuchar tu música sin ruidos molestos!",
    color: "blue",
    emoji: "🎧🤫✨"
  },
  {
    icon: Stethoscope,
    title: "Ecografías (Ultrasonido)",
    description: "Los doctores usan ondas de sonido muy agudas (que no oímos) para ver dentro de nuestro cuerpo, ¡como para ver a los bebés antes de nacer! Las ondas rebotan y crean una imagen.",
    problemSolved: "Ver dentro del cuerpo sin tener que operar. ¡Increíble!",
    color: "green",
    emoji: "👶🩺🖼️"
  },
  {
    icon: Radio,
    title: "Antenas de Radio y Wi-Fi",
    description: "Las antenas están diseñadas para que las ondas de radio o Wi-Fi 'encajen' perfectamente en ellas, como una onda estacionaria. ¡Así reciben y envían señales mucho mejor!",
    problemSolved: "Que puedas escuchar la radio o usar internet sin cables.",
    color: "yellow",
    emoji: "📡📶📱"
  },
  {
    icon: Waves,
    title: "Diseño de Salas de Concierto",
    description: "Los arquitectos usan la ciencia de las ondas para que la música suene genial en un teatro. Evitan que algunas notas suenen demasiado fuerte o desaparezcan.",
    problemSolved: "¡Que la música en vivo suene espectacular en todas partes!",
    color: "purple",
    emoji: "🏛️🎶🎤"
  },
  {
    icon: Beaker,
    title: "¡Levitación Acústica!",
    description: "¡Sí, leíste bien! Con ondas sonoras muy fuertes, los científicos pueden hacer que pequeñas cosas floten en el aire, ¡en los nodos de una onda estacionaria! Parece de película.",
    problemSolved: "Mover cosas sin tocarlas. ¡Útil para experimentos delicados!",
    color: "teal",
    emoji: "🧪💧🎈"
  }
];

const cardVariants = {
  hidden: { opacity: 0, scale: 0.8, rotateY:90 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    rotateY:0,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: [0.175, 0.885, 0.32, 1.275] 
    }
  })
};

export function RealWorldApplications() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-12"
    >
      <motion.div 
        initial={{opacity:0, y:-30}} animate={{opacity:1, y:0}} transition={{duration:0.7, ease:"easeOut"}}
        className="text-center glass-effect-dark p-8 md:p-12 rounded-3xl shadow-xl"
      >
        <motion.h1 
          className="text-4xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"
          initial={{ letterSpacing: "-0.05em"}} animate={{ letterSpacing: "0em"}}
          transition={{duration:0.8, delay:0.2, ease:"circOut"}}
        >
          ¡Ondas en Tu Mundo! <span className="inline-block animate-bounce-sm">🌍</span>
        </motion.h1>
        <p className="text-lg md:text-xl text-slate-200 max-w-3xl mx-auto leading-relaxed">
          Las ondas estacionarias no son solo cosas de laboratorio, ¡están en todas partes! Mira cómo esta física genial ayuda a resolver problemas y crea tecnología increíble.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {applicationData.map((app, index) => (
          <motion.div
            key={app.title}
            custom={index}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className={`glass-effect-dark rounded-2xl p-6 shadow-xl flex flex-col border-t-4 border-${app.color}-500 hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-2`}
          >
            <div className={`p-4 rounded-full self-start mb-5 bg-gradient-to-br from-${app.color}-600 to-${app.color}-800 shadow-lg`}>
              <app.icon className={`h-8 w-8 text-white`} />
            </div>
            <h3 className={`text-2xl font-bold neon-text-${app.color} mb-3`}>{app.title}</h3>
            <p className="text-slate-300 text-sm mb-4 flex-grow leading-relaxed">{app.description}</p>
            <div className="mt-auto pt-4 border-t border-slate-600/50">
              <p className="text-xs text-slate-400">
                <strong className={`font-semibold text-${app.color}-400`}>Ayuda a:</strong> {app.problemSolved}
                <span className="ml-2 text-lg" role="img" aria-label="emojis">{app.emoji}</span>
              </p>
            </div>
          </motion.div>
        ))}
      </div>
      
      <motion.div 
        variants={cardVariants} initial="hidden" animate="visible" custom={applicationData.length}
        className="glass-effect-dark rounded-2xl p-8 text-center mt-12 shadow-xl"
      >
        <h3 className="text-3xl font-bold neon-text-blue mb-4 flex items-center justify-center"><Lightbulb className="h-8 w-8 mr-3 animate-float"/>¡Qué Onda con Todo Esto!</h3>
        <p className="text-slate-200 text-lg leading-relaxed">
          Como ves, entender las ondas estacionarias es como tener un superpoder para crear música, ver lo invisible y hasta ¡hacer flotar cosas! La física es la clave para muchas maravillas tecnológicas.
        </p>
        <Button className="button-purple mt-6 text-md px-8 py-3.5 group">
          ¡Sigue Explorando! <Users className="ml-2 h-5 w-5 group-hover:animate-bounce-sm"/>
        </Button>
      </motion.div>
    </motion.div>
  );
}
