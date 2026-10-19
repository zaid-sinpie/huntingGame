import React from 'react';
import { useGameStore } from '../state/useGameStore';
import { X, Sliders, RotateCcw } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

export const SettingsModal: React.FC = () => {
  const activeMenu = useGameStore((s) => s.activeMenu);
  const setActiveMenu = useGameStore((s) => s.setActiveMenu);
  const settings = useGameStore((s) => s.settings);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const resetGame = useGameStore((s) => s.resetGame);

  if (activeMenu !== 'settings') return null;

  const handleVolumeChange = (type: 'master' | 'sfx' | 'ambient', val: number) => {
    if (type === 'master') {
      updateSettings({ masterVolume: val });
      soundEngine.setVolumes(val, settings.sfxVolume, settings.ambientVolume);
    } else if (type === 'sfx') {
      updateSettings({ sfxVolume: val });
      soundEngine.setVolumes(settings.masterVolume, val, settings.ambientVolume);
    } else {
      updateSettings({ ambientVolume: val });
      soundEngine.setVolumes(settings.masterVolume, settings.sfxVolume, val);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="settings-modal-card">
        {/* Header */}
        <div className="modal-header">
          <div className="header-left">
            <Sliders size={24} className="accent-icon" />
            <div>
              <h2>GAME & SYSTEM SETTINGS</h2>
              <p className="subtext">Configure input sensitivity, audio mixing, and graphical fidelity</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={() => setActiveMenu('none')}>
            <X size={20} />
          </button>
        </div>

        <div className="settings-scroll-content">
          {/* Controls Section */}
          <div className="settings-group">
            <h3>INPUT & CAMERA</h3>
            <div className="setting-row">
              <label>Mouse Sensitivity</label>
              <div className="slider-control">
                <input
                  type="range"
                  min="0.001"
                  max="0.005"
                  step="0.0002"
                  value={settings.mouseSensitivity}
                  onChange={(e) => updateSettings({ mouseSensitivity: parseFloat(e.target.value) })}
                />
                <span>{(settings.mouseSensitivity * 1000).toFixed(1)}</span>
              </div>
            </div>

            <div className="setting-row">
              <label>Field of View (FOV)</label>
              <div className="slider-control">
                <input
                  type="range"
                  min="60"
                  max="95"
                  step="1"
                  value={settings.fov}
                  onChange={(e) => updateSettings({ fov: parseInt(e.target.value) })}
                />
                <span>{settings.fov}°</span>
              </div>
            </div>

            <div className="setting-row toggle-row">
              <label>Invert Y-Axis (Flight Style)</label>
              <input
                type="checkbox"
                checked={settings.invertY}
                onChange={(e) => updateSettings({ invertY: e.target.checked })}
              />
            </div>
          </div>

          {/* Audio Section */}
          <div className="settings-group">
            <h3>AUDIO & SOUND MIXING</h3>
            <div className="setting-row">
              <label>Master Volume</label>
              <div className="slider-control">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.masterVolume}
                  onChange={(e) => handleVolumeChange('master', parseFloat(e.target.value))}
                />
                <span>{Math.round(settings.masterVolume * 100)}%</span>
              </div>
            </div>

            <div className="setting-row">
              <label>Sound Effects (Gunshots, Footsteps)</label>
              <div className="slider-control">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.sfxVolume}
                  onChange={(e) => handleVolumeChange('sfx', parseFloat(e.target.value))}
                />
                <span>{Math.round(settings.sfxVolume * 100)}%</span>
              </div>
            </div>

            <div className="setting-row">
              <label>Ambient Wilderness & Wind</label>
              <div className="slider-control">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.ambientVolume}
                  onChange={(e) => handleVolumeChange('ambient', parseFloat(e.target.value))}
                />
                <span>{Math.round(settings.ambientVolume * 100)}%</span>
              </div>
            </div>
          </div>

          {/* HUD & Graphics Section */}
          <div className="settings-group">
            <h3>DISPLAY & INTERFACE</h3>
            <div className="setting-row toggle-row">
              <label>Show Hipfire Crosshair</label>
              <input
                type="checkbox"
                checked={settings.showCrosshair}
                onChange={(e) => updateSettings({ showCrosshair: e.target.checked })}
              />
            </div>

            <div className="setting-row toggle-row">
              <label>Show Minimap Radar</label>
              <input
                type="checkbox"
                checked={settings.showMinimap}
                onChange={(e) => updateSettings({ showMinimap: e.target.checked })}
              />
            </div>

            <div className="setting-row">
              <label>Graphics Quality Profile</label>
              <select
                value={settings.graphicsQuality}
                onChange={(e) => updateSettings({ graphicsQuality: e.target.value as any })}
                className="select-dropdown"
              >
                <option value="high">High (Full Shadows & 60 FPS)</option>
                <option value="medium">Medium (Balanced)</option>
                <option value="low">Low (Performance Mode)</option>
              </select>
            </div>
          </div>

          {/* Save Data Reset */}
          <div className="settings-danger-zone">
            <div>
              <h4>Reset Progress</h4>
              <p>Erase all trophies, credits, and reset save state</p>
            </div>
            <button className="reset-save-btn" onClick={resetGame}>
              <RotateCcw size={16} />
              <span>Reset Game Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
