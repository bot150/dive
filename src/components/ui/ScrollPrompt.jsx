import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ScrollPrompt() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setVisible(false);
      } else {
        setVisible(true);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-3 pointer-events-none"
        >
          <span className="text-[10px] text-meta text-pearl-white/40 tracking-[0.25em]">
            Scroll to Descend
          </span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-pearl-white/40 to-transparent relative overflow-hidden">
            <motion.div 
              animate={{ 
                y: [0, 48, 0],
              }}
              transition={{ 
                duration: 2.2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute top-0 left-0 w-full h-4 bg-pearl-white"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
