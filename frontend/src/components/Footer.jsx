import React, { useState, useEffect } from 'react';
import { MessageCircle, Instagram, Twitter, Youtube, Cloud, Music, Mail, MapPin, Send } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const Footer = () => {
  const [content, setContent] = useState({
    email: 'submissions@808records.com',
    location: 'Long Branch, NJ'
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/content/site/contact`);
        if (response.data.content) {
          setContent({ ...content, ...response.data.content });
        }
      } catch (error) {
        console.error('Error fetching contact content:', error);
      }
    };
    fetchContent();
  }, []);

  const socialLinks = [
    { name: 'Instagram', icon: Instagram, url: 'https://www.instagram.com/808records/' },
    { name: 'Spotify', icon: Music, url: 'https://open.spotify.com/playlist/0fdKtPdObkF7hpHpjND7mQ?si=8d6de2270e934aee' },
    { name: 'SoundCloud', icon: Cloud, url: 'https://soundcloud.com/underground808' },
    { name: 'Discord', icon: MessageCircle, url: 'https://discord.gg/underground808' }
  ];

  const quickLinks = [
    { name: 'Leaderboard', href: '#leaderboard' },
    { name: 'Latest Releases', href: '#releases' },
    { name: 'About Us', href: '#about' },
    { name: 'Submit Demo', href: '#contact' }
  ];

  return (
    <footer className="bg-black border-t border-white/5 relative overflow-hidden">
      <div className="container mx-auto px-8 py-20 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Top section - different layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mb-16">
            {/* Brand */}
            <div className="lg:col-span-1">
              <p className="text-white/30 leading-relaxed font-light text-sm mb-6">
                Pioneering the future of music. Discover groundbreaking artists and exclusive releases.
              </p>
              <div className="flex items-center gap-2 text-white/30 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{content.location}</span>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white/50 font-medium text-sm mb-6 uppercase tracking-widest">Contact</h3>
              <ul className="space-y-4">
                <li>
                  <a href={`mailto:${content.email}`} className="text-white/30 hover:text-white transition-colors flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4" />
                    {content.email}
                  </a>
                </li>
                <li className="text-white/30 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{content.location}</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white/50 font-medium text-sm mb-6 uppercase tracking-widest">Navigation</h3>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.href} 
                      className="text-white/30 hover:text-white transition-colors inline-block text-sm font-light"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-white/50 font-medium text-sm mb-6 uppercase tracking-widest">Newsletter</h3>
              <p className="text-white/30 mb-4 text-sm font-light">
                Get the latest releases and news.
              </p>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-full text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-all text-sm font-light"
                />
                <button
                  type="submit"
                  className="px-4 py-3 bg-white rounded-full hover:bg-white/90 transition-all"
                >
                  <Send className="w-4 h-4 text-black" />
                </button>
              </form>
            </div>
          </div>

          {/* Social Links - cleaner horizontal layout */}
          <div className="border-t border-white/5 pt-12 mb-12">
            <div className="flex flex-wrap justify-center gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className="group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-300 group-hover:bg-white group-hover:border-white">
                    <social.icon className="w-4 h-4 text-white/60 group-hover:text-black transition-colors" />
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center text-white/20 text-xs font-light">
            <p>© {new Date().getFullYear()} 808 Records. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
