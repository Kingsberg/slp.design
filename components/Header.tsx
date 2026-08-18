import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Layers, Image as ImageIcon, Tag, Printer, Book, Award, FileText, Mail, BookOpen, Calendar, DollarSign, Menu, X, MessageCircle, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (typeof window !== 'undefined') {
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownTimeoutRef = useRef<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const handleMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // React Router changes the route before the homepage target exists, so scroll after render.
  useEffect(() => {
    if (location.pathname !== '/' || location.hash !== '#contact') return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileMenuOpen(false);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [isMobileMenuOpen]);

  const handleSupportClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/#contact');
    } else {
      const element = document.getElementById('contact');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const menuItems = [
    { id: 'business', label: 'Business Cards', icon: Layers },
    { id: 'marketing', label: 'Flyers & Brochures', icon: ImageIcon },
    { id: 'label-sticker', label: 'Labels & Stickers', icon: Tag },
    { id: 'inkjet', label: 'Inkjet Printing', icon: Printer },
    { id: 'billbook', label: 'Bill Book', icon: Book },
    { id: 'buttonbadge', label: 'Button Badge', icon: Award },
    { id: 'computerform', label: 'Computer Form', icon: FileText },
    { id: 'envelope', label: 'Envelope', icon: Mail },
    { id: 'booklet', label: 'Booklet', icon: BookOpen },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'moneypacket', label: 'Money Packet', icon: DollarSign },
  ];

  const mobileMenu = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation"
      className={`fixed inset-0 min-h-[100dvh] bg-[#f5f5f5]/98 dark:bg-[#171717]/98 backdrop-blur-xl z-[9999] transition-all duration-300 md:hidden flex flex-col px-5 pt-[calc(1rem+env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] ${
        isMobileMenuOpen ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none -translate-y-4'
      }`}
    >
      <div className="flex flex-col text-lg font-display h-full min-h-0">
        <div className="flex items-center justify-between min-h-[44px] mb-6">
          <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-lg">Menu</span>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-850 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors border border-stone-200/50 dark:border-neutral-800/50"
              aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" strokeWidth={1.8} /> : <Sun className="w-5 h-5" strokeWidth={1.8} />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-900 text-[#c1ff72] transition-colors"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="font-semibold text-neutral-400 dark:text-neutral-500 text-xs uppercase tracking-wider mb-3">Products</div>
        <div className="grid grid-cols-1 gap-1 overflow-y-auto min-h-0 pr-1">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={`/${item.id}`}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex min-h-[48px] items-center gap-3 rounded-xl px-2 py-2 text-neutral-700 dark:text-neutral-200 hover:bg-white/70 dark:hover:bg-neutral-800/70 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                <item.icon className="w-5 h-5" />
              </div>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="mt-5 border-t border-neutral-200/70 dark:border-neutral-800 pt-4 space-y-2">
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex min-h-[44px] items-center rounded-xl px-3 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-white/70 dark:hover:bg-neutral-800/70"
          >
            Home
          </Link>
          <a
            href="#contact"
            onClick={(event) => {
              setIsMobileMenuOpen(false);
              handleSupportClick(event);
            }}
            className="flex min-h-[44px] items-center rounded-xl px-3 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-white/70 dark:hover:bg-neutral-800/70"
          >
            Contact
          </a>
          <a
            href="https://wa.me/601156389800?text=Hi%20SLP%20Design%2C%20I%20have%20an%20inquiry%20about%20my%20printing%20project!"
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 text-sm font-semibold text-[#c1ff72] active:scale-[0.98] transition-transform"
          >
            <MessageCircle className="w-5 h-5" />
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[60] glass-panel dark:bg-[#171717]/85 dark:border-neutral-800/80 w-full opacity-0 animate-slide-down">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 h-16 lg:h-20 flex items-center justify-between gap-3">

          <Link to="/" onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })} className="flex min-w-0 items-center gap-3 z-[61]">
            <motion.span 
              className="font-semibold text-neutral-900 dark:text-neutral-100 hover:text-[#c1ff72] dark:hover:text-[#c1ff72] transition-colors duration-300 tracking-tight font-display text-lg sm:text-xl lg:text-2xl cursor-pointer whitespace-nowrap"
              whileHover={{ 
                x: 4,
                scale: 1.05
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              SLP Design
            </motion.span>
          </Link>

          <nav className="hidden md:flex items-center gap-10 text-sm font-montserrat h-full">
            <div 
              className="h-full flex items-center"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button 
                className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors duration-300 font-medium font-montserrat focus:outline-none"
              >
                Products
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <Link to="/" onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })} className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors duration-300 text-sm font-medium font-montserrat">Home</Link>
            <a href="#contact" onClick={handleSupportClick} className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors duration-300 text-sm font-medium font-montserrat">Contact</a>
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-850 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors border border-stone-200/50 dark:border-neutral-800/50 focus:outline-none"
              aria-label={theme === 'light' ? "Switch to dark theme" : "Switch to light theme"}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" strokeWidth={1.8} /> : <Sun className="w-4 h-4" strokeWidth={1.8} />}
            </button>

            {/* Chat with Us Button */}
            <a
              href="https://wa.me/601156389800?text=Hi%20SLP%20Design%2C%20I%20have%20an%20inquiry%20about%20my%20printing%20project!"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-neutral-900 text-[#c1ff72] hover:bg-neutral-800 transition-all font-medium sm:h-auto sm:w-auto sm:px-4 sm:py-2 lg:px-5 lg:py-2.5 text-xs lg:text-sm gap-2 group shrink-0"
              aria-label="Chat with SLP Design on WhatsApp"
            >
              <span className="hidden sm:inline">Chat with Us</span>
              <MessageCircle className="w-4 h-4" />
            </a>

            <button
              className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-850 hover:text-neutral-900 dark:hover:text-white focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </header>

      {/* DROP DOWN MEGA MENU & OVERLAY */}
      <AnimatePresence>
        {isDropdownOpen && (
          <>
            {/* FULL-PAGE BLURRED BACKDROP OVERLAY */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 top-16 lg:top-20 bg-stone-900/35 dark:bg-black/60 backdrop-blur-sm z-40 pointer-events-auto"
              onClick={() => setIsDropdownOpen(false)}
            />

            {/* MEGA-MENU PANEL */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed left-0 right-0 top-16 lg:top-20 w-full bg-white/95 dark:bg-[#121212]/95 backdrop-blur-xl border-b border-stone-200 dark:border-neutral-800 shadow-2xl z-50 overflow-hidden"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="max-w-6xl mx-auto px-6 py-8 lg:py-10">
                <div className="font-semibold text-neutral-400 dark:text-neutral-500 text-xs uppercase tracking-widest font-mono mb-6">
                  Explore Our Printing Services
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                  {menuItems.map((item) => (
                    <Link
                      key={item.id}
                      to={`/${item.id}`}
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-start gap-4 p-3.5 rounded-xl hover:bg-stone-50 dark:hover:bg-neutral-850/40 border border-transparent hover:border-stone-100 dark:hover:border-neutral-800 transition-all group/item hover:-translate-y-0.5"
                    >
                      <div className="p-2.5 rounded-xl bg-stone-100 dark:bg-neutral-850 text-stone-500 dark:text-neutral-400 group-hover/item:text-[#c1ff72] group-hover/item:bg-neutral-900 dark:group-hover/item:bg-neutral-800 transition-colors shrink-0">
                        <item.icon className="w-5 h-5" strokeWidth={1.5} />
                      </div>
                      <div>
                        <div className="text-stone-850 dark:text-neutral-200 group-hover/item:text-neutral-900 dark:group-hover/item:text-white font-semibold text-sm transition-colors font-body">
                          {item.label}
                        </div>
                        <div className="text-[11px] text-stone-450 dark:text-neutral-500 font-body mt-1 leading-relaxed">
                          {getProductDesc(item.id)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {typeof document !== 'undefined' ? ReactDOM.createPortal(mobileMenu, document.body) : null}
    </>
  );
};

const getProductDesc = (id: string): string => {
  switch (id) {
    case 'business': return 'Premium cards for professional networking';
    case 'marketing': return 'High-impact flyers & marketing brochures';
    case 'label-sticker': return 'Custom shapes & waterproof PP labeling';
    case 'inkjet': return 'Large format banners, bunting, & posters';
    case 'billbook': return 'Custom invoices, receipts, & carbonless books';
    case 'buttonbadge': return 'Pin badges for corporate branding';
    case 'computerform': return 'Continuous multi-part forms for dot-matrix';
    case 'envelope': return 'Branded mailing envelopes';
    case 'booklet': return 'Catalogues, portfolios, & multi-page booklets';
    case 'calendar': return 'Desk & wall calendars';
    case 'moneypacket': return 'Festive custom pocket envelope printing';
    default: return 'High quality custom printing services';
  }
};

export default Header;
