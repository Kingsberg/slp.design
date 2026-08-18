import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import Background from './components/Background';
import WhatsAppButton from './components/WhatsAppButton';
const HomePage = lazy(() => import('./components/HomePage'));
const ProductPage = lazy(() => import('./components/ProductPage'));

const RouteFallback = () => (
  <div className="flex min-h-[50vh] items-center justify-center px-6 text-center text-sm text-stone-500 dark:text-neutral-400 font-body">
    Loading your print experience…
  </div>
);

const App: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return (
    <div className="relative min-h-screen">
      <Background />
      <Header />
      <main className="min-h-screen pt-24 overflow-hidden">
        <AnimatePresence mode="wait">
          <Suspense fallback={<RouteFallback />}>
            <Routes location={location} {...{ key: location.pathname } as any}>
              <Route path="/" element={<HomePage />} />
              <Route path="/:category" element={<ProductPage />} />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default App;