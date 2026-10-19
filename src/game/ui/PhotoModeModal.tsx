import React, { useState } from 'react';
import { useGameStore } from '../state/useGameStore';
import { Camera, X, Sun, Eye } from 'lucide-react';

export const PhotoModeModal: React.FC = () => {
  const activeMenu = useGameStore((s) => s.activeMenu);
  const setActiveMenu = useGameStore((s) => s.setActiveMenu);
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const setTimeOfDay = useGameStore((s) => s.setTimeOfDay);
  const showNotification = useGameStore((s) => s.showNotification);

  const [showGrid, setShowGrid] = useState(true);

  if (activeMenu !== 'photo') return null;

  const handleCapture = () => {
    // Flash photo effect and notify
    showNotification('Wilderness Photograph Captured to Gallery!', 'success');
  };

  return (
    <div className="photo-mode-overlay">
      {/* Viewfinder Rule-of-Thirds Grid */}
      {showGrid && (
        <div className="photo-grid">
          <div className="grid-line vert-1" />
          <div className="grid-line vert-2" />
          <div className="grid-line horiz-1" />
          <div className="grid-line horiz-2" />
          <div className="viewfinder-brackets top-left" />
          <div className="viewfinder-brackets top-right" />
          <div className="viewfinder-brackets bot-left" />
          <div className="viewfinder-brackets bot-right" />
        </div>
      )}

      {/* Floating Photo Mode Toolbar */}
      <div className="photo-controls-bar">
        <div className="photo-title">
          <Camera size={18} />
          <span>WILDLIFE PHOTOGRAPHY MODE</span>
        </div>

        {/* Time of Day Sun Adjuster */}
        <div className="photo-control-item">
          <Sun size={16} />
          <span>Time: {Math.floor(timeOfDay)}:00</span>
          <input
            type="range"
            min="5"
            max="21"
            step="0.5"
            value={timeOfDay}
            onChange={(e) => setTimeOfDay(parseFloat(e.target.value))}
          />
        </div>

        {/* Toggle Grid */}
        <button
          className={`photo-btn ${showGrid ? 'active' : ''}`}
          onClick={() => setShowGrid(!showGrid)}
        >
          <Eye size={16} />
          <span>{showGrid ? 'Hide Grid' : 'Show Grid'}</span>
        </button>

        {/* Shutter Button */}
        <button className="photo-shutter-btn" onClick={handleCapture}>
          <div className="shutter-inner" />
          <span>CAPTURE</span>
        </button>

        {/* Exit Button */}
        <button className="photo-exit-btn" onClick={() => setActiveMenu('none')}>
          <X size={18} />
          <span>Exit [P]</span>
        </button>
      </div>
    </div>
  );
};
