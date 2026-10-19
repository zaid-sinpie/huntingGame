import React from 'react';
import { useGameStore } from '../state/useGameStore';
import { Compass, Play, Crosshair, Wind, Eye } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

export const WelcomeModal: React.FC = () => {
  const activeMenu = useGameStore((s) => s.activeMenu);
  const setActiveMenu = useGameStore((s) => s.setActiveMenu);

  if (activeMenu !== 'welcome') return null;

  const handleStartGame = () => {
    // Initialize procedural sound engine on user interaction
    soundEngine.init();
    soundEngine.resume();

    setActiveMenu('none');

    // Request Pointer Lock for first-person control
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.requestPointerLock?.();
    } else {
      document.body.requestPointerLock?.();
    }
  };

  return (
    <div className="welcome-backdrop">
      <div className="welcome-card">
        {/* Title Branding */}
        <div className="welcome-brand">
          <div className="brand-badge">
            <Compass size={22} />
            <span>3D FIRST-PERSON OPEN-WORLD HUNTING SIMULATOR</span>
          </div>
          <h1>WILDHUNT</h1>
          <p className="welcome-tagline">
            Step into the untamed wilderness of Silver Ridge Reserve. Track game, read wind patterns, master ballistics, and claim legendary trophies.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="welcome-highlights">
          <div className="highlight-pill">
            <Crosshair size={18} />
            <div>
              <strong>Realistic Ballistics</strong>
              <span>Scope zeroing, vitals damage & recoil</span>
            </div>
          </div>
          <div className="highlight-pill">
            <Eye size={18} />
            <div>
              <strong>Animal Tracking</strong>
              <span>Footprints, blood trails & clues</span>
            </div>
          </div>
          <div className="highlight-pill">
            <Wind size={18} />
            <div>
              <strong>Scent & Wind</strong>
              <span>Hunt downwind to avoid detection</span>
            </div>
          </div>
        </div>

        {/* Start Game Action */}
        <div className="welcome-start-container">
          <button className="enter-wilderness-btn" onClick={handleStartGame}>
            <Play size={22} fill="currentColor" />
            <span>ENTER THE WILDERNESS</span>
          </button>
          <p className="click-hint">Clicking will initialize 3D audio and lock the mouse pointer for FPS controls.</p>
        </div>

        {/* Quick Controls Cheat Sheet */}
        <div className="welcome-controls-summary">
          <span><strong>WASD</strong> Move</span>
          <span><strong>Mouse</strong> Look</span>
          <span><strong>LMB</strong> Shoot</span>
          <span><strong>RMB</strong> Scope</span>
          <span><strong>Shift</strong> Sprint</span>
          <span><strong>C</strong> Crouch</span>
          <span><strong>E</strong> Harvest/Clue</span>
          <span><strong>Q</strong> Hunter Sense</span>
          <span><strong>M</strong> Map</span>
          <span><strong>Esc</strong> Pause</span>
        </div>
      </div>
    </div>
  );
};
