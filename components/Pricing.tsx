import React from 'react';
import { Check, Star } from 'lucide-react';
import { useInView } from './useInView';

const Pricing: React.FC = () => {
  const [headerRef, headerVisible] = useInView<HTMLDivElement>(0.2);
  const [gridRef, gridVisible] = useInView<HTMLDivElement>(0.1);

  return (
    <section className="max-w-[1600px] mx-auto px-6 lg:px-12 py-16 lg:py-24 scroll-mt-24">
      <div ref={headerRef} className={`flex items-end justify-between transition-all duration-700 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#c1ff72]/30 bg-[#c1ff72]/10 px-3 py-1 text-xs text-stone-600 dark:text-[#c1ff72] mb-4 font-mono">
            <span className="w-1 h-1 rounded-full bg-[#c1ff72]"></span>
            Packages
          </div>
          <h2 className="text-2xl sm:text-3xl text-stone-900 dark:text-stone-100 tracking-tighter font-display">Pricing</h2>
          <p className="mt-2 text-sm text-stone-500 dark:text-neutral-400 font-montserrat">Simple packages to get started, flexible for scale.</p>
        </div>
      </div>
      
      <div ref={gridRef} className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-center">
        
        {/* Starter Pack */}
        <div className={`spotlight-card bg-white/80 dark:bg-neutral-900/60 backdrop-blur border border-stone-200/60 dark:border-neutral-800 rounded-xl p-6 hover:bg-white dark:hover:bg-neutral-900 hover:border-[#c1ff72]/80 dark:hover:border-[#c1ff72]/80 hover:-translate-y-1 transition-all duration-700 group shadow-md ${gridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '0ms' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium tracking-tight text-stone-750 dark:text-stone-200 group-hover:text-stone-900 dark:group-hover:text-white transition-colors duration-300 font-display">Starter Pack</h3>
            <span className="text-xs text-stone-400 dark:text-neutral-500 font-mono">Best for Networking</span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl tracking-tighter text-stone-800 dark:text-stone-100 group-hover:text-stone-900 dark:group-hover:text-white transition-colors duration-300 font-display">RM 48</span>
            <span className="text-sm text-stone-500 dark:text-neutral-400 font-montserrat">/ package</span>
          </div>
          <ul className="mt-6 space-y-3 text-sm text-stone-500 dark:text-neutral-400">
            <li className="flex items-center gap-2 font-montserrat">
              <Check className="w-4 h-4 text-[#c1ff72]" strokeWidth={1.5} />
              100 pcs Business Cards (Gloss Art)
            </li>
            <li className="flex items-center gap-2 font-montserrat">
              <Check className="w-4 h-4 text-[#c1ff72]" strokeWidth={1.5} />
              100 pcs MirrorKote Stickers (Round)
            </li>
            <li className="flex items-center gap-2 font-montserrat">
              <Check className="w-4 h-4 text-[#c1ff72]" strokeWidth={1.5} />
              Standard 3-4 working days dispatch
            </li>
            <li className="flex items-center gap-2 font-montserrat">
              <Check className="w-4 h-4 text-[#c1ff72]" strokeWidth={1.5} />
              Free digital PDF file check
            </li>
          </ul>
          <a href="#order" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 text-[#c1ff72] hover:bg-neutral-800 transition-all px-4 py-2.5 text-sm font-medium font-montserrat">Configure Now</a>
        </div>

        {/* Growth Pack — Featured */}
        <div className={`spotlight-card relative bg-white dark:bg-neutral-900 backdrop-blur border-2 border-[#c1ff72]/60 dark:border-[#c1ff72]/40 rounded-xl p-6 md:p-8 hover:border-[#c1ff72] hover:-translate-y-2 transition-all duration-700 group shadow-xl shadow-[#c1ff72]/10 md:scale-[1.03] ${gridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '120ms' }}>
          <span className="absolute -top-3 left-4 inline-flex items-center gap-1.5 rounded-full bg-neutral-900 text-[#c1ff72] px-2.5 py-1 text-xs shadow-lg font-mono">
            <Star className="w-3.5 h-3.5" strokeWidth={1.5} />
            Most popular
          </span>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium tracking-tight text-stone-900 dark:text-stone-100 font-display">Growth Pack</h3>
            <span className="text-xs text-stone-400 dark:text-neutral-500 font-mono">Best for Retail</span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl tracking-tighter text-stone-900 dark:text-stone-100 font-display">RM 180</span>
            <span className="text-sm text-stone-500 dark:text-neutral-400 font-montserrat">/ package</span>
          </div>
          <ul className="mt-6 space-y-3 text-sm text-stone-600 dark:text-neutral-300">
            <li className="flex items-center gap-2 font-montserrat">
              <Check className="w-4 h-4 text-[#c1ff72]" strokeWidth={1.5} />
              500 pcs Matte Cards (Double Sided)
            </li>
            <li className="flex items-center gap-2 font-montserrat">
              <Check className="w-4 h-4 text-[#c1ff72]" strokeWidth={1.5} />
              500 pcs PP Waterproof Stickers
            </li>
            <li className="flex items-center gap-2 font-montserrat">
              <Check className="w-4 h-4 text-[#c1ff72]" strokeWidth={1.5} />
              300 pcs A5 Leaflets (Both Sides 4C)
            </li>
            <li className="flex items-center gap-2 font-montserrat">
              <Check className="w-4 h-4 text-[#c1ff72]" strokeWidth={1.5} />
              Free alignment & margin verification
            </li>
          </ul>
          <a href="#order" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 text-[#c1ff72] hover:bg-neutral-800 transition-all px-4 py-2.5 text-sm font-medium font-montserrat">Configure Now</a>
        </div>

        {/* Enterprise */}
        <div className={`spotlight-card bg-white/80 dark:bg-neutral-900/60 backdrop-blur border border-stone-200/60 dark:border-neutral-800 rounded-xl p-6 hover:bg-white dark:hover:bg-neutral-900 hover:border-stone-300 dark:hover:border-neutral-700 hover:-translate-y-1 transition-all duration-700 group shadow-md ${gridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '240ms' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium tracking-tight text-stone-750 dark:text-stone-200 group-hover:text-stone-900 dark:group-hover:text-white transition-colors duration-300 font-display">Enterprise Plan</h3>
            <span className="text-xs text-stone-400 dark:text-neutral-500 font-mono">Corporate T&C</span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl tracking-tighter text-stone-850 dark:text-stone-100 group-hover:text-stone-900 dark:group-hover:text-white transition-colors duration-300 font-display">Bulk Rates</span>
            <span className="text-sm text-stone-500 dark:text-neutral-400 font-montserrat">custom</span>
          </div>
          <ul className="mt-6 space-y-3 text-sm text-stone-500 dark:text-neutral-400">
            <li className="flex items-center gap-2 font-montserrat">
              <Check className="w-4 h-4 text-stone-400 dark:text-stone-500" strokeWidth={1.5} />
              Dedicated client printing portal
            </li>
            <li className="flex items-center gap-2 font-montserrat">
              <Check className="w-4 h-4 text-stone-400 dark:text-stone-500" strokeWidth={1.5} />
              Up to 25% corporate rebate rates
            </li>
            <li className="flex items-center gap-2 font-montserrat">
              <Check className="w-4 h-4 text-stone-400 dark:text-stone-500" strokeWidth={1.5} />
              Net 30 invoice credit payments
            </li>
            <li className="flex items-center gap-2 font-montserrat">
              <Check className="w-4 h-4 text-stone-400 dark:text-stone-500" strokeWidth={1.5} />
              Priority overnight shipping (Malaysia)
            </li>
          </ul>
          <a href="#contact" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 text-[#c1ff72] hover:bg-neutral-800 transition-all px-4 py-2.5 text-sm font-medium font-montserrat">Contact Corporate</a>
        </div>

      </div>
    </section>
  );
};

export default Pricing;