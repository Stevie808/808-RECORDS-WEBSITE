import React, { useState, useEffect } from 'react';
import { Zap, Users, Globe, Sparkles } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const About = () => {
  const [activeValue, setActiveValue] = useState(0);
  const [content, setContent] = useState({
    badge: 'Our Story',
    title: 'About Us',
    description: '808 Records is more than a label - it\'s a movement dedicated to fresh, emerging talent.',
    stats: {
      founded: '2025',
      artists: '5+',
      releases: '10+'
    }
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/content/site/about`);
        if (response.data.content) {
          setContent({ ...content, ...response.data.content });
        }
      } catch (error) {
        console.error('Error fetching about content:', error);
      }
    };
    fetchContent();
  }, []);

  const stats = [
    { value: content.stats?.founded || '2025', label: 'Founded', description: 'The year we started our journey' },
    { value: content.stats?.artists || '5+', label: 'Artists', description: 'Talented creators signed' },
    { value: content.stats?.releases || '10+', label: 'Releases', description: 'Tracks, EPs & Albums' }
  ];

  const values = [
    {
      icon: Zap,
      title: 'Innovation First',
      description: 'Pushing boundaries with cutting-edge sound, giving artists complete creative freedom to experiment and evolve.',
      color: 'from-yellow-500/20 to-orange-500/20'
    },
    {
      icon: Users,
      title: 'Artist Focused',
      description: 'Supporting artists with dedicated resources, industry connections, and the creative control they deserve.',
      color: 'from-purple-500/20 to-pink-500/20'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Connecting exceptional music with passionate audiences across continents and cultures worldwide.',
      color: 'from-blue-500/20 to-cyan-500/20'
    },
    {
      icon: Sparkles,
      title: 'Quality Driven',
      description: 'Every release is crafted to perfection, focusing on timeless artistry rather than fleeting trends.',
      color: 'from-green-500/20 to-emerald-500/20'
    }
  ];

  return (
    <section id="about" className="py-20 md:py-32 bg-black relative overflow-hidden">
      {/* Subtle gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="container mx-auto px-6 md:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header - stacked layout */}
          <div className="mb-16 md:mb-24">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
                <span className="text-xs text-white/60 uppercase tracking-[0.2em] font-medium">{content.badge}</span>
              </div>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-8 leading-tight">
                {content.title}
              </h2>
              <p className="text-xl md:text-2xl text-white/50 leading-relaxed font-light">
                {content.description}
              </p>
            </div>
          </div>

          {/* Stats - horizontal scrollable on mobile, grid on desktop */}
          <div className="mb-20 md:mb-32">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className="about-stat-modern group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3 group-hover:scale-110 transition-transform">
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-sm text-white/40 uppercase tracking-[0.2em] mb-2">{stat.label}</div>
                  <div className="text-xs text-white/20 font-light leading-relaxed">{stat.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Values - interactive cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="about-value-modern card-rainbow-hover group cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
                onMouseEnter={() => setActiveValue(index)}
              >
                <div className="relative">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-white/10 group-hover:border-white/20 group-hover:scale-110 transition-all duration-300">
                    <value.icon className="w-6 h-6 md:w-7 md:h-7 text-white/60 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-white mb-4 leading-tight">{value.title}</h3>
                  <p className="text-sm md:text-base text-white/40 leading-relaxed font-light">{value.description}</p>
                </div>

                {/* Hover indicator */}
                <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 w-2 h-2 rounded-full bg-white/20 group-hover:bg-white group-hover:scale-150 transition-all duration-300" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
