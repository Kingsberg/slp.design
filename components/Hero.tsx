import React, { useRef } from 'react';
import { ArrowUpRight, Mail, Phone, Globe, Printer, Activity, Star, Award, Zap, Truck, Check } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Register plugins
gsap.registerPlugin(ScrollTrigger, useGSAP);

const Hero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // 1. Text & Cards entrance sequence
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    // Set initial opacity to avoid flash
    gsap.set('.hero-badge, .hero-title, .hero-desc, .hero-cta, .status-card', { opacity: 0 });

    tl.fromTo('.hero-badge', 
      { y: -25, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8 }
    )
    .fromTo('.hero-title', 
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2 },
      '-=0.6'
    )
    .fromTo('.hero-desc', 
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.0 },
      '-=0.8'
    )
    .fromTo('.hero-cta', 
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.12 },
      '-=0.8'
    )
    .fromTo('.status-card', 
      { y: 70, scale: 0.9, rotation: 3, opacity: 0 },
      { y: 0, scale: 1, rotation: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: 'back.out(1.1)' },
      '-=0.8'
    );

    // 2. Loop bobbing/floating animation with custom phases
    const cards = gsap.utils.toArray<HTMLElement>('.status-card');
    cards.forEach((card, i) => {
      gsap.to(card, {
        y: i === 1 ? -10 : 10,
        duration: 3.5 + i * 1.0,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.4,
      });
    });

    // 3. Staggered reveal for bottom cards on scroll
    gsap.fromTo('.bottom-card', 
      { y: 60, opacity: 0, scale: 0.97 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 1.0,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.bottom-card-container',
          start: 'top 85%',
          toggleActions: 'play none none none',
        }
      }
    );

  }, { scope: containerRef });

  return (
    <div ref={containerRef}>
      {/* Template-style 2-Column Hero */}
      <section className="lg:px-12 lg:pt-16 lg:pb-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 min-h-[60vh] lg:min-h-[75vh] max-w-[1600px] mr-auto ml-auto pt-8 pr-6 pb-12 pl-6 items-center" id="home">
        <div className="lg:col-span-7 space-y-6">
          <div className="hero-badge inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium bg-white dark:bg-neutral-900 border-stone-200 dark:border-neutral-800 text-stone-600 dark:text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-[#c1ff72] animate-pulse-slow"></span>
            Premium Printing Services Malaysia
          </div>
          <h1 className="hero-title leading-[0.95] lg:text-7xl xl:text-8xl text-5xl font-medium text-stone-900 dark:text-stone-100 tracking-tighter">
            Print that leaves a{' '}
            <span className="text-slate-950 dark:text-white font-display relative inline-block">
              lasting impression
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#c1ff72] -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" opacity="0.4"></path>
              </svg>
            </span>
          </h1>
          <p className="hero-desc leading-relaxed lg:text-xl text-lg font-normal text-stone-500 dark:text-neutral-400 font-montserrat max-w-2xl">
            From premium business cards to large-format displays. SLP Design crafts physical brand moments with high-fidelity precision and speed — delivered across Malaysia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <a href="#products" className="hero-cta inline-flex items-center justify-center gap-2 bg-neutral-900 text-[#c1ff72] hover:bg-neutral-800 transition-all font-medium px-4 py-2 lg:px-5 lg:py-2.5 rounded-lg text-xs lg:text-sm group">
              Explore Products
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </a>
            <a href="https://wa.me/601156389800?text=Hi%20SLP%20Design%2C%20I%20have%20an%20inquiry%20about%20my%20printing%20project!" target="_blank" rel="noopener noreferrer" className="hero-cta inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-stone-300 dark:border-neutral-700 font-medium text-stone-600 dark:text-neutral-350 hover:bg-stone-200/50 dark:hover:bg-neutral-800/50 transition-colors text-xs lg:text-sm">
              Get a Quote
            </a>
          </div>
        </div>

        {/* Right: Floating status cards (template style) */}
        <div className="lg:col-span-5 flex flex-col h-full mt-8 relative justify-center">
          <div className="relative space-y-4">
            <div className="status-card glass-panel dark:bg-[#171717]/85 dark:border-neutral-800/80 p-4 rounded-xl flex items-center gap-4 shadow-lg max-w-sm mx-auto w-full">
              <div className="w-10 h-10 rounded-full flex items-center justify-center border shrink-0 bg-lime-50 dark:bg-neutral-850 text-lime-600 dark:text-[#c1ff72] border-lime-100 dark:border-neutral-800">
                <Printer className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">High-Speed Digital Press</p>
                  <span className="text-[10px] text-stone-400 dark:text-neutral-500">HQ Muar, Johor</span>
                </div>
                <p className="text-xs text-stone-500 dark:text-neutral-450 truncate">Calibrated & Printing</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded border font-medium bg-stone-100 dark:bg-neutral-800 text-stone-600 dark:text-neutral-300 border-stone-200 dark:border-neutral-700">99.8% Load</span>
            </div>
            <div className="status-card glass-panel dark:bg-[#171717]/85 dark:border-neutral-800/80 p-4 rounded-xl flex items-center gap-4 shadow-lg lg:ml-8 max-w-sm mx-auto w-full">
              <div className="flex shrink-0 bg-[#c1ff72] w-10 h-10 border rounded-full items-center justify-center text-stone-950">
                <Check className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">Artwork Integrity Check</p>
                  <span className="text-[10px] text-stone-400 dark:text-neutral-500">Free Verify</span>
                </div>
                <p className="text-xs text-stone-500 dark:text-neutral-450 truncate">Pre-Press Proofing Check</p>
              </div>
              <span className="bg-[#c1ff72] text-[10px] px-2 py-0.5 rounded font-semibold text-stone-900">✓ Active</span>
            </div>
            <div className="status-card glass-panel dark:bg-[#171717]/85 dark:border-neutral-800/80 p-4 rounded-xl flex items-center gap-4 shadow-lg lg:-ml-4 max-w-sm mx-auto w-full">
              <div className="w-10 h-10 rounded-full text-[#c1ff72] flex items-center justify-center border shrink-0 bg-neutral-900">
                <Truck className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">Nationwide Delivery</p>
                  <span className="text-[10px] text-stone-400 dark:text-neutral-500">Muar Dispatch</span>
                </div>
                <p className="text-xs text-stone-500 dark:text-neutral-450 truncate">Johor & West Malaysia</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded border font-medium bg-neutral-900 text-white border-stone-700">Direct Delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom hero cards (template glass style) */}
      <section className="bottom-card-container max-w-[1600px] mx-auto px-6 lg:px-12 mt-6 lg:mt-0 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          <article className="bottom-card spotlight-card relative bg-white/70 dark:bg-neutral-900/60 backdrop-blur-xl border border-stone-200/60 dark:border-neutral-800 rounded-xl flex flex-col md:min-h-[340px] lg:min-h-[380px] hover:bg-white dark:hover:bg-neutral-900 hover:border-[#c1ff72]/80 dark:hover:border-[#c1ff72]/80 hover:shadow-xl hover:shadow-stone-200/30 transition-all duration-300 group shadow-md">
            <div className="p-8 sm:p-10 flex flex-col h-full relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 dark:border-neutral-800 bg-stone-50 dark:bg-neutral-850 px-3 py-1 text-xs text-stone-500 dark:text-neutral-300 mb-4 font-mono w-fit">
                <Star className="w-3 h-3 text-yellow-500" strokeWidth={1.5} />
                Client Story
              </div>
              <h3 className="text-2xl sm:text-3xl tracking-tight text-stone-900 dark:text-stone-100 group-hover:text-stone-950 dark:group-hover:text-white transition-colors duration-300 font-display font-semibold">Quality you can feel. Speed you can trust.</h3>
              <p className="mt-4 text-stone-600 dark:text-neutral-400 group-hover:text-stone-700 dark:group-hover:text-neutral-300 transition-colors duration-300 font-montserrat leading-relaxed">"The texture and finish of our new cards completely elevated our networking. SLP Design delivered perfectly on a tight deadline."</p>
              <div className="mt-auto pt-6 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-md border border-stone-200 dark:border-neutral-800 bg-stone-50 dark:bg-neutral-850 px-2.5 py-1 font-mono text-xs text-stone-600 dark:text-neutral-300">
                  <Printer className="w-3.5 h-3.5 text-[#c1ff72]" strokeWidth={1.5} />
                  100k+ Prints
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-md border border-stone-200 dark:border-neutral-800 bg-stone-50 dark:bg-neutral-850 px-2.5 py-1 font-mono text-xs text-stone-600 dark:text-neutral-300">
                  <Star className="w-3.5 h-3.5 text-yellow-500" strokeWidth={1.5} />
                  4.9/5 Rating
                </span>
              </div>
            </div>
          </article>

          <aside className="bottom-card spotlight-card relative sm:p-10 flex flex-col md:min-h-[340px] lg:min-h-[380px] group transition-all duration-300 text-stone-900 bg-[url('https://images.unsplash.com/photo-1626785774573-4b7993143a2d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center border border-stone-200/60 dark:border-neutral-800 rounded-xl pt-8 pr-8 pb-8 pl-8 shadow-md overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-white/95 dark:from-neutral-950/95 via-white/80 dark:via-neutral-950/80 to-white/40 dark:to-neutral-950/40 rounded-xl -z-0 animate-fade-in"></div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-start justify-between">
                <div className="inline-flex items-center gap-2 rounded-full border border-stone-200/80 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 px-3 py-1 text-xs text-stone-600 dark:text-neutral-300 font-mono">
                  <Award className="w-3 h-3 text-[#c1ff72]" strokeWidth={1.5} />
                  Materials
                </div>
                <ArrowUpRight className="w-4 h-4 text-stone-600 dark:text-neutral-450 transition-all duration-300" strokeWidth={1.5} />
              </div>
              <p className="text-stone-900 dark:text-neutral-100 transition-colors duration-300 text-xl sm:text-2xl font-display font-semibold mt-4 leading-snug">We source the finest stocks — from heavy matte cardstock to eco-friendly recycled papers and luxurious textured finishes.</p>
            </div>
          </aside>

          <aside id="contact" className="bottom-card spotlight-card relative sm:p-10 flex flex-col md:min-h-[340px] lg:min-h-[380px] group transition-all duration-300 text-stone-900 bg-[url(https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=1974&auto=format&fit=crop)] bg-cover bg-center border border-stone-200/60 dark:border-neutral-800 rounded-xl pt-8 pr-8 pb-8 pl-8 shadow-md overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-white/95 dark:from-neutral-950/95 via-white/85 dark:via-neutral-950/85 to-white/50 dark:to-neutral-950/50 rounded-xl -z-0 animate-fade-in"></div>
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-start justify-between">
                <div className="inline-flex items-center gap-2 rounded-full border border-stone-200/80 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 px-3 py-1 text-xs text-stone-600 dark:text-neutral-300 font-mono">
                  <Zap className="w-3 h-3 text-[#c1ff72]" strokeWidth={1.5} />
                  Support
                </div>
                <ArrowUpRight className="w-4 h-4 text-stone-600 dark:text-neutral-450 transition-all duration-300" strokeWidth={1.5} />
              </div>
              <p className="text-stone-900 dark:text-neutral-100 transition-colors duration-300 text-xl sm:text-2xl font-display font-semibold mt-4 leading-snug">Need help with your artwork file? Our design team is ready to review your assets before printing.</p>
              <div className="text-sm mt-auto pt-10 space-y-3">
                <a href="mailto:slprint@gmail.com" className="flex items-center gap-3 text-stone-700 dark:text-neutral-300 hover:text-stone-900 dark:hover:text-white hover:translate-x-1 transition-all duration-300 group/link font-montserrat">
                  <Mail className="w-4 h-4" strokeWidth={1.5} />
                  slprint@gmail.com
                </a>
                <a href="tel:+60126353939" className="flex items-center gap-3 text-stone-700 dark:text-neutral-300 hover:text-stone-900 dark:hover:text-white hover:translate-x-1 transition-all duration-300 group/link font-montserrat">
                  <Phone className="w-4 h-4" strokeWidth={1.5} />
                  +60 12 635 3939
                </a>
                <a href="https://slp.design" className="flex items-center gap-3 text-stone-700 dark:text-neutral-300 hover:text-stone-900 dark:hover:text-white hover:translate-x-1 transition-all duration-300 group/link font-montserrat">
                  <Globe className="w-4 h-4" strokeWidth={1.5} />
                  slp.design
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};

export default Hero;