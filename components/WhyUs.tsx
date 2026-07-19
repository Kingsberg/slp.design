import React, { useRef } from 'react';
import { ShieldCheck, Sliders, HeartHandshake } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Register plugins
gsap.registerPlugin(ScrollTrigger, useGSAP);

const WhyUs: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const points = [
    {
      title: 'We Print with Precision',
      desc: 'No blurry outcomes. Every order is checked by our pre-press team to verify resolution, dimensions, and margins before printing.',
      icon: ShieldCheck,
    },
    {
      title: 'Full-Stack Finishes',
      desc: 'Matte, gloss lamination, spot UV, or metallic hot stamp foils. Configure and view instant custom pricing grids instantly.',
      icon: Sliders,
    },
    {
      title: 'Partner, Not Vendor',
      desc: 'We automatically verify your bleed lines and resolution bounds, notifying your designers before we proceed to print.',
      icon: HeartHandshake,
    },
  ];

  useGSAP(() => {
    // Title reveal
    gsap.fromTo('.why-us-title',
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.why-us-title',
          start: 'top 85%',
          toggleActions: 'play none none none',
        }
      }
    );

    // Points staggered reveal
    gsap.fromTo('.why-us-point',
      { y: 40, opacity: 0, scale: 0.98 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 1.0,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.why-us-grid',
          start: 'top 80%',
          toggleActions: 'play none none none',
        }
      }
    );

  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="bg-stone-50 dark:bg-[#171717]/40 w-full py-16 lg:py-24 relative z-20 border-t border-stone-200/50 dark:border-neutral-800/80">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <h2 className="why-us-title text-3xl sm:text-4xl lg:text-5xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight text-center font-display">
          Why SLP Design?
        </h2>
        <div className="why-us-grid grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 mt-12 lg:mt-16">
          {points.map((point) => {
            const Icon = point.icon;
            return (
              <div key={point.title} className="why-us-point flex flex-col items-center text-center transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-stone-100 dark:bg-neutral-850 flex items-center justify-center text-stone-700 dark:text-stone-300 mb-4 shrink-0 shadow-sm border border-stone-200/30 dark:border-neutral-800">
                  <Icon className="w-5 h-5" strokeWidth={2} />
                </div>
                <h3 className="text-stone-900 dark:text-stone-100 font-bold text-lg font-display mb-2">{point.title}</h3>
                <p className="text-stone-500 dark:text-neutral-400 text-sm leading-relaxed max-w-xs mx-auto font-montserrat">{point.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
