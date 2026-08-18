import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Tag, Printer, FileText, ArrowRight, Check } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Register plugins
gsap.registerPlugin(ScrollTrigger, useGSAP);

const Services: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Reveal header
    gsap.fromTo('.services-header',
      { y: 35, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.services-header',
          start: 'top 85%',
          toggleActions: 'play none none none',
        }
      }
    );

    // Staggered reveal for service grid cards
    gsap.fromTo('.service-card',
      { y: 60, opacity: 0, scale: 0.98 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 1.1,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.services-grid',
          start: 'top 80%',
          toggleActions: 'play none none none',
        }
      }
    );

  }, { scope: containerRef });

  return (
    <section ref={containerRef} id="products" className="bg-white dark:bg-neutral-950 w-full py-16 lg:py-24 relative z-20 border-t border-stone-200/50 dark:border-neutral-800/60 scroll-mt-24">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="services-header">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#c1ff72]/20 dark:border-[#c1ff72]/30 bg-[#c1ff72]/10 backdrop-blur-sm px-3 py-1 text-xs text-stone-600 dark:text-[#c1ff72] mb-4 font-mono">
            <span className="w-1 h-1 rounded-full bg-[#c1ff72]"></span>
            Printing Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight font-display mb-12">
            End-to-End Corporate <span className="text-stone-400 dark:text-stone-500 font-normal">Printing.</span>
          </h2>
        </div>

        <div className="services-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 auto-rows-fr">
          
          {/* Card 1: Business Cards (Dark teal) */}
          <Link to="/business" aria-label="Configure Business Cards" className="service-card spotlight-card row-span-1 lg:row-span-2 group overflow-hidden lg:p-10 flex flex-col min-h-[420px] sm:min-h-[500px] lg:min-h-full transition-transform hover:scale-[1.01] duration-300 bg-[#002f43] rounded-[32px] pt-8 pr-6 pb-8 pl-6 relative justify-between cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c1ff72]">
            <div className="flex-1 flex w-full mt-4 mb-8 relative items-center justify-center">
              <div className="transform group-hover:-translate-y-2 transition-transform duration-500 bg-neutral-900 w-full max-w-[280px] z-10 rounded-xl pt-5 pr-5 pb-5 pl-5 relative shadow-2xl border border-neutral-800">
                <div className="flex gap-1.5 border-neutral-800 border-b mb-4 pb-3 items-center">
                  <div className="w-2 h-2 rounded-full bg-red-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                </div>
                <div className="space-y-3 font-mono text-[10px] text-stone-400">
                  <div className="flex gap-2"><span className="text-blue-400">category:</span> BusinessCard</div>
                  <div className="flex gap-2"><span className="text-blue-400">lamination:</span> MatteLaminate</div>
                  <div className="flex gap-2"><span className="text-blue-400">finishes:</span></div>
                  <div className="pl-4 flex gap-2"><span className="text-purple-400">spotUV:</span> true</div>
                  <div className="pl-4 flex gap-2"><span className="text-purple-400">hotStamping:</span> Gold</div>
                  <div className="flex gap-3 bg-neutral-800 border-neutral-700 border rounded-lg mt-4 p-2 items-center">
                    <div className="h-6 w-6 rounded bg-lime-900/50 text-lime-400 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 text-[9px] text-stone-300">File Integrity Check</div>
                    <div className="h-5 w-10 bg-[#c1ff72] rounded text-[8px] text-stone-950 font-bold flex items-center justify-center">PASS</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="z-20 relative">
              <div className="flex text-white bg-white/10 w-12 h-12 border border-white/10 rounded-2xl mb-6 backdrop-blur-md items-center justify-center">
                <Layers className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <h3 className="lg:text-3xl text-2xl font-bold text-white font-display mb-3">Business Cards</h3>
              <p className="text-stone-300 mb-6 text-sm lg:text-base leading-relaxed max-w-sm">Make every introduction count. Premium paper stocks, matte lamination, spot UV, and hot stamping.</p>
              <span className="inline-flex items-center text-white font-medium text-sm hover:underline underline-offset-4 group/link">
                Explore Business Cards <ArrowRight className="ml-2 w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </span>
            </div>
          </Link>

          {/* Card 2: Labels (Lime) */}
          <Link to="/label-sticker" aria-label="Configure Labels and Stickers" className="service-card spotlight-card col-span-1 md:col-span-2 group overflow-hidden lg:p-10 min-h-[360px] sm:min-h-[400px] flex flex-col md:flex-row transition-transform hover:scale-[1.01] duration-300 bg-[#c1ff72] rounded-[32px] pt-8 pr-6 pb-8 pl-6 relative items-center justify-between cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-900">
            <div className="relative z-20 flex flex-col h-full justify-between w-full md:w-1/2 mb-8 md:mb-0">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/40 backdrop-blur-sm flex items-center justify-center mb-6 text-stone-900">
                  <Tag className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <h3 className="lg:text-3xl text-2xl font-bold text-stone-900 font-display mb-3">Labels &amp; Stickers</h3>
                <p className="text-stone-800 text-sm lg:text-base mb-6 leading-relaxed max-w-xs">Custom die-cut stickers, waterproof PP stocks, and product labels that fit your brand perfectly.</p>
              </div>
              <span className="inline-flex items-center text-stone-900 font-bold text-sm hover:underline underline-offset-4 group/link">
                See Sticker Configurator <ArrowRight className="ml-2 w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </span>
            </div>
            <div className="relative w-full md:w-1/2 h-full min-h-[220px] flex items-center justify-end">
              <div className="absolute right-[-10px] md:right-[-20px] w-[110%] group-hover:scale-102 group-hover:-rotate-1 transition-all duration-500 ease-out">
                <div className="bg-white/90 backdrop-blur rounded-xl shadow-lg border border-lime-400/50 p-4">
                  <div className="flex gap-3">
                    <div className="flex-1 bg-stone-50 rounded-lg p-2 space-y-2">
                      <div className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">Queue</div>
                      <div className="bg-white p-2.5 rounded border border-stone-100 shadow-sm">
                        <div className="flex justify-between items-center mb-1.5">
                          <div className="h-1.5 w-12 bg-lime-300 rounded"></div>
                          <span className="text-[7px] text-stone-400">PP-Sticker</span>
                        </div>
                        <div className="h-1 w-full bg-stone-100 rounded"></div>
                      </div>
                    </div>
                    <div className="flex-1 bg-stone-50 rounded-lg p-2 space-y-2">
                      <div className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">Printing</div>
                      <div className="bg-white p-2.5 rounded border border-stone-100 shadow-sm relative">
                        <div className="flex justify-between items-center mb-1.5">
                          <div className="h-1.5 w-10 bg-lime-500 rounded"></div>
                          <span className="text-[7px] text-lime-600 font-semibold">Active</span>
                        </div>
                        <div className="h-1 w-full bg-lime-100 rounded overflow-hidden">
                          <div className="h-full bg-lime-500 w-2/3"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Card 3: Flyers (pale lime) */}
          <Link to="/marketing" aria-label="Configure Flyers and Brochures" className="service-card spotlight-card group overflow-hidden lg:p-10 min-h-[360px] sm:min-h-[400px] flex flex-col justify-between transition-transform hover:scale-[1.01] duration-300 bg-lime-50 dark:bg-neutral-900 border border-lime-100 dark:border-neutral-800 rounded-[32px] pt-8 pr-6 pb-8 pl-6 relative cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c1ff72]">
            <div className="flex-1 flex w-full items-center justify-center relative min-h-[160px]">
              <div className="space-y-3 w-full max-w-[240px]">
                <div className="bg-white dark:bg-neutral-850 p-3 rounded-xl border border-stone-200 dark:border-neutral-800 shadow-sm flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-lime-100 dark:bg-neutral-800 flex items-center justify-center text-lime-600 dark:text-lime-500 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <div className="h-2 w-16 bg-stone-200 dark:bg-neutral-800 rounded mb-1"></div>
                    <div className="h-1.5 w-24 bg-stone-100 dark:bg-neutral-750 rounded"></div>
                  </div>
                </div>
                <div className="bg-neutral-900 text-[#c1ff72] p-3 rounded-xl shadow-lg flex items-center gap-3 transform translate-x-4 group-hover:translate-x-6 transition-transform duration-500">
                  <Printer className="w-4 h-4 shrink-0 text-[#c1ff72]" />
                  <div className="flex-1 text-[10px] font-semibold tracking-tight">Sent to Press Pipeline</div>
                </div>
              </div>
            </div>
            <div className="z-10 relative">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-neutral-850 flex items-center justify-center mb-6 text-stone-950 dark:text-stone-100 shadow-sm border border-stone-100 dark:border-neutral-800">
                <FileText className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <h3 className="lg:text-2xl text-xl font-bold text-stone-900 dark:text-stone-100 font-display mb-2">Flyers &amp; Brochures</h3>
              <p className="text-stone-500 dark:text-neutral-400 text-sm leading-relaxed mb-4">Vibrant marketing folders and brochures. Bi-fold, tri-fold, and custom paper weights.</p>
              <span className="inline-flex items-center text-stone-900 dark:text-stone-200 font-semibold text-sm hover:underline group/link">
                Learn More <ArrowRight className="ml-1 w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </Link>

          {/* Card 4: Inkjet (sky) */}
          <Link to="/inkjet" aria-label="Configure Inkjet Printing" className="service-card spotlight-card group overflow-hidden lg:p-10 min-h-[360px] sm:min-h-[400px] flex flex-col justify-between transition-transform hover:scale-[1.01] duration-300 bg-sky-50 dark:bg-neutral-900 border border-sky-100 dark:border-neutral-800 rounded-[32px] pt-8 pr-6 pb-8 pl-6 relative cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c1ff72]">
            <div className="flex-1 flex w-full items-center justify-center relative min-h-[160px]">
              <div className="bg-white dark:bg-neutral-850 p-4 rounded-xl border border-sky-100 dark:border-neutral-800 shadow-sm w-full max-w-[200px] space-y-3">
                <div className="h-20 bg-sky-100/50 dark:bg-neutral-800/50 rounded-lg flex items-center justify-center relative border border-dashed border-sky-200 dark:border-neutral-700">
                  <div className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold">Banner 10' x 4'</div>
                  <span className="absolute bottom-1 right-2 text-[8px] text-sky-400 dark:text-sky-500">Inkjet</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-2 w-16 bg-stone-200 dark:bg-neutral-800 rounded"></div>
                  <div className="h-4 w-10 bg-sky-500 rounded text-[9px] text-white flex items-center justify-center font-bold">PDF</div>
                </div>
              </div>
            </div>
            <div className="z-10 relative">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-neutral-850 flex items-center justify-center mb-6 text-stone-950 dark:text-stone-100 shadow-sm border border-stone-100 dark:border-neutral-800">
                <Printer className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <h3 className="lg:text-2xl text-xl font-bold text-stone-900 dark:text-stone-100 font-display mb-2">Inkjet Printing</h3>
              <p className="text-stone-500 dark:text-neutral-400 text-sm leading-relaxed mb-4">Large format signs, tarpaulins, event banners, and promotional buntings.</p>
              <span className="inline-flex items-center text-stone-900 dark:text-stone-200 font-semibold text-sm hover:underline group/link">
                View Large Format <ArrowRight className="ml-1 w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </Link>

        </div>
      </div>
    </section>
  );
};

export default Services;