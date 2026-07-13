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

    // Marine snow — lightweight pre-allocated particle pool
    const SNOW_COUNT = 380;
    const snowflakes = new Array(SNOW_COUNT);

    const initSnowflake = (p, w, h, spawnAnywhere = true) => {
      p.x = Math.random() * w;
      p.y = spawnAnywhere ? Math.random() * h : -Math.random() * h * 0.2;
      p.size = 1 + Math.random() * 2;
      p.opacity = 0.12 + Math.random() * 0.55;
      p.vy = 6 + Math.random() * 24;
      p.vx = (Math.random() - 0.5) * 10;
      p.wobblePhase = Math.random() * Math.PI * 2;
      p.wobbleAmp = 1.5 + Math.random() * 4;
    };

    const resetSnow = (w, h) => {
      for (let i = 0; i < SNOW_COUNT; i++) {
        if (!snowflakes[i]) snowflakes[i] = {};
        initSnowflake(snowflakes[i], w, h);
      }
    };

    resetSnow(canvas.width, canvas.height);

    const resizeWithSnow = () => {
      resizeCanvas();
      resetSnow(canvas.width, canvas.height);
    };

    window.removeEventListener('resize', resizeCanvas);
    window.addEventListener('resize', resizeWithSnow);

    // Bubble trail — object pool, spawned at whale tail while on screen
    const BUBBLE_MAX = 90;
    const bubbles = new Array(BUBBLE_MAX);
    for (let i = 0; i < BUBBLE_MAX; i++) bubbles[i] = { active: false };
    let spawnAccumulator = 0;

    const spawnBubble = (tailX, tailY) => {
      const b = bubbles.find((p) => !p.active);
      if (!b) return;

      b.active = true;
      b.x = tailX + (Math.random() - 0.5) * 14;
      b.y = tailY + (Math.random() - 0.5) * 10;
      b.radius = 1.2 + Math.random() * 4.5;
      b.vy = -(10 + Math.random() * 16);
      b.life = 0;
      b.maxLife = 2.2 + Math.random() * 2.8;
      b.wobblePhase = Math.random() * Math.PI * 2;
      b.wobbleAmp = 2 + Math.random() * 5;
      b.baseAlpha = 0.1 + Math.random() * 0.22;
    };

    const updateAndDrawBubbles = (dt, time, tailSpawn) => {
      for (let i = 0; i < BUBBLE_MAX; i++) {
        const b = bubbles[i];
        if (!b.active) continue;

        b.life += dt;
        if (b.life >= b.maxLife) {
          b.active = false;
          continue;
        }

        b.x += Math.sin(time * 1.8 + b.wobblePhase) * b.wobbleAmp * 0.35 * dt;
        b.y += b.vy * dt;

        const lifeRatio = b.life / b.maxLife;
        const alpha = b.baseAlpha * (1 - lifeRatio * lifeRatio);

        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(195, 215, 230, 0.35)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(220, 235, 245, 0.45)';
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      if (!tailSpawn) return;

      spawnAccumulator += dt;
      const spawnInterval = 0.1 + Math.random() * 0.14;
      if (spawnAccumulator >= spawnInterval) {
        spawnAccumulator = 0;
        spawnBubble(tailSpawn.x, tailSpawn.y);
        if (Math.random() < 0.35) {
          spawnBubble(tailSpawn.x, tailSpawn.y);
        }
      }
    };

    let lastFrameTime = performance.now();

    // 4. Draw Loop — continuous RAF with time-based motion layered on scroll position
    const draw = () => {
      const now = performance.now();
      const dt = Math.min((now - lastFrameTime) * 0.001, 0.05);
      lastFrameTime = now;

      const w = canvas.width;
      const h = canvas.height;
      const time = now * 0.001;
      ctx.clearRect(0, 0, w, h);

      // Marine snow — behind whale, above background
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < SNOW_COUNT; i++) {
        const p = snowflakes[i];
        p.x += (p.vx + Math.sin(time * 0.35 + p.wobblePhase) * p.wobbleAmp * 0.12) * dt;
        p.y += p.vy * dt;

        if (p.y > h + p.size) {
          initSnowflake(p, w, h, false);
        } else if (p.x < -p.size) {
          p.x = w + p.size;
        } else if (p.x > w + p.size) {
          p.x = -p.size;
        }

        ctx.globalAlpha = p.opacity;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      ctx.globalAlpha = 1;

      let tailSpawn = null;

      if (whaleImg && whale.opacity > 0) {
        const progress = timeline.scrollTrigger ? timeline.scrollTrigger.progress : 0;
        const renderY = whale.y - progress * h * whale.parallax;

        const bobOffset = Math.sin(time * 0.75) * 11;
        const rotation = Math.sin(time * 0.45 + 0.6) * (2 * Math.PI / 180);
        const breathMultiplier = 1 + Math.sin(time * 0.3) * 0.07;

        const drawWidth = w / 3;
        const drawHeight = drawWidth * (whaleImg.height / whaleImg.width);
        const cosR = Math.cos(rotation);
        const sinR = Math.sin(rotation);

        const tailLocalX = -drawWidth * 0.44;
        const tailLocalY = drawHeight * 0.06;
        const tailX = whale.x + tailLocalX * cosR - tailLocalY * sinR;
        const tailY = renderY + bobOffset + tailLocalX * sinR + tailLocalY * cosR;

        const whaleOnScreen = whale.x > -drawWidth && whale.x < w + drawWidth && whale.opacity > 0.04;
        if (whaleOnScreen) {
          tailSpawn = { x: tailX, y: tailY };
        }

        ctx.save();
        ctx.globalAlpha = whale.opacity * breathMultiplier;
        ctx.translate(whale.x, renderY + bobOffset);
        ctx.rotate(rotation);

        // Draw preloaded whale silhouette (occupying exactly 1/3 of viewport width)

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

      updateAndDrawBubbles(dt, time, tailSpawn);

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeWithSnow);
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

        {/* Right Column - Species & Trench Panels */}
        <div className="flex flex-col gap-8 items-center lg:items-end">
          <FadeIn direction="up" delay={0.2}>
            <div className="glass-panel w-80 p-8 rounded-lg border border-white/[0.02]">
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-display font-light text-pearl-white tracking-wider uppercase">
                    Blue Whale
                  </span>
                  <span className="text-[10px] font-mono text-pearl-white/30">
                    Largest Animal
                  </span>
                </div>
                <div className="h-[1px] bg-white/[0.05] w-full" />
                <div className="flex flex-col gap-4">
                  {[
                    { label: 'Length', value: '27m' },
                    { label: 'Weight', value: '190 tons' },
                    { label: 'Diet', value: 'Krill' },
                    { label: 'Lifespan', value: '90 years' },
                    { label: 'Conservation', value: 'Endangered', accent: true },
                  ].map((stat) => (
                    <div key={stat.label} className="flex justify-between items-baseline gap-4">
                      <span className="text-[9px] font-mono text-pearl-white/30 uppercase tracking-widest">
                        {stat.label}
                      </span>
                      <span
                        className={`text-sm font-display font-light tracking-wide ${
                          stat.accent ? 'text-biolum-amber' : 'text-pearl-white'
                        }`}
                      >
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

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
