import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';

export default function PlayPause() {
  const { isPlaying, togglePlay } = useAudio();

  return (
    <motion.button
      onClick={togglePlay}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="glass-panel-light p-3 rounded-full flex items-center justify-center text-pearl-white cursor-pointer relative overflow-hidden transition-colors duration-300 hover:bg-white/[0.06] focus:outline-none"
      title={isPlaying ? "Mute Ambient Soundtrack" : "Unmute Ambient Soundtrack"}
    >
      <div className="relative z-10 flex items-center gap-[3px]">
        {isPlaying ? (
          <>
            <Volume2 size={15} className="text-pearl-white/80" />
            {/* Minimal Luxury Audio Visualizer bar indicator */}
            <div className="flex items-center gap-[2px] h-3 ml-1">
              {[0.4, 0.8, 0.5, 0.9, 0.3].map((val, idx) => (
                <motion.span
                  key={idx}
                  animate={{ 
                    scaleY: [0.3, 1, 0.3],
                  }}
                  transition={{ 
                    duration: 1 + idx * 0.15, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{ originY: 1 }}
                  className="w-[1.5px] h-full bg-pearl-white/80 rounded-full"
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <VolumeX size={15} className="text-pearl-white/40" />
            <span className="text-[9px] text-meta text-muted-sand/60 ml-2 select-none">
              Sound Off
            </span>
          </>
        )}
      </div>
    </motion.button>
  );
}
