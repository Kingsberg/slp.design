import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import Background from './components/Background';
import WhatsAppButton from './components/WhatsAppButton';
import HomePage from './components/HomePage';
import ProductPage from './components/ProductPage';

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
          <Routes location={location} {...{ key: location.pathname } as any}>
            <Route path="/" element={<HomePage />} />
            <Route path="/:category" element={<ProductPage />} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default App;