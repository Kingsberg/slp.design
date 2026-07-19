import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Mail, Globe } from 'lucide-react';
import { useInView } from './useInView';

const Footer: React.FC = () => {
  const [ref, isVisible] = useInView<HTMLElement>(0.1);

  return (
    <>
      {/* Template-style CTA section */}
      <section className="w-full px-6 sm:px-8 pt-16 lg:pt-24 pb-8 bg-neutral-100 dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto bg-neutral-900 rounded-[32px] py-16 px-8 sm:px-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] grid-lines"></div>
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight font-display">
              Ready to print with precision?
            </h2>
            <p className="mt-4 text-stone-400 font-montserrat text-base sm:text-lg max-w-xl mx-auto">
              Get a custom quote in under 2 minutes. Our printing team is standing by.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/601156389800?text=Hi%20SLP%20Design%2C%20I%20have%20an%20inquiry%20about%20my%20printing%20project!"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#c1ff72] text-neutral-900 hover:bg-[#b0ee5c] transition-all font-bold px-6 py-3 rounded-xl text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Get a Quote
              </a>
              <a
                href="#products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-stone-700 text-stone-300 hover:text-white hover:border-stone-500 transition-all text-sm font-montserrat"
              >
                Browse Products
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer
        ref={ref}
        className={`w-full z-40 px-6 sm:px-8 pb-12 bg-neutral-100 dark:bg-neutral-950 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
      <div className="max-w-7xl bg-[#f8f9fa] dark:bg-neutral-900/40 border border-stone-200/60 dark:border-neutral-800 rounded-[32px] mx-auto py-12 px-8 sm:px-16 shadow-sm">
        {/* Main content */}
        <div className="flex flex-col lg:flex-row lg:justify-between gap-12 lg:gap-8">
          
          {/* Brand Info */}
          <div className="flex flex-col max-w-sm">
            <div className="flex items-center mb-4">
              <span className="font-display font-bold text-[26px] text-stone-900 dark:text-stone-100 tracking-tight">SLP</span>
              <span className="font-display font-bold text-[26px] text-[#c1ff72] tracking-tight">Design</span>
            </div>
            <p className="text-[15px] text-stone-500 dark:text-neutral-400 font-montserrat leading-relaxed">
              End-to-end premium print production for modern business.
            </p>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-16 lg:gap-24">
            
            {/* Company Column */}
            <div className="flex flex-col">
              <h4 className="text-[11px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-[0.06em] mb-5 font-sans">
                Company
              </h4>
              <div className="flex flex-col gap-3.5">
                <Link to="/" className="text-[14px] text-stone-600 dark:text-neutral-300 hover:text-stone-900 dark:hover:text-white font-sans font-medium transition-colors duration-200">
                  Services
                </Link>
                <a href="#products" className="text-[14px] text-stone-600 dark:text-neutral-300 hover:text-stone-900 dark:hover:text-white font-sans font-medium transition-colors duration-200">
                  Products
                </a>
                <a href="#contact" className="text-[14px] text-stone-600 dark:text-neutral-300 hover:text-stone-900 dark:hover:text-white font-sans font-medium transition-colors duration-200">
                  Contact
                </a>
              </div>
            </div>

            {/* Connect Column */}
            <div className="flex flex-col">
              <h4 className="text-[11px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-[0.06em] mb-5 font-sans">
                Connect
              </h4>
              <div className="flex flex-col gap-3.5">
                <a 
                  href="https://www.facebook.com/SLPXDesign/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2.5 text-[14px] text-stone-600 dark:text-neutral-300 hover:text-stone-900 dark:hover:text-white font-sans font-medium transition-colors duration-200"
                >
                  <Globe className="w-4 h-4 text-stone-700 dark:text-stone-400" strokeWidth={2} />
                  Facebook
                </a>
                <a 
                  href="https://wa.me/601156389800" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2.5 text-[14px] text-stone-600 dark:text-neutral-300 hover:text-stone-900 dark:hover:text-white font-sans font-medium transition-colors duration-200"
                >
                  <MessageCircle className="w-4 h-4 text-stone-700 dark:text-stone-400" strokeWidth={2} />
                  WhatsApp
                </a>
                <a 
                  href="mailto:slprint@gmail.com"
                  className="flex items-center gap-2.5 text-[14px] text-stone-600 dark:text-neutral-300 hover:text-stone-900 dark:hover:text-white font-sans font-medium transition-colors duration-200"
                >
                  <Mail className="w-4 h-4 text-stone-700 dark:text-stone-400" strokeWidth={2} />
                  Email
                </a>
              </div>
            </div>

            {/* Legal Column */}
            <div className="flex flex-col">
              <h4 className="text-[11px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-[0.06em] mb-5 font-sans">
                Legal
              </h4>
              <div className="flex flex-col gap-3.5">
                <a href="#privacy" className="text-[14px] text-stone-600 dark:text-neutral-300 hover:text-stone-900 dark:hover:text-white font-sans font-medium transition-colors duration-200">
                  Privacy Policy
                </a>
                <a href="#terms" className="text-[14px] text-stone-600 dark:text-neutral-300 hover:text-stone-900 dark:hover:text-white font-sans font-medium transition-colors duration-200">
                  Terms
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-stone-200/60 dark:border-neutral-800/80 mt-12 mb-6" />

        {/* Copyright */}
        <div className="text-[13px] text-stone-400 dark:text-neutral-500 font-sans">
          © 2026 SLP Design. All rights reserved.
        </div>
      </div>
    </footer>
    </>
  );
};

export default Footer;
