import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const MAX_DEPTH = 11000;

const OCEAN_ZONES = [
  { name: 'Epipelagic', sub: 'Sunlit Zone', start: 0, end: 200 },
  { name: 'Mesopelagic', sub: 'Twilight Zone', start: 200, end: 1000 },
  { name: 'Bathypelagic', sub: 'Midnight Zone', start: 1000, end: 4000 },
  { name: 'Abyssopelagic', sub: 'The Abyss', start: 4000, end: 6000 },
  { name: 'Hadalpelagic', sub: 'Hadal Trenches', start: 6000, end: MAX_DEPTH },
];

const ZONE_BLEND_RANGE = 80;

const lerp = (a, b, t) => a + (b - a) * t;

const computeTemperature = (depth) => {
  if (depth < 200) return 22 - (depth / 200) * 10;
  if (depth < 1000) return 12 - ((depth - 200) / 800) * 8;
  if (depth < 4000) return 4 - ((depth - 1000) / 3000) * 2;
  return 2;
};

const computeZoneBlend = (depth) => {
  const zone =
    OCEAN_ZONES.find((z) => depth >= z.start && depth < z.end) ??
    OCEAN_ZONES[OCEAN_ZONES.length - 1];
  const zoneIndex = OCEAN_ZONES.indexOf(zone);
  const nextZone = OCEAN_ZONES[zoneIndex + 1] ?? zone;
  const blendStart = zone.end - ZONE_BLEND_RANGE;
  const blend =
    nextZone !== zone && depth > blendStart
      ? Math.min(1, (depth - blendStart) / ZONE_BLEND_RANGE)
      : 0;

  return { zone, nextZone, blend };
};

const computeMetrics = (progress) => {
  const depth = progress * MAX_DEPTH;
  const temperature = computeTemperature(depth);
  const pressure = 1 + (depth / MAX_DEPTH) * 1099;
  const light = Math.max(0, 100 * (1 - depth / MAX_DEPTH) ** 1.15);
  const { zone, nextZone, blend } = computeZoneBlend(depth);

  return {
    depth,
    temperature,
    pressure,
    light,
    zone: zone.name,
    subZone: zone.sub,
    nextZone: nextZone.name,
    nextSubZone: nextZone.sub,
    zoneBlend: blend,
  };
};

const INITIAL = computeMetrics(0);

function MetricRow({ label, value, unit }) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="text-[7px] font-mono text-muted-sand/45 uppercase tracking-[0.18em]">
        {label}
      </span>
      <div className="flex items-baseline gap-0.5 font-display leading-none">
        <span className="text-[11px] font-medium text-pearl-white/80 tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="text-[7px] text-muted-sand/55 font-medium">{unit}</span>
        )}
      </div>
    </div>
  );
}

export default function DepthTracker() {
  const [display, setDisplay] = useState(INITIAL);
  const targetRef = useRef(INITIAL);
  const displayRef = useRef(INITIAL);

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        targetRef.current = computeMetrics(self.progress);
      },
    });

    let animationFrameId;
    const tick = () => {
      const target = targetRef.current;
      const current = displayRef.current;
      const ease = 0.14;

      const next = {
        depth: lerp(current.depth, target.depth, ease),
        temperature: lerp(current.temperature, target.temperature, ease),
        pressure: lerp(current.pressure, target.pressure, ease),
        light: lerp(current.light, target.light, ease),
        zone: target.zone,
        subZone: target.subZone,
        nextZone: target.nextZone,
        nextSubZone: target.nextSubZone,
        zoneBlend: lerp(current.zoneBlend, target.zoneBlend, ease),
      };

      displayRef.current = next;
      setDisplay(next);
      animationFrameId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      trigger.kill();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed top-5 left-5 z-50 w-[156px] pointer-events-none select-none opacity-60">
      <div className="glass-panel p-3 flex flex-col gap-2.5 border border-white/5 bg-black/20 backdrop-blur-md rounded-lg shadow-md shadow-black/30">
        {/* Header — dive computer identity + status */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[7px] font-mono text-muted-sand/50 uppercase tracking-[0.2em]">
            Dive Computer
          </span>
          <div className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-biolum-cyan/70 animate-pulse" />
            <span className="text-[7px] font-mono text-biolum-cyan/80 uppercase tracking-wider">
              Descending
            </span>
          </div>
        </div>

        {/* Primary depth readout */}
        <div className="flex flex-col gap-0.5">
          <span className="text-[7px] font-mono text-muted-sand/45 uppercase tracking-[0.18em]">
            Current Depth
          </span>
          <div className="flex items-baseline gap-0.5 font-display">
            <span className="text-lg font-medium tracking-tight text-pearl-white/90 tabular-nums">
              {display.depth.toLocaleString(undefined, {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}
            </span>
            <span className="text-[9px] text-muted-sand font-medium">m</span>
          </div>
        </div>

        <div className="h-[1px] bg-white/[0.03] w-full" />

        {/* Secondary sensor grid */}
        <div className="grid grid-cols-3 gap-2">
          <MetricRow
            label="Temp"
            value={display.temperature.toFixed(1)}
            unit="°C"
          />
          <MetricRow
            label="Pres"
            value={display.pressure.toFixed(1)}
            unit="atm"
          />
          <MetricRow
            label="Light"
            value={display.light.toFixed(1)}
            unit="%"
          />
        </div>

        <div className="h-[1px] bg-white/[0.03] w-full" />

        {/* Ocean zone — crossfades at boundaries */}
        <div className="flex flex-col gap-0.5 font-display leading-tight min-h-[28px] relative">
          <span className="text-[7px] font-mono text-muted-sand/45 uppercase tracking-[0.18em]">
            Ocean Zone
          </span>
          <div className="relative">
            <div
              className="flex flex-col gap-0.5 transition-opacity duration-300"
              style={{ opacity: 1 - display.zoneBlend }}
            >
              <span className="text-[10px] font-medium tracking-wide text-pearl-white/80 truncate">
                {display.zone}
              </span>
              <span className="text-[7.5px] font-sans text-muted-sand/50 uppercase tracking-wider font-medium truncate">
                {display.subZone}
              </span>
            </div>
            {display.zoneBlend > 0.01 && (
              <div
                className="absolute inset-0 flex flex-col gap-0.5 transition-opacity duration-300"
                style={{ opacity: display.zoneBlend }}
              >
                <span className="text-[10px] font-medium tracking-wide text-pearl-white/80 truncate">
                  {display.nextZone}
                </span>
                <span className="text-[7.5px] font-sans text-muted-sand/50 uppercase tracking-wider font-medium truncate">
                  {display.nextSubZone}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
