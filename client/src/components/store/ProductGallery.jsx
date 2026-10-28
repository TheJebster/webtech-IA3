import { useEffect, useState } from 'react';
import ItemVisual from './ItemVisual';

// Product photos: large main image with thumbnails (arrow keys switch photos).
// Falls back to the item's icon tile when there are no photos.
export default function ProductGallery({ item }) {
  const photos = item.gallery || [];
  const [active, setActive] = useState(0);

  useEffect(() => setActive(0), [item._id]);

  if (!photos.length) {
    return <div className="product-media"><ItemVisual item={item} size="hero" /></div>;
  }

  const current = photos[Math.min(active, photos.length - 1)];
  const step = (d) => setActive((i) => (i + d + photos.length) % photos.length);

  return (
    <div className="gallery">
      <div
        className="product-media gallery-main"
        tabIndex={photos.length > 1 ? 0 : undefined}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') step(1);
          if (e.key === 'ArrowLeft') step(-1);
        }}
        aria-label={`${item.name} photos, ${active + 1} of ${photos.length}`}
      >
        <img src={current.src} alt={current.alt || item.name} />
        {photos.length > 1 && (
          <>
            <button type="button" className="gallery-nav prev" onClick={() => step(-1)} aria-label="Previous photo">‹</button>
            <button type="button" className="gallery-nav next" onClick={() => step(1)} aria-label="Next photo">›</button>
            <span className="gallery-count">{active + 1} / {photos.length}</span>
          </>
        )}
      </div>
      {photos.length > 1 && (
        <div className="gallery-thumbs" role="tablist" aria-label="Choose photo">
          {photos.map((p, i) => (
            <button
              key={p.src}
              type="button"
              role="tab"
              aria-selected={i === active}
              className={i === active ? 'active' : ''}
              onClick={() => setActive(i)}
              aria-label={`Photo ${i + 1}`}
            >
              <img src={p.src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
      {current.source && (
        <p className="gallery-credit">
          Photo: <a href={current.source} target="_blank" rel="noreferrer">Unsplash</a> · representative image
        </p>
      )}
    </div>
  );
}
