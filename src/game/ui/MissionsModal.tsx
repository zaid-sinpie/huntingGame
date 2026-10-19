import React from 'react';
import { useGameStore } from '../state/useGameStore';
import { X, Target, CheckCircle2, Gift } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

export const MissionsModal: React.FC = () => {
  const activeMenu = useGameStore((s) => s.activeMenu);
  const setActiveMenu = useGameStore((s) => s.setActiveMenu);
  const missions = useGameStore((s) => s.missions);
  const claimMission = useGameStore((s) => s.claimMission);

  if (activeMenu !== 'missions') return null;

  const handleClaim = (mId: string) => {
    claimMission(mId);
    soundEngine.playHarvestFanfare();
  };

  return (
    <div className="modal-backdrop">
      <div className="missions-modal-card">
        {/* Header */}
        <div className="modal-header">
          <div className="header-left">
            <Target size={24} className="accent-icon" />
            <div>
              <h2>WILDERNESS CONTRACTS & CHALLENGES</h2>
              <p className="subtext">Fulfill reserve contracts to earn hunting credentials and bounties</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={() => setActiveMenu('none')}>
            <X size={20} />
          </button>
        </div>

        {/* Missions List */}
        <div className="missions-list-container">
          {missions.map((m) => {
            const pct = Math.min(100, Math.round((m.currentCount / m.requiredCount) * 100));

            return (
              <div
                key={m.id}
                className={`mission-card ${m.isClaimed ? 'claimed' : m.isCompleted ? 'completed' : 'in-progress'}`}
              >
                <div className="mission-card-top">
                  <div className="mission-title-group">
                    <h3>{m.title}</h3>
                    <p className="mission-desc">{m.description}</p>
                  </div>
                  <div className="mission-rewards">
                    <span className="reward-cred">+{m.rewardCredits} Credits</span>
                    <span className="reward-xp">+{m.rewardXp} XP</span>
                  </div>
                </div>

                <div className="mission-progress-strip">
                  <div className="progress-info">
                    <span>Objective Progress</span>
                    <strong>
                      {m.currentCount} / {m.requiredCount} ({pct}%)
                    </strong>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <div className="mission-card-action">
                  {m.isClaimed ? (
                    <div className="status-pill claimed">
                      <CheckCircle2 size={16} />
                      <span>CONTRACT COMPLETED & CLAIMED</span>
                    </div>
                  ) : m.isCompleted ? (
                    <button className="claim-reward-btn" onClick={() => handleClaim(m.id)}>
                      <Gift size={18} />
                      <span>CLAIM BOUNTY REWARD</span>
                    </button>
                  ) : (
                    <div className="status-pill in-progress">
                      <span>IN PROGRESS IN WILDERNESS</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
