import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { loadTransparentImg } from '../../utils/image';

gsap.registerPlugin(ScrollTrigger);

export default function CoralReef() {
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

    // 1. Load Transparent Image Assets
    let turtleImg = null;
    loadTransparentImg('/creatures/turtle.png', (canvas) => {
      turtleImg = canvas;
    });

    // 2. Sea Turtle (Hero centerpiece - enters bottom-left, glides diagonally upward)
    const turtle = {
      x: -480,
      y: window.innerHeight * 0.95,
      size: 215, // Large centerpiece turtle
      parallax: 0.12
    };

    // Diagonal swim glide over 19 seconds (visible for 14-16 seconds)
    gsap.to(turtle, {
      x: window.innerWidth + 480,
      y: window.innerHeight * 0.15,
      duration: 19,
      repeat: -1,
      ease: "none",
      onRepeat: () => {
        turtle.x = -480;
        turtle.y = window.innerHeight * 0.95;
      }
    });

    // Gentle yoyo floating sway
    gsap.to(turtle, {
      y: "+=22",
      duration: 3.5,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });

    // 4. Bubbles and Floating Organics
    const bubbleCount = 30;
    const bubbles = [];
    for (let i = 0; i < bubbleCount; i++) {
      bubbles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 2.5 + 0.5,
        speedY: Math.random() * 0.2 + 0.1,
        wobble: Math.random() * 100,
      });
    }

    // 5. Coral silhouettes (Swaying sea fans & stalks)
    const coralBranches = [];
    const branchCount = 18;
    for (let i = 0; i < branchCount; i++) {
      coralBranches.push({
        x: (window.innerWidth / (branchCount - 1)) * i + (Math.random() - 0.5) * 40,
        height: Math.random() * 120 + 80,
        swayOffset: Math.random() * 100,
        swaySpeed: Math.random() * 0.01 + 0.008,
        color: i % 2 === 0 ? '#06162a' : '#040f1c', // deep layer coral silhouettes
      });
    }

    let time = 0;
    let scrollProgress = 0;

    // Helper: Draw single jellyfish entity
    const drawJellyfish = (j) => {
      const pulse = Math.sin(j.pulseTime) * 0.15 + 0.85; // scale contraction
      j.pulseTime += j.pulseSpeed;

      ctx.save();
      ctx.translate(j.x + Math.sin(j.pulseTime * 0.5) * 10, j.y);

      // Draw tentacles (thin waving paths)
      ctx.strokeStyle = j.color;
      ctx.lineWidth = 1.2;
      for (let k = -2; k <= 2; k++) {
        ctx.beginPath();
        ctx.moveTo(k * (j.radius * 0.35), j.radius * 0.6);
        const controlX = k * (j.radius * 0.45) + Math.sin(time * 0.03 + k) * 8;
        const endX = k * (j.radius * 0.5) + Math.sin(time * 0.02 + k) * 15;
        ctx.quadraticCurveTo(controlX, j.radius * 1.5, endX, j.radius * 2.8);
        ctx.stroke();
      }

      // Draw Cap/Bell (pulsing dome)
      ctx.fillStyle = j.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, j.radius * pulse, j.radius * 0.7, 0, Math.PI, 0); // half ellipse dome
      ctx.closePath();
      ctx.fill();

      // Cap inner frill highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.ellipse(0, j.radius * 0.15, j.radius * 0.8 * pulse, j.radius * 0.3, 0, Math.PI, 0);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    };

    // --- Main Render Loop ---
    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const prog = scrollProgress; // synced to ScrollTrigger progress

      ctx.clearRect(0, 0, w, h);



      // --- B. PARALLAX SWAYING KELP & CORALS SILHOUETTES ---
      // Distant corals layer (Move slower)
      ctx.save();
      coralBranches.forEach((branch, idx) => {
        const sway = Math.sin(time * branch.swaySpeed + branch.swayOffset) * 8;
        const branchX = branch.x;
        // Parallax vertical movement (coral grows up into view as we scroll)
        const branchY = h + 20 - prog * 100;

        ctx.fillStyle = branch.color;
        ctx.beginPath();
        ctx.moveTo(branchX, branchY);
        // Draw simple stylized organic coral stalk
        ctx.quadraticCurveTo(branchX - 10 + sway, branchY - branch.height * 0.5, branchX + sway, branchY - branch.height);
        ctx.quadraticCurveTo(branchX + 15 + sway, branchY - branch.height * 0.5, branchX + 8, branchY);
        ctx.closePath();
        ctx.fill();
      });
      ctx.restore();

      // --- C. SEA TURTLE (GSAP animated diagonal glide, w/ parallax scroll) ---
      if (turtleImg) {
        ctx.save();
        const currentTurtleY = turtle.y - prog * h * turtle.parallax;
        ctx.save();
        ctx.translate(turtle.x, currentTurtleY);
        ctx.rotate(-0.06); // slight upward swim angle
        ctx.drawImage(turtleImg, -turtle.size * 1.3, -turtle.size * 0.9, turtle.size * 2.6, turtle.size * 1.8);
        ctx.restore();
        ctx.restore();
      }



      // --- F. ATMOSPHERIC BUBBLES ---
      bubbles.forEach((b) => {
        const renderY = b.y - prog * h * 0.7;

        ctx.strokeStyle = 'rgba(244, 241, 234, 0.22)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(b.x, renderY, b.radius, 0, Math.PI * 2);
        ctx.stroke();

        b.y -= b.speedY;
        if (b.y < -20) {
          b.y = h + 20;
          b.x = Math.random() * w;
        }
      });

      time += 0.8;
      animationFrameId = requestAnimationFrame(draw);
    };

    // Connect GSAP ScrollTrigger to capture page scroll and feed into canvas rendering
    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        scrollProgress = self.progress;
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
      id="coral-reef" 
      className="relative w-full h-screen overflow-hidden bg-abyssal-black"
    >
      {/* Atmosphere Animation Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      />

      {/* Layer Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20 pointer-events-none z-10" />

      {/* Rich Atmospheric Heading (Quiet display typography, no cards yet) */}
      <div className="absolute inset-x-0 bottom-24 z-20 flex justify-center text-center px-6">
        <div className="flex flex-col items-center gap-2 max-w-xl">
          <span className="text-[10px] text-meta tracking-[0.3em] text-pearl-white/40">
            Shallow Ecosystems
          </span>
          <h2 className="text-2xl font-display font-light text-pearl-white/80 tracking-widest uppercase">
            The Coral Gardens
          </h2>
        </div>
      </div>
    </section>
  );
}
