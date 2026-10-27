// Static storefront content: category photos and ready-made kits by occasion

export const CATEGORY_IMAGES = {
  Audio: '/images/equipment/pa-speaker.webp',
  Lighting: '/images/equipment/moving-head.webp',
  Staging: '/images/equipment/stage-deck.webp',
  Furniture: '/images/equipment/chiavari-chair.webp',
  'Tents & Canopies': '/images/equipment/pagoda-tent.webp',
  'Video & Projection': '/images/equipment/led-wall.webp',
  Power: '/images/equipment/generator.webp',
  Decor: '/images/equipment/floral-arch.webp',
};

// Each kit lists catalog items by exact name with a suggested quantity
export const PACKAGES = [
  {
    id: 'wedding',
    name: 'Wedding reception kit',
    blurb: 'Seating, décor and sound for around 100 guests.',
    image: '/images/banners/weddings.webp',
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
    image: '/images/banners/concerts.webp',
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
    image: '/images/banners/corporate.webp',
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
    image: '/images/banners/college-fests.webp',
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
