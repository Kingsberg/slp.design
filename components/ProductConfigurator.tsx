import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, MessageCircle, FileText, Calendar, X, AlertTriangle, Box, Layout, ChevronDown, ChevronUp, ClipboardCheck, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

import { PRODUCT_DATA, LABEL_QTY_STEPS, ProductConfigData } from '../data/productData';
import pricingData from '../data/pricing.json';
import { formatPrice } from '../lib/utils';

// CONSTANTS for Label Logic
const SHEET_W = 316;
const SHEET_H = 469;
const GAP = 3;
const MIN_CART = 12.00;

const getExHexColor = (code: string) => {
  const map: Record<string, string> = {
    'BLK 01': '#2C2A29',
    'BLU 01': '#43469B',
    'BLU 02': '#0F578F',
    'BLU 03': '#567EC0',
    'BLU 04': '#0F88D6',
    'BRW 01': '#895A39',
    'CYN 01': '#00AEEF',
    'GRN 04': '#629339',
    'GRN 05': '#00A859',
    'MAG 01': '#EC008C',
    'MAR 01': '#AA3052',
    'ORG 01': '#F59331',
    'RED 01': '#F06654',
    'RED 03': '#F27579',
    'VIO 01': '#8371B3',
  };
  return map[code] || '#ffffff';
};

const BillBookDiagram = ({ 
  sizeLabel, 
  orientation, 
  bindingEdge, 
  bindingType, 
  holePunch 
}: {
  sizeLabel: string;
  orientation: string;
  bindingEdge: string;
  bindingType: string;
  holePunch: string;
}) => {
  // Extract width/height from "A4 (210mm x 297mm)"
  let w = 210, h = 297;
  const match = sizeLabel.match(/(\d+)mm x (\d+)mm/);
  if (match) {
    w = parseInt(match[1]);
    h = parseInt(match[2]);
  }
  
  // Swap for landscape
  if (orientation === 'Landscape') {
    const temp = w;
    w = h;
    h = temp;
  }

  const isLeft = bindingEdge === 'Left Binding';
  
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-stone-50 dark:bg-neutral-900/50 rounded-xl border border-stone-200 dark:border-neutral-800">
      <div className="relative" style={{ width: '160px', height: `${(h/w) * 160}px`, maxWidth: '100%', maxHeight: '200px', aspectRatio: `${w}/${h}` }}>
        {/* Paper Body */}
        <div className="absolute inset-0 bg-white dark:bg-neutral-800 border-2 border-stone-400 dark:border-neutral-600 rounded-sm shadow-sm overflow-hidden">
          {/* Perforation Line (Only for Book) */}
          {bindingType === 'Book' && (
            <div className={`absolute ${isLeft ? 'left-[15%] top-0 bottom-0 border-l-2' : 'top-[15%] left-0 right-0 border-t-2'} border-dashed border-stone-400 dark:border-neutral-500`} />
          )}
          
          {/* Hole Punching Dots */}
          {holePunch !== 'No Hole Punching' && (
            <>
              <div className={`absolute w-1.5 h-1.5 rounded-full bg-stone-300 dark:bg-neutral-700 ${isLeft ? 'left-[8%] top-[25%]' : 'top-[8%] left-[25%]'}`} />
              <div className={`absolute w-1.5 h-1.5 rounded-full bg-stone-300 dark:bg-neutral-700 ${isLeft ? 'left-[8%] bottom-[25%]' : 'top-[8%] right-[25%]'}`} />
            </>
          )}

          {/* Flap fold illusion (Only for Book) */}
          {bindingType === 'Book' && (
            <div className={`absolute ${isLeft ? 'left-0 top-0 bottom-0 w-[15%]' : 'top-0 left-0 right-0 h-[15%]'} bg-stone-100 dark:bg-neutral-700/50`} />
          )}

          {/* Binding Glue/Staple Strip */}
          <div className={`absolute ${isLeft ? 'left-0 top-0 bottom-0 w-1.5' : 'top-0 left-0 right-0 h-1.5'} bg-stone-700 dark:bg-neutral-950`} />
        </div>

        {/* Dimension Labels */}
        <div className="absolute -top-6 left-0 right-0 text-center text-[10px] font-medium text-stone-500 dark:text-neutral-400 whitespace-nowrap">
          {w} mm
        </div>
        <div className="absolute top-0 bottom-0 -left-12 flex items-center justify-center text-[10px] font-medium text-stone-500 dark:text-neutral-400 whitespace-nowrap -rotate-90">
          {h} mm
        </div>
      </div>
    </div>
  );
};

// RATES CONFIGURATION (Anchor Fixed Calculator)
const TIERS = [
  { max: 2, mirror: 10.50, pp: 12.50, name: "Micro-Order" },
  { max: 5, mirror: 8.50, pp: 10.50, name: "Startup" },
  { max: 12, mirror: 6.30, pp: 8.50, name: "Bridge" },
  { max: 24, mirror: 5.00, pp: 6.80, name: "500pcs Range" },
  { max: 49, mirror: 4.60, pp: 5.80, name: "1000pcs Range" },
  { max: 74, mirror: 3.80, pp: 4.80, name: "2000pcs Range" },
  { max: 99, mirror: 3.30, pp: 4.30, name: "3000pcs Range" },
  { max: 124, mirror: 2.95, pp: 4.00, name: "4000pcs Range" },
  { max: 99999, mirror: 2.65, pp: 3.60, name: "5000pcs+ Range" }
];

const CATEGORIES = [
  { id: 'business', label: 'Business Card' },
  { id: 'marketing', label: 'Flyer / Brochure' },
  { id: 'label-sticker', label: 'Sticker / Label' },
  { id: 'inkjet', label: 'Inkjet Printing' },
  { id: 'moneypacket', label: 'Money Packet' }
];

interface ProductConfiguratorProps {
  activeCategory: string;
}

