import { useState } from 'react';

// Shows the equipment photo when one exists; otherwise nothing — the type carries the item
export default function EquipmentImage({ item, height = 180, className = '' }) {
  const [failed, setFailed] = useState(false);
  if (!item.imageUrl || failed) return null;
  return (
    <img
      src={item.imageUrl}
      alt={item.name}
      onError={() => setFailed(true)}
      className={`w-100 object-fit-cover d-block ${className}`}
      style={{ height }}
      loading="lazy"
    />
  );
}
