import {
  Boombox, Lightbulb, Easel, Lamp, Umbrella, Camera2, Lightning, Flower1, BoxSeam,
} from 'react-bootstrap-icons';

// Visual identity for each equipment category (icon + gradient used as image fallback)
export const CATEGORY_META = {
  Audio: { icon: Boombox, from: '#6366f1', to: '#8b5cf6' },
  Lighting: { icon: Lightbulb, from: '#f59e0b', to: '#ef4444' },
  Staging: { icon: Easel, from: '#0ea5e9', to: '#6366f1' },
  Furniture: { icon: Lamp, from: '#14b8a6', to: '#0ea5e9' },
  'Tents & Canopies': { icon: Umbrella, from: '#22c55e', to: '#14b8a6' },
  'Video & Projection': { icon: Camera2, from: '#ec4899', to: '#8b5cf6' },
  Power: { icon: Lightning, from: '#eab308', to: '#f97316' },
  Decor: { icon: Flower1, from: '#f43f5e', to: '#ec4899' },
};

export const categoryMeta = (name) => CATEGORY_META[name] || { icon: BoxSeam, from: '#64748b', to: '#334155' };

export const CONDITION_VARIANT = { New: 'success', Excellent: 'primary', Good: 'secondary', Fair: 'warning' };
