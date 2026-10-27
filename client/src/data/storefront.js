// Static storefront content: category photos and ready-made kits by occasion

import {
  BarChartSteps, BoundingBox, CloudFog2, CupStraw, Display, Easel2, Flower1, FuelPump, Grid3x3Gap, House, Lamp, Layers,
  Lightbulb, LightningCharge, Mic, PeopleFill, PlugFill, Projector, Sliders, Sliders2Vertical, Speaker, SpeakerFill,
  Stars, Sun, Table, Umbrella, Box,
} from 'react-bootstrap-icons';

// Each category has a soft gradient and an accent colour for its icon tiles
export const CATEGORY_STYLE = {
  Audio: { icon: Speaker, from: '#fff1e6', to: '#fed7aa', accent: '#c2410c' },
  Lighting: { icon: Lightbulb, from: '#fefce8', to: '#fde68a', accent: '#a16207' },
  Staging: { icon: Easel2, from: '#f5f3ff', to: '#ddd6fe', accent: '#6d28d9' },
  Furniture: { icon: Lamp, from: '#fdf2f8', to: '#fbcfe8', accent: '#be185d' },
  'Tents & Canopies': { icon: Umbrella, from: '#f0fdf4', to: '#bbf7d0', accent: '#15803d' },
  'Video & Projection': { icon: Display, from: '#eff6ff', to: '#bfdbfe', accent: '#1d4ed8' },
  Power: { icon: LightningCharge, from: '#f0f9ff', to: '#bae6fd', accent: '#0369a1' },
  Decor: { icon: Flower1, from: '#fff1f2', to: '#fecdd3', accent: '#be123c' },
};
const FALLBACK_STYLE = { icon: Box, from: '#f5f5f4', to: '#e7e5e4', accent: '#57534e' };

// Item-specific icons where one fits better than the category icon
const ITEM_ICONS = {
  '18" Subwoofer (Active)': SpeakerFill,
  'Yamaha MG16XU 16-Channel Mixer': Sliders,
  'Shure SLXD24 Wireless Handheld Mic': Mic,
  'JBL PRX 815 Powered Speaker': Speaker,
  'Moving Head Beam 230': Lightbulb,
  'LED Par Can RGBW (Set of 4)': Sun,
  'DMX Lighting Controller': Sliders2Vertical,
  'Fog Machine 1500 W': CloudFog2,
  'Modular Stage Deck 4 × 8 ft': Layers,
  'Truss Goal Post 20 ft': BoundingBox,
  'Stage Stairs with Handrail': BarChartSteps,
  'Chiavari Chair (Gold)': PeopleFill,
  'Round Banquet Table (8-seater)': Table,
  'Cocktail Table (High-top)': CupStraw,
  'Lounge Sofa Set': Lamp,
  'Pagoda Tent 20 × 20 ft': House,
  'Pop-up Canopy 10 × 10 ft': Umbrella,
  'Full HD Projector 5000 lm': Projector,
  'Projection Screen 12 ft': Display,
  'LED Video Wall Panel (P3.9)': Grid3x3Gap,
  'Silent Diesel Generator 62.5 kVA': FuelPump,
  'Power Distribution Box': PlugFill,
  'Floral Arch (Artificial)': Flower1,
  'Fairy Light Curtain (Warm White)': Stars,
};

export const categoryStyle = (category) => CATEGORY_STYLE[category] || FALLBACK_STYLE;
export const itemIcon = (item) => ITEM_ICONS[item.name] || categoryStyle(item.category).icon;

// Each kit lists catalog items by exact name with a suggested quantity
export const PACKAGES = [
  {
    id: 'wedding',
    name: 'Wedding reception kit',
    blurb: 'Seating, décor and sound for around 100 guests.',
    icons: [PeopleFill, Table, Flower1, Stars],
    items: [
      ['Chiavari Chair (Gold)', 100],
      ['Round Banquet Table (8-seater)', 13],
      ['Floral Arch (Artificial)', 1],
      ['Fairy Light Curtain (Warm White)', 6],
      ['JBL PRX 815 Powered Speaker', 2],
      ['Shure SLXD24 Wireless Handheld Mic', 2],
    ],
  },
  {
    id: 'concert',
    name: 'Concert stage kit',
    blurb: 'A punchy PA, a light show and a stage for live bands.',
    icons: [Speaker, Lightbulb, Sliders, Layers],
    items: [
      ['JBL PRX 815 Powered Speaker', 4],
      ['18" Subwoofer (Active)', 2],
      ['Yamaha MG16XU 16-Channel Mixer', 1],
      ['Moving Head Beam 230', 8],
      ['DMX Lighting Controller', 1],
      ['Modular Stage Deck 4 × 8 ft', 8],
    ],
  },
  {
    id: 'corporate',
    name: 'Conference & launch kit',
    blurb: 'Projection, microphones and lounge seating for business events.',
    icons: [Projector, Mic, Lamp, CupStraw],
    items: [
      ['Full HD Projector 5000 lm', 1],
      ['Projection Screen 12 ft', 1],
      ['Shure SLXD24 Wireless Handheld Mic', 4],
      ['JBL PRX 815 Powered Speaker', 2],
      ['Lounge Sofa Set', 2],
      ['Cocktail Table (High-top)', 6],
    ],
  },
  {
    id: 'fest',
    name: 'College fest kit',
    blurb: 'Big sound, haze and beams for an outdoor night.',
    icons: [SpeakerFill, CloudFog2, BoundingBox, FuelPump],
    items: [
      ['JBL PRX 815 Powered Speaker', 4],
      ['18" Subwoofer (Active)', 2],
      ['Moving Head Beam 230', 8],
      ['Fog Machine 1500 W', 2],
      ['Truss Goal Post 20 ft', 1],
      ['Silent Diesel Generator 62.5 kVA', 1],
    ],
  },
];

export const CONTACT = {
  phone: '+91 98765 43210',
  email: 'hello@rentkit.example',
  area: 'Coimbatore & nearby',
};
