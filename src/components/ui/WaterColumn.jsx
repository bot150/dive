import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function WaterColumn() {
  const canvasRef = useRef(null);
  const scrollRef = useRef({ progress: 0, velocity: 0 });

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

    // 1. Color Interpolator for seamless depth gradient
    const getWaterColors = (progress) => {
      let h1, s1, l1;
      let h2, s2, l2;

      if (progress < 0.2) {
        // Surface (Bright Cyan) -> Coral Reef (Turquoise)
        const t = progress / 0.2;
        h1 = 190 - t * 15;
        s1 = 85 - t * 10;
        l1 = 26 - t * 11;
        
        h2 = 195 - t * 10;
        s2 = 80 - t * 10;
        l2 = 15 - t * 6;
      } else if (progress < 0.4) {
        // Coral Reef (Turquoise) -> Twilight (Deep Blue)
        const t = (progress - 0.2) / 0.2;
        h1 = 175 + t * 40;
        s1 = 75 - t * 15;
        l1 = 15 - t * 7;

        h2 = 185 + t * 35;
        s2 = 70 - t * 20;
        l2 = 9 - t * 5;
      } else if (progress < 0.6) {
        // Twilight (Deep Blue) -> Midnight (Navy Blue)
        const t = (progress - 0.4) / 0.2;
        h1 = 215 + t * 10;
        s1 = 60 - t * 15;
        l1 = 8 - t * 5;

        h2 = 220 + t * 10;
        s2 = 50 - t * 20;
        l2 = 4 - t * 2.8;
      } else if (progress < 0.8) {
        // Midnight (Navy Blue) -> Abyss (Almost Black)
        const t = (progress - 0.6) / 0.2;
        h1 = 225 + t * 10;
        s1 = 45 - t * 30;
        l1 = 3 - t * 2.2;

        h2 = 230 + t * 10;
        s2 = 30 - t * 25;
        l2 = 1.2 - t * 1.0;
      } else {
        // Abyss to Hadal floor (Almost Black -> Absolute Black)
        const t = Math.min(1.0, (progress - 0.8) / 0.2);
        h1 = 235 + t * 5;
        s1 = 15 - t * 10;
        l1 = 0.8 - t * 0.6;

        h2 = 240 + t * 5;
        s2 = 5 - t * 5;
        l2 = 0.2 - t * 0.2;
      }

      return {
        top: `hsl(${h1}, ${s1}%, ${l1}%)`,
        bottom: `hsl(${h2}, ${s2}%, ${l2}%)`
      };
    };

    // 2. Light Rays Setup (Volumetric sun shafts)
    const rayCount = 6;
    const lightRays = [];
    for (let i = 0; i < rayCount; i++) {
      lightRays.push({
        angle: (Math.random() - 0.5) * 0.15 + Math.PI * 0.5,
        width: Math.random() * 50 + 40,
        length: Math.random() * 300 + 400,
        swayTime: Math.random() * 100,
        swaySpeed: Math.random() * 0.002 + 0.001,
        originOffset: (Math.random() - 0.5) * 160,
      });
    }

    // 3. Persistent Viewport Particle Field (Continuous bubbles and snow)
    const particleCount = 75;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      const type = Math.random() > 0.4 ? 'snow' : 'bubble';
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: type === 'snow' ? Math.random() * 1.8 + 0.5 : Math.random() * 2.5 + 0.8,
        speedY: type === 'snow' ? Math.random() * 0.25 + 0.15 : -(Math.random() * 0.35 + 0.2), // snow falls, bubbles rise
        opacity: Math.random() * 0.35 + 0.1,
        wobble: Math.random() * 100,
        wobbleSpeed: Math.random() * 0.02 + 0.01,
        type
      });
    }

    // 4. GSAP ScrollTrigger to track page-wide progress and scroll velocity
    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: 0,
      end: "max",
      onUpdate: (self) => {
        // Clamp and smooth velocity to avoid extreme jumps during scroll spikes
        const targetVelocity = self.getVelocity() * 0.012;
        scrollRef.current.progress = self.progress;
        
        gsap.to(scrollRef.current, {
          velocity: targetVelocity,
          duration: 0.5,
          overwrite: "auto"
        });
      }
    });

    let time = 0;

    // 5. Unified Canvas Rendering Loop
    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const prog = scrollRef.current.progress;
      const vel = scrollRef.current.velocity;

      ctx.clearRect(0, 0, w, h);

      // --- A. DYNAMIC WATER GRADIENT ---
      const colors = getWaterColors(prog);
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, colors.top);
      bgGrad.addColorStop(1, colors.bottom);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // --- B. VOLUMETRIC LIGHT SHAFTS (Only visible at surface, fades by prog = 0.25) ---
      if (prog < 0.25) {
        ctx.save();
        const rayAlpha = (1 - prog * 4.0) * 0.15;
        ctx.globalAlpha = Math.max(0, rayAlpha);
        ctx.globalCompositeOperation = 'overlay';

        lightRays.forEach((ray) => {
          const sway = Math.sin(time * ray.swaySpeed + ray.swayTime) * 0.06;
          const currentAngle = ray.angle + sway;
          const originX = w * 0.5 + ray.originOffset;

          const endX1 = originX + Math.cos(currentAngle - 0.08) * ray.length;
          const endY1 = Math.sin(currentAngle - 0.08) * ray.length;
          const endX2 = originX + Math.cos(currentAngle + 0.08) * ray.length;
          const endY2 = Math.sin(currentAngle + 0.08) * ray.length;

          const rayGrad = ctx.createLinearGradient(originX, 0, (endX1 + endX2) * 0.5, (endY1 + endY2) * 0.5);
          rayGrad.addColorStop(0, 'rgba(244, 241, 234, 0.4)');
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

      // --- C. PERSISTENT VIEWPORT PARTICLES (Reactive to scroll speed) ---
      ctx.save();
      particles.forEach((p) => {
        ctx.fillStyle = p.type === 'snow' 
          ? `rgba(244, 241, 234, ${p.opacity * 0.8})` 
          : `rgba(244, 241, 234, ${p.opacity * 0.45})`;

        ctx.beginPath();
        if (p.type === 'bubble') {
          // Draw bubble hollow circle
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(244, 241, 234, ${p.opacity * 0.55})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        } else {
          // Draw snow soft circle
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Particle dynamics (reacts to downward scroll by dragging particles up)
        // vel > 0 means scrolling down (descending), so particles rise faster
        p.y += p.speedY - vel * 0.85;
        p.x += Math.sin(p.wobble) * 0.06;
        p.wobble += p.wobbleSpeed;

        // Wrap particles vertically
        if (p.speedY > 0) {
          // Marine snow falling
          if (p.y > h + 10) {
            p.y = -10;
            p.x = Math.random() * w;
          } else if (p.y < -10) {
            p.y = h + 10;
          }
        } else {
          // Bubbles rising
          if (p.y < -10) {
            p.y = h + 10;
            p.x = Math.random() * w;
          } else if (p.y > h + 10) {
            p.y = -10;
          }
        }
      });
      ctx.restore();

      // --- D. ATMOSPHERIC FOG VIGNETTE (Thickens and darkens with depth) ---
      ctx.save();
      const fogAlpha = Math.min(0.85, prog * 0.95);
      if (fogAlpha > 0) {
        const vignette = ctx.createRadialGradient(w * 0.5, h * 0.5, w * 0.25, w * 0.5, h * 0.5, w * 0.8);
        vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vignette.addColorStop(1, `rgba(0, 0, 0, ${fogAlpha})`);
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, w, h);
      }
      ctx.restore();

      time += 0.8;
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
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}
