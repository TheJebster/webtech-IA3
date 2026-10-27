import { useState } from 'react';
import ItemVisual from './store/ItemVisual';

// Uses the item's own photo when an admin has added one; otherwise the designed icon tile
export default function EquipmentImage({ item, size = 'card', className = '' }) {
  const [failed, setFailed] = useState(false);
  if (!item.imageUrl || failed) return <ItemVisual item={item} size={size} className={className} />;
  return <img src={item.imageUrl} alt={item.name} onError={() => setFailed(true)} className={className} loading="lazy" />;
}
