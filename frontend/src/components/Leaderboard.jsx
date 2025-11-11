import React, { useState, useEffect } from 'react';
import { TrendingUp, Play } from 'lucide-react';
import { mockArtists } from '../mock';

const Leaderboard = () => {
  const [artists, setArtists] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    setTimeout(() => setArtists(mockArtists), 300);
  }, []);

  const formatStreams = (streams) => {
    return (streams / 1000000).toFixed(2) + 'M';
  };

  return (
    <section id="leaderboard" className="py-20 md:py-32 bg-black relative overflow-hidden">
      <div className="container mx-auto px-6 md:px-8 relative z-10">
        {/* Modern header */}
        <div className="max-w-7xl mx-auto mb-16 md:mb-24">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 md:gap-12">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
                <TrendingUp className="w-3.5 h-3.5 text-white/60" />
                <span className="text-xs text-white/60 uppercase tracking-[0.2em] font-medium">Live Rankings</span>
              </div>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[0.9] mb-4">
                Top<br />Artists
              </h2>
            </div>
            <div className="max-w-md">
              <p className="text-base md:text-lg text-white/40 font-light leading-relaxed">
                Real-time rankings based on monthly streams, engagement, and community support.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive cards with alternating layout */}
        <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
          {artists.map((artist, index) => (
            <div
              key={artist.id}
              className="group"
              style={{ animationDelay: `${index * 100}ms` }}
              onMouseEnter={() => setHoveredId(artist.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className={`leaderboard-card-modern ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}>
                {/* Image section */}
                <div className="relative w-full md:w-64 lg:w-80 h-48 md:h-64 flex-shrink-0 rounded-2xl md:rounded-3xl overflow-hidden">
                  <img 
                    src={artist.image} 
                    alt={artist.name} 
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* Play button overlay */}
                  <button className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                    hoveredId === artist.id ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center transform transition-transform hover:scale-110">
                      <Play className="w-6 h-6 text-black ml-1" fill="black" />
                    </div>
                  </button>

                  {/* Rank badge */}
                  <div className="absolute top-4 left-4 md:top-6 md:left-6">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white text-black flex items-center justify-center font-black text-lg md:text-xl shadow-xl">
                      {artist.rank}
                    </div>
                  </div>
                </div>

                {/* Info section */}
                <div className="flex-1 flex flex-col justify-between p-6 md:p-8 lg:p-10 min-h-[200px] md:min-h-0">
                  <div>
                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3 leading-tight group-hover:text-white/80 transition-colors">
                      {artist.name}
                    </h3>
                    <p className="text-sm md:text-base text-white/40 uppercase tracking-[0.2em] font-medium mb-6">
                      {artist.genre}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-white/60" />
                        <span className="text-4xl md:text-5xl lg:text-6xl font-black text-white">
                          {formatStreams(artist.streams)}
                        </span>
                      </div>
                      <p className="text-xs text-white/30 uppercase tracking-[0.2em]">Monthly Plays</p>
                    </div>

                    {/* Progress indicator */}
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-white/10 flex items-center justify-center">
                      <span className="text-xl md:text-2xl font-bold text-white/60">
                        {Math.round((artist.streams / mockArtists[0].streams) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Leaderboard;
