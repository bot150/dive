import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="relative w-full bg-abyssal-black border-t border-white/[0.03] py-20 px-6 z-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
        <div className="flex flex-col gap-4">
          <h4 className="text-xl font-display font-light tracking-[0.2em] text-pearl-white uppercase">
            D I V E
          </h4>
          <p className="text-sm text-muted-sand max-w-sm leading-relaxed">
            An immersive storytelling exploration of the ocean's deepest, most mysterious biological zones.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
          <div className="flex flex-col gap-3">
            <span className="text-[10px] text-meta text-muted-sand">Chapters</span>
            <a href="#surface" className="text-xs text-pearl-white/60 hover:text-pearl-white transition-colors duration-200">01. Epipelagic</a>
            <a href="#twilight" className="text-xs text-pearl-white/60 hover:text-pearl-white transition-colors duration-200">02. Mesopelagic</a>
            <a href="#midnight" className="text-xs text-pearl-white/60 hover:text-pearl-white transition-colors duration-200">03. Bathypelagic</a>
            <a href="#abyss" className="text-xs text-pearl-white/60 hover:text-pearl-white transition-colors duration-200">04. Abyssopelagic</a>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-[10px] text-meta text-muted-sand">Credits</span>
            <span className="text-xs text-pearl-white/60">Creative Design</span>
            <span className="text-xs text-pearl-white/60">Oceanic Data</span>
            <span className="text-xs text-pearl-white/60">Soundscape</span>
          </div>

          <div className="flex flex-col gap-3 col-span-2 md:col-span-1">
            <span className="text-[10px] text-meta text-muted-sand">Conservation</span>
            <a href="https://oceanconservancy.org" target="_blank" rel="noopener noreferrer" className="text-xs text-pearl-white/60 hover:text-pearl-white transition-colors">
              Ocean Conservancy
            </a>
            <a href="https://www.mbari.org" target="_blank" rel="noopener noreferrer" className="text-xs text-pearl-white/60 hover:text-pearl-white transition-colors">
              MBARI Research
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/[0.02] flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-muted-sand/50">
        <p>&copy; {new Date().getFullYear()} DIVE Project. Built for immersive education.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-pearl-white transition-colors">Terms of Experience</a>
          <a href="#" className="hover:text-pearl-white transition-colors">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
}
