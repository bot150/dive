import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from "framer-motion";
import { loadTransparentImg } from '../../utils/image';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const promptRef = useRef(null);

  // Animation refs to track scrolling parameters
  const progressRef = useRef(0);
  const velocityRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let scrollVelocity = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // 1. Clouds (Sky elements)
    const cloudCount = 5;
    const clouds = [];
    for (let i = 0; i < cloudCount; i++) {
      const radius = Math.random() * 120 + 80;
      clouds.push({
        x: Math.random() * (window.innerWidth + radius * 2) - radius,
        y: Math.random() * (window.innerHeight * 0.22),
        radius,
        speed: Math.random() * 0.02 + 0.01,
        opacity: Math.random() * 0.05 + 0.02,
      });
    }

    // 2. Hundreds of Floating Particles (Continuous atmospheric opening drift)
    const particleCount = 180;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 1.5 + 0.4,
        speedY: -(Math.random() * 0.28 + 0.12), // float up slowly
        wobble: Math.random() * 100,
        wobbleSpeed: Math.random() * 0.02 + 0.01,
        opacity: Math.random() * 0.38 + 0.08
      });
    }

    // 3. Shimmering Sun Rays (Deep crepuscular rays)
    const rayCount = 8;
    const lightRays = [];
    for (let i = 0; i < rayCount; i++) {
      lightRays.push({
        angle: (Math.random() - 0.5) * 0.15 + Math.PI * 0.5,
        width: Math.random() * 60 + 50,
        length: Math.random() * 350 + 450,
        swayTime: Math.random() * 100,
        swaySpeed: Math.random() * 0.004 + 0.002,
        originOffset: (Math.random() - 0.5) * 180, // spread origin along the surface center
      });
    }

    // 4. Clownfish Asset Load
    let clownfishImg = null;
    loadTransparentImg('/creatures/clownfish.png', (canvas) => {
      clownfishImg = canvas;
    });

    const clownfishList = [
      { x: -150, y: window.innerHeight * 0.52, size: 82, direction: 1, duration: 22, delay: 0, parallax: 0.5 },
      { x: window.innerWidth + 150, y: window.innerHeight * 0.65, size: 68, direction: -1, duration: 29, delay: 3, parallax: 0.75 },
      { x: -150, y: window.innerHeight * 0.42, size: 96, direction: 1, duration: 18, delay: 6, parallax: 0.3 }
    ];

    clownfishList.forEach((fish) => {
      // Independent horizontal swimming using GSAP
      gsap.to(fish, {
        x: fish.direction > 0 ? window.innerWidth + 180 : -180,
        duration: fish.duration,
        repeat: -1,
        ease: "none",
        delay: fish.delay,
        onRepeat: () => {
          fish.x = fish.direction > 0 ? -180 : window.innerWidth + 180;
          fish.y = window.innerHeight * (0.35 + Math.random() * 0.35);
        }
      });

      // Subtle vertical floating motion using GSAP
      gsap.to(fish, {
        y: "+=22",
        duration: 3 + Math.random() * 2,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
      });
    });

    // 5. Ambient Atmospheric Dust Motes (Air particles above water)
    const dustParticles = [];
    const dustCount = 25;
    for (let i = 0; i < dustCount; i++) {
      dustParticles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * (window.innerHeight * 0.42),
        radius: Math.random() * 1.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.08,
        speedY: (Math.random() - 0.5) * 0.05,
        opacity: Math.random() * 0.28 + 0.06
      });
    }

    let time = 0;

    // --- Core Canvas Render Loop ---
    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const p = progressRef.current; // Scroll progress (0 to 1)

      // Horizon line moves up out of view (starts already underwater at h * 0.12)
      const initialHorizon = h * 0.12;
      const horizon = initialHorizon - p * (initialHorizon + 250);

      // Parallax scroll vertical offset factor
      const scrollOffset = p * h;

      ctx.clearRect(0, 0, w, h);

      // --- A. UNDERWATER DUSKY BLUE WATER COLUMN ---
      // At p=0: bright cyan HSL(190, 85%, 26%) to HSL(195, 80%, 15%)
      // Blends to turquoise HSL(175, 75%, 15%) to HSL(185, 70%, 9%)
      const hVal1 = 190 - p * 15;
      const sVal1 = 85 - p * 10;
      const lVal1 = 26 - p * 11;

      const hVal2 = 195 - p * 10;
      const sVal2 = 80 - p * 10;
      const lVal2 = 15 - p * 6;

      const waterBgGrad = ctx.createLinearGradient(0, Math.max(0, horizon), 0, h);
      waterBgGrad.addColorStop(0, `hsl(${hVal1}, ${sVal1}%, ${lVal1}%)`);
      waterBgGrad.addColorStop(1, `hsl(${hVal2}, ${sVal2}%, ${lVal2}%)`);
      ctx.fillStyle = waterBgGrad;
      ctx.fillRect(0, 0, w, h);

      // --- A1. SHIMMERING CAUSTIC LIGHT PATTERNS (Underwater light refraction) ---
      ctx.save();
      ctx.globalCompositeOperation = 'overlay';
      ctx.globalAlpha = Math.max(0, 0.08 * (1 - p * 1.3));
      const causticCols = 12;
      const colWidth = w / causticCols;
      for (let i = 0; i < causticCols; i++) {
        const x = i * colWidth;
        const sway = Math.sin(x * 0.005 + time * 0.018) * 15 + Math.cos(x * 0.008 - time * 0.012) * 8;
        const cx = x + sway;
        const cw = colWidth * (0.8 + Math.sin(time * 0.008 + i) * 0.2);
        const cGrad = ctx.createLinearGradient(cx, 0, cx + cw, 0);
        cGrad.addColorStop(0, 'rgba(100, 220, 255, 0)');
        cGrad.addColorStop(0.5, 'rgba(100, 220, 255, 0.45)');
        cGrad.addColorStop(1, 'rgba(100, 220, 255, 0)');
        ctx.fillStyle = cGrad;
        ctx.fillRect(cx, 0, cw, h);
      }
      ctx.restore();

      // --- B. SKY AND CLOUDS (Parallax shift upwards) ---
      if (p < 1.0) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - p);

        // Sky backdrop
        const skyGrad = ctx.createLinearGradient(0, 0, 0, horizon);
        skyGrad.addColorStop(0, '#091223');
        skyGrad.addColorStop(0.7, '#122543');
        skyGrad.addColorStop(1, '#1b3252');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, Math.max(0, horizon));

        // Clouds (Shifting upward with scroll)
        clouds.forEach((c) => {
          const cloudY = c.y - scrollOffset * 0.45;
          const cloudGrad = ctx.createRadialGradient(c.x, cloudY, 0, c.x, cloudY, c.radius);
          cloudGrad.addColorStop(0, `rgba(244, 241, 234, ${c.opacity})`);
          cloudGrad.addColorStop(0.5, `rgba(244, 241, 234, ${c.opacity * 0.4})`);
          cloudGrad.addColorStop(1, 'rgba(244, 241, 234, 0)');

          ctx.fillStyle = cloudGrad;
          ctx.beginPath();
          ctx.arc(c.x, cloudY, c.radius, 0, Math.PI * 2);
          ctx.fill();

          c.x += c.speed;
          if (c.x - c.radius > w) c.x = -c.radius;
        });

        // Sun Glow
        const sunGlow = ctx.createRadialGradient(w * 0.5, horizon, 0, w * 0.5, horizon, Math.min(w * 0.4, 400));
        sunGlow.addColorStop(0, 'rgba(244, 241, 234, 0.15)');
        sunGlow.addColorStop(0.5, 'rgba(244, 241, 234, 0.04)');
        sunGlow.addColorStop(1, 'rgba(244, 241, 234, 0)');
        ctx.fillStyle = sunGlow;
        ctx.beginPath();
        ctx.arc(w * 0.5, horizon, Math.min(w * 0.4, 400), 0, Math.PI * 2);
        ctx.fill();

        // 1. Faint Ocean Mist (Low horizon haze)
        const mistGrad = ctx.createLinearGradient(0, horizon - 50, 0, horizon + 15);
        mistGrad.addColorStop(0, 'rgba(244, 241, 234, 0)');
        mistGrad.addColorStop(0.5, 'rgba(244, 241, 234, 0.08)');
        mistGrad.addColorStop(1, 'rgba(244, 241, 234, 0)');
        ctx.fillStyle = mistGrad;
        ctx.fillRect(0, horizon - 50, w, 65);

        // 2. Realistic Sunlight Reflections Glare on the horizon
        const glareGrad = ctx.createRadialGradient(w * 0.5, horizon, 0, w * 0.5, horizon + 5, 200);
        glareGrad.addColorStop(0, 'rgba(244, 241, 234, 0.35)');
        glareGrad.addColorStop(0.4, 'rgba(244, 241, 234, 0.06)');
        glareGrad.addColorStop(1, 'rgba(244, 241, 234, 0)');
        ctx.fillStyle = glareGrad;
        ctx.beginPath();
        ctx.ellipse(w * 0.5, horizon + 2, 180, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // 3. Floating Air Dust Particles
        dustParticles.forEach((d) => {
          ctx.fillStyle = `rgba(244, 241, 234, ${d.opacity})`;
          ctx.beginPath();
          ctx.arc(d.x, d.y - scrollOffset * 0.3, d.radius, 0, Math.PI * 2);
          ctx.fill();

          // Move particles slowly
          d.x += d.speedX;
          d.y += d.speedY;
          if (d.x - d.radius > w) d.x = -d.radius;
          if (d.x + d.radius < 0) d.x = w + d.radius;
          if (d.y - d.radius > h * 0.45) d.y = -d.radius;
        });

        ctx.restore();
      }

      // --- C. UNDERWATER CEILING INTERFACE (Subtle wave boundary viewed from below) ---
      if (horizon > -100) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - p);

        // Draw the main subtle wave boundary path
        ctx.beginPath();
        ctx.moveTo(0, h);
        ctx.lineTo(0, horizon);

        for (let x = 0; x <= w; x += 10) {
          const waveY = horizon +
            Math.sin(x * 0.0016 + time * 0.001) * 4.5 +
            Math.cos(x * 0.0008 + time * 0.0006) * 2.5; // extremely slow, gentle undulation

          ctx.lineTo(x, waveY);
        }

        ctx.lineTo(w, h);
        ctx.closePath();

        // 1. Fill the underwater body shade
        ctx.fillStyle = `rgba(8, 20, 38, ${Math.max(0, (1 - p) * 0.85)})`;
        ctx.fill();

        // 2. Overlay a soft glowing reflective ceiling highlight
        const ceilingGrad = ctx.createLinearGradient(0, horizon - 10, 0, horizon + 90);
        ceilingGrad.addColorStop(0, 'rgba(100, 220, 255, 0.28)'); // soft sky refraction glare
        ceilingGrad.addColorStop(0.25, 'rgba(12, 28, 52, 0.15)');
        ceilingGrad.addColorStop(1, 'rgba(12, 28, 52, 0)');

        ctx.fillStyle = ceilingGrad;
        ctx.fill();

        ctx.restore();
      }

      // --- D. SHIMMERING UNDERWATER SUN RAYS (Soft volumetric rays from above) ---
      ctx.save();
      // Rays are visible from the start, fading out slowly as we descend deep
      const rayAlpha = 0.26 * (1 - p * 0.85);
      ctx.globalAlpha = Math.max(0, rayAlpha);
      ctx.globalCompositeOperation = 'screen';

      lightRays.forEach((ray) => {
        const sway = Math.sin(time * ray.swaySpeed + ray.swayTime) * 0.05;
        const currentAngle = ray.angle + sway;

        const originX = w * 0.5 + ray.originOffset;
        const originY = Math.max(0, horizon);

        const endX1 = originX + Math.cos(currentAngle - 0.075) * ray.length;
        const endY1 = originY + Math.sin(currentAngle - 0.075) * ray.length;
        const endX2 = originX + Math.cos(currentAngle + 0.075) * ray.length;
        const endY2 = originY + Math.sin(currentAngle + 0.075) * ray.length;

        const rayGrad = ctx.createLinearGradient(originX, originY, (endX1 + endX2) * 0.5, (endY1 + endY2) * 0.5);
        rayGrad.addColorStop(0, 'rgba(100, 220, 255, 0.45)'); // soft cyan volumetric highlight
        rayGrad.addColorStop(0.3, 'rgba(244, 241, 234, 0.15)');
        rayGrad.addColorStop(1, 'rgba(244, 241, 234, 0)');

        ctx.fillStyle = rayGrad;
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(endX1, endY1);
        ctx.lineTo(endX2, endY2);
        ctx.closePath();
        ctx.fill();
      });

      ctx.restore();

      // --- E. CLOWNFISH SWIMMING (GSAP animated, w/ parallax scroll) ---
      if (p > 0.05 && clownfishImg) {
        ctx.save();
        ctx.globalAlpha = Math.min(1.0, (p - 0.05) * 2.2);

        clownfishList.forEach((f) => {
          const renderY = f.y - scrollOffset * f.parallax;
          ctx.save();
          ctx.translate(f.x, renderY);
          
          if (f.direction < 0) {
            ctx.scale(-1, 1); // swim left
          }
          
          ctx.drawImage(clownfishImg, -f.size, -f.size * 0.5, f.size * 2, f.size);
          ctx.restore();
        });

        ctx.restore();
      }

      // --- F. HUNDREDS OF TINY FLOATING PARTICLES (Continuous drift) ---
      // Apply momentum friction decay to scrolling velocity
      scrollVelocity += (velocityRef.current * 0.02 - scrollVelocity) * 0.1;
      velocityRef.current *= 0.94;

      ctx.save();
      // Particles fade slowly as we descend to merge with local layers
      ctx.globalAlpha = Math.min(1.0, 1.0 - p * 0.4);

      particles.forEach((pt) => {
        const renderY = pt.y - scrollOffset * 0.35;

        // Draw soft translucent particle circle
        ctx.fillStyle = `rgba(244, 241, 234, ${pt.opacity})`;
        ctx.beginPath();
        ctx.arc(pt.x, renderY, pt.radius, 0, Math.PI * 2);
        ctx.fill();

        // Particle floating dynamics (reacts to scroll drag)
        pt.y += pt.speedY - scrollVelocity * 0.75;
        pt.x += Math.sin(pt.wobble) * 0.08;
        pt.wobble += pt.wobbleSpeed;

        // Wrap particles vertically
        if (pt.y < -15) {
          pt.y = h + 15;
          pt.x = Math.random() * w;
        } else if (pt.y > h + 15) {
          pt.y = -15;
        }
      });

      ctx.restore();

      time += 0.8;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // --- ScrollTrigger Setup ---
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: "+=150%",
      pin: true,
      scrub: true,
      onUpdate: (self) => {
        progressRef.current = self.progress;
        velocityRef.current = self.getVelocity();
      }
    });

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top top",
        end: "+=120%",
        scrub: true,
      }
    });

    timeline.to(titleRef.current, {
      y: -120,
      opacity: 0,
      scale: 0.95,
      ease: "none"
    }, 0);

    timeline.to(subtitleRef.current, {
      y: -90,
      opacity: 0,
      ease: "none"
    }, 0);

    timeline.to(promptRef.current, {
      opacity: 0,
      y: 30,
      ease: "none"
    }, 0);

    // Gentle underwater text distortion/sway
    const titleSway = gsap.to(titleRef.current, {
      x: "+=8",
      y: "+=4",
      duration: 6,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });
    const subSway = gsap.to(subtitleRef.current, {
      x: "-=6",
      y: "+=3",
      duration: 7,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });

    return () => {
      trigger.kill();
      timeline.kill();
      titleSway.kill();
      subSway.kill();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-screen overflow-hidden bg-abyssal-black">
      {/* Immersive Canvas Rendering Surface */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      />

      {/* Cinematic Ambient Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/40 pointer-events-none z-10" />

      {/* Surface Overlay Typography Container */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6">
        <div className="flex flex-col items-center gap-8 max-w-4xl">
          <h1
            ref={titleRef}
            className="text-[72px] md:text-[140px] font-display font-medium text-pearl-white tracking-[0.24em] leading-none select-none ml-[0.24em] will-change-transform"
          >
            DIVE
          </h1>

          <p
            ref={subtitleRef}
            className="text-sm md:text-xl font-display font-medium tracking-[0.2em] text-muted-sand select-none uppercase mt-4 leading-relaxed max-w-2xl will-change-transform"
          >
            Every meter hides another world.
          </p>
        </div>
      </div>

      {/* Minimal Scroll down prompt indicator (Gently bouncing wrapper) */}
      <motion.div
        ref={promptRef}
        animate={{ y: [0, -8, 0] }}
        transition={{ 
          duration: 3.5, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3.5 pointer-events-none"
      >
        <span className="text-[10px] text-meta text-pearl-white/40 tracking-[0.2em]">
          Scroll to Descend
        </span>
        <div className="w-[1px] h-10 bg-gradient-to-b from-pearl-white/30 to-transparent relative overflow-hidden">
          <motion.div
            animate={{
              y: [0, 40, 0],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-0 left-0 w-full h-3 bg-pearl-white/70"
          />
        </div>
      </motion.div>
    </div>
  );
}
