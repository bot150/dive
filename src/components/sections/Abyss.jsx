import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import FadeIn from '../ui/FadeIn';
import { loadTransparentImg } from '../../utils/image';

import turtleSrc from "../../assets/creatures/sea-turtle.png";
import whaleSrc from '../../assets/creatures/whale.png';



gsap.registerPlugin(ScrollTrigger);

export default function Abyss() {
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
    let whaleImg = null;
    loadTransparentImg(whaleSrc, (canvasEl) => {
      console.log("Whale Loaded");
      whaleImg = canvasEl;
    });
 

    // 2. Blue Whale Setup (Giant centerpiece silhouette crossing)
    const whale = {
      x: -window.innerWidth / 3 - 250,
      y: window.innerHeight * 0.52,
      opacity: 0,
      parallax: 0.15
    };

    // 3. ScrollTrigger timeline with 1.5s smoothing scrub inertia
    const startX = -window.innerWidth / 3 - 250;
    const endX = window.innerWidth + window.innerWidth / 3 + 250;

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top bottom", // Starts emerging as Abyss enters viewport
        end: "bottom top", // Disappears as it leaves viewport
        scrub: 1.5
      }
    });

    timeline.set(whale, { x: startX, opacity: 0 })
      .to(whale, { x: window.innerWidth * 0.42, opacity: 0.32, ease: "power1.out", duration: 1 })
      .to(whale, { x: endX, opacity: 0, ease: "power1.in", duration: 1 });

    // 4. Draw Loop
    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      if (whaleImg && whale.opacity > 0) {
        const progress = timeline.scrollTrigger ? timeline.scrollTrigger.progress : 0;
        const renderY = whale.y - progress * h * whale.parallax;

        ctx.save();
        ctx.globalAlpha = whale.opacity;
        ctx.translate(whale.x, renderY);

        // Draw preloaded whale silhouette (occupying exactly 1/3 of viewport width)
        const drawWidth = w / 3;
        const drawHeight = drawWidth * (whaleImg.height / whaleImg.width);

        ctx.drawImage(whaleImg, -drawWidth * 0.5, -drawHeight * 0.5, drawWidth, drawHeight);

        // --- SUBTLE UNDERWATER FOG SHROUD OVERLAY ---
        // Radial gradient centered on the whale, fading it softly into the abyssal black background
        const fogRad = drawWidth * 0.85;
        const fogGrad = ctx.createRadialGradient(0, 0, drawWidth * 0.25, 0, 0, fogRad);
        fogGrad.addColorStop(0, 'rgba(2, 4, 8, 0)');
        fogGrad.addColorStop(0.5, 'rgba(2, 4, 8, 0.45)');
        fogGrad.addColorStop(1, 'rgba(2, 4, 8, 0.98)');

        ctx.fillStyle = fogGrad;
        ctx.beginPath();
        ctx.arc(0, 0, fogRad, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
      timeline.kill();
    };
  }, []);

  return (
    <section
      ref={containerRef}
      id="abyss"
      className="relative min-h-screen w-full flex flex-col justify-center bg-abyssal-black px-6 py-32 overflow-hidden"
    >
      {/* Background canvas for blue whale silhouette */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
      />

      <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Column - Main Details */}
        <div className="flex flex-col gap-8">
          <FadeIn>
            <span className="text-meta">
              03 // The Abyssal Plains
            </span>
          </FadeIn>
          <FadeIn delay={0.2}>
            <h2 className="heading-section text-pearl-white leading-tight">
              Abyssopelagic<br />
              <span className="text-pearl-white/50 font-normal">4,000m — 6,000m</span>
            </h2>
          </FadeIn>
          <FadeIn delay={0.4}>
            <p className="text-body max-w-md mt-6">
              True abyss. Sunlight has never touched this zone, and water pressures exceed 600 times that of the surface. Food is extremely scarce, consisting only of "marine snow"—organic debris drifting down from above.
            </p>
            <p className="text-body max-w-md mt-4">
              Here lies the vast, flat oceanic desert floor. The life that survives here is blind, colorless, and possesses slow metabolisms designed to withstand years of starvation.
            </p>
          </FadeIn>
        </div>

        {/* Right Column - Deep Sea Trench Feature */}
        <div className="flex justify-center lg:justify-end">
          <FadeIn direction="up" delay={0.3}>
            <div className="glass-panel w-80 p-8 rounded-lg border border-white/[0.02]">
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-display font-light text-pearl-white tracking-wider">
                    Marianas Trench
                  </span>
                  <span className="text-[10px] font-mono text-pearl-white/30">
                    Challenger Deep
                  </span>
                </div>
                <div className="h-[1px] bg-white/[0.05] w-full" />
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-mono text-pearl-white/30 uppercase tracking-widest">
                    Maximum Recorded Depth
                  </span>
                  <span className="text-3xl font-display font-light text-pearl-white tracking-wider">
                    10,994m
                  </span>
                </div>
                <p className="text-[11px] text-muted-sand/70 leading-relaxed font-light">
                  A depth greater than the height of Mount Everest. A cold, high-pressure domain where only extremophiles can endure.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
