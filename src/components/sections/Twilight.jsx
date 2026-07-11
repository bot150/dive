import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import FadeIn from '../ui/FadeIn';
import { loadTransparentImg } from '../../utils/image';

gsap.registerPlugin(ScrollTrigger);

export default function Twilight() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [sunlightPercentage, setSunlightPercentage] = useState(1.0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // 1. Load Transparent Image Assets
    let lanternfishImg = null;
    loadTransparentImg('/creatures/lanternfish.png', (canvas) => {
      lanternfishImg = canvas;
    });

    const lanternfishList = [];
    const lanternfishCount = 4; // 4 larger centerpiece fish
    for (let i = 0; i < lanternfishCount; i++) {
      const direction = Math.random() > 0.5 ? 1 : -1;
      const lf = {
        x: Math.random() * window.innerWidth,
        y: Math.random() * (window.innerHeight * 0.6) + window.innerHeight * 0.2,
        size: Math.random() * 20 + 52, // Larger sizes (52px to 72px)
        direction,
        depthParallax: Math.random() * 0.12 + 0.08,
        lureGlow: 0,
      };
      lanternfishList.push(lf);

      // Independent horizontal swimming using GSAP (slower swim times)
      gsap.to(lf, {
        x: direction > 0 ? window.innerWidth + 180 : -180,
        duration: Math.random() * 14 + 20,
        repeat: -1,
        ease: "none",
        delay: Math.random() * 6,
        onRepeat: () => {
          lf.x = direction > 0 ? -180 : window.innerWidth + 180;
          lf.y = Math.random() * (window.innerHeight * 0.65) + window.innerHeight * 0.15;
        }
      });

      // Subtle vertical floating motion
      gsap.to(lf, {
        y: "+=18",
        duration: 3.5 + Math.random() * 2.5,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
      });

      // Gentle lure pulsing blue-green glow
      gsap.to(lf, {
        lureGlow: 1.0,
        duration: 1.0 + Math.random() * 0.6,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
      });
    }

    // 2. Marine Snow Particles (Organic detritus drifting slowly downwards)
    const snowCount = 65;
    const snowList = [];
    for (let i = 0; i < snowCount; i++) {
      snowList.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 2 + 0.6,
        speedY: Math.random() * 0.22 + 0.12, // drifts downwards
        speedX: (Math.random() - 0.5) * 0.08,
        opacity: Math.random() * 0.4 + 0.15,
        wobble: Math.random() * 100,
        wobbleSpeed: Math.random() * 0.02 + 0.01,
      });
    }

    // 3. Fading Sun Rays (Leftovers from surface, fades to 0)
    const rayCount = 5;
    const lightRays = [];
    for (let i = 0; i < rayCount; i++) {
      lightRays.push({
        angle: (Math.random() - 0.5) * 0.12 + Math.PI * 0.5,
        width: Math.random() * 40 + 35,
        length: Math.random() * 250 + 300,
        swayTime: Math.random() * 100,
        swaySpeed: Math.random() * 0.003 + 0.001,
        originOffset: (Math.random() - 0.5) * 120,
      });
    }

    let time = 0;
    let scrollProgress = 0;

    // Helper: Draw wiggling bioluminescent lanternfish image and glowing lure
    const drawLanternfishImg = (f, scrollOffset) => {
      const renderY = f.y - scrollOffset * f.depthParallax;
      ctx.save();
      ctx.translate(f.x, renderY);

      if (f.direction < 0) {
        ctx.scale(-1, 1); // Swim left
      }

      if (lanternfishImg) {
        ctx.drawImage(lanternfishImg, -f.size, -f.size * 0.5, f.size * 2, f.size);
      }

      // Draw soft glowing bioluminescent lure spot (white core, larger cyan glow)
      const lureX = f.size * 0.85;
      const lureY = -f.size * 0.45;

      const pulseRadius = 28 * (0.7 + f.lureGlow * 0.3);
      const glowGrad = ctx.createRadialGradient(lureX, lureY, 0, lureX, lureY, pulseRadius);
      glowGrad.addColorStop(0, 'rgba(255, 255, 255, 1.0)'); // Volumetric pure white core
      glowGrad.addColorStop(0.15, 'rgba(120, 240, 255, 0.95)'); // Cyan bright inner
      glowGrad.addColorStop(0.4, 'rgba(100, 220, 255, 0.35)');
      glowGrad.addColorStop(1, 'rgba(100, 220, 255, 0)');

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(lureX, lureY, pulseRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // --- Core Canvas Render Loop ---
    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const prog = scrollProgress; // 0 to 1
      const scrollOffset = prog * h;

      ctx.clearRect(0, 0, w, h);



      // --- B. LEFTOVER SUNLIGHT RAYS (Gradually fade to 0 by 50% scroll) ---
      if (prog < 0.5) {
        ctx.save();
        // Fade sunlight dynamically with scroll progress
        const rayAlpha = (1 - prog * 2) * 0.12;
        ctx.globalAlpha = rayAlpha;
        ctx.globalCompositeOperation = 'overlay';

        lightRays.forEach((ray) => {
          const sway = Math.sin(time * ray.swaySpeed + ray.swayTime) * 0.05;
          const currentAngle = ray.angle + sway;
          const originX = w * 0.5 + ray.originOffset;

          const endX1 = originX + Math.cos(currentAngle - 0.07) * ray.length;
          const endY1 = Math.sin(currentAngle - 0.07) * ray.length;
          const endX2 = originX + Math.cos(currentAngle + 0.07) * ray.length;
          const endY2 = Math.sin(currentAngle + 0.07) * ray.length;

          const rayGrad = ctx.createLinearGradient(originX, 0, (endX1 + endX2) * 0.5, (endY1 + endY2) * 0.5);
          rayGrad.addColorStop(0, 'rgba(244, 241, 234, 0.35)');
          rayGrad.addColorStop(1, 'rgba(244, 241, 234, 0)');

          ctx.fillStyle = rayGrad;
          ctx.beginPath();
          ctx.moveTo(originX, 0);
          ctx.lineTo(endX1, endY1);
          ctx.lineTo(endX2, endY2);
          ctx.closePath();
          ctx.fill();
        });
        ctx.restore();
      }

      // --- C. FLOATING MARINE SNOW PARTICLES (Drifting downwards) ---
      ctx.save();
      // Increase visibility/density of marine snow as we scroll deeper
      const snowDensityMultiplier = Math.min(1.0, 0.3 + prog * 0.7);
      ctx.globalAlpha = snowDensityMultiplier;

      snowList.forEach((s) => {
        // Vertical parallax offset relative to scroll progress
        const renderY = s.y - scrollOffset * 0.18;

        // Draw marine snow as soft organic specks
        ctx.fillStyle = `rgba(244, 241, 234, ${s.opacity})`;
        ctx.beginPath();
        ctx.arc(s.x, renderY, s.radius, 0, Math.PI * 2);
        ctx.fill();

        // Drift physics (Downward gravity drift)
        s.y += s.speedY;
        s.x += s.speedX + Math.sin(s.wobble) * 0.06;
        s.wobble += s.wobbleSpeed;

        // Reset if drifted past screen bottom
        if (s.y > h + 10) {
          s.y = -10;
          s.x = Math.random() * w;
        }
      });
      ctx.restore();

      // --- D. LANTERNFISH (Swim in deeper, fade in progressively) ---
      if (prog > 0.15 && lanternfishImg) {
        ctx.save();
        // Fade in lanternfish as sunlight vanishes
        const fishAlpha = Math.min(1.0, (prog - 0.15) * 2.2);
        ctx.globalAlpha = fishAlpha;

        lanternfishList.forEach((lf) => {
          drawLanternfishImg(lf, scrollOffset);
        });
        ctx.restore();
      }

      time += 0.8;
      animationFrameId = requestAnimationFrame(draw);
    };

    // GSAP ScrollTrigger hook inside Twilight section
    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        scrollProgress = self.progress;
        // Live sunlight reduction updates in DOM layout
        setSunlightPercentage(Math.max(0.01, parseFloat((1.0 - self.progress * 0.99).toFixed(3))));
      }
    });

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
      id="twilight" 
      className="relative min-h-screen w-full flex flex-col justify-center bg-abyssal-black px-6 py-32 overflow-hidden"
    >
      {/* Background Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      />

      {/* Layer Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/25 pointer-events-none z-10" />

      {/* Text Content Overlay */}
      <div className="relative z-20 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Column - Large Typography Statement */}
        <div className="flex flex-col gap-8">
          <FadeIn>
            <span className="text-meta">
              01 // The Twilight Zone
            </span>
          </FadeIn>
          <FadeIn delay={0.2}>
            <h2 className="heading-section text-pearl-white leading-tight">
              Mesopelagic<br />
              <span className="text-pearl-white/50 font-normal">200m — 1,000m</span>
            </h2>
          </FadeIn>
          <FadeIn delay={0.4}>
            <p className="text-body max-w-md mt-6">
              Here, only faint blue light filters down from the surface. In this dim sanctuary, thousands of bizarre, translucent species undergo the largest daily migration on Earth, ascending to feed under the cover of night.
            </p>
          </FadeIn>
        </div>

        {/* Right Column - Luxury Minimal Graphic Grid */}
        <div className="relative w-full flex justify-center lg:justify-end">
          <FadeIn direction="left" delay={0.3}>
            <div className="glass-panel w-72 h-96 p-8 flex flex-col justify-between items-start rounded-lg relative overflow-hidden group hover:bg-white/[0.02] transition-colors duration-500">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-300/5 to-transparent rounded-full filter blur-xl" />
              
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-mono text-pearl-white/30 uppercase tracking-widest">
                  Sunlight Level
                </span>
                <span className="text-xl font-light text-pearl-white">
                  {(sunlightPercentage * 100).toFixed(1)}%
                </span>
              </div>

              <div className="flex flex-col gap-2 w-full pt-10 border-t border-white/[0.04]">
                <h3 className="text-sm font-display text-pearl-white tracking-wide">
                  Marine Life Adaptation
                </h3>
                <p className="text-[11px] text-muted-sand/70 leading-relaxed font-light">
                  Eyes grow larger, designed to capture every single photon available in this dim twilight. Bioluminescence begins to emerge as the primary tool for navigation and survival.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
