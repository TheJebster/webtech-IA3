import { useState } from 'react';
import { Image as ImageIcon } from 'react-bootstrap-icons';

// Equipment photo with a neutral placeholder when there is no image (or it fails to load)
export default function EquipmentImage({ item, className = '', style }) {
  const [failed, setFailed] = useState(false);
  if (!item.imageUrl || failed) {
    return (
      <div className={`d-flex align-items-center justify-content-center text-muted w-100 h-100 ${className}`} style={style} role="img" aria-label={item.name}>
        <ImageIcon size={28} />
      </div>
    );
  }
  return (
    <img
      src={item.imageUrl}
      alt={item.name}
      onError={() => setFailed(true)}
      className={className}
      style={style}
      loading="lazy"
    />
  );
}
