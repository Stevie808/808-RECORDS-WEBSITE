import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
    
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [isMobileMenuOpen]);

  const scrollToSection = (id) => {
    // Get the target scroll position before closing menu
    const element = document.getElementById(id);
    if (!element) return;
    
    // Get element position relative to document
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    
    // Close the menu which will restore scroll
    setIsMobileMenuOpen(false);
    
    // Wait for body styles to be cleared and scroll to be restored
    setTimeout(() => {
      window.scrollTo({ top: elementPosition, behavior: 'smooth' });
    }, 150);
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-black/95 backdrop-blur-2xl border-b border-white/5' : 'bg-transparent'}`}>
        <div className="container mx-auto px-6 md:px-8 py-5 md:py-6">
          <div className="flex items-center justify-between">
            {/* Empty space for symmetry on desktop, hidden on mobile */}
            <div className="hidden md:block w-8" />

            {/* Desktop Navigation - Centered */}
            <nav className="hidden md:flex items-center justify-center gap-10 flex-1">
              <button onClick={() => scrollToSection('leaderboard')} className="nav-link-sleek">Roster</button>
              <button onClick={() => scrollToSection('releases')} className="nav-link-sleek">Releases</button>
              <button onClick={() => scrollToSection('about')} className="nav-link-sleek">About</button>
              <button onClick={() => scrollToSection('contact')} className="btn-sleek-minimal">Submit Demo</button>
            </nav>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-white p-2 hover:bg-white/5 rounded-full transition-all ml-auto z-[60]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Fullscreen overlay - Outside header */}
      {isMobileMenuOpen && (
        <>
          {/* Close X button - Top right corner with highest z-index */}
          <button
            className="md:hidden fixed top-6 right-6 z-[70] text-white p-3 hover:bg-white/10 rounded-full transition-all"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={28} />
          </button>
          
          {/* Overlay */}
          <div 
            className="md:hidden fixed inset-0 bg-black z-[55] flex items-center justify-center"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <nav 
              className="flex flex-col items-center justify-center gap-8 px-6"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => scrollToSection('leaderboard')} 
                className="text-white/60 text-2xl font-bold hover:text-white transition-colors"
              >
                Roster
              </button>
              <button 
                onClick={() => scrollToSection('releases')} 
                className="text-white/60 text-2xl font-bold hover:text-white transition-colors"
              >
                Releases
              </button>
              <button 
                onClick={() => scrollToSection('about')} 
                className="text-white/60 text-2xl font-bold hover:text-white transition-colors"
              >
                About
              </button>
              <button 
                onClick={() => scrollToSection('contact')} 
                className="btn-sleek-large mt-4"
              >
                Submit Demo
              </button>
            </nav>
          </div>
        </>
      )}
    </>
  );
};

export default Header;
