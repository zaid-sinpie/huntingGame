import React from 'react';
import { useGameStore } from '../state/useGameStore';
import { X, ShoppingBag, Check, Crosshair, Wind, VolumeX, EyeOff, ShieldAlert } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

export const ShopModal: React.FC = () => {
  const activeMenu = useGameStore((s) => s.activeMenu);
  const setActiveMenu = useGameStore((s) => s.setActiveMenu);
  const credits = useGameStore((s) => s.credits);
  const shopItems = useGameStore((s) => s.shopItems);
  const buyShopItem = useGameStore((s) => s.buyShopItem);

  if (activeMenu !== 'shop') return null;

  const handlePurchase = (itemId: string, price: number) => {
    if (credits >= price) {
      buyShopItem(itemId);
      soundEngine.playHarvestFanfare();
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Crosshair':
        return <Crosshair size={26} />;
      case 'Wind':
        return <Wind size={26} />;
      case 'VolumeX':
        return <VolumeX size={26} />;
      case 'EyeOff':
        return <EyeOff size={26} />;
      default:
        return <ShieldAlert size={26} />;
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="shop-modal-card">
        {/* Header */}
        <div className="modal-header">
          <div className="header-left">
            <ShoppingBag size={24} className="accent-icon" />
            <div>
              <h2>PINE VALLEY LODGE • OUTFITTER & ARMORY</h2>
              <p className="subtext">
                Available Hunting Credits: <strong className="credit-text">{credits} Credits</strong>
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={() => setActiveMenu('none')}>
            <X size={20} />
          </button>
        </div>

        {/* Items Grid */}
        <div className="shop-items-grid">
          {shopItems.map((item) => {
            const canAfford = credits >= item.price;

            return (
              <div
                key={item.id}
                className={`shop-card ${item.isPurchased ? 'purchased' : canAfford ? 'affordable' : 'unaffordable'}`}
              >
                <div className="shop-card-icon">{getIcon(item.icon)}</div>
                <div className="shop-card-info">
                  <div className="card-top-row">
                    <h3>{item.name}</h3>
                    <span className="category-pill">{item.category.toUpperCase()}</span>
                  </div>
                  <p className="item-description">{item.description}</p>
                  <div className="item-effect-highlight">
                    <span>Effect: </span>
                    {item.effectDescription}
                  </div>
                </div>

                <div className="shop-card-action">
                  {item.isPurchased ? (
                    <div className="purchased-badge">
                      <Check size={18} />
                      <span>PURCHASED</span>
                    </div>
                  ) : (
                    <button
                      className={`buy-btn ${canAfford ? 'enabled' : 'disabled'}`}
                      disabled={!canAfford}
                      onClick={() => handlePurchase(item.id, item.price)}
                    >
                      <span>Buy for</span>
                      <strong>{item.price} C</strong>
                    </button>
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
