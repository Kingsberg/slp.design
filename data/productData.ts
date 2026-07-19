
export const LABEL_QTY_STEPS = [100, 200, 300, 500, 1000, 2000, 3000, 4000, 5000, 10000, 20000, 30000, 40000, 50000];

export interface ProductConfigData {
  label: string;
  types?: string[];
  sizes: string[];
  materials: string[];
  orientations: string[];
  printColors: string[];
  finishings: string[];
  packages?: string[];
  basePrice: number;
  color: string;
  isCustomSize?: boolean;
}

export const PRODUCT_DATA: Record<string, ProductConfigData> = {
  business: {
    label: 'Business Card',
    types: ['Standard Business Card', 'Folded Business Card', 'Custom Die-cut Business Card'],
    sizes: ['54mm x 89mm', '52mm x 86mm', '50mm x 89mm', '54mm x 86mm', 'Custom Size'],
    materials: [
      'Gloss Art Card 250gsm (2 sides coated)',
      'Gloss Art Card 310gsm (2 sides coated)',
      'Gloss Art Card 360gsm (2 sides coated)',
      'Linen 240gsm',
      'Metal Ice 250gsm',
      'Synthetic Paper 180micron',
      'Super White 250gsm',
      'Suwen 240gsm'
    ],
    orientations: ['Landscape', 'Portrait'],
    printColors: ['Full Colour Printing'],
    finishings: [
      'No Finishing',
      'Matte Lamination',
      'Gloss Lamination',
      'Matte Lamination (Both)',
      'Gloss Lamination (Both)',
      'Matte Lamination (Both) + Spot UV (Front)',
      'Matte Lamination (Both) + Spot UV (Both)',
      'Gloss Waterbase Varnish'
    ],
    basePrice: 19.20,
    color: 'blue'
  },
  marketing: {
    label: 'Flyer / Brochure',
    sizes: [
      'A2 (420mm x 594mm)',
      'A3 (297mm x 420mm)',
      'A4 (210mm x 297mm)',
      'A5 (148mm x 210mm)',
      '3xA4 (297mm x 630mm)',
      '4xA4 (297mm x 840mm)',
      '4xA5 (210mm x 594mm)',
      'Others'
    ],
    materials: [
      'Simili 80gsm - Best Seller',
      'Simili 100gsm - Best Seller',
      'Gloss Art Paper 100gsm - Best Seller',
      'Gloss Art Paper 128gsm - Best Seller',
      'Gloss Art Paper 150gsm - Best Seller',
      'Matte Art Paper 130gsm - Best Seller',
      'Gloss Art Card 250gsm (2 sides coated) - Best Seller',
      'Gloss Art Card 310gsm (2 sides coated)',
      'Gloss Art Card 360gsm (2 sides coated)'
    ],
    orientations: [], // Removed for Flyers
    printColors: ['Single Side (4C)', 'Both Sides (4C+4C)'],
    finishings: [], // Replaced by custom UI
    basePrice: 45.00,
    color: 'purple'
  },
  'label-sticker': {
    label: 'Sticker / Label',
    isCustomSize: true, // Enabled for mm inputs
    sizes: ['Custom Size'],
    materials: ['Simili Sticker (Writeable)', 'MirrorKote Sticker', 'White PP Sticker (Waterproof)', 'Silver PP Sticker (Waterproof)', 'Transparent PP Sticker (Waterproof)'],
    orientations: ['Sheet'],
    printColors: ['Digital Printing'],
    finishings: ['Die Cut'],
    basePrice: 55.00,
    color: 'green'
  },
  inkjet: {
    label: 'Inkjet Printing',
    types: ['Banner / Bunting', 'Epson Sticker'],
    isCustomSize: true,
    sizes: ['Custom Size'],
    materials: ['Tarpaulin 300gsm', 'Tarpaulin 380gsm'],
    orientations: ['Landscape', 'Portrait'],
    printColors: ['720 dpi solvent', '1440 dpi solvent'],
    finishings: ['Eyelets + Rope', 'PVC Pipe', 'Wood', 'Cut to Size'],
    basePrice: 0,
    color: 'orange'
  },
  moneypacket: {
    label: 'Money Packet',
    types: ['Custom Made Money Packet'],
    sizes: ['154mm x 79.5mm', '79.5mm x 154mm', '85mm x 167mm'],
    materials: ['Gloss Art Paper 130gsm', 'Linen 140gsm', 'Art Paper 157gsm'],
    orientations: [], // Defined by Model
    printColors: ['4C (Front)'],
    finishings: ['N/A', 'Matte Lamination', 'Soft Touch Lamination'],
    basePrice: 200.00,
    color: 'emerald'
  },
  billbook: {
    label: 'Bill Book',
    types: ['NCR Carbonless Bill Book'],
    sizes: ['A4 (210mm x 297mm)', 'A5 (148mm x 210mm)'],
    materials: ['2 Ply NCR', '3 Ply NCR', '4 Ply NCR', '5 Ply NCR'],
    orientations: ['Portrait', 'Landscape'],
    printColors: ['1C', '2C', '4C'],
    finishings: ['Padding', 'Booking (with running number)'],
    basePrice: 50.00,
    color: 'blue'
  }
};
