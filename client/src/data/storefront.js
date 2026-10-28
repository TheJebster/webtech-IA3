// Static storefront content: category styles, item icons and contact details

import {
  IconAdjustments, IconAdjustmentsHorizontal, IconArmchair, IconBolt, IconBoxAlignBottom, IconBuildingPavilion,
  IconBulb, IconChairDirector, IconDeviceProjector, IconDeviceSpeaker, IconDeviceSpeakerFilled, IconDeviceTv,
  IconEngine, IconFlower, IconGlassCocktail, IconGrid4x4, IconLadder, IconLamp2, IconMicrophone2, IconMist,
  IconPackage, IconPlugConnected, IconPresentation, IconSofa, IconSparkles, IconStairs, IconTent, IconToolsKitchen2,
} from '@tabler/icons-react';

// Each category has a muted, earthy gradient (Floema-style stone palette) and an accent colour for its icon tiles
export const CATEGORY_STYLE = {
  Audio: { icon: IconDeviceSpeaker, from: '#f3efe8', to: '#e6ddd0', accent: '#5b4a3f' },
  Lighting: { icon: IconBulb, from: '#f6f5d6', to: '#e9e778', accent: '#55531a' },
  Staging: { icon: IconStairs, from: '#efece6', to: '#dcd5ca', accent: '#4a4340' },
  Furniture: { icon: IconArmchair, from: '#f4ece6', to: '#e5d3c6', accent: '#6b4a3a' },
  'Tents & Canopies': { icon: IconTent, from: '#eef0e6', to: '#d6dcc6', accent: '#46523a' },
  'Video & Projection': { icon: IconDeviceTv, from: '#ebedee', to: '#d5d9dc', accent: '#3d4750' },
  Power: { icon: IconBolt, from: '#f3f2df', to: '#e2e0b4', accent: '#4f4d22' },
  Decor: { icon: IconFlower, from: '#f5ebe8', to: '#e6d2cc', accent: '#6e3f37' },
};
const FALLBACK_STYLE = { icon: IconPackage, from: '#f2efea', to: '#e4ded3', accent: '#4a4340' };

// Item-specific icons (Tabler), chosen and checked visually so each one depicts the actual item.
// `rotate` turns an icon (a ladder on its side reads as a truss beam).
const ITEM_ICONS = {
  '18" Subwoofer (Active)': { icon: IconDeviceSpeakerFilled },
  'Yamaha MG16XU 16-Channel Mixer': { icon: IconAdjustmentsHorizontal },
  'Shure SLXD24 Wireless Handheld Mic': { icon: IconMicrophone2 },
  'JBL PRX 815 Powered Speaker': { icon: IconDeviceSpeaker },
  'Moving Head Beam 230': { icon: IconLamp2 },
  'LED Par Can RGBW (Set of 4)': { icon: IconBulb },
  'DMX Lighting Controller': { icon: IconAdjustments },
  'Fog Machine 1500 W': { icon: IconMist },
  'Modular Stage Deck 4 × 8 ft': { icon: IconBoxAlignBottom },
  'Truss Goal Post 20 ft': { icon: IconLadder, rotate: 90 },
  'Stage Stairs with Handrail': { icon: IconStairs },
  'Chair (Gold)': { icon: IconChairDirector },
  'Round Banquet Table (8-seater)': { icon: IconToolsKitchen2 },
  'Cocktail Table (High-top)': { icon: IconGlassCocktail },
  'Lounge Sofa Set': { icon: IconSofa },
  'Pagoda Tent 20 × 20 ft': { icon: IconTent },
  'Pop-up Canopy 10 × 10 ft': { icon: IconBuildingPavilion },
  'Full HD Projector 5000 lm': { icon: IconDeviceProjector },
  'Projection Screen 12 ft': { icon: IconPresentation },
  'LED Video Wall Panel (P3.9)': { icon: IconGrid4x4 },
  'Silent Diesel Generator 62.5 kVA': { icon: IconEngine },
  'Power Distribution Box': { icon: IconPlugConnected },
  'Floral Arch (Artificial)': { icon: IconFlower },
  'Fairy Light Curtain (Warm White)': { icon: IconSparkles },
};

export const categoryStyle = (category) => CATEGORY_STYLE[category] || FALLBACK_STYLE;
// Returns { icon, rotate } for an item, falling back to its category icon
export const itemGlyph = (item) => ITEM_ICONS[item.name] || { icon: categoryStyle(item.category).icon };

export const CONTACT = {
  phone: '+91 98765 43210',
  email: 'hello@rentkit.example',
  area: 'Coimbatore & nearby',
};
