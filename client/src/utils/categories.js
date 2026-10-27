import {
  Boombox, Lightbulb, Easel, Lamp, Umbrella, Camera2, Lightning, Flower1, BoxSeam,
} from 'react-bootstrap-icons';

// Each category's flat tile: icon + a fill from the palette (yellow, blue, red, peach, black, mist)
const YELLOW = { bg: '#e6e51e', fg: '#000000' };
const BLUE = { bg: '#466cf3', fg: '#ffffff' };
const RED = { bg: '#f34646', fg: '#ffffff' };
const PEACH = { bg: '#ff8562', fg: '#000000' };
const BLACK = { bg: '#000000', fg: '#e6e51e' };
const MIST = { bg: '#e6e6e6', fg: '#000000' };

export const CATEGORY_META = {
  Audio: { icon: Boombox, ...BLUE },
  Lighting: { icon: Lightbulb, ...YELLOW },
  Staging: { icon: Easel, ...BLACK },
  Furniture: { icon: Lamp, ...PEACH },
  'Tents & Canopies': { icon: Umbrella, ...MIST },
  'Video & Projection': { icon: Camera2, ...RED },
  Power: { icon: Lightning, ...YELLOW },
  Decor: { icon: Flower1, ...PEACH },
};

export const categoryMeta = (name) => CATEGORY_META[name] || { icon: BoxSeam, ...MIST };

export const CONDITION_VARIANT = { New: 'success', Excellent: 'primary', Good: 'secondary', Fair: 'warning' };
