import { useState } from 'react';
import ItemVisual from './store/ItemVisual';
import { primaryPhoto } from '../utils/photo';

// Item photo (see primaryPhoto); falls back to the designed icon tile when there is none or it fails to load
export default function EquipmentImage({ item, size = 'card', className = '' }) {
  const [failed, setFailed] = useState(false);
  const src = primaryPhoto(item);
  if (!src || failed) return <ItemVisual item={item} size={size} className={className} />;
  return <img src={src} alt={item.name} onError={() => setFailed(true)} className={`item-photo ${className}`} loading="lazy" />;
}
