import React, { useRef } from 'react';
import { AlertCircle, Eye, Truck, ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const BrandPromise: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const promises = [
    {
      title: 'Razor-Sharp Precision',
      desc: 'We print every artwork at 300 DPI high-definition resolution to ensure that even the smallest micro-texts print perfectly sharp and legible.',
      icon: Eye,
      stat: '300 DPI',
      statLabel: 'Print Resolution',
    },
    {
      title: 'Artwork Verification',
      desc: 'Our pre-press experts inspect your bleed bounds, resolution scaling, and margins to guarantee error-free results before printing.',
      icon: AlertCircle,
      stat: '100%',
      statLabel: 'Pre-Press Checks',
    },
    {
      title: 'Express Nationwide Delivery',
      desc: 'Lightning-fast express turnarounds and standard doorstep shipping across Malaysia on every corporate order, no exceptions.',
      icon: Truck,
      stat: '1–3 Days',
      statLabel: 'Turnaround',
    },
  ];

  useGSAP(() => {
    gsap.fromTo('.brand-promise-title-group',
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.brand-promise-title-group',
          start: 'top 85%',
          toggleActions: 'play none none none',
        }
      }
    );

    gsap.fromTo('.brand-promise-card',
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.0,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.brand-promise-list',
          start: 'top 80%',
          toggleActions: 'play none none none',
        }
      }
    );
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="bg-stone-50 dark:bg-[#171717]/40 w-full py-16 lg:py-24 relative z-20 border-t border-stone-200/50 dark:border-neutral-800/80">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Left: Title + intro */}
          <div className="brand-promise-title-group lg:col-span-2 lg:sticky lg:top-32 lg:self-start">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#c1ff72]/20 bg-[#c1ff72]/10 px-3 py-1 text-xs text-stone-600 dark:text-[#c1ff72] mb-4 font-mono">
              <span className="w-1 h-1 rounded-full bg-[#c1ff72]"></span>
              Quality Guarantee
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight font-display leading-[1.05]">
              Precision That Elevates <span className="text-stone-400 dark:text-stone-500 font-normal">Your Brand.</span>
            </h2>
            <p className="mt-4 text-stone-500 dark:text-neutral-400 font-montserrat leading-relaxed text-base lg:text-lg">
              Every order passes through our thorough artwork verification pipeline before it reaches your hands.
            </p>
            <div className="mt-8 hidden lg:block">
              <a href="#products" className="inline-flex items-center gap-2 text-stone-600 dark:text-neutral-400 hover:text-stone-900 dark:hover:text-white font-medium text-sm font-montserrat transition-colors">
                View our process <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
              </a>
            </div>
          </div>

          {/* Right: Vertical card stack */}
          <div className="brand-promise-list lg:col-span-3 space-y-4">
            {promises.map((promise, i) => {
              const Icon = promise.icon;
              return (
                <div key={promise.title} className="brand-promise-card group bg-white dark:bg-neutral-900/60 backdrop-blur border border-stone-200/60 dark:border-neutral-800/65 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8 hover:border-stone-300 dark:hover:border-neutral-700 hover:shadow-md transition-all duration-300">
                  <div className="w-12 h-12 rounded-2xl border border-stone-200 dark:border-neutral-800 bg-white dark:bg-neutral-850 flex items-center justify-center shrink-0 text-stone-500 dark:text-stone-400 group-hover:text-[#c1ff72] group-hover:border-[#c1ff72]/30 transition-all duration-300">
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-stone-900 dark:text-stone-100 font-bold text-lg font-display">{promise.title}</h3>
                        <p className="text-stone-500 dark:text-neutral-400 text-sm leading-relaxed font-montserrat mt-1">{promise.desc}</p>
                      </div>
                      <div className="shrink-0 text-right hidden sm:block">
                        <div className="text-lg font-bold text-stone-900 dark:text-stone-100 font-display">{promise.stat}</div>
                        <div className="text-[11px] text-stone-400 dark:text-neutral-500 font-mono uppercase tracking-wider">{promise.statLabel}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandPromise;
