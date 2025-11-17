import React, { useState, useEffect } from 'react';
import { Instagram, Music as SpotifyIcon, ExternalLink, Play } from 'lucide-react';
import axios from 'axios';
import { logPerformance, measureLatency } from '../utils/analytics';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const LeaderboardModern = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState({
    badge: 'Our Artists',
    title: '808 Artist Roster',
    subtitle: '...from our 808 roster'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Performance monitoring disabled
        // logPerformance();
        // measureLatency(800);
        
        const [artistsRes, contentRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/content/artists`),
          axios.get(`${BACKEND_URL}/api/content/site/leaderboard`)
        ]);
        
        // measureLatency(500);
        
        const sortedArtists = artistsRes.data.sort((a, b) => b.popularityScore - a.popularityScore);
        setArtists(sortedArtists);
        
        if (contentRes.data.content) {
          setContent({ ...content, ...contentRes.data.content });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        console.error('Backend URL:', BACKEND_URL);
        console.error('Full error:', error.response?.data || error.message);
        // Keep default content if API fails
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Performance tracking disabled to prevent console violations
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     logPerformance();
  //   }, 3000);
  //   
  //   return () => clearInterval(interval);
  // }, []);

  const formatStreams = (streams) => {
    return (streams / 1000000).toFixed(2) + 'M';
  };

  return (
    <section id="leaderboard" className="py-20 md:py-32 bg-black relative overflow-hidden">
      <div className="container mx-auto px-6 md:px-8 relative z-10">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-16 md:mb-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
              <span className="text-xs text-white/60 uppercase tracking-[0.2em] font-medium">{content.badge}</span>
            </div>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-6">
              {content.title}
            </h2>
            <p className="text-base md:text-lg text-white/40 font-light leading-relaxed">
              {content.subtitle}
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            <p className="text-white/40 mt-4">Loading artists...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && artists.length === 0 && (
          <div className="text-center py-20">
            <p className="text-white/40 text-lg">No artists found.</p>
            <p className="text-white/20 text-sm mt-2">Check console for API errors.</p>
          </div>
        )}

        {/* Artist Grid */}
        {!loading && artists.length > 0 && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {artists.map((artist, index) => (
            <div
              key={artist.id}
              className="artist-card-modern card-rainbow-hover group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Artist Image */}
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-6">
                <img 
                  src={artist.image} 
                  alt={artist.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-60" />
                
                {/* Featured Badge - Only show if artist is featured */}
                {artist.featured && (
                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg">
                    <span className="text-xs font-black text-white uppercase tracking-wider">Featured</span>
                  </div>
                )}
              </div>

              {/* Artist Info */}
              <div className="px-2">
                <h3 className="text-2xl md:text-3xl font-black text-white mb-2 leading-tight group-hover:text-white/80 transition-colors">
                  {artist.name}
                </h3>
                <p className="text-sm text-white/40 uppercase tracking-[0.15em] mb-6 font-medium">
                  {artist.genre}
                </p>

                {/* Social Links with Rainbow Gradient */}
                <div className="flex items-center gap-3">
                  <a
                    href={artist.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-white/5 border border-white/10 hover:border-rainbow transition-all group/btn social-btn-rainbow"
                  >
                    <Instagram className="w-4 h-4 text-white/60 group-hover/btn:text-white transition-colors" />
                    <span className="text-xs text-white/60 group-hover/btn:text-white transition-colors font-medium uppercase tracking-wider">IG</span>
                  </a>
                  <a
                    href={artist.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-white/5 border border-white/10 hover:border-rainbow transition-all group/btn social-btn-rainbow"
                  >
                    <SpotifyIcon className="w-4 h-4 text-white/60 group-hover/btn:text-white transition-colors" />
                    <span className="text-xs text-white/60 group-hover/btn:text-white transition-colors font-medium uppercase tracking-wider">Spotify</span>
                  </a>
                  <a
                    href={artist.latestRelease}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-11 h-11 rounded-full bg-white hover:bg-white/90 transition-all group/btn"
                  >
                    <ExternalLink className="w-4 h-4 text-black" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </section>
  );
};

export default LeaderboardModern;
