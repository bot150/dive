import { AudioProvider } from './context/AudioContext';
import SmoothScroll from './components/layout/SmoothScroll';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import DepthTracker from './components/ui/DepthTracker';
import WaterColumn from './components/ui/WaterColumn';

// Storytelling sections
import Hero from './components/sections/Hero';
import CoralReef from './components/sections/CoralReef';
import Twilight from './components/sections/Twilight';
import Midnight from './components/sections/Midnight';
import Abyss from './components/sections/Abyss';
import Outro from './components/sections/Outro';

export default function App() {
  return (
    <AudioProvider>
      <SmoothScroll>
        <div className="relative min-h-screen bg-transparent text-pearl-white selection:bg-pearl-white/20 selection:text-pearl-white">
          {/* Main Navigation */}
          <Header />

          {/* Floating HUD instrumentation */}
          <DepthTracker />

          {/* Seamless Water Column Background */}
          <WaterColumn />

          {/* Scroll Story Chapters */}
          <main className="relative z-10">
            <Hero />
            <CoralReef />
            <Twilight />
            <Midnight />
            <Abyss />
            <Outro />
          </main>

          {/* Concluding Footer */}
          <Footer />
        </div>
      </SmoothScroll>
    </AudioProvider>
  );
}
