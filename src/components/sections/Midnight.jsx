import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import FadeIn from '../ui/FadeIn';
import { loadTransparentImg } from '../../utils/image';

gsap.registerPlugin(ScrollTrigger);

export default function Midnight() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let scrollProgress = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // 1. Load Transparent Image Assets
    let jellyfishImg = null;
    loadTransparentImg('/creatures/jellyfish.png', (canvasEl) => {
      jellyfishImg = canvasEl;
    });

    // 2. Two Jellyfish Setup (Drifts vertically and pulses - enlarged centerpieces)
    const jellyfishList = [
      {
        x: window.innerWidth * 0.25,
        y: window.innerHeight + 150,
        size: 125, // Large centerpiece 1
        parallax: 0.35,
        pulse: 0
      },
      {
        x: window.innerWidth * 0.70,
        y: window.innerHeight + 300,
        size: 165, // Large centerpiece 2
        parallax: 0.55,
        pulse: 0
      }
    ];

    jellyfishList.forEach((j, index) => {
      // Independent vertical rise using GSAP
      gsap.to(j, {
        y: -300,
        duration: index === 0 ? 42 : 34,
        repeat: -1,
        ease: "none",
        delay: index * 4,
        onRepeat: () => {
          j.y = window.innerHeight + 300;
          j.x = window.innerWidth * (index === 0 ? 0.12 + Math.random() * 0.18 : 0.55 + Math.random() * 0.25);
        }
      });

      // Independent horizontal sway using GSAP
      gsap.to(j, {
        x: index === 0 ? "+=35" : "-=45",
        duration: index === 0 ? 5.5 : 7,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
      });

      // Independent pulsing contraction of the bells
      gsap.to(j, {
        pulse: 1.0,
        duration: index === 0 ? 1.7 : 2.1,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
      });
    });

    // 3. Parallax Scroll Trigger
    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        scrollProgress = self.progress;
      }
    });

    // 4. Draw Loop
    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      if (jellyfishImg) {
        jellyfishList.forEach((j) => {
          const renderY = j.y - scrollProgress * h * j.parallax;
          
          ctx.save();
          ctx.translate(j.x, renderY);
          
          // Apply biological squeeze and stretch to the drawing matrix
          const scaleX = 1 + Math.sin(j.pulse * Math.PI) * 0.12;
          const scaleY = 1 - Math.sin(j.pulse * Math.PI) * 0.08;
          ctx.scale(scaleX, scaleY);

          // Render a soft glowing bioluminescent pink back-aura
          const auraRad = j.size * 1.4;
          const auraGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, auraRad);
          auraGrad.addColorStop(0, 'rgba(240, 120, 200, 0.25)');
          auraGrad.addColorStop(0.5, 'rgba(240, 120, 200, 0.08)');
          auraGrad.addColorStop(1, 'rgba(240, 120, 200, 0)');
          ctx.fillStyle = auraGrad;
          ctx.beginPath();
          ctx.arc(0, 0, auraRad, 0, Math.PI * 2);
          ctx.fill();

          // Draw preloaded jellyfish
          ctx.drawImage(jellyfishImg, -j.size, -j.size, j.size * 2, j.size * 2);
          
          ctx.restore();
        });
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
      trigger.kill();
    };
  }, []);

  return (
    <section 
      ref={containerRef}
      id="midnight" 
      className="relative min-h-screen w-full flex flex-col justify-center bg-transparent px-6 py-32 overflow-hidden"
    >
      {/* Background canvas for bioluminescent jellyfish */}
      <canvas 
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
      />

      {/* Subtle bioluminescent particles simulation backplate */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-cyan-900/5 rounded-full filter blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-900/5 rounded-full filter blur-[120px] pointer-events-none z-0" />

      <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Column - Submarine Instrumentation Panel */}
        <div className="order-2 lg:order-1 flex justify-center lg:justify-start">
          <FadeIn direction="right" delay={0.2}>
            <div className="glass-panel w-72 p-8 rounded-lg border border-white/[0.02]">
              <div className="flex flex-col gap-6">
                <div>
                  <span className="text-[9px] font-mono text-pearl-white/30 uppercase tracking-widest block mb-1">
                    Ambient Temperature
                  </span>
                  <span className="text-xl font-light text-pearl-white">
                    4°C
                  </span>
                </div>

                <div>
                  <span className="text-[9px] font-mono text-pearl-white/30 uppercase tracking-widest block mb-1">
                    Hydrostatic Pressure
                  </span>
                  <span className="text-xl font-light text-pearl-white">
                    Up to 400 atm
                  </span>
                </div>

                <p className="text-[11px] text-muted-sand/70 leading-relaxed font-light border-t border-white/[0.04] pt-4">
                  Without light, visual communication relies entirely on custom chemical luminescence. Anglerfish, siphonophores, and lanternfish ignite the dark.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Right Column - Storytelling Copy */}
        <div className="order-1 lg:order-2 flex flex-col gap-8">
          <FadeIn>
            <span className="text-meta">
              02 // The Midnight Zone
            </span>
          </FadeIn>
          <FadeIn delay={0.2}>
            <h2 className="heading-section text-pearl-white leading-tight">
              Bathypelagic<br />
              <span className="text-pearl-white/50 font-normal">1,000m — 4,000m</span>
            </h2>
          </FadeIn>
          <FadeIn delay={0.4}>
            <p className="text-body max-w-md mt-6">
              Here, sunlight cannot penetrate, leaving the ocean in perpetual midnight. The water temperature hovers near freezing, and the pressure is equivalent to an elephant standing on your thumb. 
            </p>
            <p className="text-body max-w-md mt-4">
              Yet, in this dark abyss, life generates its own lanterns. Chemical reactions spark tiny beacons of bioluminescence, creating a rare starry sky beneath the sea.
            </p>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
