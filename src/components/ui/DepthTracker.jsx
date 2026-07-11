import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function DepthTracker() {
  const [metrics, setMetrics] = useState({
    depth: 0,
    temperature: 22.0,
    zone: 'Epipelagic',
    subZone: 'Sunlit Zone'
  });

  useEffect(() => {
    // ScrollTrigger to calculate physics based on overall scroll progress
    const trigger = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const progress = self.progress;
        
        // 1. Depth (0m to 10935m at Challenger Deep)
        const currentDepth = Math.round(progress * 10935);
        
        // 2. Temperature (Realistic non-linear curve)
        let currentTemp = 22.0;
        if (currentDepth < 200) {
          currentTemp = 22 - (currentDepth / 200) * 10;
        } else if (currentDepth < 1000) {
          currentTemp = 12 - ((currentDepth - 200) / 800) * 8;
        } else if (currentDepth < 4000) {
          currentTemp = 4.0 - ((currentDepth - 1000) / 3000) * 2;
        } else {
          currentTemp = 2.0 - ((currentDepth - 4000) / 6935) * 0.9;
        }

        // Active sensor micro-fluctuations
        const fluctuation = Math.sin(currentDepth * 0.05) * 0.04;
        currentTemp = Math.max(1.1, parseFloat((currentTemp + fluctuation).toFixed(2)));

        // 3. Biological Ocean Zones
        let zoneName = 'Epipelagic';
        let subZoneName = 'Sunlit Zone';
        if (currentDepth >= 200 && currentDepth < 1000) {
          zoneName = 'Mesopelagic';
          subZoneName = 'Twilight Zone';
        } else if (currentDepth >= 1000 && currentDepth < 4000) {
          zoneName = 'Bathypelagic';
          subZoneName = 'Midnight Zone';
        } else if (currentDepth >= 4000 && currentDepth < 6000) {
          zoneName = 'Abyssopelagic';
          subZoneName = 'The Abyss';
        } else if (currentDepth >= 6000) {
          zoneName = 'Hadalpelagic';
          subZoneName = 'Hadal Trenches';
        }

        setMetrics({
          depth: currentDepth,
          temperature: currentTemp,
          zone: zoneName,
          subZone: subZoneName
        });
      }
    });

    return () => trigger.kill();
  }, []);

  return (
    <div className="fixed top-5 left-5 z-50 w-[110px] pointer-events-none select-none opacity-55">
      {/* Hyper-minimalist Luxury Submarine Instrument Box */}
      <div className="glass-panel p-2.5 flex flex-col gap-2.5 border border-white/5 bg-black/20 backdrop-blur-md rounded-lg shadow-md shadow-black/30">
        
        {/* 1. Large Depth Display */}
        <div className="flex items-baseline gap-0.5 font-display">
          <span className="text-base font-medium tracking-tight text-pearl-white/90">
            {metrics.depth.toLocaleString()}
          </span>
          <span className="text-[9px] text-muted-sand font-medium">m</span>
        </div>

        {/* Subtle separator */}
        <div className="h-[1px] bg-white/[0.03] w-full" />

        {/* 2. Ocean Zone Info */}
        <div className="flex flex-col gap-0.5 font-display leading-tight">
          <span className="text-[10px] font-medium tracking-wide text-pearl-white/80 truncate">
            {metrics.zone}
          </span>
          <span className="text-[7.5px] font-sans text-muted-sand/50 uppercase tracking-wider font-medium truncate">
            {metrics.subZone}
          </span>
        </div>

        {/* Subtle separator */}
        <div className="h-[1px] bg-white/[0.03] w-full" />

        {/* 3. Temperature Info */}
        <div className="flex items-baseline gap-0.5 font-display">
          <span className="text-xs font-medium text-pearl-white/75">
            {metrics.temperature.toFixed(1)}
          </span>
          <span className="text-[8px] text-muted-sand font-medium">°C</span>
        </div>

      </div>
    </div>
  );
}
