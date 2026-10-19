import React, { useState } from 'react';
import { useGameStore } from '../state/useGameStore';
import { X, Award, Crosshair, Package, Sparkles } from 'lucide-react';
import type { WeaponType } from '../types';

export const InventoryModal: React.FC = () => {
  const activeMenu = useGameStore((s) => s.activeMenu);
  const setActiveMenu = useGameStore((s) => s.setActiveMenu);
  const weapons = useGameStore((s) => s.weapons);
  const equippedWeaponId = useGameStore((s) => s.equippedWeaponId);
  const setEquippedWeapon = useGameStore((s) => s.setEquippedWeapon);
  const trophies = useGameStore((s) => s.trophies);
  const credits = useGameStore((s) => s.credits);
  const xp = useGameStore((s) => s.xp);
  const shopItems = useGameStore((s) => s.shopItems);

  const [activeTab, setActiveTab] = useState<'loadout' | 'trophies'>('loadout');

  if (activeMenu !== 'inventory') return null;

  // Calculate trophy stats
  const totalWeight = trophies.reduce((acc, t) => acc + t.weightKg, 0);
  const diamondCount = trophies.filter((t) => t.trophyRating === 'Diamond').length;
  const goldCount = trophies.filter((t) => t.trophyRating === 'Gold').length;

  return (
    <div className="modal-backdrop">
      <div className="inventory-modal-card">
        {/* Header */}
        <div className="modal-header">
          <div className="header-left">
            <Package size={24} className="accent-icon" />
            <div>
              <h2>HUNTER'S LOCKER & TROPHY LODGE</h2>
              <p className="subtext">
                Hunt Credits: <strong className="credit-text">{credits} C</strong> • Hunter XP: <strong className="xp-text">{xp} XP</strong>
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={() => setActiveMenu('none')}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="modal-tabs">
          <button
            className={`tab-btn ${activeTab === 'loadout' ? 'active' : ''}`}
            onClick={() => setActiveTab('loadout')}
          >
            <Crosshair size={18} />
            <span>Weapons & Loadout</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'trophies' ? 'active' : ''}`}
            onClick={() => setActiveTab('trophies')}
          >
            <Award size={18} />
            <span>Trophy Room ({trophies.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="modal-body">
          {activeTab === 'loadout' ? (
            <div className="loadout-grid">
              {/* Weapons Selection List */}
              <div className="weapons-column">
                <h3>EQUIPPED WEAPONRY</h3>
                {(Object.keys(weapons) as WeaponType[]).map((wId) => {
                  const w = weapons[wId];
                  const isEquipped = equippedWeaponId === wId;

                  return (
                    <div
                      key={wId}
                      className={`weapon-slot-card ${isEquipped ? 'equipped' : ''}`}
                      onClick={() => setEquippedWeapon(wId)}
                    >
                      <div className="slot-header">
                        <h4>{w.name}</h4>
                        {isEquipped && <span className="equipped-badge">EQUIPPED</span>}
                      </div>
                      <p className="weapon-desc">{w.description}</p>
                      <div className="weapon-stats-row">
                        <span>Damage: <strong>{w.damage}</strong></span>
                        <span>Range: <strong>{w.range}m</strong></span>
                        <span>Ammo: <strong>{w.ammo}/{w.magazineSize}</strong> [{w.reserveAmmo}]</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Active Gear & Upgrades */}
              <div className="gear-column">
                <h3>ACTIVE HUNTING GEAR</h3>
                <div className="gear-list">
                  {shopItems
                    .filter((item) => item.isPurchased)
                    .map((item) => (
                      <div key={item.id} className="gear-card">
                        <Sparkles size={18} className="gear-icon" />
                        <div>
                          <h4>{item.name}</h4>
                          <p>{item.effectDescription}</p>
                        </div>
                      </div>
                    ))}
                  {shopItems.filter((i) => i.isPurchased).length === 0 && (
                    <div className="empty-gear-notice">
                      <p>No gear upgrades purchased yet.</p>
                      <p className="sub">Visit the Pine Valley Lodge Shop [K] to purchase scopes, suppressors, and camouflage suits.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="trophy-room-container">
              {/* Stats Bar */}
              <div className="trophy-stats-strip">
                <div className="t-stat">
                  <span>Total Harvests</span>
                  <strong>{trophies.length}</strong>
                </div>
                <div className="t-stat">
                  <span>Total Harvest Weight</span>
                  <strong>{totalWeight} kg</strong>
                </div>
                <div className="t-stat">
                  <span>Diamond Trophies</span>
                  <strong className="diamond-num">{diamondCount}</strong>
                </div>
                <div className="t-stat">
                  <span>Gold Trophies</span>
                  <strong className="gold-num">{goldCount}</strong>
                </div>
              </div>

              {/* Trophy List */}
              <div className="trophy-list-scroll">
                {trophies.length === 0 ? (
                  <div className="empty-trophies">
                    <Award size={48} />
                    <p>No trophies claimed yet.</p>
                    <span>Explore Pine Valley, track wildlife, and take your first clean harvest!</span>
                  </div>
                ) : (
                  trophies.map((t) => (
                    <div key={t.id} className={`trophy-entry-card ${t.trophyRating.toLowerCase()}`}>
                      <div className="trophy-medal-badge">
                        <Award size={24} />
                        <span>{t.trophyRating}</span>
                      </div>
                      <div className="trophy-details">
                        <h4>{t.species.toUpperCase()}</h4>
                        <div className="trophy-metrics">
                          <span>Weight: <strong>{t.weightKg} kg</strong></span>
                          <span>Distance: <strong>{t.distanceMeters}m</strong></span>
                          <span>Hit: <strong className="capitalize">{t.hitZone}</strong></span>
                        </div>
                      </div>
                      <div className="trophy-payout">
                        <div className="payout-cred">+{t.rewardCredits} C</div>
                        <div className="payout-xp">+{t.rewardXp} XP</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
