import React from 'react';
import { Building2, Briefcase, Users, Store, GraduationCap, Hotel, Gift, Heart } from 'lucide-react';
import { useInView } from './useInView';

const TrustBar: React.FC = () => {
  const [ref, isVisible] = useInView<HTMLDivElement>(0.3);

  const brandLogos = [
    { name: 'Corporate', icon: Building2 },
    { name: 'Retail', icon: Store },
    { name: 'Education', icon: GraduationCap },
    { name: 'Hospitality', icon: Hotel },
    { name: 'Healthcare', icon: Heart },
    { name: 'Events', icon: Gift },
    { name: 'SME', icon: Briefcase },
    { name: 'Enterprise', icon: Users },
  ];

  return (
    <section ref={ref} className="max-w-[1600px] mx-auto px-6 lg:px-12 pb-12">
      <div className={`bg-white/80 dark:bg-neutral-900/40 backdrop-blur border border-stone-200/60 dark:border-neutral-800 rounded-xl p-8 shadow-md transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <p className="text-left text-xs font-montserrat font-semibold text-stone-400 dark:text-neutral-500 uppercase tracking-widest mb-6">Trusted by forward-thinking businesses across Malaysia</p>
        <div className="overflow-hidden w-full relative">
          <div className="z-10 bg-gradient-to-r from-white dark:from-neutral-900 via-white/80 dark:via-neutral-900/80 to-transparent w-16 lg:w-32 h-full absolute top-0 left-0 pointer-events-none"></div>
          <div className="bg-gradient-to-l from-white dark:from-neutral-900 via-white/80 dark:via-neutral-900/80 to-transparent w-16 lg:w-32 h-full z-10 absolute top-0 right-0 pointer-events-none"></div>
          <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
              <div className="flex items-center gap-12 lg:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500 py-2 group">
                {brandLogos.map((brand, i) => {
                  const Icon = brand.icon;
                  return (
                    <div key={`brand-1-${i}`} className="flex items-center gap-2 text-lg lg:text-xl font-bold font-geist text-stone-600 dark:text-neutral-300 hover:text-stone-900 dark:hover:text-white transition-colors">
                    <Icon className="w-5 h-5 text-stone-400 dark:text-neutral-500 group-hover:text-[#c1ff72]" strokeWidth={2.5} />
                    {brand.name}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-12 lg:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500 py-2 ml-12 lg:ml-24 group">
              {brandLogos.map((brand, i) => {
                const Icon = brand.icon;
                return (
                  <div key={`brand-2-${i}`} className="flex items-center gap-2 text-lg lg:text-xl font-bold font-geist text-stone-600 dark:text-neutral-300 hover:text-stone-900 dark:hover:text-white transition-colors">
                    <Icon className="w-5 h-5 text-stone-400 dark:text-neutral-500 group-hover:text-[#c1ff72]" strokeWidth={2.5} />
                    {brand.name}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
