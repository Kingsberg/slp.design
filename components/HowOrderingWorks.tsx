import React from 'react';
import { ArrowRight, ClipboardList, MessageCircle, SlidersHorizontal } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: ClipboardList,
    title: 'Choose a product',
    description: 'Start with business cards, stickers, flyers, large-format prints, or another print category.',
    proof: 'Browse by project',
  },
  {
    number: '02',
    icon: SlidersHorizontal,
    title: 'Configure your specs',
    description: 'Select size, material, finishing, quantity, and artwork options while your estimate updates.',
    proof: 'Live estimate',
  },
  {
    number: '03',
    icon: MessageCircle,
    title: 'Review and send',
    description: 'Check the itemized summary and shipment window, then send the prepared details to our print team.',
    proof: 'WhatsApp handoff',
  },
];

const HowOrderingWorks: React.FC = () => {
  return (
    <section id="how-ordering-works" className="relative z-20 border-y border-stone-200/60 bg-stone-50/70 py-16 dark:border-neutral-800/70 dark:bg-neutral-950/80 lg:py-24 scroll-mt-24">
      <div className="mx-auto max-w-[1600px] px-6 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#c1ff72]/30 bg-[#c1ff72]/10 px-3 py-1 text-xs font-mono text-stone-600 dark:text-[#c1ff72]">
            <span className="h-1 w-1 rounded-full bg-[#c1ff72]" />
            How ordering works
          </div>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-100 sm:text-4xl lg:text-5xl">
            From idea to print in <span className="font-normal text-stone-400 dark:text-stone-500">three clear steps.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-stone-500 dark:text-neutral-400 sm:text-lg">
            A simpler path to a confident quote: choose what you need, set the details, and let our team take it from there.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3 lg:mt-14 lg:gap-6">
          {steps.map(({ number, icon: Icon, title, description, proof }) => (
            <article key={number} className="group rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#c1ff72]/70 hover:shadow-xl hover:shadow-stone-200/40 dark:border-neutral-800 dark:bg-neutral-900/80 dark:hover:border-[#c1ff72]/60 dark:hover:shadow-none sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900 text-[#c1ff72] dark:bg-[#c1ff72] dark:text-neutral-900">
                  <Icon className="h-5 w-5" strokeWidth={1.7} />
                </div>
                <span className="font-mono text-xs text-stone-400 dark:text-neutral-500">{number}</span>
              </div>
              <h3 className="mt-7 font-display text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-stone-500 dark:text-neutral-400">{description}</p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c1ff72]" />
                {proof}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 flex justify-center lg:mt-12">
          <a href="#products" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-[#c1ff72] transition-all hover:bg-neutral-800 active:scale-[0.98] dark:bg-[#c1ff72] dark:text-neutral-900 dark:hover:bg-[#d5ff9a]">
            Browse products
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default HowOrderingWorks;
