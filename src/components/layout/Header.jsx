import { motion } from 'framer-motion';
import PlayPause from '../ui/PlayPause';

export default function Header() {
  const navItems = [
    { name: 'Surface', depth: '0m' },
    { name: 'Twilight', depth: '200m' },
    { name: 'Midnight', depth: '1000m' },
    { name: 'Abyss', depth: '4000m' }
  ];

  return (
    <motion.header 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 w-full z-50 glass-panel border-b border-white/[0.03]"
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-2 group">
          <span className="text-xl font-display font-light tracking-[0.3em] text-pearl-white uppercase transition-colors duration-300 group-hover:text-muted-sand">
            Dive
          </span>
        </a>

        {/* Cinematic Chapter Indicators */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item, idx) => (
            <a 
              key={idx} 
              href={`#${item.name.toLowerCase()}`}
              className="group flex flex-col items-center justify-center text-center transition-all duration-300"
            >
              <span className="text-[10px] text-meta text-muted-sand group-hover:text-pearl-white transition-colors duration-200">
                {item.name}
              </span>
              <span className="text-[9px] font-mono text-pearl-white/40 group-hover:text-pearl-white/80 transition-colors duration-200">
                {item.depth}
              </span>
            </a>
          ))}
        </nav>

        {/* Ambient Soundtrack Toggle placeholder */}
        <div className="flex items-center gap-4">
          <PlayPause />
        </div>
      </div>
    </motion.header>
  );
}
