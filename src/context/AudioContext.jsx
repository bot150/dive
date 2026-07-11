import { createContext, useContext, useState, useEffect, useRef } from 'react';

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef(null);
  const synthNodesRef = useRef([]);

  // Synthesize a beautiful, premium, low-frequency ocean drone using Web Audio API
  const startSynthDrone = () => {
    try {
      // Create audio context
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Master gain node
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      // Fade in smoothly to avoid sudden pop
      masterGain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 3.0);
      masterGain.connect(ctx.destination);

      // Low pass filter to create deep, muffled underwater sound
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(120, ctx.currentTime);
      filter.connect(masterGain);

      // Oscillator 1: Deep fundamental drone (55Hz - A1 note)
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(55, ctx.currentTime);
      const gain1 = ctx.createGain();
      gain1.gain.setValueAtTime(0.5, ctx.currentTime);
      osc1.connect(gain1);
      gain1.connect(filter);

      // Oscillator 2: Harmonics (82.4Hz - E2 note, perfect fifth)
      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(82.4, ctx.currentTime);
      const gain2 = ctx.createGain();
      gain2.gain.setValueAtTime(0.15, ctx.currentTime);
      osc2.connect(gain2);
      gain2.connect(filter);

      // Modulator for slow swelling waves (0.08Hz LFO)
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.08, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.1, ctx.currentTime); // modulate volume by 10%
      lfo.connect(lfoGain);
      lfoGain.connect(masterGain.gain); // modulate master gain

      // Start all nodes
      osc1.start();
      osc2.start();
      lfo.start();

      // Store nodes to clean them up later
      synthNodesRef.current = [osc1, osc2, lfo, gain1, gain2, lfoGain, filter, masterGain];
    } catch (e) {
      console.warn("Failed to initialize Web Audio Synthesizer:", e);
    }
  };

  const stopSynthDrone = () => {
    // Fade out gain node if it exists
    const masterGainNode = synthNodesRef.current.find(node => node instanceof GainNode && node.numberOfOutputs === 1);
    const ctx = audioCtxRef.current;
    
    if (ctx && masterGainNode) {
      masterGainNode.gain.cancelScheduledValues(ctx.currentTime);
      masterGainNode.gain.setValueAtTime(masterGainNode.gain.value, ctx.currentTime);
      masterGainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
    }

    // Stop and close context after fadeout
    setTimeout(() => {
      synthNodesRef.current.forEach(node => {
        try {
          if (node.stop) node.stop();
        } catch (_) {}
      });
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
      audioCtxRef.current = null;
      synthNodesRef.current = [];
    }, 1600);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopSynthDrone();
      setIsPlaying(false);
    } else {
      startSynthDrone();
      setIsPlaying(true);
    }
  };

  // Clean up audio nodes on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return (
    <AudioContext.Provider value={{ isPlaying, togglePlay }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
