import React, { useEffect, useState } from 'react';
import { ArrowRight, Play } from 'lucide-react';
import axios from 'axios';
import { logPerformance, measureLatency, PERF_CONFIG } from '../utils/analytics';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const Hero = () => {
  const [scrollY, setScrollY] = useState(0);
  const [content, setContent] = useState({
    badge: 'Now Signing',
    title1: '808',
    title2: 'RECORDS',
    subtitle: 'A new era of music, driven by 808',
    button1: 'Explore Artists',
    button2: 'View Releases'
  });

  useEffect(() => {
    const handleScroll = () => {
      measureLatency(100);
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        // Performance monitoring disabled
        // logPerformance();
        
        const response = await axios.get(`${BACKEND_URL}/api/content/site/hero`);
        if (response.data.content) {
          setContent({ ...content, ...response.data.content });
        }
      } catch (error) {
        console.error('Error fetching hero content:', error);
      }
    };
    fetchContent();
  }, []);

  const scrollToSection = (id) => {
    measureLatency(500);
    
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black pt-32 pb-40">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 md:top-20 left-10 md:left-20 w-64 h-64 md:w-96 md:h-96 bg-white/5 rounded-full blur-3xl" style={{ transform: `translateY(${scrollY * 0.3}px)` }} />
        <div className="absolute bottom-10 md:bottom-20 right-10 md:right-20 w-64 h-64 md:w-96 md:h-96 bg-white/3 rounded-full blur-3xl" style={{ transform: `translateY(${scrollY * 0.2}px)` }} />
      </div>

      <div className="container mx-auto px-6 md:px-8 relative z-10 w-full">
        <div className="max-w-6xl mx-auto w-full">
          <div className="mb-6 md:mb-10 lg:mb-12 animate-fade-in-up flex justify-center">
            <div className="inline-flex items-center gap-2 md:gap-3 px-3 md:px-5 py-1.5 md:py-2.5 rounded-full bg-white/5 border border-white/10">
              <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-white animate-pulse flex-shrink-0" />
              <span className="text-[0.6rem] sm:text-[0.65rem] md:text-xs text-white/60 uppercase tracking-[0.15em] md:tracking-[0.2em] font-medium whitespace-nowrap">{content.badge}</span>
            </div>
          </div>

          <div className="text-center mb-8 md:mb-12 lg:mb-16 animate-fade-in-up animation-delay-200">
            <h1 className="font-black leading-none tracking-tighter mb-0 hero-title-no-select">
              <span className="block text-white text-[4rem] sm:text-[6rem] md:text-[8rem] lg:text-[12rem] xl:text-[14rem]">{content.title1}</span>
              <span className="block text-white/10 -mt-6 sm:-mt-8 md:-mt-12 lg:-mt-16 xl:-mt-20 text-[4rem] sm:text-[6rem] md:text-[8rem] lg:text-[12rem] xl:text-[14rem]">
                {content.title2}
              </span>
            </h1>
          </div>

          <div className="max-w-2xl mx-auto text-center mb-8 md:mb-12 lg:mb-16 animate-fade-in-up animation-delay-400 px-4">
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/50 leading-relaxed font-light">
              {content.subtitle}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 lg:gap-6 animate-fade-in-up animation-delay-600 px-4">
            <button onClick={() => scrollToSection('leaderboard')} className="btn-sleek-large group w-full sm:w-auto">
              <Play className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 transition-transform group-hover:scale-110" fill="white" />
              <span className="text-sm md:text-base">{content.button1}</span>
            </button>
            <button onClick={() => scrollToSection('releases')} className="btn-sleek-outline group w-full sm:w-auto">
              <span className="text-sm md:text-base">{content.button2}</span>
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2 md:ml-3 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex absolute bottom-20 left-1/2 -translate-x-1/2 flex-col items-center gap-2 z-20">
        <span className="text-[0.65rem] text-white/30 uppercase tracking-widest">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent" />
      </div>
    </section>
  );
};

export default Hero;
