export const getProductCatalog = async () => {
  return {
    materials: {
      alpineWool: {
        name: 'Alpine Wool',
        price: 'CHF 420',
        origin: 'Swiss Alps',
        description: 'Naturally resilient and stain-resistant, ideal for high-traffic areas.',
        care: 'Vacuum weekly and avoid moisture exposure.',
        stock: 45, // m² in stock
        leadTime: '2-3', // weeks
        durability: 9,
        softness: 7,
        maintenance: 'Easy'
      },
      silk: {
        name: 'Silk',
        price: 'CHF 890',
        origin: 'Italy',
        description: 'Exceptionally soft with a natural sheen, best suited for low-traffic or wall display.',
        care: 'Dry clean only. Avoid sunlight and moisture.',
        stock: 18,
        leadTime: '4-5',
        durability: 6,
        softness: 10,
        maintenance: 'Professional'
      },
      cotton: {
        name: 'Organic Cotton',
        price: 'CHF 310',
        origin: 'Switzerland',
        description: 'Soft, breathable, and family-friendly. Ideal for childrens rooms and bedrooms.',
        care: 'Machine washable with cold water. Hang dry.',
        stock: 62,
        leadTime: '1-2',
        durability: 7,
        softness: 8,
        maintenance: 'Easy'
      },
      alpaca: {
        name: 'Alpaca Wool',
        price: 'CHF 650',
        origin: 'Peruvian Highlands',
        description: 'Silky texture with excellent insulation. Adds warmth and texture.',
        care: 'Dry clean only. Brush gently for maintenance.',
        stock: 28,
        leadTime: '3-4',
        durability: 8,
        softness: 9,
        maintenance: 'Moderate'
      }
    },
    custom: {
      basePrice: 'CHF 950',
      leadTime: '4-6 weeks',
      consultation: true,
      includes: ['Design service', 'Material sourcing', 'Handweaving', 'Final delivery'],
      designOptions: 150,
      maxSize: 25, // m²
      materialOptions: ['Alpine Wool', 'Silk', 'Cotton', 'Alpaca', 'Blends'],
      productionTime: '6-8',
      recentProjects: [
        '5m² silk carpet for Geneva penthouse',
        'Custom Alpine wool runner for Bern museum'
      ]
    },
    collections: [
      {
        id: 'classic-rosetta',
        name: 'Classic Rosetta',
        style: 'Traditional',
        description: 'Timeless floral patterns with deep symbolism, perfect for heritage homes.',
        basePrice: 'CHF 1200',
        sizes: ['1x1m', '1.5x2m', '2x3m', '3x4m'],
        inStock: 7
      },
      {
        id: 'zen-lines',
        name: 'Zen Lines',
        style: 'Modern',
        description: 'Minimalist linework inspired by Japanese raked gardens.',
        basePrice: 'CHF 980',
        sizes: ['1x1m', '2x2m', '2x3m'],
        inStock: 12
      },
      {
        id: 'alpine-heritage',
        name: 'Alpine Heritage',
        style: 'Rustic',
        description: 'Inspired by Swiss mountain motifs and natural palettes.',
        basePrice: 'CHF 1050',
        sizes: ['1.5x2m', '2x3m', '3x4m', '4x5m'],
        inStock: 5
      }
    ],
    artisans: [
      {
        id: 'ursula-hess',
        name: 'Ursula Hess',
        specialty: 'Traditional Knotting',
        experience: '35 years',
        quote: 'Each knot is a moment of focus, a promise of beauty.',
        languages: ['German', 'French'],
        awards: ['2022 Swiss Craft Award', '2018 European Textile Prize']
      },
      {
        id: 'benoit-meier',
        name: 'Benoît Meier',
        specialty: 'Contemporary Design Weaving',
        experience: '20 years',
        quote: 'I see modern design as a bridge to ancient craft.',
        languages: ['French', 'English', 'German'],
        awards: ['2023 Design Innovation Award']
      }
    ],
    stats: {
      annualProduction: 1200, // m²
      readyMadeSizes: 8,
      totalDesigns: 78,
      localSourced: 65, // percentage
      clientSatisfaction: 98.7 // percentage
    },
    pricing: {
      readyMade: {
        min: 320,
        max: 1200
      },
      custom: {
        min: 950,
        max: 3500
      },
      promotions: [
        '15% off Alpine Wool until end of month',
        'Free consultation with custom order'
      ]
    },
    showroom: {
      exhibits: [
        'Historic Swiss Textiles Collection',
        'Modern Interpretations by Young Weavers'
      ],
      specials: [
        'Complimentary coffee from local roastery',
        'Weekend weaving demonstrations'
      ]
    },
    consultation: {
      availability: [
        'Weekdays: 9AM-6PM',
        'Saturdays: 10AM-4PM',
        'Evenings by appointment'
      ],
      experience: '15', // average years
      duration: '60 minutes'
    }
  };
};