const ProductConfigurator: React.FC<ProductConfiguratorProps> = ({ activeCategory }) => {
  const navigate = useNavigate();
  // Config data based on active category (default to business if not found)
  const config = PRODUCT_DATA[activeCategory] || PRODUCT_DATA['business'];

  // State for configuration
  const [searchParams, setSearchParams] = useSearchParams();

  // State initialization
  const [quantity, setQuantity] = useState(100);
  const [size, setSize] = useState(config.sizes[0]);
  const [orientation, setOrientation] = useState(config.orientations?.[0] || '');
  const [material, setMaterial] = useState(config.materials[0]);
  const [printColor, setPrintColor] = useState(config.printColors[0]);
  const [finishing, setFinishing] = useState(config.finishings[0] || '');
  const [packageType, setPackageType] = useState(config.packages ? config.packages[0] : '');
  const [designOption, setDesignOption] = useState('Send us your print ready design');
  const [flyerFolding, setFlyerFolding] = useState('Not Required');
  const [flyerHotStamping, setFlyerHotStamping] = useState('Not Required');
  const [flyerHolePunching, setFlyerHolePunching] = useState('Not Required');
  const [mpCategory, setMpCategory] = useState('Standard');
  const [mpModel, setMpModel] = useState('Money Packet Portrait');
  const [mpPacking, setMpPacking] = useState('5pcs / Pack');
  const [mpHotStampingSides, setMpHotStampingSides] = useState('Hot Stamping (1 Side)');
  const [selectedType, setSelectedType] = useState(config.types ? config.types[0] : '');
  const [customWidth, setCustomWidth] = useState('50');
  const [customHeight, setCustomHeight] = useState('50');
  const [bizCustomHeight, setBizCustomHeight] = useState('54');
  const [bizCustomWidth, setBizCustomWidth] = useState('89');
  const [previewSide, setPreviewSide] = useState<'front' | 'back'>('front');
  const [isPreviewZoomed, setIsPreviewZoomed] = useState(false);
  const [stickerLamination, setStickerLamination] = useState('None');

  // Bill Book State
  const [bbBinding, setBbBinding] = useState('Book');
  const [bbBindingEdge, setBbBindingEdge] = useState('Left Binding');
  const [bbMaterial, setBbMaterial] = useState('NCR (Carbonize Paper)');
  const [bbLayers, setBbLayers] = useState('2');
  const [bbSets, setBbSets] = useState('50');
  const [bbPerforation, setBbPerforation] = useState('No');
  const [bbNumbering, setBbNumbering] = useState('No Numbering');
  const [bbNumberFrom, setBbNumberFrom] = useState('');
  const [bbHolePunching, setBbHolePunching] = useState('No Hole Punching');
  const [bbPrintColorHex, setBbPrintColorHex] = useState('BLK 01');
  const [bbLayerColors, setBbLayerColors] = useState<string[]>(['NCR White 50gsm', 'NCR Pink 50gsm', 'NCR Yellow 50gsm', 'NCR Blue 50gsm', 'NCR Green 50gsm', 'NCR White 50gsm']);
  const [bbNumberError, setBbNumberError] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Mobile browsing helpers: keep the long configurator scannable without changing desktop behavior.
  const [mobileStep, setMobileStep] = useState(0);
  const [isMobileReviewOpen, setIsMobileReviewOpen] = useState(false);

  // Helper to determine available quantities
  const getQuantitiesFor = (cat: string, currentSize: string, currentMaterial?: string) => {
    if (cat === 'label-sticker') {
      return LABEL_QTY_STEPS;
    }

    if (cat === 'moneypacket') {
      return [1250, 2500, 5000, 10000, 15000, 20000, 25000, 30000, 40000, 50000];
    }

    if (cat === 'marketing') {
      if (currentSize.includes('A5') && !currentSize.includes('4xA5')) {
        return [600, 1000, 4000, 6000, 8000, 10000, 12000, 16000, 20000, 24000, 30000, 40000, 50000];
      } else if (currentSize.includes('3xA4') || currentSize.includes('4xA4') || currentSize.includes('4xA5')) {
        return [300, 500, 1000, 2000, 3000, 4000, 5000, 6000, 8000, 10000, 15000, 20000];
      } else {
        return [300, 500, 1000, 2000, 3000, 4000, 5000, 6000, 8000, 10000, 15000, 20000, 25000, 30000, 35000, 40000, 50000];
      }
    }

    if (cat === 'inkjet') {
      return [1, 2, 3, 5, 10, 20];
    }

    if (cat === 'business') {
      if (currentMaterial === 'Gloss Art Card 250gsm (2 sides coated)') {
        return [100, 200, 300, 500, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000];
      }
      return [100, 200, 300, 500, 1000, 2000, 3000, 4000, 5000, 10000];
    }

    if (cat === 'billbook') {
      return [10, 20, 30, 50, 100];
    }

    // Default
    return [50, 100, 200, 300, 500, 1000];
  };

  const availableQuantities = useMemo(() => getQuantitiesFor(activeCategory, size, material), [activeCategory, size, material]);

  // Compute available materials dynamically based on selection
  const availableMaterials = useMemo(() => {
    if (activeCategory === 'inkjet') {
      if (selectedType === 'Epson Sticker') {
        return [
          'White Sticker',
          'Transparent Sticker',
          'Synthetic Paper',
          'Art Canvas',
          'One Way Vision Sticker'
        ];
      } else {
        return ['Tarpaulin 300gsm', 'Tarpaulin 380gsm'];
      }
    }
    return config.materials;
  }, [activeCategory, selectedType, config.materials]);

  // Compute available finishings dynamically based on selection
  const availableFinishings = useMemo(() => {
    if (activeCategory === 'moneypacket') {
      if (material === 'Art Paper 157gsm') {
        return ['Matte Lamination', 'Soft Touch Lamination'];
      } else {
        return ['N/A'];
      }
    }
    if (activeCategory === 'inkjet') {
      if (selectedType === 'Epson Sticker') {
        return ['Cut to Size'];
      } else {
        return ['Eyelets + Rope', 'PVC Pipe', 'Wood', 'Cut to Size'];
      }
    }
    if (activeCategory === 'business') {
      const isSpotUVAllowedMaterial = material === 'Gloss Art Card 250gsm (2 sides coated)' || material === 'Gloss Art Card 310gsm (2 sides coated)';
      const isLaminationAllowedMaterial = isSpotUVAllowedMaterial || material === 'Gloss Art Card 360gsm (2 sides coated)';
      const isSpotUVAllowedQty = quantity === 300 || quantity === 500 || (quantity >= 1000 && quantity <= 10000);

      if (quantity < 300) {
        if (isLaminationAllowedMaterial) {
          return ['No Finishing', 'Matte Lamination', 'Gloss Lamination'];
        } else {
          return ['No Finishing'];
        }
      } else {
        const options = ['No Finishing'];
        if (isLaminationAllowedMaterial) {
          options.push('Gloss Waterbase Varnish', 'Matte Lamination (Both)', 'Gloss Lamination (Both)');
          if (isSpotUVAllowedMaterial && isSpotUVAllowedQty) {
            options.push(
              'Matte Lamination (Both) + Spot UV (Front)',
              'Matte Lamination (Both) + Spot UV (Both)'
            );
          }
        }
        return options;
      }
    }
    return config.finishings;
  }, [activeCategory, material, selectedType, quantity, config.finishings]);

  // Compute print method display label
  const printMethodDisplay = useMemo(() => {
    if (activeCategory === 'inkjet') {
      return selectedType === 'Epson Sticker' ? '1440 dpi Epson Eco Solvent' : '720 dpi solvent';
    }
    return config.printColors[0];
  }, [activeCategory, selectedType, config.printColors]);

  // Reset the mobile flow when the visitor switches product categories.
  useEffect(() => {
    setMobileStep(0);
    setIsMobileReviewOpen(false);
  }, [activeCategory]);

  // Initialize and synchronize states from URL search parameters on load
  useEffect(() => {
    const hasParams = searchParams.has('qty');

    if (hasParams) {
      const q = searchParams.get('qty');
      if (q) {
        const val = parseInt(q, 10);
        if (val !== quantity) setQuantity(val);
      }

      const sz = searchParams.get('size');
      if (sz && sz !== size) setSize(sz);

      const ori = searchParams.get('orientation');
      if (ori && ori !== orientation) setOrientation(ori);

      const mat = searchParams.get('material');
      if (mat && mat !== material) setMaterial(mat);

      const col = searchParams.get('printColor');
      if (col && col !== printColor) setPrintColor(col);

      const fin = searchParams.get('finishing');
      if (fin && fin !== finishing) setFinishing(fin);

      const pkg = searchParams.get('pkg');
      if (pkg && pkg !== packageType) setPackageType(pkg);

      const des = searchParams.get('design');
      if (des && des !== designOption) setDesignOption(des);

      const w = searchParams.get('w');
      if (w && w !== customWidth) setCustomWidth(w);

      const h = searchParams.get('h');
      if (h && h !== customHeight) setCustomHeight(h);

      const bh = searchParams.get('bh');
      if (bh && bh !== bizCustomHeight) setBizCustomHeight(bh);

      const bw = searchParams.get('bw');
      if (bw && bw !== bizCustomWidth) setBizCustomWidth(bw);

      const lam = searchParams.get('lamination');
      if (lam && lam !== stickerLamination) setStickerLamination(lam);

      const mpc = searchParams.get('mp_cat');
      if (mpc && mpc !== mpCategory) setMpCategory(mpc);

      const mpm = searchParams.get('mp_model');
      if (mpm && mpm !== mpModel) setMpModel(mpm);

      const mpp = searchParams.get('mp_pack');
      if (mpp && mpp !== mpPacking) setMpPacking(mpp);

      const mph = searchParams.get('mp_hs');
      if (mph && mph !== mpHotStampingSides) setMpHotStampingSides(mph);

      const fld = searchParams.get('folding');
      if (fld && fld !== flyerFolding) setFlyerFolding(fld);

      const fhs = searchParams.get('hs');
      if (fhs && fhs !== flyerHotStamping) setFlyerHotStamping(fhs);

      const fph = searchParams.get('punch');
      if (fph && fph !== flyerHolePunching) setFlyerHolePunching(fph);

      const typ = searchParams.get('type');
      if (typ && typ !== selectedType) setSelectedType(typ);
    } else {
      // Load defaults
      const defaultSize = config.sizes[0];
      if (defaultSize !== size) setSize(defaultSize);
      
      const defaultOri = config.orientations?.[0] || '';
      if (defaultOri !== orientation) setOrientation(defaultOri);
      
      const defaultCol = config.printColors[0];
      if (defaultCol !== printColor) setPrintColor(defaultCol);

      const defaults = getQuantitiesFor(activeCategory, defaultSize, config.materials[0]);
      if (defaults[0] !== quantity) setQuantity(defaults[0]);

      if (activeCategory === 'label-sticker') {
        if (customWidth !== '50') setCustomWidth('50');
        if (customHeight !== '50') setCustomHeight('50');
      } else {
        if (customWidth !== '5') setCustomWidth('5');
        if (customHeight !== '2') setCustomHeight('2');
      }

      if (bizCustomHeight !== '54') setBizCustomHeight('54');
      if (bizCustomWidth !== '89') setBizCustomWidth('89');

      const defaultDesign = activeCategory === 'moneypacket' ? 'Chat with us for ready designed template' : 'Send us your print ready design';
      if (designOption !== defaultDesign) setDesignOption(defaultDesign);

      if (flyerFolding !== 'Not Required') setFlyerFolding('Not Required');
      if (flyerHotStamping !== 'Not Required') setFlyerHotStamping('Not Required');
      if (flyerHolePunching !== 'Not Required') setFlyerHolePunching('Not Required');

      if (mpCategory !== 'Standard') setMpCategory('Standard');
      if (mpModel !== 'Money Packet Portrait') setMpModel('Money Packet Portrait');
      if (mpPacking !== '5pcs / Pack') setMpPacking('5pcs / Pack');
      if (mpHotStampingSides !== 'Hot Stamping (1 Side)') setMpHotStampingSides('Hot Stamping (1 Side)');
      if (stickerLamination !== 'None') setStickerLamination('None');

      const defaultType = config.types ? config.types[0] : '';
      if (selectedType !== defaultType) setSelectedType(defaultType);

      const defaultPkg = config.packages ? config.packages[0] : '';
      if (packageType !== defaultPkg) setPackageType(defaultPkg);

      if (material !== config.materials[0]) setMaterial(config.materials[0]);
      
      const defaultFin = config.finishings[0] || '';
      if (finishing !== defaultFin) setFinishing(defaultFin);
    }
  }, [activeCategory, config]);

  // Synchronize state configurations to the URL search params
  useEffect(() => {
    const params: Record<string, string> = {
      qty: String(quantity),
      size: size,
    };
    if (orientation) params.orientation = orientation;
    if (material) params.material = material;
    if (printColor) params.printColor = printColor;
    if (finishing) params.finishing = finishing;
    if (selectedType) params.type = selectedType;
    if (customWidth) params.w = customWidth;
    if (customHeight) params.h = customHeight;
    if (bizCustomHeight) params.bh = bizCustomHeight;
    if (bizCustomWidth) params.bw = bizCustomWidth;
    if (packageType) params.pkg = packageType;
    if (designOption) params.design = designOption;
    if (stickerLamination !== 'None') params.lamination = stickerLamination;
    if (activeCategory === 'moneypacket') {
      params.mp_cat = mpCategory;
      params.mp_model = mpModel;
      params.mp_pack = mpPacking;
      params.mp_hs = mpHotStampingSides;
    }
    if (activeCategory === 'marketing') {
      params.folding = flyerFolding;
      params.hs = flyerHotStamping;
      params.punch = flyerHolePunching;
    }
    setSearchParams(params, { replace: true });
  }, [
    quantity, size, orientation, material, printColor, finishing, selectedType,
    customWidth, customHeight, bizCustomHeight, bizCustomWidth,
    packageType, designOption, stickerLamination, mpCategory,
    mpModel, mpPacking, mpHotStampingSides, flyerFolding,
    flyerHotStamping, flyerHolePunching, setSearchParams, activeCategory
  ]);

  // Enforce No Lamination on Non-MirrorKote Sticker
  useEffect(() => {
    if (activeCategory === 'label-sticker' && material && !material.includes('MirrorKote') && stickerLamination !== 'None') {
      setStickerLamination('None');
    }
  }, [material, activeCategory, stickerLamination]);

  // Bill Book Constraints
  useEffect(() => {
    if (activeCategory === 'billbook') {
      if (bbMaterial === 'Normal Paper') {
        // 100 sets: 1 - 2 layers only
        if (bbSets === '100' && parseInt(bbLayers) > 2) {
          setBbLayers('2');
        }
        // 3-6 layers available with 50 sets only
        if (parseInt(bbLayers) > 2 && bbSets !== '50') {
          setBbSets('50');
        }
      } else {
        if (bbSets !== '50') {
          setBbSets('50');
        }
      }

      // Numbering validation
      if (bbNumbering === 'Yes — Add Numbering') {
        if (!bbNumberFrom) {
          setBbNumberError(null); // Just empty
        } else if (!/^\d{4,7}$/.test(bbNumberFrom)) {
          setBbNumberError('Number must be 4 to 7 digits');
        } else if (!bbNumberFrom.endsWith('1')) {
          setBbNumberError('Last digit of starting number must be 1 (e.g. 0001, 00101)');
        } else {
          setBbNumberError(null);
        }
      } else {
        setBbNumberError(null);
      }
    }
  }, [activeCategory, bbLayers, bbSets, bbBinding, bbPerforation, bbNumbering, bbNumberFrom, bbMaterial]);


  // Enforce material bounds
  useEffect(() => {
    if (material && !availableMaterials.includes(material)) {
      setMaterial(availableMaterials[0] || '');
    }
  }, [availableMaterials, material]);

  // Enforce finishing bounds
  useEffect(() => {
    if (finishing && !availableFinishings.includes(finishing)) {
      setFinishing(availableFinishings[0] || '');
    }
  }, [availableFinishings, finishing]);

  // Enforce quantity bounds
  useEffect(() => {
    if (quantity && !availableQuantities.includes(quantity)) {
      setQuantity(availableQuantities[0] || 100);
    }
  }, [availableQuantities, quantity]);

  // Enforce lamination restrictions for Simili and thin flyer stocks
  useEffect(() => {
    const isRestricted = material.includes('Simili') || material.includes('Art Paper 100gsm') || material.includes('Art Paper 128gsm');
    if (isRestricted && finishing.includes('Lamination')) {
      setFinishing('Not Required');
    }
  }, [material, finishing]);

  // Handle Money Packet Size Logic
  useEffect(() => {
    if (activeCategory === 'moneypacket') {
      if (mpModel === 'Money Packet Portrait') {
        setSize('154mm x 79.5mm');
      } else if (mpModel === 'Money Packet Landscape') {
        setSize('79.5mm x 154mm');
      } else if (mpModel === 'Money Packet Portrait Large') {
        setSize('85mm x 167mm');
      }
    }
  }, [activeCategory, mpModel]);

  // Compute calculated shipment date information synchronously
  const shipmentDateData = useMemo(() => {
    let daysNeeded = 3;
    let cutoffHour = 16; // 4 PM
    let displayDays = '3';

    if (activeCategory === 'business') {
      if (finishing.includes('Spot UV')) {
        daysNeeded = 5;
        displayDays = '5';
      } else {
        daysNeeded = 3;
        displayDays = '2-3';
      }
      cutoffHour = 16;
    } else if (activeCategory === 'moneypacket') {
      daysNeeded = 7;
      displayDays = '7-9';
    } else if (activeCategory === 'billbook') {
      daysNeeded = 7;
      displayDays = '7';
      cutoffHour = 13; // Using standard 1 PM cutoff
    } else if (activeCategory === 'marketing') {
      daysNeeded = 3;
      displayDays = '3-4';
      cutoffHour = 13; // 1 PM cutoff for Flyers
    } else if (activeCategory === 'label-sticker') {
      cutoffHour = 13;
      if (quantity <= 500) {
        daysNeeded = 1;
        displayDays = '1-2';
      } else if (quantity <= 2000) {
        daysNeeded = 2;
        displayDays = '2-3';
      } else if (quantity <= 5000) {
        daysNeeded = 3;
        displayDays = '3-4';
      } else {
        daysNeeded = 4;
        displayDays = '4-5';
      }
    } else {
      daysNeeded = 3; // Inkjet
      displayDays = '3-4';
      cutoffHour = 13; // 1 PM cutoff for other items
    }

    const now = new Date();
    const currentHour = now.getHours();

    let startOffset = 0;
    if (currentHour >= cutoffHour) {
      startOffset = 1;
    }

    let tempDate = new Date(now);
    tempDate.setDate(tempDate.getDate() + startOffset);

    let workingDaysAdded = 0;
    while (workingDaysAdded < daysNeeded) {
      tempDate.setDate(tempDate.getDate() + 1);
      const day = tempDate.getDay();
      if (day !== 0 && day !== 6) { // 0 = Sunday, 6 = Saturday
        workingDaysAdded++;
      }
    }

    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric' };
    const dateStr = tempDate.toLocaleDateString('en-MY', options);
    
    return {
      dateString: dateStr,
      workingDays: daysNeeded,
      displayDays: displayDays,
      pastCutoff: currentHour >= cutoffHour,
      cutoffText: `${cutoffHour > 12 ? cutoffHour - 12 + 'pm' : cutoffHour + 'am'}`
    };
  }, [activeCategory, finishing, quantity]);

  // Helper function for accessibility keypress handling
  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  // Synchronously compute price, metrics, size errors, and upsell configurations
  const calcData = useMemo(() => {
    let error = null;
    let computedLabelYield = 0;
    let computedLabelSheets = 0;
    let computedLabelTier = '';

    if (activeCategory === 'label-sticker') {
      const w = parseFloat(customWidth) || 0;
      const h = parseFloat(customHeight) || 0;
      if (w <= 0 || h <= 0) {
        error = 'Please enter valid dimensions';
      } else if (w < 10 || h < 10) {
        error = 'Minimum dimensions for stickers is 10mm x 10mm.';
      } else {
        const effW = w + GAP;
        const effH = h + GAP;
        const y1 = Math.floor(SHEET_W / effW) * Math.floor(SHEET_H / effH);
        const y2 = Math.floor(SHEET_W / effH) * Math.floor(SHEET_H / effW);
        const bestYield = Math.max(y1, y2);
        if (bestYield === 0) {
          error = 'Stickers exceed printable sheet area (316x469mm) + bleed. For larger sizes, please use Inkjet Printing.';
        } else {
          computedLabelYield = bestYield;
          computedLabelSheets = Math.ceil(quantity / bestYield);
        }
      }
    } else if (activeCategory === 'inkjet') {
      const w = parseFloat(customWidth) || 0;
      const h = parseFloat(customHeight) || 0;
      let limit = 10;
      if (selectedType === 'Epson Sticker') {
        limit = 4;
      }
      if (w <= 0 || h <= 0) {
        error = 'Please enter valid dimensions';
      } else if (w > limit && h > limit) {
        error = `Maximum roll width is ${limit}ft. Please ensure at least one dimension is ${limit}ft or less.`;
      }
    } else if (activeCategory === 'business' && size === 'Custom Size') {
      const bizH = parseFloat(bizCustomHeight) || 0;
      const bizW = parseFloat(bizCustomWidth) || 0;
      if (bizH < 40 || bizH > 54) {
        error = 'Height must be between 40mm and 54mm';
      } else if (bizW < 40 || bizW > 89) {
        error = 'Width must be between 40mm and 89mm';
      }
    }

    const computeRawPriceFor = (qty: number) => {
      let finalPrice = 0;

      if (activeCategory === 'label-sticker') {
        const w = parseFloat(customWidth) || 0;
        const h = parseFloat(customHeight) || 0;
        if (w > 0 && h > 0) {
          const effW = w + GAP;
          const effH = h + GAP;
          const y1 = Math.floor(SHEET_W / effW) * Math.floor(SHEET_H / effH);
          const y2 = Math.floor(SHEET_W / effH) * Math.floor(SHEET_H / effW);
          const bestYield = Math.max(y1, y2);
          
          if (bestYield > 0) {
            const sheetsNeeded = Math.ceil(qty / bestYield);
            const isMirror = material.includes('MirrorKote') || material.includes('Simili');
            const lamRate = stickerLamination !== 'None' ? 0.80 : 0.00;
            let selectedRate = 0;
            let tierName = "";

            for (let i = 0; i < TIERS.length; i++) {
              if (sheetsNeeded <= TIERS[i].max) {
                selectedRate = ((isMirror) ? TIERS[i].mirror : TIERS[i].pp) + lamRate;
                tierName = TIERS[i].name;
                break;
              }
            }

            let total = sheetsNeeded * selectedRate;

            for (let i = 0; i < TIERS.length; i++) {
              if (sheetsNeeded < TIERS[i].max) {
                let nextTier = TIERS[i + 1];
                if (nextTier) {
                  let nextRate = ((isMirror) ? nextTier.mirror : nextTier.pp) + lamRate;
                  let nextStartSheets = TIERS[i].max + 1;
                  let nextTierStartPrice = nextStartSheets * nextRate;

                  if (total > nextTierStartPrice) {
                    total = nextTierStartPrice;
                  }
                }
                break;
              }
            }

            if (qty === quantity) {
              computedLabelTier = tierName;
            }

            const isTinyCut = w < 30 || h < 30;
            if (isTinyCut) {
              total = total * 1.15;
            }

            if (total < MIN_CART) total = MIN_CART;
            finalPrice = total;
          }
        }
      } else if (activeCategory === 'inkjet') {
        const w = parseFloat(customWidth) || 0;
        const h = parseFloat(customHeight) || 0;
        const area = w * h;

        if (selectedType === 'Epson Sticker') {
          let rate = 6.00;
          if (material.includes('Art Canvas')) rate = 13.00;
          if (material.includes('One Way Vision')) rate = 7.00;
          const chargeableArea = Math.max(area, 3);
          finalPrice = chargeableArea * rate * qty;
        } else {
          const rate = material.includes('380') ? 3.00 : 2.00;
          let p = area * qty * rate;
          if (p < 10) p = 10;
          finalPrice = p;
        }
      } else if (activeCategory === 'business') {
        let base = 0;
        const pData: any = pricingData;
        
        let lookupMaterial = material;
        if (pData.business && !pData.business[lookupMaterial]) {
          if (material.includes('360gsm')) {
            lookupMaterial = 'Gloss Art Card 310gsm (2 sides coated)';
          } else if (material.includes('Metal Ice') || material.includes('Synthetic') || material.includes('Suwen')) {
            lookupMaterial = 'Linen 240gsm';
          }
        }

        if (pData.business?.[lookupMaterial]?.[String(qty)]) {
          base = pData.business[lookupMaterial][String(qty)];
        } else {
          const is250gsm = material.includes('250gsm');
          base = is250gsm ? 38 : 35;
        }

        if (qty < 300) {
          if (finishing === 'Matte Lamination' || finishing === 'Gloss Lamination') {
            base += 10;
          }
        }

        if (qty >= 300) {
          if (finishing === 'Matte Lamination (Both) + Spot UV (Front)') {
            if (qty <= 500) base += 30;
            else if (qty <= 2000) base += 50;
            else if (qty <= 3000) base += 80;
            else if (qty <= 5000) base += 120;
            else base += 200;
          }
          if (finishing === 'Matte Lamination (Both) + Spot UV (Both)') {
            if (qty <= 500) base += 50;
            else if (qty <= 2000) base += 80;
            else if (qty <= 3000) base += 120;
            else if (qty <= 5000) base += 180;
            else base += 300;
          }
        }

        if (selectedType === 'Folded Business Card') {
          base *= 1.8;
        } else if (selectedType === 'Custom Die-cut Business Card') {
          base *= 1.5;
        }
        finalPrice = base;
      } else if (activeCategory === 'marketing') {
        let base = 0;
        const isDoubleSide = printColor.includes('Both Sides');
        const colorKey = isDoubleSide ? '4C+4C' : '4C';
        let dataKey: string | null = null;
        if (size.includes('A4')) {
          if (material.includes('Simili 80gsm')) dataKey = 'A4_80gsm_Simili';
          else if (material.includes('Simili 100gsm')) dataKey = 'A4_100gsm_Simili';
          else if (material.includes('Simili 140gsm')) dataKey = 'A4_140gsm_Simili';
          else if (material.includes('Art Paper 100gsm')) dataKey = 'A4_100gsm_Artpaper';
          else if (material.includes('Art Paper 128gsm')) dataKey = 'A4_128gsm_Artpaper';
          else if (material.includes('Art Paper 150gsm')) dataKey = 'A4_150gsm_Artpaper';
          else if (material.includes('Art Card 250gsm')) dataKey = 'A4_250gsm_ArtCard';
        }
        const pData: any = pricingData;
        if (dataKey && pData[dataKey] && pData[dataKey][colorKey] && pData[dataKey][colorKey][String(qty)]) {
          base = pData[dataKey][colorKey][String(qty)];
        } else {
          base = config.basePrice;
          if (qty > 50) base = (base / 50) * qty * 0.8;
          if (isDoubleSide) base *= 1.6;
        }

        if (finishing === 'Gloss Lamination (Both)') {
          base += 40 + (qty * 0.12);
        } else if (finishing === 'Matte Lamination (Both)') {
          base += 40 + (qty * 0.15);
        }

        const hasFinishing = flyerFolding !== 'Not Required' || flyerHotStamping !== 'Not Required' || flyerHolePunching !== 'Not Required';
        if (hasFinishing) {
          base += (qty * 0.15);
        }
        finalPrice = base;
      } else if (activeCategory === 'moneypacket') {
        const pData: any = pricingData;
        const isPortrait = mpModel === 'Money Packet Portrait';
        const isLandscape = mpModel === 'Money Packet Landscape';
        
        let mpModelKey = "Portrait";
        if (isLandscape) mpModelKey = "Landscape";
        else if (mpModel === 'Money Packet Portrait Large') mpModelKey = "PortraitLarge";

        let matKey = "Gloss_130gsm";
        if (material === 'Linen 140gsm') matKey = "Linen_140gsm";
        else if (material === 'Art Paper 157gsm') matKey = "Art_157gsm";

        let subKey = "standard";
        if (mpCategory === 'Hot Stamping') {
          subKey = mpHotStampingSides === 'Hot Stamping (2 Sides)' ? "hotstamp_2sides" : "hotstamp_1side";
        } else if (material === 'Art Paper 157gsm' && finishing === 'Soft Touch Lamination') {
          subKey = "softtouch";
        }

        let base = pData.moneypacket?.[mpModelKey]?.[matKey]?.[subKey]?.[String(qty)] || 0;
        
        if (base === 0) {
          // Fallback logic
          if (isPortrait) {
            if (material === 'Gloss Art Paper 130gsm') {
              base = 399 + ((qty - 1250) * 0.1);
              if (mpCategory === 'Hot Stamping') {
                base = mpHotStampingSides === 'Hot Stamping (2 Sides)' ? base * 1.6 : base * 1.4;
              }
            } else if (material === 'Linen 140gsm') {
              base = 499 + ((qty - 1250) * 0.15);
              if (mpCategory === 'Hot Stamping') {
                base = mpHotStampingSides === 'Hot Stamping (2 Sides)' ? base * 1.6 : base * 1.4;
              }
            } else if (material === 'Art Paper 157gsm') {
              base = finishing === 'Soft Touch Lamination' ? 688 + ((qty - 1250) * 0.3) : 529 + ((qty - 1250) * 0.25);
              if (mpCategory === 'Hot Stamping') {
                base = mpHotStampingSides === 'Hot Stamping (2 Sides)' ? base * 1.6 : base * 1.4;
              }
            } else {
              base = config.basePrice;
              if (qty > 1250) base = base + ((qty - 1250) * 0.15);
              if (mpCategory === 'Hot Stamping') {
                base = mpHotStampingSides === 'Hot Stamping (2 Sides)' ? base * 1.6 : base * 1.4;
              }
            }
          } else if (isLandscape) {
            if (material === 'Art Paper 157gsm') {
              base = 599 + ((qty - 1250) * 0.4);
              if (finishing === 'Soft Touch Lamination') base *= 1.3;
              if (mpCategory === 'Hot Stamping') {
                base = mpHotStampingSides === 'Hot Stamping (2 Sides)' ? base * 1.6 : base * 1.4;
              }
            } else if (material === 'Linen 140gsm') {
              base = 599 + ((qty - 1250) * 0.2);
              if (mpCategory === 'Hot Stamping') {
                base = mpHotStampingSides === 'Hot Stamping (2 Sides)' ? base * 1.6 : base * 1.4;
              }
            } else if (material === 'Gloss Art Paper 130gsm') {
              base = 450 + ((qty - 1250) * 0.1);
              if (mpCategory === 'Hot Stamping') {
                base = mpHotStampingSides === 'Hot Stamping (2 Sides)' ? base * 1.6 : base * 1.4;
              }
            } else {
              base = config.basePrice;
              if (qty > 1250) base = base + ((qty - 1250) * 0.15);
              if (mpCategory === 'Hot Stamping') {
                base = mpHotStampingSides === 'Hot Stamping (2 Sides)' ? base * 1.6 : base * 1.4;
              }
            }
          } else { // Portrait Large
            if (material === 'Gloss Art Paper 130gsm') {
              base = 439 + ((qty - 1250) * 0.15);
              if (mpCategory === 'Hot Stamping') {
                base = mpHotStampingSides === 'Hot Stamping (2 Sides)' ? base * 1.6 : base * 1.4;
              }
            } else if (material === 'Linen 140gsm') {
              base = 588 + ((qty - 1250) * 0.15);
              if (mpCategory === 'Hot Stamping') {
                base = mpHotStampingSides === 'Hot Stamping (2 Sides)' ? base * 1.6 : base * 1.4;
              }
            } else if (material === 'Art Paper 157gsm') {
              base = finishing === 'Soft Touch Lamination' ? 798 + ((qty - 1250) * 0.25) : 688 + ((qty - 1250) * 0.2);
              if (mpCategory === 'Hot Stamping') {
                base = mpHotStampingSides === 'Hot Stamping (2 Sides)' ? base * 1.6 : base * 1.4;
              }
            } else {
              base = config.basePrice;
              if (qty > 1250) base = base + ((qty - 1250) * 0.15);
              if (mpCategory === 'Hot Stamping') {
                base = mpHotStampingSides === 'Hot Stamping (2 Sides)' ? base * 1.6 : base * 1.4;
              }
            }
          }
        }
        finalPrice = base;
      } else if (activeCategory === 'billbook') {
        const pData: any = pricingData;
        let base = 0;
        
        // Key format: "NCR 2ply_50" or "Normal 1 Layer_100"
        let materialPrefix = 'NCR';
        if (bbMaterial.includes('Normal')) materialPrefix = 'Normal';
        
        let layerSuffix = bbLayers + 'ply';
        if (materialPrefix === 'Normal') {
           layerSuffix = bbLayers + ' Layer';
        }

        const key = `${materialPrefix} ${layerSuffix}_${bbSets}_${printColor}`;

        if (pData.billbook?.[key]?.[String(qty)]) {
          base = pData.billbook[key][String(qty)];
        } else {
          // Fallback if not found in Excel
          base = config.basePrice * qty;
        }

        // Add-ons are free as requested by user!
        if (designOption === 'Let us design for you') {
          base += 30;
        }
        finalPrice = base;
      } else {
        let base = config.basePrice;
        if (qty > 50) base = (base / 50) * qty * 0.8;
        if (finishing && !finishing.includes('No Finishing') && !finishing.includes('Varnish')) {
          base += (qty * 0.15);
        }
        finalPrice = base;
      }

      return finalPrice;
    };

    const getRoundedPrice = (price: number, category: string) => {
      if (category === 'label-sticker') return Math.ceil(price / 5) * 5;
      if (category === 'billbook') return Math.ceil(price);
      if (category === 'business') return Math.round(price);
      return price;
    };

    // Calculate price
    const currentPrice = computeRawPriceFor(quantity);
    const roundedPrice = getRoundedPrice(currentPrice, activeCategory);

    // Calculate upsell
    let upsellInfoData = null;
    const nextIndex = availableQuantities.indexOf(quantity) + 1;
    if (nextIndex < availableQuantities.length) {
      const nextQty = availableQuantities[nextIndex];
      const nextPrice = computeRawPriceFor(nextQty);
      const roundedNextPrice = getRoundedPrice(nextPrice, activeCategory);
      
      const currentUnit = roundedPrice / quantity;
      const nextUnit = roundedNextPrice / nextQty;
      const savingsPercent = Math.max(0, Math.round((1 - nextUnit / currentUnit) * 100));
      const priceDiff = roundedNextPrice - roundedPrice;

      upsellInfoData = {
        nextQty,
        priceDiff,
        savingsPercent
      };
    }

    return {
      price: roundedPrice,
      labelYield: computedLabelYield,
      labelSheets: computedLabelSheets,
      labelTier: computedLabelTier,
      upsellInfo: upsellInfoData,
      sizeError: error
    };
  }, [
    quantity, finishing, config, activeCategory, customWidth, customHeight,
    material, selectedType, size, bizCustomHeight, bizCustomWidth,
    printColor, flyerFolding, flyerHotStamping, flyerHolePunching,
    mpCategory, mpModel, mpPacking, mpHotStampingSides,
    availableQuantities, stickerLamination, packageType, designOption
  ]);

  const { price, labelYield, labelSheets, labelTier, upsellInfo, sizeError } = calcData;


  const buildOrderMessage = () => {
    const productType = config.types ? selectedType : config.label;

    let finalSize = size;
    if (activeCategory === 'inkjet' && config.isCustomSize) {
      finalSize = `${customWidth}ft x ${customHeight}ft`;
    } else if (activeCategory === 'label-sticker' && config.isCustomSize) {
      finalSize = `${customWidth}mm x ${customHeight}mm`;
    } else if (activeCategory === 'business' && size === 'Custom Size') {
      finalSize = `${bizCustomHeight}mm (H) x ${bizCustomWidth}mm (W)`;
    }

    const packageInfo = packageType ? `Package: ${packageType}\n` : '';

    let finishingInfo = finishing;
    if (activeCategory === 'marketing') {
      const parts = [];
      if (flyerFolding !== 'Not Required') parts.push(`Folding: ${flyerFolding}`);
      if (flyerHotStamping !== 'Not Required') parts.push(`Hot Stamping: ${flyerHotStamping}`);
      if (flyerHolePunching !== 'Not Required') parts.push(`Hole Punching: ${flyerHolePunching}`);
      finishingInfo = parts.length > 0 ? parts.join(', ') : 'None';
    } else if (activeCategory === 'label-sticker') {
      finishingInfo = stickerLamination !== 'None' ? `${finishing}, ${stickerLamination}` : finishing;
    }

    let extraDetails = '';
    if (activeCategory === 'moneypacket') {
      extraDetails = `
Category: ${mpCategory}${mpCategory === 'Hot Stamping' ? ` (${mpHotStampingSides})` : ''}
Model: ${mpModel}
Packing: ${mpPacking}`;
    }



    let fileInfo = '';
    if (designOption === 'Send us your print ready design') {
      fileInfo = `\n*[Note: I will attach/send my design files in this WhatsApp chat]*`;
    }

    const finalPrice = price;

    const message = `Hi, I would like to place an order:

Product: ${productType}
Size: ${finalSize}
Material: ${material}
Orientation: ${orientation}
Finishing: ${finishingInfo}
Design: ${designOption}${fileInfo}
Quantity: ${quantity}
${packageInfo}${extraDetails}
Est. Price: RM ${finalPrice.toFixed(2)}
Print Color: ${printColor}

Please assist with this order.`;

    return message;
  };

  const triggerDirectCheckout = () => {
    const message = buildOrderMessage();
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/601156389800?text=${encodedMessage}`, '_blank');
  };

  const handleCheckout = () => {
    triggerDirectCheckout();
  };

  const getShipmentText = () => {
    if (activeCategory === 'business') {
      if (finishing.includes('Spot UV')) {
        return '4-5 Working Days (Order < 4pm)';
      }
      return '3-4 Working Days (Order < 4pm)';
    }
    if (activeCategory === 'moneypacket') {
      return '5-7 Working Days';
    }
    return '2-3 Working Days (Order < 1pm)';
  };

  const getColorClass = (type: string) => {
    if (type === 'border') return 'border-[#c1ff72]';
    if (type === 'bg') return 'bg-[#c1ff72]';
    if (type === 'text') return 'text-neutral-900';
    return '';
  };

  const getFlyerSummary = () => {
    if (activeCategory === 'marketing') {
      const parts = [];
      if (flyerFolding !== 'Not Required') parts.push(`Folding: Yes`);
      if (flyerHotStamping !== 'Not Required') parts.push(`Hot Stamp: ${flyerHotStamping}`);
      if (flyerHolePunching !== 'Not Required') parts.push(`Hole Punch: ${flyerHolePunching}`);
      return parts.length > 0 ? parts.join(', ') : 'None';
    }
    if (activeCategory === 'label-sticker') {
      return stickerLamination !== 'None' ? `${finishing} + ${stickerLamination.replace(' Lamination', '')}` : finishing;
    }
    return finishing;
  };

  const summaryItems = useMemo(() => {
    const currentSize = config.isCustomSize
      ? `${customWidth}${activeCategory === 'label-sticker' ? 'mm' : 'ft'} x ${customHeight}${activeCategory === 'label-sticker' ? 'mm' : 'ft'}`
      : (activeCategory === 'business' && size === 'Custom Size' ? `${bizCustomHeight}mm (H) x ${bizCustomWidth}mm (W)` : size);

    return [
      { label: 'Product', value: config.label },
      ...(config.types ? [{ label: 'Type', value: selectedType }] : []),
      { label: 'Size', value: currentSize },
      { label: 'Material', value: material },
      { label: 'Quantity', value: String(quantity) },
      { label: 'Finishing', value: getFlyerSummary() },
      ...(designOption === 'Let us design for you' ? [{ label: 'Design', value: designOption }] : []),
    ];
  }, [activeCategory, bizCustomHeight, bizCustomWidth, config, customHeight, customWidth, designOption, finishing, flyerFolding, flyerHolePunching, flyerHotStamping, material, quantity, selectedType, size, stickerLamination]);

  const mobileSteps = ['Product', 'Finishing', 'Quantity', 'Review'];

  const renderMobileReview = () => (
    <div className="rounded-2xl border border-stone-200 dark:border-neutral-800 bg-stone-50/80 dark:bg-neutral-950/40 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 shrink-0 rounded-xl bg-[#c1ff72] text-neutral-900 flex items-center justify-center">
          <ClipboardCheck className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-stone-900 dark:text-stone-100 font-body">Review your order</h3>
          <p className="mt-1 text-xs leading-relaxed text-stone-500 dark:text-neutral-400 font-body">Check the specifications before sending your request to WhatsApp.</p>
        </div>
      </div>
      <dl className="mt-4 divide-y divide-stone-200 dark:divide-neutral-800 rounded-xl border border-stone-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 px-3">
        {summaryItems.map((item) => (
          <div key={item.label} className="flex items-start justify-between gap-4 py-2.5 text-xs">
            <dt className="text-stone-500 dark:text-neutral-400">{item.label}</dt>
            <dd className="max-w-[62%] text-right font-medium text-stone-800 dark:text-neutral-200">{item.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-neutral-400">Estimated total</div>
          <div className="mt-1 text-2xl font-bold text-stone-900 dark:text-stone-100 font-body">{formatPrice(price)}</div>
        </div>
        <div className="text-right text-xs text-stone-500 dark:text-neutral-400">
          <div className="font-semibold text-stone-700 dark:text-neutral-200">{shipmentDateData.dateString}</div>
          <div className="mt-0.5">{shipmentDateData.displayDays} working days</div>
        </div>
      </div>
      <button
        type="button"
        onClick={handleCheckout}
        disabled={!!sizeError}
        className={`mt-4 w-full rounded-xl px-4 py-3.5 text-sm font-bold transition-all ${sizeError ? 'cursor-not-allowed bg-stone-200 text-stone-400 dark:bg-neutral-800 dark:text-neutral-500' : 'bg-neutral-900 text-[#c1ff72] active:scale-[0.98] dark:bg-[#c1ff72] dark:text-neutral-900'}`}
      >
        <MessageCircle className="mr-2 inline-block h-4 w-4" />
        Send artwork &amp; order on WhatsApp
      </button>
    </div>
  );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-44 lg:pb-12 scroll-mt-24" id="order">
      {/* Horizontal Category Switcher */}
      <div className="mb-4 border-b border-stone-200 dark:border-neutral-800 pb-4">
        <label htmlFor="mobile-product-category" className="mb-1.5 block text-xs font-medium text-stone-500 dark:text-neutral-400 md:hidden">Product</label>
        <select
          id="mobile-product-category"
          value={activeCategory}
          onChange={(event) => navigate(`/${event.target.value}`)}
          className="min-h-[44px] w-full rounded-lg border border-stone-200 bg-white px-3 text-sm font-medium text-stone-800 dark:border-neutral-700 dark:bg-neutral-850 dark:text-neutral-200 md:hidden"
        >
          {activeCategory === 'billbook' && <option value="billbook">Bill Book</option>}
          {CATEGORIES.map((cat) => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
        </select>
        <div className="hidden md:flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 -mx-4 px-4 sm:mx-0 sm:px-0" aria-label="Product categories">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => navigate(`/${cat.id}`)}
                className={`min-h-[44px] px-5 py-2.5 rounded-full text-xs sm:text-sm font-body font-medium transition-all duration-300 whitespace-nowrap border touch-manipulation ${
                  isActive
                    ? 'bg-neutral-900 dark:bg-neutral-100 text-[#c1ff72] dark:text-neutral-900 shadow-lg shadow-stone-900/10'
                    : 'bg-white/80 dark:bg-neutral-900/80 border-stone-200 dark:border-neutral-800 text-stone-500 dark:text-neutral-400 hover:text-stone-800 dark:hover:text-neutral-200 hover:border-stone-300 dark:hover:border-neutral-700'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

        {/* LEFT COLUMN - CONFIGURATION */}
        <div className="mobile-compact-config lg:col-span-8 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-stone-200 dark:border-neutral-800 rounded-xl p-4 sm:p-6 shadow-2xl dark:shadow-none">
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-stone-900 dark:text-stone-100 font-body">Build your order</h2>
            <p className="mt-1 text-sm leading-relaxed text-stone-500 dark:text-neutral-400 font-body">Choose your print details below. Your price updates as you go.</p>
          </div>

          <div>
            {/* Mobile progressive flow. Desktop keeps all sections visible as before. */}
            <div className="mb-6 lg:hidden">
              <div className="flex items-center justify-between gap-2" aria-label="Order progress">
                {mobileSteps.map((step, index) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => setMobileStep(index)}
                    className="group flex min-w-0 flex-1 flex-col items-center gap-1.5"
                    aria-current={mobileStep === index ? 'step' : undefined}
                  >
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition-colors ${mobileStep === index ? 'border-neutral-900 bg-neutral-900 text-[#c1ff72] dark:border-[#c1ff72] dark:bg-[#c1ff72] dark:text-neutral-900' : mobileStep > index ? 'border-[#c1ff72] bg-[#c1ff72]/20 text-stone-700 dark:text-neutral-200' : 'border-stone-300 text-stone-400 dark:border-neutral-700 dark:text-neutral-500'}`}>{index + 1}</span>
                    <span className={`truncate text-[10px] font-medium ${mobileStep === index ? 'text-stone-900 dark:text-stone-100' : 'text-stone-400 dark:text-neutral-500'}`}>{step}</span>
                  </button>
                ))}
              </div>
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-stone-200 dark:bg-neutral-800">
                <div className="h-full rounded-full bg-[#c1ff72] transition-all duration-200" style={{ width: `${((mobileStep + 1) / mobileSteps.length) * 100}%` }} />
              </div>
            </div>

            {/* ESSENTIAL PRINT DETAILS */}
            <div className={`space-y-4 ${mobileStep === 0 ? 'block' : 'hidden lg:block'}`} id="config-step-product">
              {activeCategory === 'billbook' ? (
                <>
                  <div className="space-y-4 mb-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-center">
                      <label className="text-stone-500 dark:text-neutral-400 font-medium font-body pt-1 sm:pt-0">Size</label>
                      <div className="sm:col-span-2">
                        <select value={size} onChange={(e) => setSize(e.target.value)} className="w-full bg-white dark:bg-neutral-850 border border-stone-200 dark:border-neutral-700 text-stone-800 dark:text-neutral-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors font-body text-sm sm:text-base">
                          {config.sizes.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-center">
                      <label className="text-stone-500 dark:text-neutral-400 font-medium font-body">Binding Location</label>
                      <div className="sm:col-span-2 flex flex-wrap items-center gap-4 sm:gap-6">
                        {['Book', 'Pad'].map(b => (
                          <label key={b} className="flex items-center gap-2 sm:gap-3 cursor-pointer group relative">
                            <input type="radio" name="bbBinding" className="sr-only peer" checked={bbBinding === b} onChange={() => setBbBinding(b)} />
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#c1ff72] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white dark:peer-focus-visible:ring-offset-neutral-900 ${bbBinding === b ? `${getColorClass('border')} ${getColorClass('bg')}` : 'border-stone-300 dark:border-neutral-700 group-hover:border-stone-400 dark:group-hover:border-neutral-500'}`}>
                              {bbBinding === b && <div className="w-1.5 h-1.5 bg-neutral-900 dark:bg-neutral-900 rounded-full"></div>}
                            </div>
                            <span className="text-stone-800 dark:text-neutral-200 font-body text-sm sm:text-base">{b}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-center">
                      <label className="text-stone-500 dark:text-neutral-400 font-medium font-body">Orientation</label>
                      <div className="sm:col-span-2 flex flex-wrap items-center gap-4 sm:gap-6">
                        {['Portrait', 'Landscape'].map(o => (
                          <label key={o} className="flex items-center gap-2 sm:gap-3 cursor-pointer group relative">
                            <input type="radio" name="orientation" className="sr-only peer" checked={orientation === o} onChange={() => setOrientation(o)} />
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#c1ff72] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white dark:peer-focus-visible:ring-offset-neutral-900 ${orientation === o ? `${getColorClass('border')} ${getColorClass('bg')}` : 'border-stone-300 dark:border-neutral-700 group-hover:border-stone-400 dark:group-hover:border-neutral-500'}`}>
                              {orientation === o && <div className="w-1.5 h-1.5 bg-neutral-900 dark:bg-neutral-900 rounded-full"></div>}
                            </div>
                            <span className="text-stone-800 dark:text-neutral-200 font-body text-sm sm:text-base">{o}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-center">
                      <label className="text-stone-500 dark:text-neutral-400 font-medium font-body">Binding Edge</label>
                      <div className="sm:col-span-2 flex flex-wrap items-center gap-4 sm:gap-6">
                        {['Left Binding', 'Top Binding'].map(be => (
                          <label key={be} className="flex items-center gap-2 sm:gap-3 cursor-pointer group relative">
                            <input type="radio" name="bbBindingEdge" className="sr-only peer" checked={bbBindingEdge === be} onChange={() => setBbBindingEdge(be)} />
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#c1ff72] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white dark:peer-focus-visible:ring-offset-neutral-900 ${bbBindingEdge === be ? `${getColorClass('border')} ${getColorClass('bg')}` : 'border-stone-300 dark:border-neutral-700 group-hover:border-stone-400 dark:group-hover:border-neutral-500'}`}>
                              {bbBindingEdge === be && <div className="w-1.5 h-1.5 bg-neutral-900 dark:bg-neutral-900 rounded-full"></div>}
                            </div>
                            <span className="text-stone-800 dark:text-neutral-200 font-body text-sm sm:text-base">{be}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-center">
                    <label className="text-stone-500 dark:text-neutral-400 font-medium font-body">Hole Punching</label>
                    <div className="sm:col-span-2 flex flex-wrap items-center gap-4 sm:gap-6">
                      {['No Hole Punching', 'Yes — Hole Punching (Diameter 6mm)'].map(hp => (
                        <label key={hp} className="flex items-center gap-2 sm:gap-3 cursor-pointer group relative">
                          <input type="radio" name="bbHolePunching" className="sr-only peer" checked={bbHolePunching === hp} onChange={() => setBbHolePunching(hp)} />
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#c1ff72] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white dark:peer-focus-visible:ring-offset-neutral-900 ${bbHolePunching === hp ? `${getColorClass('border')} ${getColorClass('bg')}` : 'border-stone-300 dark:border-neutral-700 group-hover:border-stone-400 dark:group-hover:border-neutral-500'}`}>
                            {bbHolePunching === hp && <div className="w-1.5 h-1.5 bg-neutral-900 dark:bg-neutral-900 rounded-full"></div>}
                          </div>
                          <span className="text-stone-800 dark:text-neutral-200 font-body text-sm sm:text-base">{hp}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
              {/* Money Packet Specific: Category */}
            {activeCategory === 'moneypacket' && (
              <div role="group" aria-labelledby="mp-category-label" className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-center">
                <span id="mp-category-label" className="text-stone-500 dark:text-neutral-400 font-medium font-body text-sm sm:text-base">Category</span>
                <div className="sm:col-span-2">
                  <div className="flex flex-wrap gap-3 sm:gap-4">
                    {['Standard', 'Hot Stamping', 'Pouch'].map(cat => (
                      <label key={cat} className="flex items-center gap-2 sm:gap-3 cursor-pointer group relative">
                        <input
                          type="radio"
                          name="mpCategory"
                          className="sr-only peer"
                          checked={mpCategory === cat}
                          onChange={() => setMpCategory(cat)}
                        />
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#c1ff72] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white dark:peer-focus-visible:ring-offset-neutral-900 ${mpCategory === cat ? `${getColorClass('border')} ${getColorClass('bg')}` : 'border-stone-300 dark:border-neutral-700 group-hover:border-stone-400 dark:group-hover:border-neutral-500'}`}>
                          {mpCategory === cat && <div className="w-1.5 h-1.5 bg-neutral-900 dark:bg-neutral-900 rounded-full"></div>}
                        </div>
                        <span className="text-stone-800 dark:text-neutral-200 font-body text-sm sm:text-base">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Type or Category Type Selection */}
            <div role="group" aria-labelledby="product-type-label" className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-start sm:items-center">
              <span id="product-type-label" className="text-stone-500 dark:text-neutral-400 font-medium font-body pt-1 sm:pt-0 text-sm sm:text-base">Type</span>
              <div className="sm:col-span-2">
                {config.types ? (
                  <div className={`flex ${activeCategory === 'moneypacket' ? 'flex-col space-y-3' : 'flex-wrap gap-3 sm:gap-4'}`}>
                    {config.types.map(t => (
                      <label key={t} className="flex items-center gap-2 sm:gap-3 cursor-pointer group relative">
                        <input
                          type="radio"
                          name="productType"
                          className="sr-only peer"
                          checked={selectedType === t}
                          onChange={() => setSelectedType(t)}
                        />
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#c1ff72] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white dark:peer-focus-visible:ring-offset-neutral-900 ${selectedType === t ? `${getColorClass('border')} ${getColorClass('bg')}` : 'border-stone-300 dark:border-neutral-700 group-hover:border-stone-400 dark:group-hover:border-neutral-500'}`}>
                          {selectedType === t && <div className="w-1.5 h-1.5 bg-neutral-900 dark:bg-neutral-900 rounded-full"></div>}
                        </div>
                        <span className="text-stone-800 dark:text-neutral-200 font-body text-sm sm:text-base">{t}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border ${getColorClass('border')} ${getColorClass('bg')} flex items-center justify-center`}>
                      <div className="w-1.5 h-1.5 bg-neutral-900 dark:bg-neutral-900 rounded-full"></div>
                    </div>
                    <span className="text-stone-800 dark:text-neutral-200 font-body capitalize text-sm sm:text-base">{config.label}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Money Packet Specific: Model */}
            {activeCategory === 'moneypacket' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                <label className="text-stone-500 dark:text-neutral-400 font-medium font-body pt-2 sm:pt-4">Model</label>
                <div className="sm:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {[
                    { id: 'Money Packet Portrait', label: 'Money Packet Portrait' },
                    { id: 'Money Packet Landscape', label: 'Money Packet Landscape (Coming Soon)' },
                    { id: 'Money Packet Portrait Large', label: 'Money Packet Portrait Large' }
                  ].map((item) => {
                    const isDisabled = item.id === 'Money Packet Landscape';
                    return (
                      <div
                        key={item.id}
                        role="button"
                        tabIndex={isDisabled ? -1 : 0}
                        onClick={() => !isDisabled && setMpModel(item.id)}
                        onKeyDown={(e) => !isDisabled && handleKeyDown(e, () => setMpModel(item.id))}
                        className={`rounded-lg border-2 p-3 sm:p-4 flex flex-col items-center justify-center gap-2 transition-all focus-visible:ring-2 focus-visible:ring-[#c1ff72] focus-visible:border-transparent outline-none ${isDisabled
                          ? 'opacity-50 cursor-not-allowed border-stone-200 dark:border-neutral-800 bg-stone-100 dark:bg-neutral-900'
                          : mpModel === item.id
                            ? 'border-[#c1ff72] bg-[#c1ff72]/10 dark:bg-[#c1ff72]/5 cursor-pointer'
                            : 'border-stone-200 dark:border-neutral-800 hover:border-stone-300 dark:hover:border-neutral-700 bg-stone-50/80 dark:bg-neutral-900/60 cursor-pointer'
                          }`}
                      >
                        {/* Placeholder visuals for models */}
                        {item.id === 'Money Packet Portrait' && <div className="w-10 h-14 sm:w-12 sm:h-16 border border-stone-400 dark:border-neutral-700 rounded-sm bg-stone-100 dark:bg-neutral-800"></div>}
                        {item.id === 'Money Packet Landscape' && <div className="w-14 h-8 sm:w-16 sm:h-10 border border-stone-400 dark:border-neutral-700 rounded-sm bg-stone-100 dark:bg-neutral-800 mt-2 mb-2 sm:mt-3 sm:mb-3"></div>}
                        {item.id === 'Money Packet Portrait Large' && <div className="w-10 h-14 sm:w-12 sm:h-16 border border-stone-400 dark:border-neutral-700 rounded-sm bg-stone-100 dark:bg-neutral-800 relative"><div className="absolute top-0 w-full h-4 border-b border-stone-300 dark:border-neutral-700"></div></div>}
                        <span className={`text-[10px] leading-tight text-center font-medium font-body ${mpModel === item.id ? 'text-neutral-900 dark:text-[#c1ff72] font-semibold' : 'text-stone-500 dark:text-neutral-450'}`}>{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}            {/* Category / Size Mode (Specific for Inkjet/Custom/Labels) */}
            {config.isCustomSize && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-center">
                <label className="text-stone-500 dark:text-neutral-400 font-medium font-body">Category</label>
                <div className="sm:col-span-2 flex items-center gap-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className={`w-4 h-4 rounded-full border ${getColorClass('border')} ${getColorClass('bg')} flex items-center justify-center`}>
                      <div className="w-1.5 h-1.5 bg-neutral-900 dark:bg-neutral-900 rounded-full"></div>
                    </div>
                    <span className="text-stone-800 dark:text-neutral-200 font-body text-sm sm:text-base">Custom Size</span>
                  </label>
                </div>
              </div>
            )}

            {/* Size Input */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-start sm:items-center">
              <label className="text-stone-500 dark:text-neutral-400 font-medium flex items-center gap-2 font-body pt-1 sm:pt-0">
                Size
              </label>
              <div className="sm:col-span-2">
                {config.isCustomSize ? (
                  // Custom Size (Labels: mm, Inkjet: ft)
                  <div className="space-y-3">
                    {/* Dimension Preset Chips */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(activeCategory === 'label-sticker'
                        ? []
                        : selectedType === 'Epson Sticker'
                          ? [
                              { label: 'Door Poster (2x6ft)', w: '2', h: '6' },
                              { label: 'Square Decal (3x3ft)', w: '3', h: '3' },
                              { label: 'Vehicle Strip (4x1.5ft)', w: '4', h: '1.5' }
                            ]
                          : [
                              { label: 'Bunting Stand (2x6ft)', w: '2', h: '6' },
                              { label: 'Shop Banner (10x4ft)', w: '10', h: '4' },
                              { label: 'Event Backdrop (8x8ft)', w: '8', h: '8' }
                            ]
                      ).map(preset => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            setCustomWidth(preset.w);
                            setCustomHeight(preset.h);
                          }}
                          className={`text-[10px] px-2.5 py-1 rounded-md border font-body transition-colors ${
                            customWidth === preset.w && customHeight === preset.h
                              ? 'bg-[#c1ff72] text-neutral-900 border-transparent'
                              : 'border-stone-200 dark:border-neutral-800 hover:border-stone-300 dark:hover:border-neutral-750 bg-white/80 dark:bg-neutral-900/80 text-stone-505 dark:text-neutral-400 hover:text-stone-700 dark:hover:text-neutral-200'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="block text-xs text-stone-400 dark:text-neutral-500 mb-1 font-body text-center">Width ({activeCategory === 'label-sticker' ? 'mm' : 'ft'})</label>
                        <input
                          type="number"
                          value={customWidth}
                          onChange={(e) => setCustomWidth(e.target.value)}
                          className={`w-full bg-stone-100 dark:bg-neutral-850 border ${sizeError ? 'border-red-500/50 text-red-600 dark:text-red-400' : 'border-stone-200 dark:border-neutral-750 text-stone-800 dark:text-neutral-200'} rounded-lg px-4 py-2.5 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors font-body text-center`}
                        />
                      </div>
                      <span className="text-stone-400 dark:text-neutral-500 mt-4"><X className="w-4 h-4" /></span>
                      <div className="flex-1">
                        <label className="block text-xs text-stone-400 dark:text-neutral-550 mb-1 font-body text-center">Height ({activeCategory === 'label-sticker' ? 'mm' : 'ft'})</label>
                        <input
                          type="number"
                          value={customHeight}
                          onChange={(e) => setCustomHeight(e.target.value)}
                          className={`w-full bg-stone-100 dark:bg-neutral-850 border ${sizeError ? 'border-red-500/50 text-red-600 dark:text-red-400' : 'border-stone-200 dark:border-neutral-750 text-stone-800 dark:text-neutral-200'} rounded-lg px-4 py-2.5 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors font-body text-center`}
                        />
                      </div>
                    </div>
                    {/* Contextual help texts for custom dimensions */}
                    {activeCategory === 'label-sticker' && (
                      <p className="text-xs text-stone-400 dark:text-neutral-500 font-body mt-1.5">
                        * Min size 10mm. Size excludes 3mm border spacing gap. Sticker sizes under 30mm incur a 15% tiny-cut surcharge.
                      </p>
                    )}
                    {activeCategory === 'inkjet' && (
                      <p className="text-xs text-stone-400 dark:text-neutral-550 font-body mt-1.5">
                        * Machine roll width limit is {selectedType === 'Epson Sticker' ? '4ft' : '10ft'}. At least one dimension must be within this limit.
                      </p>
                    )}
                  </div>
                ) : (
                  // Standard Selection
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    disabled={activeCategory === 'moneypacket'} // Fixed size for money packet
                    className={`w-full bg-stone-100 dark:bg-neutral-850 border border-stone-200 dark:border-neutral-750 text-stone-800 dark:text-neutral-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors font-body text-sm sm:text-base ${activeCategory === 'moneypacket' ? 'cursor-not-allowed opacity-80' : ''}`}
                  >
                    {config.sizes.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                )}

                {/* Business Card Custom Inputs */}
                {activeCategory === 'business' && size === 'Custom Size' && (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="block text-xs text-stone-400 dark:text-neutral-550 mb-1 font-body text-center">Height (40mm - 54mm)</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={bizCustomHeight}
                            onChange={(e) => setBizCustomHeight(e.target.value)}
                            className={`w-full bg-stone-100 dark:bg-neutral-850 border ${sizeError && sizeError.includes('Height') ? 'border-red-500/50 text-red-600 dark:text-red-400' : 'border-stone-200 dark:border-neutral-750 text-stone-800 dark:text-neutral-200'} rounded-lg px-4 py-2.5 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors font-body text-center`}
                          />
                          <span className="text-stone-400 dark:text-neutral-550 text-sm">mm</span>
                        </div>
                        {sizeError && sizeError.includes('Height') && <p className="text-red-400 dark:text-red-300 text-[10px] mt-1 text-center">{sizeError}</p>}
                      </div>

                      <span className="text-stone-400 dark:text-neutral-550 mt-4"><X className="w-4 h-4" /></span>

                      <div className="flex-1">
                        <label className="block text-xs text-stone-400 dark:text-neutral-550 mb-1 font-body text-center">Width (40mm - 89mm)</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={bizCustomWidth}
                            onChange={(e) => setBizCustomWidth(e.target.value)}
                            className={`w-full bg-stone-100 dark:bg-neutral-850 border ${sizeError && sizeError.includes('Width') ? 'border-red-500/50 text-red-600 dark:text-red-400' : 'border-stone-200 dark:border-neutral-750 text-stone-800 dark:text-neutral-200'} rounded-lg px-4 py-2.5 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors font-body text-center`}
                          />
                          <span className="text-stone-400 dark:text-neutral-550 text-sm">mm</span>
                        </div>
                        {sizeError && sizeError.includes('Width') && <p className="text-red-400 dark:text-red-300 text-[10px] mt-1 text-center">{sizeError}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Size Error Display */}
                {sizeError && (activeCategory === 'inkjet' || activeCategory === 'label-sticker') && (
                  <div className="flex items-start gap-2 text-red-400 dark:text-red-350 text-xs bg-red-50 dark:bg-red-950/40 p-2 rounded-lg border border-red-200 dark:border-red-900/40 mt-3">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-400 dark:text-red-350" />
                    <span>{sizeError}</span>
                  </div>
                )}

              </div>
            </div>

            {/* Orientation - Only show if available in config */}
            {config.orientations && config.orientations.length > 0 && (
              <div role="group" aria-labelledby="orientation-label" className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-center">
                <span id="orientation-label" className="text-stone-500 dark:text-neutral-400 font-medium font-body text-sm sm:text-base">Orientation</span>
                <div className="sm:col-span-2 flex items-center gap-6">
                  {config.orientations.map(o => (
                    <label key={o} className="flex items-center gap-2 sm:gap-3 cursor-pointer group relative">
                      <input
                        type="radio"
                        name="orientation"
                        className="sr-only peer"
                        checked={orientation === o}
                        onChange={() => setOrientation(o)}
                      />
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#c1ff72] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white dark:peer-focus-visible:ring-offset-neutral-900 ${orientation === o ? `${getColorClass('border')} ${getColorClass('bg')}` : 'border-stone-300 dark:border-neutral-700 group-hover:border-stone-400 dark:group-hover:border-neutral-500'}`}>
                        {orientation === o && <div className="w-1.5 h-1.5 bg-neutral-900 dark:bg-neutral-900 rounded-full"></div>}
                      </div>
                      <span className="text-stone-800 dark:text-neutral-200 font-body text-sm sm:text-base">{o}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            
            </>
            )}
            </div>

            {/* PRINT FINISHES AND ARTWORK */}
            <div className={`mt-8 space-y-4 border-t border-stone-200 pt-6 dark:border-neutral-800 ${mobileStep === 1 ? 'block' : 'hidden lg:block'}`} id="config-step-finishing">
              {activeCategory === 'billbook' ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-center">
                    <label className="text-stone-500 dark:text-neutral-400 font-medium font-body pt-1 sm:pt-0">Paper Material</label>
                    <div className="sm:col-span-2 flex flex-wrap gap-4">
                      {['NCR (Carbonize Paper)', 'Normal Paper'].map(m => (
                        <label key={m} className="flex items-center gap-2 cursor-pointer group relative">
                          <input type="radio" name="bbMaterial" className="sr-only peer" checked={bbMaterial === m} onChange={() => setBbMaterial(m)} />
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#c1ff72] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white dark:peer-focus-visible:ring-offset-neutral-900 ${bbMaterial === m ? `${getColorClass('border')} ${getColorClass('bg')}` : 'border-stone-300 dark:border-neutral-700 group-hover:border-stone-400 dark:group-hover:border-neutral-500'}`}>
                            {bbMaterial === m && <div className="w-1.5 h-1.5 bg-neutral-900 dark:bg-neutral-900 rounded-full"></div>}
                          </div>
                          <span className="text-stone-800 dark:text-neutral-200 font-body text-sm sm:text-base">{m}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-center">
                    <label className="text-stone-500 dark:text-neutral-400 font-medium font-body pt-1 sm:pt-0">Layers</label>
                    <div className="sm:col-span-2">
                      <select value={bbLayers} onChange={(e) => setBbLayers(e.target.value)} className="w-full bg-white dark:bg-neutral-850 border border-stone-200 dark:border-neutral-700 text-stone-800 dark:text-neutral-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors font-body text-sm sm:text-base">
                        {(bbMaterial === 'Normal Paper' ? ['1', '2', '3', '4', '5', '6'] : ['2', '3', '4', '5', '6']).map(l => (
                          <option key={l} value={l}>{l} Layer{l !== '1' ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-start">
                    <label className="text-stone-500 dark:text-neutral-400 font-medium font-body flex items-center gap-2 pt-2">Layer Colors (50gsm)</label>
                    <div className="sm:col-span-2">
                      <div className="flex gap-4 p-4 bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/30 rounded-xl">
                        
                        {/* Left: Visual Stack */}
                        <div className="w-24 sm:w-32 flex flex-col border border-stone-200 dark:border-neutral-700 bg-white rounded shadow-sm overflow-hidden">
                          {Array.from({ length: parseInt(bbLayers) }).map((_, i) => {
                            const colorName = bbLayerColors[i] || (bbMaterial === 'Normal Paper' ? 'Simili 50gsm' : 'NCR White 50gsm');
                            let hex = '#ffffff';
                            if (colorName.includes('Pink')) hex = '#fbcfe8';
                            else if (colorName.includes('Yellow')) hex = '#fef08a';
                            else if (colorName.includes('Blue')) hex = '#bfdbfe';
                            else if (colorName.includes('Green')) hex = '#bbf7d0';
                            else if (colorName.includes('Newsprint')) hex = '#f5f5f4'; // Slightly off-white for newsprint
                            
                            return (
                              <div key={i} className={`flex-1 flex flex-col items-center justify-center border-b last:border-b-0 border-black/5 min-h-[44px]`} style={{ backgroundColor: hex }}>
                                {i === 0 && <span className="text-2xl font-black text-stone-800 leading-none mb-1">A</span>}
                                <span className="text-[10px] text-stone-600 font-medium bg-white/50 px-1.5 py-0.5 rounded">Layer {i + 1}</span>
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* Right: Dropdowns */}
                        <div className="flex-1 space-y-3 flex flex-col justify-center">
                          {Array.from({ length: parseInt(bbLayers) }).map((_, i) => {
                            const colors = bbMaterial === 'Normal Paper' 
                              ? ['Simili 50gsm', 'Bond Blue 50gsm', 'Bond Green 50gsm', 'Bond Pink 50gsm', 'Bond Yellow 50gsm', 'Newsprint 50gsm']
                              : ['NCR White 50gsm', 'NCR Pink 50gsm', 'NCR Yellow 50gsm', 'NCR Blue 50gsm', 'NCR Green 50gsm'];
                              
                            const currentValue = bbLayerColors[i] || colors[0];
                            // Ensure the current value is valid for the current material, otherwise fallback to default
                            const displayValue = colors.includes(currentValue) ? currentValue : colors[0];
                            
                            return (
                              <select 
                                key={i}
                                value={displayValue}
                                onChange={(e) => {
                                  const newColors = [...bbLayerColors];
                                  newColors[i] = e.target.value;
                                  setBbLayerColors(newColors);
                                }}
                                className="w-full bg-white dark:bg-neutral-850 border border-stone-200 dark:border-neutral-700 text-stone-800 dark:text-neutral-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors font-body text-sm shadow-sm"
                              >
                                {colors.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-center">
                    <label className="text-stone-500 dark:text-neutral-400 font-medium font-body flex items-center gap-2">
                      Last Layer Perforation
                    </label>
                    <div className="sm:col-span-2 flex flex-wrap items-center gap-4 sm:gap-6">
                      {['No', 'Yes'].map(p => {
                        return (
                          <label key={p} className={`flex items-center gap-2 sm:gap-3 cursor-pointer group relative`}>
                            <input type="radio" name="bbPerforation" className="sr-only peer" checked={bbPerforation === p} onChange={() => setBbPerforation(p)} />
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#c1ff72] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white dark:peer-focus-visible:ring-offset-neutral-900 ${bbPerforation === p ? `${getColorClass('border')} ${getColorClass('bg')}` : 'border-stone-300 dark:border-neutral-700 group-hover:border-stone-400 dark:group-hover:border-neutral-500'}`}>
                              {bbPerforation === p && <div className="w-1.5 h-1.5 bg-neutral-900 dark:bg-neutral-900 rounded-full"></div>}
                            </div>
                            <span className="text-stone-800 dark:text-neutral-200 font-body text-sm sm:text-base">{p}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-start relative">
                    <label className="text-stone-500 dark:text-neutral-400 font-medium font-body pt-2">Print Colour</label>
                    <div className="sm:col-span-2">
                      <div className="flex flex-wrap items-center gap-4">
                        <select
                          value={printColor}
                          onChange={(e) => setPrintColor(e.target.value)}
                          className="bg-stone-100 dark:bg-neutral-850 border border-stone-200 dark:border-neutral-750 text-stone-800 dark:text-neutral-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-neutral-900 transition-colors font-body text-sm sm:text-base min-w-[160px]"
                        >
                          {config.printColors.map((c) => (
                            <option key={c} value={c}>{c === '1C' ? '1 Colour (Front)' : c === '2C' ? '2 Colours (Front)' : '4 Colours (Front)'}</option>
                          ))}
                        </select>
                        {printColor !== '4C' && (
                          <button
                          type="button"
                          onClick={() => setShowColorPicker(!showColorPicker)}
                          className="flex items-center gap-2 bg-stone-100 dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 px-3 py-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-neutral-700 transition-colors"
                        >
                          <div className={`w-4 h-4 rounded-sm border border-stone-300 shadow-sm`} style={{ backgroundColor: getExHexColor(bbPrintColorHex) }}></div>
                          <span className="text-xs font-medium text-stone-700 dark:text-neutral-300">{bbPrintColorHex}</span>
                        </button>
                        )}
                      </div>
                      
                      {showColorPicker && printColor !== '4C' && (
                        <div className="absolute top-full left-0 mt-2 z-50 w-full sm:w-[400px] sm:left-1/3 bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-700 shadow-xl rounded-xl p-4">
                          <p className="text-center text-sm font-medium text-stone-700 dark:text-neutral-300 mb-4 pb-2 border-b border-stone-100 dark:border-neutral-800">Please Select Colour</p>
                          <div className="grid grid-cols-4 gap-4">
                            {[
                              'BLK 01', 'BLU 01', 'BLU 02',
                              'BLU 03', 'BLU 04', 'BRW 01', 'CYN 01',
                              'GRN 04', 'GRN 05', 'MAG 01', 'MAR 01',
                              'ORG 01', 'RED 01', 'RED 03', 'VIO 01'
                            ].map(c => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => { setBbPrintColorHex(c); setShowColorPicker(false); }}
                                className="flex flex-col items-center gap-1 group"
                              >
                                <div 
                                  className={`w-12 h-10 rounded-lg border shadow-sm transition-transform group-hover:scale-105 border-black/5 ${bbPrintColorHex === c ? 'ring-2 ring-[#c1ff72] ring-offset-2 dark:ring-offset-neutral-900' : ''}`}
                                  style={{ backgroundColor: getExHexColor(c) }}
                                ></div>
                                <span className="text-[10px] text-stone-600 dark:text-neutral-400 text-center">{c}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
              {/* Material / Paper */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-center">
              <label className="text-stone-500 dark:text-neutral-400 font-medium flex items-center gap-2 font-body group relative">
                {activeCategory === 'moneypacket' ? 'Paper' : 'Material'}
                <span className="cursor-help w-4 h-4 rounded-full border border-stone-300 dark:border-neutral-750 flex items-center justify-center text-[10px] text-stone-400 dark:text-neutral-500 hover:text-stone-700 dark:hover:text-neutral-300 transition-colors">i</span>
                <span className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 bg-stone-800 border border-stone-700 rounded-lg p-3 text-[11px] text-stone-300 font-normal leading-normal shadow-2xl z-50 pointer-events-none">
                  <strong className="text-stone-100 block mb-1">Material Guide:</strong>
                  • <strong>Simili (80/100gsm)</strong>: Uncoated, writeable paper (like copier paper).
                  <br />
                  • <strong>Art Paper (100/128/150gsm)</strong>: Smooth coated paper with a slight sheen, ideal for flyers.
                  <br />
                  • <strong>Art Card (250/310/360gsm)</strong>: Thick, rigid coated stock, standard for premium business cards.
                  <br />
                  • <strong>Tarpaulin</strong>: Heavy-duty PVC banner material.
                  <br />
                  • <strong>PP Sticker</strong>: Waterproof synthetic plastic sticker.
                </span>
              </label>
              <div className="sm:col-span-2">
                <select
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-850 border border-stone-200 dark:border-neutral-700 text-stone-800 dark:text-neutral-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors font-body text-sm sm:text-base"
                >
                  {activeCategory === 'moneypacket' && <option value="" disabled>- Please Select -</option>}
                  {availableMaterials.map(m => (
                    <option key={m} value={m} className={m.includes('Out of Stock') ? 'text-red-400' : ''}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Print Spec / Printing */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-center">
              <label className="text-stone-500 dark:text-neutral-400 font-medium font-body">{activeCategory === 'inkjet' ? 'Printing' : 'Print Colour'}</label>
              {activeCategory === 'inkjet' ? (
                <div className="sm:col-span-2">
                  <div className="w-full bg-stone-100 dark:bg-neutral-850 border border-stone-200 dark:border-neutral-700 text-stone-500 dark:text-neutral-400 rounded-lg px-4 py-2.5 cursor-not-allowed font-body text-sm sm:text-base">
                    {printMethodDisplay}
                  </div>
                </div>
              ) : activeCategory === 'moneypacket' ? (
                <div className="sm:col-span-2">
                  <div className="w-full bg-stone-100 dark:bg-neutral-850 border border-stone-200 dark:border-neutral-700 text-stone-500 dark:text-neutral-400 rounded-lg px-4 py-2.5 cursor-not-allowed font-body text-sm sm:text-base">
                    {printColor}
                  </div>
                </div>
              ) : (
                <div className="sm:col-span-2 flex flex-wrap items-center gap-3 sm:gap-4 lg:gap-6">
                  {config.printColors.map(pc => (
                    <label key={pc} className="flex items-center gap-2 sm:gap-3 cursor-pointer group relative">
                      <input
                        type="radio"
                        name="printColor"
                        className="sr-only peer"
                        checked={printColor === pc}
                        onChange={() => setPrintColor(pc)}
                      />
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#c1ff72] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white dark:peer-focus-visible:ring-offset-neutral-900 ${printColor === pc ? `${getColorClass('border')} ${getColorClass('bg')}` : 'border-stone-300 dark:border-neutral-700 group-hover:border-stone-400 dark:group-hover:border-neutral-500'}`}>
                        {printColor === pc && <div className="w-1.5 h-1.5 bg-neutral-900 dark:bg-neutral-900 rounded-full"></div>}
                      </div>
                      <span className="text-stone-800 dark:text-neutral-200 font-body text-sm sm:text-base">{pc}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Packing Method (Money Packet Specific) */}
            {activeCategory === 'moneypacket' && (
              <div role="group" aria-labelledby="packing-method-label" className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-start">
                <span id="packing-method-label" className="text-stone-500 dark:text-neutral-400 font-medium font-body pt-2 text-sm sm:text-base">Packing Method</span>
                <div className="sm:col-span-2 flex flex-col space-y-3">
                  {['5pcs / Pack', '10pcs / Pack'].map(pm => (
                    <label key={pm} className="flex items-center gap-2 sm:gap-3 cursor-pointer group relative">
                      <input
                        type="radio"
                        name="packingMethod"
                        className="sr-only peer"
                        checked={mpPacking === pm}
                        onChange={() => setMpPacking(pm)}
                      />
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#c1ff72] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white dark:peer-focus-visible:ring-offset-neutral-900 ${mpPacking === pm ? `${getColorClass('border')} ${getColorClass('bg')}` : 'border-stone-300 dark:border-neutral-700 group-hover:border-stone-400 dark:group-hover:border-neutral-500'}`}>
                        {mpPacking === pm && <div className="w-1.5 h-1.5 bg-neutral-900 dark:bg-neutral-900 rounded-full"></div>}
                      </div>
                      <span className="text-stone-800 dark:text-neutral-200 font-body text-sm sm:text-base">{pm}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* FINISHING SECTION: CONDITIONAL */}
            {activeCategory === 'marketing' ? (
              <div className="space-y-4 mt-6 pt-5 border-t border-stone-200 dark:border-neutral-800">
                <div className="bg-stone-100 dark:bg-neutral-850 border border-stone-200 dark:border-neutral-800 text-stone-600 dark:text-neutral-400 px-4 py-2 rounded font-medium font-body uppercase text-sm tracking-wider">
                  Optional Finishing
                </div>

                {/* Lamination */}
                {(() => {
                  const isRestricted = material.includes('Simili') || material.includes('Art Paper 100gsm') || material.includes('Art Paper 128gsm');
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-center">
                      <label className="text-stone-500 dark:text-neutral-400 font-medium font-body flex items-center gap-2 group relative">
                        Lamination
                        <span className="cursor-help w-4 h-4 rounded-full border border-stone-300 dark:border-neutral-750 flex items-center justify-center text-[10px] text-stone-400 dark:text-neutral-500 hover:text-stone-700 dark:hover:text-neutral-300 transition-colors">i</span>
                        <span className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 bg-stone-800 border border-stone-700 rounded-lg p-3 text-[11px] text-stone-300 font-normal leading-normal shadow-2xl z-50 pointer-events-none">
                          <strong className="text-stone-100 block mb-1">Lamination Types:</strong>
                          • <strong>Matte</strong>: Smooth, glare-free satiny finish. Prevents reflections.
                          <br />
                          • <strong>Gloss</strong>: High-shine, highly reflective. Makes colors pop.
                        </span>
                      </label>
                      <div className="sm:col-span-2">
                        <select
                          value={finishing}
                          onChange={(e) => setFinishing(e.target.value)}
                          disabled={isRestricted}
                          className={`w-full bg-stone-100 dark:bg-neutral-850 border border-stone-200 dark:border-neutral-750 text-stone-800 dark:text-neutral-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors font-body text-sm sm:text-base ${isRestricted ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <option value="Not Required">- Not Required -</option>
                          {!isRestricted && (
                            <>
                              <option value="Matte Lamination (Both)">Matte Lamination (Both)</option>
                              <option value="Gloss Lamination (Both)">Gloss Lamination (Both)</option>
                            </>
                          )}
                        </select>
                        {isRestricted && (
                          <div className="text-xs text-amber-600/80 dark:text-amber-500/80 mt-1 font-body space-y-1">
                            <p>⚠️ Lamination is disabled for {material.includes('Simili') ? 'this writing paper.' : 'this thin paper.'}</p>
                            <p className="text-[10px] text-stone-400 dark:text-neutral-500">Writing paper (Simili) requires an uncoated surface. Lightweight paper (100gsm/128gsm) will warp under lamination heat.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Folding Type */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-center">
                  <label className="text-stone-500 dark:text-neutral-400 font-medium font-body flex items-center gap-2 group relative">
                    Folding Type
                    <span className="cursor-help w-4 h-4 rounded-full border border-stone-300 dark:border-neutral-750 flex items-center justify-center text-[10px] text-stone-400 dark:text-neutral-500 hover:text-stone-700 dark:hover:text-neutral-300 transition-colors">i</span>
                    <span className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 bg-stone-800 border border-stone-700 rounded-lg p-3 text-[11px] text-stone-300 font-normal leading-normal shadow-2xl z-50 pointer-events-none">
                      <strong className="text-stone-100 block mb-1">Folding Options:</strong>
                      • <strong>Required</strong>: Includes machine scoring and folding based on dimensions.
                      <br />
                      • <strong>Not Required</strong>: Shipped as flat sheets.
                    </span>
                  </label>
                  <div className="sm:col-span-2 flex flex-wrap items-center gap-4 sm:gap-6">
                    {['Not Required', 'Required'].map(opt => (
                      <label key={opt} className="flex items-center gap-2 sm:gap-3 cursor-pointer group relative">
                        <input
                          type="radio"
                          name="foldingType"
                          className="sr-only peer"
                          checked={flyerFolding === opt}
                          onChange={() => setFlyerFolding(opt)}
                        />
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#c1ff72] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white dark:peer-focus-visible:ring-offset-neutral-900 ${flyerFolding === opt ? `${getColorClass('border')} ${getColorClass('bg')}` : 'border-stone-300 dark:border-neutral-700 group-hover:border-stone-400 dark:group-hover:border-neutral-500'}`}>
                          {flyerFolding === opt && <div className="w-1.5 h-1.5 bg-neutral-900 dark:bg-neutral-900 rounded-full"></div>}
                        </div>
                        <span className="text-stone-800 dark:text-neutral-200 font-body text-sm sm:text-base">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Hot Stamping Colour */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-center">
                  <label className="text-stone-500 dark:text-neutral-400 font-medium font-body flex items-center gap-2">
                    Hot Stamping Colour
                  </label>
                  <div className="sm:col-span-2">
                    <select
                      value={flyerHotStamping}
                      onChange={(e) => setFlyerHotStamping(e.target.value)}
                      className="w-full bg-stone-100 dark:bg-neutral-850 border border-stone-200 dark:border-neutral-750 text-stone-800 dark:text-neutral-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors font-body text-sm sm:text-base"
                    >
                      <option value="Not Required">- Not Required -</option>
                      <option value="1C (Front)">1C (Front)</option>
                      <option value="1C (Back)">1C (Back)</option>
                      <option value="2C (Front)">2C (Front)</option>
                      <option value="2C (Back)">2C (Back)</option>
                    </select>
                  </div>
                </div>
                {/* Hole Punching */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-center">
                  <label className="text-stone-500 dark:text-neutral-400 font-medium font-body">Hole Punching</label>
                  <div className="sm:col-span-2 flex flex-wrap items-center gap-4 sm:gap-6">
                    {['Not Required', 'Hole Punching (3mm)', 'Hole Punching (6mm)'].map(opt => (
                      <label key={opt} className="flex items-center gap-2 sm:gap-3 cursor-pointer group relative">
                        <input
                          type="radio"
                          name="holePunching"
                          className="sr-only peer"
                          checked={flyerHolePunching === opt}
                          onChange={() => setFlyerHolePunching(opt)}
                        />
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#c1ff72] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white dark:peer-focus-visible:ring-offset-neutral-900 ${flyerHolePunching === opt ? `${getColorClass('border')} ${getColorClass('bg')}` : 'border-stone-300 dark:border-neutral-700 group-hover:border-stone-400 dark:group-hover:border-neutral-500'}`}>
                          {flyerHolePunching === opt && <div className="w-1.5 h-1.5 bg-neutral-900 dark:bg-neutral-900 rounded-full"></div>}
                        </div>
                        <span className="text-stone-800 dark:text-neutral-200 font-body text-sm sm:text-base">{opt.replace('Hole Punching', 'Punch')}</span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              /* Standard Finishing Dropdown (for Business, Labels, etc) */
              (activeCategory !== 'moneypacket' || material === 'Art Paper 157gsm') && (
                <div className="flex flex-col gap-4">
                  {activeCategory === 'business' ? (
                    <>
                      {/* Lamination Selector */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-center">
                        <label className="text-stone-500 dark:text-neutral-400 font-medium flex items-center gap-2 font-body group relative">
                          Lamination
                          <span className="cursor-help w-4 h-4 rounded-full border border-stone-300 dark:border-neutral-750 flex items-center justify-center text-[10px] text-stone-400 dark:text-neutral-500 hover:text-stone-700 dark:hover:text-neutral-300 transition-colors">i</span>
                          <span className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 bg-stone-800 border border-stone-700 rounded-lg p-3 text-[11px] text-stone-300 font-normal leading-normal shadow-2xl z-50 pointer-events-none">
                            <strong className="text-stone-100 block mb-1">Lamination:</strong>
                            Adds a protective matte or gloss layer to the card surface.
                          </span>
                        </label>
                        <div className="sm:col-span-2">
                          {(() => {
                            const isSpotUVAllowedMaterial = material === 'Gloss Art Card 250gsm (2 sides coated)' || material === 'Gloss Art Card 310gsm (2 sides coated)';
                            const isLaminationAllowedMaterial = isSpotUVAllowedMaterial || material === 'Gloss Art Card 360gsm (2 sides coated)';
                            
                            let lamOptions = ['No Lamination'];
                            if (isLaminationAllowedMaterial) {
                              if (quantity < 300) {
                                lamOptions = ['No Lamination', 'Matte Lamination', 'Gloss Lamination'];
                              } else {
                                lamOptions = ['No Lamination', 'Gloss Waterbase Varnish', 'Matte Lamination (Both)', 'Gloss Lamination (Both)'];
                              }
                            }

                            // Determine current selected lamination value based on finishing state
                            let currentLam = 'No Lamination';
                            if (finishing === 'Matte Lamination') currentLam = 'Matte Lamination';
                            else if (finishing === 'Gloss Lamination') currentLam = 'Gloss Lamination';
                            else if (finishing === 'Gloss Waterbase Varnish') currentLam = 'Gloss Waterbase Varnish';
                            else if (finishing === 'Matte Lamination (Both)' || finishing.startsWith('Matte Lamination (Both) + Spot UV')) currentLam = 'Matte Lamination (Both)';
                            else if (finishing === 'Gloss Lamination (Both)') currentLam = 'Gloss Lamination (Both)';

                            return (
                              <select
                                value={currentLam}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === 'No Lamination') {
                                    setFinishing('No Finishing');
                                  } else if (val === 'Matte Lamination (Both)') {
                                    // Check if Spot UV is allowed to keep it, otherwise just Matte Lamination (Both)
                                    const isSpotUVAllowedQty = quantity === 300 || quantity === 500 || (quantity >= 1000 && quantity <= 10000);
                                    if (isSpotUVAllowedMaterial && isSpotUVAllowedQty && finishing.includes('Spot UV (Front)')) {
                                      setFinishing('Matte Lamination (Both) + Spot UV (Front)');
                                    } else if (isSpotUVAllowedMaterial && isSpotUVAllowedQty && finishing.includes('Spot UV (Both)')) {
                                      setFinishing('Matte Lamination (Both) + Spot UV (Both)');
                                    } else {
                                      setFinishing('Matte Lamination (Both)');
                                    }
                                  } else {
                                    setFinishing(val);
                                  }
                                }}
                                disabled={!isLaminationAllowedMaterial}
                                className={`w-full bg-stone-100 dark:bg-neutral-850 border border-stone-200 dark:border-neutral-750 text-stone-800 dark:text-neutral-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors font-body text-sm sm:text-base ${!isLaminationAllowedMaterial ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                {lamOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Spot UV Selector */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-center">
                        <label className="text-stone-500 dark:text-neutral-400 font-medium flex items-center gap-2 font-body group relative">
                          Spot UV
                          <span className="cursor-help w-4 h-4 rounded-full border border-stone-300 dark:border-neutral-750 flex items-center justify-center text-[10px] text-stone-400 dark:text-neutral-500 hover:text-stone-700 dark:hover:text-neutral-300 transition-colors">i</span>
                          <span className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 bg-stone-800 border border-stone-700 rounded-lg p-3 text-[11px] text-stone-300 font-normal leading-normal shadow-2xl z-50 pointer-events-none">
                            <strong className="text-stone-100 block mb-1">Spot UV:</strong>
                            A shiny, raised varnish layer on selected areas (logo, text) to create contrast.
                          </span>
                        </label>
                        <div className="sm:col-span-2">
                          {(() => {
                            const isSpotUVAllowedMaterial = material === 'Gloss Art Card 250gsm (2 sides coated)' || material === 'Gloss Art Card 310gsm (2 sides coated)';
                            const isSpotUVAllowedQty = quantity === 300 || quantity === 500 || (quantity >= 1000 && quantity <= 10000);
                            
                            // Determine current selected lamination value based on finishing state
                            let currentLam = 'No Lamination';
                            if (finishing === 'Matte Lamination') currentLam = 'Matte Lamination';
                            else if (finishing === 'Gloss Lamination') currentLam = 'Gloss Lamination';
                            else if (finishing === 'Gloss Waterbase Varnish') currentLam = 'Gloss Waterbase Varnish';
                            else if (finishing === 'Matte Lamination (Both)' || finishing.startsWith('Matte Lamination (Both) + Spot UV')) currentLam = 'Matte Lamination (Both)';
                            else if (finishing === 'Gloss Lamination (Both)') currentLam = 'Gloss Lamination (Both)';

                            const isSpotUVEnabled = isSpotUVAllowedMaterial && isSpotUVAllowedQty && currentLam === 'Matte Lamination (Both)';

                            let uvOptions = ['No Spot UV'];
                            if (isSpotUVEnabled) {
                              uvOptions = ['No Spot UV', 'Spot UV (Front)', 'Spot UV (Both)'];
                            }

                            let currentUV = 'No Spot UV';
                            if (finishing.includes('Spot UV (Front)')) currentUV = 'Spot UV (Front)';
                            else if (finishing.includes('Spot UV (Both)')) currentUV = 'Spot UV (Both)';

                            return (
                              <>
                                <select
                                  value={currentUV}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === 'Spot UV (Front)') {
                                      setFinishing('Matte Lamination (Both) + Spot UV (Front)');
                                    } else if (val === 'Spot UV (Both)') {
                                      setFinishing('Matte Lamination (Both) + Spot UV (Both)');
                                    } else {
                                      setFinishing('Matte Lamination (Both)');
                                    }
                                  }}
                                  disabled={!isSpotUVEnabled}
                                  className={`w-full bg-stone-100 dark:bg-neutral-850 border border-stone-200 dark:border-neutral-750 text-stone-800 dark:text-neutral-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors font-body text-sm sm:text-base ${!isSpotUVEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  {uvOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                                <p className="text-xs text-stone-500 dark:text-neutral-450 italic mt-1.5 font-body">
                                  Available with Matte Lamination (Both Sides) only. Gloss Art Card 250gsm & 310gsm only. Qty: 300, 500, 1,000 – 10,000.
                                </p>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-center">
                      <label className="text-stone-500 dark:text-neutral-400 font-medium flex items-center gap-2 font-body group relative">
                        Finishing
                        <span className="cursor-help w-4 h-4 rounded-full border border-stone-300 dark:border-neutral-750 flex items-center justify-center text-[10px] text-stone-400 dark:text-neutral-500 hover:text-stone-700 dark:hover:text-neutral-300 transition-colors">i</span>
                        <span className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 bg-stone-800 border border-stone-700 rounded-lg p-3 text-[11px] text-stone-300 font-normal leading-normal shadow-2xl z-50 pointer-events-none">
                          <strong className="text-stone-100 block mb-1">Finishing Options:</strong>
                          • <strong>Lamination</strong>: Adds a protective matte or gloss layer.
                          <br />
                          • <strong>Spot UV</strong>: Shiny, raised varnish layer on selected areas (logo, details).
                          <br />
                          • <strong>Die Cut</strong>: Cutting the material into custom contours or shapes.
                        </span>
                      </label>
                      <div className="sm:col-span-2">
                        <select
                          value={finishing}
                          onChange={(e) => setFinishing(e.target.value)}
                          className="w-full bg-stone-100 dark:bg-neutral-850 border border-stone-200 dark:border-neutral-750 text-stone-800 dark:text-neutral-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors font-body text-sm sm:text-base"
                        >
                          {activeCategory === 'moneypacket' && <option value="" disabled>- Please Select -</option>}
                          {availableFinishings.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Sticker Lamination Selector */}
                  {activeCategory === 'label-sticker' && material.includes('MirrorKote') && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-center">
                      <label className="text-stone-500 dark:text-neutral-400 font-medium flex items-center gap-2 font-body">
                        Lamination
                      </label>
                      <div className="sm:col-span-2">
                        <select
                          value={stickerLamination}
                          onChange={(e) => setStickerLamination(e.target.value)}
                          className="w-full bg-stone-100 dark:bg-neutral-850 border border-stone-200 dark:border-neutral-750 text-stone-800 dark:text-neutral-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors font-body text-sm sm:text-base"
                        >
                          <option value="None">No Lamination</option>
                          <option value="Gloss Lamination">Gloss Lamination (+RM 0.80/sheet)</option>
                          <option value="Matte Lamination">Matte Lamination (+RM 0.80/sheet)</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )
            )}
            </>
          )}

            {/* Money Packet Specific: Hot Stamping Sides */}
            {activeCategory === 'moneypacket' && mpCategory === 'Hot Stamping' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-center">
                <label className="text-stone-500 dark:text-neutral-400 font-medium font-body">Finishing</label>
                <div className="sm:col-span-2">
                  <div className="flex flex-wrap gap-3 sm:gap-4">
                    {['Hot Stamping (1 Side)', 'Hot Stamping (2 Sides)'].map(opt => (
                      <label key={opt} className="flex items-center gap-2 sm:gap-3 cursor-pointer group relative">
                        <input
                          type="radio"
                          name="mpHotStampingSides"
                          className="sr-only peer"
                          checked={mpHotStampingSides === opt}
                          onChange={() => setMpHotStampingSides(opt)}
                        />
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#c1ff72] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white dark:peer-focus-visible:ring-offset-neutral-900 ${mpHotStampingSides === opt ? `${getColorClass('border')} ${getColorClass('bg')}` : 'border-stone-300 dark:border-neutral-700 group-hover:border-stone-400 dark:group-hover:border-neutral-500'}`}>
                          {mpHotStampingSides === opt && <div className="w-1.5 h-1.5 bg-neutral-900 dark:bg-neutral-900 rounded-full"></div>}
                        </div>
                        <span className="text-stone-800 dark:text-neutral-200 font-body text-sm sm:text-base">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Design Option */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-center">
              <label className="text-stone-500 dark:text-neutral-400 font-medium flex items-center gap-2 font-body">
                Design
              </label>
              <div className="sm:col-span-2">
                {activeCategory === 'moneypacket' ? (
                  // Single button option for Money Packet
                  <label className="flex items-center gap-2 sm:gap-3 cursor-pointer group">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${getColorClass('border')} ${getColorClass('bg')}`}>
                      <div className="w-1.5 h-1.5 bg-neutral-900 dark:bg-neutral-900 rounded-full"></div>
                    </div>
                    <span className="text-stone-800 dark:text-neutral-200 font-body text-sm sm:text-base">Chat with us for ready designed template</span>
                  </label>
                ) : (
                  // Standard options
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                      {[
                        'Send us your print ready design',
                        'Let us design for you'
                      ].map((option) => (
                        <label key={option} className="flex items-center gap-2 sm:gap-3 cursor-pointer group relative">
                          <input
                            type="radio"
                            name="designOption"
                            className="sr-only peer"
                            checked={designOption === option}
                            onChange={() => setDesignOption(option)}
                          />
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#c1ff72] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white dark:peer-focus-visible:ring-offset-neutral-900 ${designOption === option ? `${getColorClass('border')} ${getColorClass('bg')}` : 'border-stone-300 dark:border-neutral-700 group-hover:border-stone-400 dark:group-hover:border-neutral-500'}`}>
                            {designOption === option && <div className="w-1.5 h-1.5 bg-neutral-900 dark:bg-neutral-900 rounded-full"></div>}
                          </div>
                          <span className="text-stone-800 dark:text-neutral-200 font-body text-sm sm:text-base">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* QUANTITY AND OPTIONAL DETAILS */}
          <div className={`mt-8 space-y-4 border-t border-stone-200 pt-6 dark:border-neutral-800 ${mobileStep === 2 ? 'block' : 'hidden lg:block'}`} id="config-step-quantity">
            {/* Quantity */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-start">
              <label className="text-stone-500 dark:text-neutral-400 font-medium font-body pt-2.5">
                {activeCategory === 'billbook' ? `Quantity (${bbBinding}s)` : 'Quantity (pcs)'}
              </label>
              <div className="sm:col-span-2">
                <div className={`flex ${activeCategory === 'billbook' ? 'items-center gap-4' : ''}`}>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className={`bg-stone-100 dark:bg-neutral-850 border border-stone-200 dark:border-neutral-750 text-stone-800 dark:text-neutral-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors font-body text-sm sm:text-base ${activeCategory === 'billbook' ? 'w-1/2' : 'w-full'}`}
                  >
                    {activeCategory === 'moneypacket' && <option value="" disabled>- Please Select -</option>}
                    {availableQuantities.map((q) => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                  
                  {activeCategory === 'billbook' && (
                    <>
                      <span className="text-stone-500 font-body text-sm">X</span>
                      {bbMaterial === 'Normal Paper' ? (
                        <div className="relative w-1/2">
                          <select
                            value={bbSets}
                            onChange={(e) => setBbSets(e.target.value)}
                            className="w-full bg-stone-100 dark:bg-neutral-850 border border-stone-200 dark:border-neutral-750 text-stone-800 dark:text-neutral-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors font-body text-sm sm:text-base"
                          >
                            <option value="50">50 Sets</option>
                            <option value="100" disabled={parseInt(bbLayers) > 2}>100 Sets</option>
                          </select>
                          <span className="absolute top-full left-0 mt-1 text-[10px] text-stone-400 dark:text-neutral-500 leading-tight whitespace-nowrap">100 sets: 1-2 layers only.</span>
                        </div>
                      ) : (
                        <span className="text-stone-800 dark:text-neutral-200 font-body text-sm sm:text-base">50 Sets</span>
                      )}
                    </>
                  )}
                </div>
                {/* UP-SELLING HINT */}
                {upsellInfo && (
                  <div className="mt-3 flex flex-col gap-1 text-xs bg-stone-50 dark:bg-neutral-950/40 text-stone-600 dark:text-neutral-400 border border-stone-200 dark:border-neutral-800 rounded-xl px-4 py-3 font-body w-full">
                    <div className="flex items-center gap-1.5 font-semibold text-stone-700 dark:text-neutral-300">
                      <span className="animate-pulse">✨</span> 
                      Recommended Value Upgrade
                    </div>
                    <p className="text-stone-700 dark:text-neutral-300 mt-1">
                      Upgrade to <strong className="text-stone-700 dark:text-neutral-300">{upsellInfo.nextQty} pcs</strong> for just <strong className="text-stone-700 dark:text-neutral-300">+RM {upsellInfo.priceDiff.toFixed(2)}</strong> more!
                    </p>
                    <p className="text-stone-500 dark:text-neutral-500 text-[10px] mt-0.5">
                      Saves <strong className="text-stone-600 dark:text-neutral-400 font-semibold">{upsellInfo.savingsPercent}%</strong> per piece compared to your current selection.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Billbook Numbering Selection (Moved here) */}
            {activeCategory === 'billbook' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-start">
                <label className="text-stone-500 dark:text-neutral-400 font-medium font-body pt-2">Numbering</label>
                <div className="sm:col-span-2">
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-4">
                    {['No Numbering', 'Yes — Add Numbering'].map(num => (
                      <label key={num} className="flex items-center gap-2 sm:gap-3 cursor-pointer group relative">
                        <input type="radio" name="bbNumbering" className="sr-only peer" checked={bbNumbering === num} onChange={() => setBbNumbering(num)} />
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#c1ff72] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white dark:peer-focus-visible:ring-offset-neutral-900 ${bbNumbering === num ? `${getColorClass('border')} ${getColorClass('bg')}` : 'border-stone-300 dark:border-neutral-700 group-hover:border-stone-400 dark:group-hover:border-neutral-500'}`}>
                          {bbNumbering === num && <div className="w-1.5 h-1.5 bg-neutral-900 dark:bg-neutral-900 rounded-full"></div>}
                        </div>
                        <span className="text-stone-800 dark:text-neutral-200 font-body text-sm sm:text-base">{num}</span>
                      </label>
                    ))}
                  </div>
                  {bbNumbering === 'Yes — Add Numbering' && (
                    <div className="bg-stone-50 dark:bg-neutral-900/50 p-4 rounded-xl border border-stone-200 dark:border-neutral-800">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="block text-xs text-stone-500 dark:text-neutral-400 mb-1">Number From</label>
                          <input type="text" placeholder="e.g. 0001" value={bbNumberFrom} onChange={(e) => setBbNumberFrom(e.target.value)} className={`w-full bg-white dark:bg-neutral-850 border ${bbNumberError ? 'border-red-400' : 'border-stone-200 dark:border-neutral-700'} rounded-lg px-3 py-2 text-stone-800 dark:text-neutral-200 font-mono focus:outline-none focus:border-neutral-900 transition-colors`} />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs text-stone-500 dark:text-neutral-400 mb-1">Number To (Auto)</label>
                          <div className="w-full bg-stone-100 dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-stone-500 dark:text-neutral-500 font-mono cursor-not-allowed">
                            {bbNumberFrom && !bbNumberError ? 
                              String(parseInt(bbNumberFrom, 10) + (quantity * parseInt(bbSets, 10)) - 1).padStart(bbNumberFrom.length, '0') 
                              : '-'}
                          </div>
                        </div>
                      </div>
                      {bbNumberError && <p className="text-red-500 text-xs mt-2 font-medium">{bbNumberError}</p>}
                      <p className="text-stone-400 dark:text-neutral-500 text-[10px] mt-2 leading-tight">4-7 digit sequential numbering in red. Last digit must be 1 (e.g. 0001, 00101).</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Package (If applicable) */}
            {config.packages && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-center">
                <label className="text-stone-500 dark:text-neutral-400 font-medium flex items-center gap-2 font-body">
                  Package
                </label>
                <div className="sm:col-span-2">
                  <select
                    value={packageType}
                    onChange={(e) => setPackageType(e.target.value)}
                    className="w-full bg-stone-100 dark:bg-neutral-850 border border-stone-200 dark:border-neutral-750 text-stone-800 dark:text-neutral-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors font-body text-sm sm:text-base"
                  >
                    {config.packages.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
            )}

          </div>

          {mobileStep === 3 && (
            <div className="mt-8 lg:hidden" id="config-step-review">
              {renderMobileReview()}
            </div>
          )}

          <div className="mt-6 flex items-center justify-between gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileStep((step) => Math.max(0, step - 1))}
              disabled={mobileStep === 0}
              className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-stone-200 px-4 text-sm font-semibold text-stone-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-300"
            >
              <ChevronUp className="h-4 w-4 rotate-[-90deg]" />
              Back
            </button>
            {mobileStep < mobileSteps.length - 1 ? (
              <button
                type="button"
                onClick={() => setMobileStep((step) => Math.min(mobileSteps.length - 1, step + 1))}
                className="inline-flex min-h-11 items-center gap-1 rounded-xl bg-neutral-900 px-5 text-sm font-bold text-[#c1ff72] active:scale-[0.98] dark:bg-[#c1ff72] dark:text-neutral-900"
              >
                Continue
                <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsMobileReviewOpen(true)}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-neutral-900 px-5 text-sm font-bold text-[#c1ff72] active:scale-[0.98] dark:bg-[#c1ff72] dark:text-neutral-900"
              >
                <Eye className="h-4 w-4" />
                Review order
              </button>
            )}
          </div>
        </div>
        </div>

        {/* RIGHT COLUMN - SUMMARY */}
        <div className="hidden lg:block lg:col-span-4 space-y-6">
          <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-stone-200 dark:border-neutral-800 rounded-xl p-6 shadow-2xl sticky top-28 self-start">

            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 uppercase font-body">PRODUCT : {config.label.toUpperCase()}</h3>
              <div className={`w-2 h-2 ${getColorClass('bg')} rounded-full animate-pulse shadow-[0_0_8px_rgba(193,255,114,0.5)]`}></div>
            </div>

            {/* PREVIEW BOX */}
            <div className="bg-white/50 dark:bg-neutral-900/50 rounded-lg border border-stone-200 dark:border-neutral-800 p-8 flex flex-col items-center justify-center mb-6 relative overflow-hidden group">
              <div className="absolute top-2 right-2">
                <button className={`text-xs ${getColorClass('text')} border border-stone-200 dark:border-neutral-800 bg-stone-100 dark:bg-neutral-800 px-2 py-1 rounded flex items-center gap-1 hover:bg-stone-100 dark:hover:bg-neutral-700 transition-colors font-body`}>
                  <FileText className="w-3 h-3" /> PREVIEW
                </button>
              </div>

              {(() => {
                if (activeCategory === 'billbook') {
                  return (
                    <div className="w-full h-full flex items-center justify-center -mt-6">
                      <BillBookDiagram 
                        sizeLabel={size}
                        orientation={orientation}
                        bindingEdge={bbBindingEdge}
                        bindingType={bbBinding}
                        holePunch={bbHolePunching}
                      />
                    </div>
                  );
                }

                const hasLinenTexture = material.includes('Linen');
                const hasHotStamping = finishing.includes('Spot UV') || finishing.includes('Hot Stamping') || mpCategory === 'Hot Stamping' || flyerHotStamping !== 'Not Required';
                const hasFoldLines = selectedType === 'Folded Business Card' || flyerFolding === 'Required';
                const isDieCut = selectedType === 'Custom Die-cut Business Card' || finishing === 'Die Cut';

                return (
                  <>
                    <div className="overflow-visible flex items-center justify-center h-52 w-full">
                      <div
                        className={`bg-stone-100 dark:bg-neutral-800 shadow-lg transition-all duration-300 relative overflow-hidden ${
                          isDieCut 
                            ? 'border-dashed border-2 border-neutral-900/60 dark:border-neutral-100/60 rounded-xl' 
                            : 'border border-stone-200 dark:border-neutral-750 rounded-sm'
                        } ${orientation && orientation.includes('Landscape') ? 'w-48 h-28' : (orientation && orientation.includes('Portrait') ? 'w-28 h-48' : 'w-40 h-40')}`}
                      >
                        {previewSide === 'back' ? (
                          // Simulated reverse side layout
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-stone-100/80 dark:bg-neutral-850/80 text-center select-none">
                            <span className="text-[10px] font-semibold tracking-widest text-stone-400/70 dark:text-neutral-500 font-body uppercase mb-1">SLP DESIGN</span>
                            <div className="w-5 h-5 border border-stone-200 dark:border-neutral-700 rounded-full flex items-center justify-center opacity-30">
                              <Box className="w-3 h-3 text-stone-400 dark:text-neutral-500" />
                            </div>
                            <span className="text-[8px] text-stone-400 dark:text-neutral-500 font-mono mt-1.5 uppercase">REVERSE SPECIFICATION</span>
                          </div>
                        ) : (
                          <>
                            {/* Simulated Content lines */}
                            <div className="absolute top-4 left-4 w-1/2 h-2 bg-stone-300/60 dark:bg-neutral-700/65 rounded-sm"></div>
                            <div className="absolute top-8 left-4 w-3/4 h-1.5 bg-stone-300/40 dark:bg-neutral-700/45 rounded-sm"></div>
                            <div className="absolute top-11 left-4 w-2/3 h-1.5 bg-stone-300/40 dark:bg-neutral-700/45 rounded-sm"></div>
                          </>
                        )}

                        {/* Dynamic Linen Texture Overlay */}
                        {hasLinenTexture && (
                          <div 
                            className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay bg-[linear-gradient(90deg,rgba(255,255,255,0)_90%,rgba(0,0,0,0.8)_100%),linear-gradient(0deg,rgba(255,255,255,0)_90%,rgba(0,0,0,0.8)_100%)] bg-[size:4px_4px]"
                            title="Linen finish simulation"
                          ></div>
                        )}

                        {/* Dynamic Hot Stamping / Foil Sheen Overlay */}
                        {hasHotStamping && (
                          <div className="absolute inset-0 bg-gradient-to-tr from-yellow-600/0 via-amber-300/40 to-yellow-600/0 opacity-80 pointer-events-none mix-blend-color-dodge animate-pulse bg-[length:200%_200%]">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-amber-400/80 rounded px-2 py-0.5 text-[8px] font-semibold text-amber-600 bg-stone-50/80 uppercase tracking-widest font-body shadow-sm">
                              ✨ FOIL
                            </div>
                          </div>
                        )}

                        {/* Dynamic Fold Line Indicator */}
                        {hasFoldLines && (
                          <div 
                            className={`absolute border-dashed border-stone-400/80 pointer-events-none ${
                              orientation && orientation.includes('Landscape') ? 'left-1/2 top-0 bottom-0 border-l' : 'top-1/2 left-0 right-0 border-t'
                            }`}
                            title="Fold line simulation"
                          ></div>
                        )}

                        {/* Dimensions Label */}
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-stone-400 dark:text-neutral-500 font-mono text-center w-full">
                          {config.isCustomSize
                            ? `${customWidth}${activeCategory === 'label-sticker' ? 'mm' : 'ft'} x ${customHeight}${activeCategory === 'label-sticker' ? 'mm' : 'ft'}`
                            : (activeCategory === 'business' && size === 'Custom Size' ? `${bizCustomHeight}mm x ${bizCustomWidth}mm` : size.split(' ')[0])}
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 text-xs text-stone-400 dark:text-neutral-550 font-mono text-center space-y-1">
                      <div>
                        {config.isCustomSize
                          ? `${customWidth}${activeCategory === 'label-sticker' ? 'mm' : 'ft'} x ${customHeight}${activeCategory === 'label-sticker' ? 'mm' : 'ft'}`
                          : (activeCategory === 'business' && size === 'Custom Size' ? `${bizCustomHeight}mm (H) x ${bizCustomWidth}mm (W)` : size)}
                      </div>
                      {activeCategory === 'label-sticker' && (parseFloat(customWidth) < 30 || parseFloat(customHeight) < 30) && (
                        <div className="text-[10px] text-amber-600/80 dark:text-amber-400/80 bg-amber-50 dark:bg-amber-950/20 px-2 py-1 rounded inline-block max-w-[220px]">
                          Note: Sizes &lt; 30mm incur a handling fee and may have +/- 1mm cutting tolerance.
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>

            {/* SUMMARY LIST */}
            <div className="space-y-3 text-sm border-b border-stone-200 dark:border-neutral-800 pb-6 mb-6">
              {activeCategory === 'moneypacket' && (
                <div className="flex justify-between">
                  <span className="text-stone-400 dark:text-neutral-550 font-body">Category</span>
                  <span className="text-stone-800 dark:text-neutral-300 font-medium font-body text-right w-1/2">
                    {mpCategory}
                    {mpCategory === 'Hot Stamping' && <span className="block text-xs text-stone-500 dark:text-neutral-450">{mpHotStampingSides}</span>}
                  </span>
                </div>
              )}
              {config.types && (
                <div className="flex justify-between">
                  <span className="text-stone-400 dark:text-neutral-550 font-body">Type</span>
                  <span className="text-stone-800 dark:text-neutral-300 font-medium font-body text-right w-1/2">{selectedType}</span>
                </div>
              )}
              {activeCategory === 'moneypacket' && (
                <div className="flex justify-between">
                  <span className="text-stone-400 dark:text-neutral-550 font-body">Model</span>
                  <span className="text-stone-800 dark:text-neutral-300 font-medium font-body text-right w-1/2">{mpModel}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-stone-400 dark:text-neutral-550 font-body">Size</span>
                <span className="text-stone-800 dark:text-neutral-300 font-medium font-body text-right w-1/2">
                  {config.isCustomSize
                    ? `${customWidth}${activeCategory === 'label-sticker' ? 'mm' : 'ft'} x ${customHeight}${activeCategory === 'label-sticker' ? 'mm' : 'ft'}`
                    : (activeCategory === 'business' && size === 'Custom Size' ? `${bizCustomHeight}mm (H) x ${bizCustomWidth}mm (W)` : size)}
                </span>
              </div>
              {config.orientations && config.orientations.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-stone-400 dark:text-neutral-550 font-body">Orientation</span>
                  <span className="text-stone-800 dark:text-neutral-300 font-medium font-body">{orientation}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-stone-400 dark:text-neutral-550 font-body">Material</span>
                <span className="text-stone-800 dark:text-neutral-300 font-medium font-body text-right w-1/2">{material}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400 dark:text-neutral-550 font-body">Quantity</span>
                <span className="text-stone-800 dark:text-neutral-300 font-medium font-body">{quantity}</span>
              </div>
              {config.packages && packageType && (
                <div className="flex justify-between">
                  <span className="text-stone-400 dark:text-neutral-550 font-body">Package</span>
                  <span className="text-stone-800 dark:text-neutral-300 font-medium font-body">{packageType}</span>
                </div>
              )}
              {designOption === 'Let us design for you' && (
                <div className="flex justify-between">
                  <span className="text-stone-400 dark:text-neutral-550 font-body">Design</span>
                  <span className="text-stone-800 dark:text-neutral-300 font-medium font-body text-right w-1/2">{designOption}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-stone-400 dark:text-neutral-550 font-body">Finishing</span>
                <span className="text-stone-800 dark:text-neutral-300 font-medium font-body text-right w-1/2">{getFlyerSummary()}</span>
              </div>

            </div>

            {/* PRICE */}
            <div className="flex flex-col items-end mb-8">
              <div className="flex items-end justify-between w-full">
                <span className="text-stone-500 dark:text-neutral-400 font-medium font-body">
                  Price
                </span>
                <span className="text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight font-body">{formatPrice(price)}</span>
              </div>
              <div className="flex flex-col items-end mt-1 text-[10px] text-stone-400 dark:text-neutral-550 font-mono">
                <span>{(price / quantity).toLocaleString('en-MY', { style: 'currency', currency: 'MYR', minimumFractionDigits: 4, maximumFractionDigits: 4 })} / pc</span>

              </div>
            </div>

            {/* DATES */}
            {(() => {
              const shipmentInfo = shipmentDateData;
              return (
                <div className="bg-stone-50/80 dark:bg-neutral-950/40 rounded-lg p-4 space-y-2 mb-6 border border-stone-200 dark:border-neutral-800">
                  <div className="flex justify-between items-start text-xs">
                    <span className="text-stone-400 dark:text-neutral-550 shrink-0 mt-0.5">Est. Shipment:</span>
                    <div className="text-right ml-4">
                      <span className="text-stone-600 dark:text-neutral-300 font-semibold font-mono block">
                        {shipmentInfo.dateString}
                      </span>
                      <span className="text-[10px] text-stone-400 dark:text-neutral-500 block mt-0.5">
                        ({shipmentInfo.displayDays} working days, order before {shipmentInfo.cutoffText})
                        {shipmentInfo.pastCutoff && <span className="text-amber-600/80 dark:text-amber-400/80 block mt-0.5">(Cutoff passed: production starts next business day)</span>}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ACTION */}
            <button
              onClick={handleCheckout}
              className={`w-full font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all transform font-body group ${sizeError ? 'bg-stone-100 dark:bg-neutral-800 text-stone-400 dark:text-neutral-500 cursor-not-allowed' : 'bg-neutral-900 text-[#c1ff72] dark:bg-[#c1ff72] dark:text-neutral-950 shadow-lg hover:scale-[1.02] dark:hover:bg-[#d2ff90]'}`}
              disabled={!!sizeError}
            >
              <MessageCircle className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              SEND ARTWORK & ORDER
            </button>

          </div>
        </div>

      </div>

      {/* MOBILE FIXED BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-stone-100/95 dark:bg-neutral-900/95 backdrop-blur-xl border-t border-stone-200 dark:border-neutral-800 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden">
        {/* Surface Validation Errors in Mobile Order Bar */}
        {sizeError && (
          <div role="alert" className="max-w-7xl mx-auto mb-3 px-3 py-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 text-xs rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-400 animate-pulse" />
            <span className="font-body">{sizeError}</span>
          </div>
        )}
        <div className="flex items-center gap-4 max-w-7xl mx-auto">
          <div className="flex-1 min-w-0" aria-live="polite">
            <div className="text-[10px] text-stone-500 dark:text-neutral-400 uppercase tracking-wider font-medium font-body mb-0.5">Est. Total</div>
            <div className="text-2xl font-bold text-stone-900 dark:text-stone-100 leading-none font-body">{formatPrice(price)}</div>
            <div className="text-[10px] text-stone-400 dark:text-neutral-500 mt-1 truncate font-body">
              {(() => {
                const dateInfo = shipmentDateData;
                return `Ships ${dateInfo.dateString.split(',')[1] || dateInfo.dateString}`;
              })()}
            </div>
          </div>
          <button
            onClick={() => {
              setMobileStep(3);
              setIsMobileReviewOpen(true);
            }}
            disabled={!!sizeError}
            className={`flex-1 max-w-[180px] h-12 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all font-body ${sizeError ? 'bg-stone-100 dark:bg-neutral-800 text-stone-400 dark:text-neutral-500 cursor-not-allowed' : 'bg-neutral-800 text-[#c1ff72] dark:bg-[#c1ff72] dark:text-neutral-900 shadow-lg active:scale-95'}`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>REVIEW ORDER</span>
          </button>
        </div>
      </div>

      {isMobileReviewOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Review order">
          <button
            type="button"
            aria-label="Close order review"
            onClick={() => setIsMobileReviewOpen(false)}
            className="absolute inset-0 bg-neutral-950/50 backdrop-blur-sm"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-3xl border-t border-stone-200 bg-stone-100 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-stone-300 dark:bg-neutral-700" />
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-neutral-400">Final check</div>
                <h3 className="mt-1 text-lg font-bold text-stone-900 dark:text-stone-100 font-body">Ready to send?</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileReviewOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
                aria-label="Close order review"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {renderMobileReview()}
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductConfigurator;
