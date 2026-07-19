import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Book, Award, FileText, Mail, BookOpen, Calendar, MessageCircle } from 'lucide-react';
import ProductConfigurator from './ProductConfigurator';
import { PRODUCT_DATA } from '../data/productData';

const UNCONFIGURED_PRODUCTS: Record<string, { label: string; icon: any; features: string[] }> = {

  buttonbadge: {
    label: 'Button Badge',
    icon: Award,
    features: [
      'Standard sizes (58mm, 44mm)',
      'Glossy or matte lamination finishes',
      'Pin back or magnet back attachments',
      'Ideal for campaigns, events, and corporate gifting'
    ]
  },
  computerform: {
    label: 'Computer Form',
    icon: FileText,
    features: [
      'Continuous sprocket feed sheets',
      '1 Ply to 4 Ply custom forms',
      'Custom layout & company logo printing',
      'Ideal for dot-matrix printing and warehousing'
    ]
  },
  envelope: {
    label: 'Envelope',
    icon: Mail,
    features: [
      'Standard envelope dimensions (DL, C5, C4)',
      'Peel & seal strip closures',
      'Window and non-window versions available',
      'Official branding & high-grade paper stock'
    ]
  },
  booklet: {
    label: 'Booklet',
    icon: BookOpen,
    features: [
      'Saddle stitch or perfect binding options',
      'Custom cover weight with glossy text pages',
      'Perfect for annual reports, catalogs, and booklets',
      'A4 or A5 custom sizes available'
    ]
  },
  calendar: {
    label: 'Calendar',
    icon: Calendar,
    features: [
      'Desktop stand or wall hanging configurations',
      'Custom monthly layout templates',
      'Horse/Hijri/Chinese lunar calendars included',
      'Premium thick cards and sturdy wire-o loops'
    ]
  }
};

const ProductPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  
  const isConfigured = category && PRODUCT_DATA[category];
  const isUnconfigured = category && UNCONFIGURED_PRODUCTS[category];
  
  const activeCategory = isConfigured ? category : 'business';
  const productInfo = PRODUCT_DATA[activeCategory];

  useEffect(() => {
    if (isConfigured && productInfo) {
      document.title = `${productInfo.label} | SLP Design`;
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', `Configure and order premium ${productInfo.label.toLowerCase()} online at SLP Design. Fast turnaround and highest quality printing in Malaysia.`);
    } else if (isUnconfigured) {
      const info = UNCONFIGURED_PRODUCTS[category!];
      document.title = `${info.label} Printing Services | SLP Design`;
    }
  }, [category, isConfigured, isUnconfigured, productInfo]);

  if (isUnconfigured) {
    const info = UNCONFIGURED_PRODUCTS[category!];
    const Icon = info.icon;
    const whatsappMessage = encodeURIComponent(`Hi SLP Design, I have an inquiry about printing custom ${info.label}s!`);
    const whatsappUrl = `https://wa.me/601156389800?text=${whatsappMessage}`;

    return (
      <motion.div className="max-w-4xl mx-auto px-6 sm:px-8 py-16" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
        <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur border border-stone-200/60 dark:border-neutral-800/80 rounded-2xl p-8 sm:p-12 shadow-md relative overflow-hidden">
          <div className="flex flex-col items-center text-center">
            <div className="p-4 rounded-2xl bg-stone-100 dark:bg-neutral-800 text-stone-500 dark:text-neutral-400 mb-6 border border-stone-200/50 dark:border-neutral-700/50">
              <Icon size={48} strokeWidth={1.5} />
            </div>
            <span className="text-xs uppercase tracking-widest text-stone-400 dark:text-neutral-500 font-semibold font-mono">Launching Soon</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl text-stone-900 dark:text-neutral-100 font-bold tracking-tight font-display mt-3">
              Premium {info.label} Printing
            </h1>
            <p className="mt-4 text-stone-500 dark:text-neutral-400 font-montserrat max-w-xl text-base sm:text-lg">
              We are still building our online self-checkout configurator for **{info.label}**, but we print them every single day! Chat with our print experts to get an instant custom quote.
            </p>

            <div className="w-full max-w-md mt-10 bg-stone-50 dark:bg-neutral-950/40 border border-stone-200/80 dark:border-neutral-800/80 rounded-xl p-6 text-left">
              <h3 className="text-sm font-semibold text-stone-400 dark:text-neutral-500 uppercase tracking-wider font-montserrat mb-4">What we support:</h3>
              <ul className="space-y-3">
                {info.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-stone-500 dark:text-neutral-400 text-sm font-montserrat">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c1ff72] mt-2 shrink-0"></span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="mt-10 inline-flex items-center gap-3 bg-neutral-900 dark:bg-neutral-100 text-[#c1ff72] dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 font-bold px-8 py-4 rounded-xl shadow-lg hover:scale-[1.02] active:scale-98 transition-all font-montserrat text-base">
              <MessageCircle className="w-5 h-5" />
              <span>Get Custom Quote on WhatsApp</span>
            </a>
            
            <a href="/" className="mt-6 text-stone-400 dark:text-neutral-500 hover:text-stone-600 dark:hover:text-neutral-300 transition-colors text-sm font-montserrat underline underline-offset-4">
              Back to Homepage
            </a>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!isConfigured) {
    return (
      <motion.div className="max-w-md mx-auto px-6 py-24 text-center font-montserrat" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
        <h2 className="text-2xl text-stone-900 dark:text-neutral-100 font-bold mb-4">Product Not Found</h2>
        <p className="text-stone-500 dark:text-neutral-400 mb-8">The requested printing product category does not exist.</p>
        <a href="/" className="inline-block bg-neutral-900 dark:bg-neutral-100 text-[#c1ff72] dark:text-neutral-900 px-6 py-3 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors font-montserrat">
          Return to Home
        </a>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
      <ProductConfigurator activeCategory={activeCategory} />
    </motion.div>
  );
};

export default ProductPage;
