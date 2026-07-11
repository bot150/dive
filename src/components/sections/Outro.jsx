import FadeIn from '../ui/FadeIn';
import { ShieldAlert, Globe, Compass } from 'lucide-react';

export default function Outro() {
  const cards = [
    {
      icon: <ShieldAlert size={20} className="text-pearl-white/70" />,
      title: "Deep Footprint",
      description: "Even in the Mariana Trench, researchers have detected human-made synthetic fibers and microplastics inside organisms."
    },
    {
      icon: <Globe size={20} className="text-pearl-white/70" />,
      title: "Acidification",
      description: "As carbon emissions heat our climate, the ocean absorbs excess heat, modifying the fragile chemistry of deep sea layers."
    },
    {
      icon: <Compass size={20} className="text-pearl-white/70" />,
      title: "Unknown Frontiers",
      description: "More than 80% of our global oceans remain entirely unmapped, unobserved, and unexplored by humanity."
    }
  ];

  return (
    <section 
      id="outro" 
      className="relative min-h-screen w-full flex flex-col justify-center bg-abyssal-black px-6 py-32 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-20">
        
        {/* Intro Section Headline */}
        <div className="max-w-3xl flex flex-col gap-8">
          <FadeIn>
            <span className="text-meta">
              04 // The Deep Frontier
            </span>
          </FadeIn>
          <FadeIn delay={0.2}>
            <h2 className="heading-section text-pearl-white leading-tight">
              An ecosystem under pressure.
            </h2>
          </FadeIn>
          <FadeIn delay={0.4}>
            <p className="text-body max-w-xl mt-6">
              Although hidden thousands of meters below the surface, the deep ocean is not immune to surface activities. It is our planet's final wilderness, and it is silently changing.
            </p>
          </FadeIn>
        </div>

        {/* 3-Column Immersive Conservation Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {cards.map((card, index) => (
            <FadeIn key={index} direction="up" delay={index * 0.2}>
              <div className="glass-panel p-8 rounded-lg min-h-[220px] flex flex-col gap-6 transition-all duration-300 hover:border-pearl-white/20">
                <div className="glass-panel-light p-3 w-fit rounded-full flex items-center justify-center">
                  {card.icon}
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-base font-display font-light text-pearl-white tracking-wide">
                    {card.title}
                  </h3>
                  <p className="text-xs text-muted-sand/70 leading-relaxed font-light">
                    {card.description}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* CTA section */}
        <div className="flex flex-col items-center justify-center text-center mt-12 gap-8">
          <FadeIn>
            <h3 className="text-xl md:text-2xl font-display font-light text-pearl-white tracking-[0.1em] uppercase">
              The Ocean Calls for Balance
            </h3>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-6">
              <a 
                href="https://oceanconservancy.org" 
                target="_blank" 
                rel="noreferrer" 
                className="glass-panel text-xs text-pearl-white uppercase tracking-widest px-8 py-4 rounded-full transition-colors hover:bg-white/10"
              >
                Support Conservation
              </a>
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="bg-pearl-white text-abyssal-black text-xs uppercase tracking-widest px-8 py-4 rounded-full font-medium hover:bg-muted-sand transition-colors"
              >
                Ascend to Surface
              </button>
            </div>
          </FadeIn>
        </div>

      </div>
    </section>
  );
}
