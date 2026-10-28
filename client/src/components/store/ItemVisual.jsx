import { categoryStyle, itemGlyph } from '../../data/storefront';

// Designed tile for an item: the category's soft gradient with the item's icon in a white badge.
// size: 'card' (product cards), 'hero' (product page), 'thumb' (lists and tables)
export default function ItemVisual({ item, size = 'card', className = '' }) {
  const { from, to, accent } = categoryStyle(item.category);
  const { icon: Icon, rotate } = itemGlyph(item);
  const iconSize = size === 'hero' ? 72 : size === 'thumb' ? 18 : 38;
  return (
    <div
      className={`item-visual item-visual-${size} ${className}`}
      style={{ '--tile-from': from, '--tile-to': to, '--tile-accent': accent }}
      role="img"
      aria-label={item.name}
    >
      <span className="item-visual-badge">
        <Icon size={iconSize} stroke={1.6} style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined} />
      </span>
    </div>
  );
}
