import React from 'react';
import { motion } from 'framer-motion';
import Hero from './Hero';
import TrustBar from './TrustBar';
import BrandPromise from './BrandPromise';
import Services from './Services';
import WhyUs from './WhyUs';

const HomePage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Hero />
      <TrustBar />
      <BrandPromise />
      <Services />
      <WhyUs />
    </motion.div>
  );
};

export default HomePage;
