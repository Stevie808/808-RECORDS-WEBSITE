import React, { useState, useEffect } from 'react';
import { Play, Calendar, Clock } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const Releases = () => {
  const [releases, setReleases] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState({
    badge: 'New Music',
    title: 'Latest Releases',
    subtitle: 'Fresh tracks, EPs, and albums from our talented roster.'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [releasesRes, contentRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/content/releases`),
          axios.get(`${BACKEND_URL}/api/content/site/releases`)
        ]);
        
        const sortedReleases = releasesRes.data.sort((a, b) => 
          new Date(b.releaseDate) - new Date(a.releaseDate)
        );
        setReleases(sortedReleases);
        
        if (contentRes.data.content) {
          setContent({ ...content, ...contentRes.data.content });
        }
      } catch (error) {
        console.error('Error fetching releases:', error);
        console.error('Backend URL:', BACKEND_URL);
        console.error('Full error:', error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const filteredReleases = filter === 'all' 
    ? releases 
    : releases.filter(r => r.type.toLowerCase() === filter);

  // Sort to show featured releases first, then by date
  const sortedFilteredReleases = [...filteredReleases].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return new Date(b.releaseDate) - new Date(a.releaseDate);
  });

  return (
    <section id="releases" className="py-32 bg-black relative overflow-hidden">
      {/* Subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent" />

      <div className="container mx-auto px-8 relative z-10">
        {/* Different header layout */}
        <div className="max-w-6xl mx-auto mb-20">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                <span className="text-xs text-white/60 uppercase tracking-widest">{content.badge}</span>
              </div>
              <h2 className="text-6xl md:text-7xl font-black text-white mb-6">
                {content.title}
              </h2>
              <p className="text-lg text-white/40 font-light">
                {content.subtitle}
              </p>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-3 flex-wrap">
              {['all', 'album', 'ep', 'single'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-6 py-2.5 rounded-full font-medium text-sm uppercase tracking-wider transition-all ${
                    filter === type
                      ? 'bg-white text-black'
                      : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/10'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            <p className="text-white/40 mt-4">Loading releases...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && releases.length === 0 && (
          <div className="text-center py-20">
            <p className="text-white/40 text-lg">No releases found.</p>
            <p className="text-white/20 text-sm mt-2">Check console for API errors.</p>
          </div>
        )}

        {/* Clean uniform grid layout */}
        {!loading && releases.length > 0 && (
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedFilteredReleases.map((release, index) => (
              <a
                key={release.id}
                href={release.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`release-card-sleek card-rainbow-hover group block ${
                  release.featured ? 'lg:col-span-2 lg:row-span-1' : ''
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-4">
                  {/* Cover */}
                  <div className="relative aspect-square rounded-2xl overflow-hidden mb-6">
                    <img 
                      src={release.coverArt} 
                      alt={`${release.title} by ${release.artist}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/500x500/1a1a1a/ffffff?text=' + release.title;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Featured Badge */}
                    {release.featured && (
                      <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg">
                        <span className="text-xs font-black text-white uppercase tracking-wider">Featured</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-medium uppercase tracking-wider">
                      {release.type}
                    </span>
                    <span className="text-white/30 text-xs">•</span>
                    <span className="text-white/40 text-xs">{release.tracks} {release.tracks === 1 ? 'track' : 'tracks'}</span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-white/80 transition-colors">
                    {release.title}
                  </h3>
                  <p className="text-white/40 mb-4 font-medium">{release.artist}</p>

                  <div className="flex items-center gap-4 text-sm text-white/30">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(release.releaseDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{release.duration}</span>
                    </div>
                  </div>
                </div>
                </div>
              </a>
            ))}
          </div>
        </div>
        )}
      </div>
    </section>
  );
};

export default Releases;
