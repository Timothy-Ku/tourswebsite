import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, Globe, Star, MapPin, Facebook, Twitter, Linkedin, ChevronDown } from 'lucide-react';

interface NavbarProps {
  currentHash: string;
  onNavigate: (hash: string) => void;
}

export default function Navbar({ currentHash, onNavigate }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Primary links visible directly on the desktop header
  const primaryLinks = [
    { label: 'Home', hash: '#/' },
    { label: 'Destinations', hash: '#/destinations' },
    { label: 'Experiences', hash: '#/tours' },
  ];

  // Secondary links tucked cleanly inside the 'More' dropdown
  const secondaryLinks = [
    { label: 'Travel Guide', hash: '#/guide' },
    { label: 'Photo Gallery', hash: '#/gallery' },
    { label: 'About Us', hash: '#/about' },
    { label: 'Contact Us', hash: '#/contact' },
  ];

  // Full flat list for mobile navigation
  const mobileLinks = [
    { label: 'Home', hash: '#/' },
    { label: 'Destinations', hash: '#/destinations' },
    { label: 'Experiences', hash: '#/tours' },
    { label: 'Travel Guide', hash: '#/guide' },
    { label: 'Photo Gallery', hash: '#/gallery' },
    { label: 'About Us', hash: '#/about' },
    { label: 'Contact Us', hash: '#/contact' },
  ];

  const handleLinkClick = (hash: string) => {
    onNavigate(hash);
    setIsOpen(false);
    setIsMoreOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isActive = (hash: string) => {
    if (hash === '#/') {
      return currentHash === '#/' || currentHash === '';
    }
    return currentHash.startsWith(hash);
  };

  // Check if any of the secondary links are currently active to highlight the "More" button
  const isSecondaryActive = () => {
    return secondaryLinks.some(link => isActive(link.hash));
  };

  return (
    <div className="sticky top-0 z-50 select-none shadow-sm">
      {/* 1. QUIET TOP UTILITY BAR (Dark Charcoal from screenshot layout) */}
      <div className="bg-[#1C2421] text-stone-200 text-[10px] py-2.5 px-4 sm:px-6 lg:px-8 border-b border-white/5 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center font-sans tracking-widest text-[9px] uppercase font-semibold">
          {/* Left: Language & Socials */}
          <div className="flex items-center gap-6 text-white/80">
            <div className="flex items-center gap-1.5 border-r border-white/10 pr-6">
              <Globe className="w-3 h-3 text-[#C5A880]" />
              <button className="hover:text-[#C5A880] transition-colors">EN</button>
              <span className="text-white/20">|</span>
              <button className="hover:text-[#C5A880] transition-colors">ES</button>
            </div>
            
            <div className="flex items-center gap-3">
              <a href="#/" aria-label="Facebook" className="hover:text-[#C5A880] transition-colors"><Facebook className="w-3 h-3" /></a>
              <a href="#/" aria-label="Twitter" className="hover:text-[#C5A880] transition-colors"><Twitter className="w-3 h-3" /></a>
              <a href="#/" aria-label="LinkedIn" className="hover:text-[#C5A880] transition-colors"><Linkedin className="w-3 h-3" /></a>
            </div>
          </div>

          {/* Right: Quick Links */}
          <div className="flex items-center gap-6 text-white/80">
            <button 
              onClick={() => handleLinkClick('#/tours')}
              className="flex items-center gap-1 hover:text-[#C5A880] transition-colors text-left"
            >
              <Star className="w-3 h-3 text-amber-300 fill-current" />
              <span>Packages</span>
            </button>
            <span className="text-white/10">|</span>
            <button 
              onClick={() => handleLinkClick('#/contact')}
              className="flex items-center gap-1 hover:text-[#C5A880] transition-colors text-left"
            >
              <MapPin className="w-3 h-3 text-[#C5A880]" />
              <span>Location</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVBAR */}
      <header className="bg-white text-slate-800 border-b border-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo Group */}
            <div className="flex items-center">
              <button 
                onClick={() => handleLinkClick('#/')}
                className="flex items-center gap-2 font-sans text-2xl font-black tracking-tight text-[#1C2421] hover:opacity-90 cursor-pointer"
              >
                <svg className="w-7 h-7 text-[#C5A880]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 21h16a1 1 0 0 0 .8-.4l2-3A1 1 0 0 0 22 17h-2.5L12 3 4.5 17H2a1 1 0 0 0-.8.6l2 3A1 1 0 0 0 4 21z M12 5.5l5.5 10H6.5 L12 5.5z" />
                </svg>
                <span>KAGZ<span className="text-[#C5A880]">.</span></span>
              </button>
            </div>

            {/* Links center */}
            <nav className="hidden lg:flex items-center gap-8 relative">
              {primaryLinks.map((link) => (
                <button
                  key={link.hash}
                  onClick={() => handleLinkClick(link.hash)}
                  className={`text-xs font-bold tracking-widest uppercase transition-all py-2 cursor-pointer border-b-2 ${
                    isActive(link.hash)
                      ? 'text-[#C5A880] border-[#C5A880]'
                      : 'text-slate-500 border-transparent hover:text-[#C5A880] hover:border-[#C5A880]/30'
                  }`}
                >
                  {link.label}
                </button>
              ))}

              {/* Elegant 'More' Dropdown Trigger */}
              <div 
                className="relative" 
                ref={dropdownRef}
                onMouseEnter={() => setIsMoreOpen(true)}
                onMouseLeave={() => setIsMoreOpen(false)}
              >
                <button
                  onClick={() => setIsMoreOpen(!isMoreOpen)}
                  className={`text-xs font-bold tracking-widest uppercase transition-all py-2 flex items-center gap-1 cursor-pointer border-b-2 ${
                    isSecondaryActive() || isMoreOpen
                      ? 'text-[#C5A880] border-[#C5A880]'
                      : 'text-slate-500 border-transparent hover:text-[#C5A880]'
                  }`}
                  aria-expanded={isMoreOpen}
                  aria-haspopup="true"
                >
                  <span>More</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isMoreOpen ? 'rotate-180 text-[#C5A880]' : 'text-slate-400'}`} />
                </button>

                {/* Dropdown Menu Container */}
                {isMoreOpen && (
                  <div className="absolute left-0 mt-0.5 w-52 bg-white border border-stone-100 shadow-xl py-3 px-4 flex flex-col gap-3 z-50 rounded-none transition-all fade-in">
                    {secondaryLinks.map((link) => (
                      <button
                        key={link.hash}
                        onClick={() => handleLinkClick(link.hash)}
                        className={`text-left text-[11px] font-bold tracking-widest uppercase transition-colors cursor-pointer py-1 block ${
                          isActive(link.hash)
                            ? 'text-[#C5A880]'
                            : 'text-slate-500 hover:text-[#C5A880]'
                        }`}
                      >
                        {link.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* Action button right (Earthy Gold rounded-capsule) */}
            <div className="hidden sm:flex items-center">
              <button
                onClick={() => handleLinkClick('#/plan')}
                className="px-7 py-3 bg-[#C5A880] hover:bg-[#1C2421] text-[#1C2421] hover:text-white font-bold text-[10px] uppercase tracking-widest rounded-full transition-colors duration-300 shadow-sm cursor-pointer"
              >
                PLAN YOUR TRIP
              </button>
            </div>

            {/* Mobile menu trigger */}
            <div className="flex lg:hidden items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-slate-500 hover:text-slate-800 focus:outline-none cursor-pointer"
                aria-label="Toggle mobile menu"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isOpen && (
          <div className="lg:hidden bg-white border-t border-stone-100 shadow-inner">
            <div className="px-2 pt-2 pb-6 space-y-1">
              {mobileLinks.map((link) => (
                <button
                  key={link.hash}
                  onClick={() => handleLinkClick(link.hash)}
                  className={`block w-full text-left px-4 py-3 text-sm font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                    isActive(link.hash)
                      ? 'bg-orange-50 text-[#C5A880]'
                      : 'text-slate-600 hover:bg-stone-50 hover:text-[#C5A880]'
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-4 px-4">
                <button
                  onClick={() => handleLinkClick('#/plan')}
                  className="w-full text-center py-3.5 bg-[#C5A880] text-stone-900 font-bold text-xs uppercase tracking-widest rounded-full transition-colors cursor-pointer"
                >
                  PLAN YOUR TRIP
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
