import React from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

const WhatsAppButton: React.FC = () => {
  const location = useLocation();
  const phoneNumber = '601156389800';
  const defaultMessage = encodeURIComponent("Hi SLP Design, I have an inquiry about my printing project!");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${defaultMessage}`;

  // Hide the global floating bubble on all product configurator pages
  if (location.pathname !== '/' && location.pathname !== '/index.html') {
    return null;
  }

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-neutral-900 text-[#c1ff72] shadow-lg hover:bg-neutral-800 hover:scale-110 transition-all duration-300 group"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={28} />
      <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-neutral-900 text-[#c1ff72] text-sm font-montserrat px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Chat with us
      </span>
    </a>
  );
};

export default WhatsAppButton;
