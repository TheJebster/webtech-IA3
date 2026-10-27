import { useState } from 'react';
import { categoryMeta } from '../utils/categories';

// Shows the equipment photo, or a category-coloured icon tile if there is none / it fails to load
export default function EquipmentImage({ item, height = 180, iconSize = 56, className = '', rounded = true }) {
  const [failed, setFailed] = useState(false);
  const { icon: Icon, from, to } = categoryMeta(item.category);
  const radius = rounded ? 'rounded-3' : '';

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
      className={`d-flex align-items-center justify-content-center text-white ${radius} ${className}`}
      style={{ height, background: `linear-gradient(135deg, ${from}, ${to})` }}
      role="img"
      aria-label={item.name}
    >
      <Icon size={iconSize} className="opacity-75" />
    </div>
  );
}
