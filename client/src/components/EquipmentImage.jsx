import { useState } from 'react';
import { categoryMeta } from '../utils/categories';

// Shows the equipment photo, or a flat category tile (palette fill + dot grid) if there is none / it fails to load
export default function EquipmentImage({ item, height = 180, iconSize = 56, className = '', rounded = true }) {
  const [failed, setFailed] = useState(false);
  const { icon: Icon, bg, fg } = categoryMeta(item.category);
  const radius = rounded ? 'rounded-product' : '';

  if (item.imageUrl && !failed) {
    return (
      <img
        src={item.imageUrl}
        alt={item.name}
        onError={() => setFailed(true)}
        className={`w-100 object-fit-cover ${radius} ${className}`}
        style={{ height }}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`equipment-tile d-flex align-items-center justify-content-center ${radius} ${className}`}
      style={{ height, background: bg, color: fg }}
      role="img"
      aria-label={item.name}
    >
      <span className="tile-grid" aria-hidden="true" />
      <Icon size={iconSize} />
    </div>
  );
}
