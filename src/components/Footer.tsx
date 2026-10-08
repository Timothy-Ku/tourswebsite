import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Globe } from 'lucide-react';

interface FooterProps {
  onNavigate: (hash: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  const handleLinkClick = (hash: string) => {
    onNavigate(hash);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#1C2421] text-stone-300 border-t border-white/5 pt-16 pb-8 select-none font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        {/* Brand Column */}
        <div className="space-y-4">
          <button
            onClick={() => handleLinkClick('#/')}
            className="flex items-center gap-2 font-sans text-2xl font-black tracking-tight text-white hover:text-[#C5A880] transition-colors cursor-pointer"
          >
            {/* Sailboat/Wilderness SVG Matching the theme */}
            <svg className="w-6 h-6 text-[#C5A880]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 21h16a1 1 0 0 0 .8-.4l2-3A1 1 0 0 0 22 17h-2.5L12 3 4.5 17H2a1 1 0 0 0-.8.6l2 3A1 1 0 0 0 4 21z M12 5.5l5.5 10H6.5 L12 5.5z" />
            </svg>
            <span>KAGZ<span className="text-[#C5A880]">.</span></span>
          </button>
          <p className="text-xs sm:text-sm leading-relaxed text-stone-400">
            KAGZ is a premium travel company. We curate deeply memorable, custom wildlife safaris, tropical beach escapes, and rich cultural expeditions across East and Southern Africa.
          </p>
          <div className="pt-2 text-xs text-stone-400">
            <span>Nairobi Luxury District, Karen, Kenya</span>
          </div>
        </div>

        {/* Quick Navigation Mirror */}
        <div>
          <h3 className="font-serif text-lg font-bold text-white tracking-wider mb-4">Explore KAGZ</h3>
          <ul className="space-y-2.5 text-xs sm:text-sm">
            {[
              { label: 'Home', hash: '#/' },
              { label: 'Destinations', hash: '#/destinations' },
              { label: 'Tours & Experiences', hash: '#/tours' },
              { label: 'About Us', hash: '#/about' },
              { label: 'Travel Guide', hash: '#/guide' },
              { label: 'Gallery', hash: '#/gallery' },
              { label: 'Contact KAGZ', hash: '#/contact' },
            ].map((link) => (
              <li key={link.hash}>
                <button
                  onClick={() => handleLinkClick(link.hash)}
                  className="hover:text-[#C5A880] transition-colors cursor-pointer text-left font-semibold"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Featured African Countries */}
        <div>
          <h3 className="font-serif text-lg font-bold text-white tracking-wider mb-4">Destinations</h3>
          <ul className="space-y-2.5 text-xs sm:text-sm">
            {[
              { name: 'Kenya', id: 'kenya' },
              { name: 'Tanzania', id: 'tanzania' },
              { name: 'Zanzibar', id: 'zanzibar' },
              { name: 'Uganda', id: 'uganda' },
              { name: 'Rwanda', id: 'rwanda' },
              { name: 'South Africa', id: 'south-africa' },
            ].map((country) => (
              <li key={country.id}>
                <button
                  onClick={() => handleLinkClick(`#/destinations/${country.id}`)}
                  className="hover:text-[#C5A880] transition-colors cursor-pointer text-left font-semibold"
                >
                  {country.name} Safaris
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact & Newsletter */}
        <div className="space-y-6">
          <div>
            <h3 className="font-serif text-lg font-bold text-white tracking-wider mb-4">Newsletter</h3>
            <p className="text-xs text-stone-400 mb-3 leading-relaxed">
              Subscribe to receive curated travel inspiration, wildlife updates, and exclusive safari itineraries.
            </p>
            {subscribed ? (
              <div className="p-3 bg-[#C5A880]/10 text-xs text-[#C5A880] border border-[#C5A880]/20">
                Thank you! You have been subscribed successfully.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex border border-white/10 overflow-hidden">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent text-xs text-white px-3 py-2 w-full focus:outline-none placeholder-stone-500"
                />
                <button
                  type="submit"
                  className="p-2.5 bg-[#C5A880] text-[#1C2421] hover:bg-white transition-colors cursor-pointer"
                  aria-label="Submit newsletter subscription"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

          <div className="space-y-2.5 text-xs text-stone-400 border-t border-white/5 pt-4">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#C5A880]" />
              <span>+254 700 000000 (WhatsApp)</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#C5A880]" />
              <span>concierge@kagztravel.com</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-stone-500">
        <span>&copy; 2026 KAGZ. All rights reserved. Premium African Wilderness Safaris.</span>
        <div className="flex gap-6 mt-4 md:mt-0">
          <button onClick={() => handleLinkClick('#/about')} className="hover:text-stone-300">Privacy Policy</button>
          <button onClick={() => handleLinkClick('#/about')} className="hover:text-stone-300">Terms of Service</button>
          <span className="text-stone-700">|</span>
          <button onClick={() => handleLinkClick('#/admin')} className="hover:text-[#C5A880] text-[#C5A880]/80 font-bold transition-colors">Concierge Portal</button>
        </div>
      </div>
    </footer>
  );
}
