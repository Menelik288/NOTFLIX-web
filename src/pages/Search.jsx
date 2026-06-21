import React, { useState, useEffect, useCallback } from 'react';
import { TMDBService, normalizeListResponse } from '../services/tmdb';
import { useApp } from '../context/AppContext';
import debounce from 'lodash/debounce';

export const Search = () => {
    const { navigateTo } = useApp();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Filters
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [availableGenres, setAvailableGenres] = useState([]);
    const [filters, setFilters] = useState({
        type: 'all',
        genres: [],
        providers: [],
        year: '',
        rating: 0
    });

    const AVAILABLE_PROVIDERS = [
        { id: 8, name: 'Netflix' },
        { id: 1899, name: 'HBO Max' },
        { id: 337, name: 'Disney+' },
        { id: 9, name: 'Amazon Prime' },
        { id: 350, name: 'Apple TV+' },
        { id: 15, name: 'Hulu' },
        { id: 531, name: 'Paramount+' },
        { id: 386, name: 'Peacock' },
        { id: 283, name: 'Crunchyroll' },
        { id: 43, name: 'Starz' },
        { id: 37, name: 'Showtime' },
        { id: 528, name: 'AMC+' }
    ];

    // Load initial query from URL
    useEffect(() => {
        const hash = window.location.hash;
        if (hash.includes('?')) {
            const params = new URLSearchParams(hash.split('?')[1]);
            const q = params.get('q');
            if (q) setQuery(decodeURIComponent(q));
        }
    }, []);

    // Load Genres on mount
    useEffect(() => {
        const loadGenres = async () => {
            const genres = normalizeListResponse(await TMDBService.getGenres());
            setAvailableGenres(genres);
        };
        loadGenres();
    }, []);

    // Perform Search
    const executeSearch = async (searchQuery, currentFilters) => {
        setLoading(true);
        try {
            const data = normalizeListResponse(await TMDBService.searchMedia(searchQuery, currentFilters));
            // Remove any AI‑related titles (case‑insensitive)
            const filtered = data.filter(item => {
                const title = (item.title || '').toLowerCase();
                return !title.includes('ai');
            });
            setResults(filtered);
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setLoading(false);
        }
    };

    // Debounced search
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSearch = useCallback(
        debounce((q, f) => executeSearch(q, f), 500),
        []
    );

    // Trigger search when query or filters change
    useEffect(() => {
        // If empty query and no filters, just clear
        if (!query.trim() && filters.type === 'all' && filters.genres.length === 0 && filters.providers.length === 0 && !filters.year && !filters.rating) {
            setResults([]);
            return;
        }
        
        debouncedSearch(query, filters);
        
        return () => debouncedSearch.cancel();
    }, [query, filters, debouncedSearch]);

    const handleGenreToggle = (genreId) => {
        setFilters(prev => ({
            ...prev,
            genres: prev.genres.includes(genreId) ? [] : [genreId]
        }));
    };

    const handleProviderToggle = (providerId) => {
        setFilters(prev => ({
            ...prev,
            providers: prev.providers.includes(providerId) ? [] : [providerId]
        }));
    };

    const handleClearFilters = () => {
        setFilters({
            type: 'all',
            genres: [],
            providers: [],
            year: '',
            rating: 0
        });
        setIsFilterOpen(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-black/80 to-black/50 backdrop-blur-xl text-white pt-24 pb-32 px-6 lg:px-12 relative">
            {/* Top Bar Area */}
            <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row items-center gap-4">
                <h1 className="text-4xl font-black tracking-tight">Search</h1>
                
                <div className="flex-1 flex items-center gap-3 w-full md:ml-8">
                    {/* Search Input Area */}
                    <div className="relative flex-1 flex items-center group">
                        <span className="material-symbols-outlined absolute left-5 text-white/50 text-2xl transition-colors group-focus-within:text-primary">search</span>
                        <input 
                            type="text" 
                            placeholder="Type to search movies, TV shows..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-primary/50 focus:bg-white/10 focus:ring-4 focus:ring-primary/20 focus:ring-2 transition-all shadow-xl backdrop-blur-md text-lg"
                        />
                        {query && (
                            <button 
                                onClick={() => setQuery('')}
                                className="absolute right-5 text-white/40 hover:text-white transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        )}
                    </div>
                    
                    {/* Explicit Filter Button */}
                     <button
                         onClick={() => setIsFilterOpen(!isFilterOpen)}
                         className={`py-5 px-8 rounded-2xl border transition-all shadow-xl backdrop-blur-md flex items-center justify-center gap-3 font-bold text-lg whitespace-nowrap hover:scale-105 ${
                             isFilterOpen || filters.genres.length > 0 || filters.providers.length > 0 || filters.year || filters.rating > 0 || filters.type !== 'all' 
                             ? 'bg-primary border-primary text-on-primary' 
                             : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/30'
                         }`}
                     >
                        <span className="material-symbols-outlined">tune</span>
                        Filters
                        {(filters.genres.length > 0 || filters.providers.length > 0 || filters.year || filters.rating > 0 || filters.type !== 'all') && (
                            <span className="bg-white text-black text-xs px-2 py-0.5 rounded-full ml-1">Active</span>
                        )}
                    </button>
                </div>
            </div>

            {/* Glassmorphism Filter Panel */}
            {isFilterOpen && (
                <div className="max-w-7xl mx-auto mb-10 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                    {/* Subtle noise/gradient background for premium feel */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                    
                    <div className="relative z-10 space-y-8">
                        <div className="flex justify-between items-center border-b border-white/10 pb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">filter_list</span>
                                Refine Results
                            </h2>
                            <button onClick={handleClearFilters} className="text-sm font-semibold text-white/50 hover:text-white transition-colors">
                                Clear All
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Type Filter */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">Content Type</h3>
                                <div className="flex bg-black/40 rounded-xl p-1 border border-white/5">
                                    {['all', 'movie', 'tv'].map(t => (
                                        <button 
                                            key={t}
                                            onClick={() => setFilters(prev => ({ ...prev, type: t }))}
                                            className={`flex-1 py-2 text-sm font-bold rounded-lg capitalize transition-all ${filters.type === t ? 'bg-white/10 text-white shadow-md' : 'text-white/50 hover:text-white/80'}`}
                                        >
                                            {t === 'all' ? 'All' : t === 'tv' ? 'TV Shows' : 'Movies'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Year Filter */}
                            <div className="space-y-3">
                          <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">Release Year</h3>
                        <input
                            type="number"
                            placeholder="e.g. 2024"
                            value={filters.year}
                            onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-all"
                        />
  <select
    value={filters.year}
    onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-white/30 transition-all"
  >
    <option value="">Any Year</option>
    {Array.from({ length: 100 }, (_, i) => {
      const yr = new Date().getFullYear() - i;
      return (
        <option key={yr} value={yr}>{yr}</option>
      );
    })}
  </select>
</div>

                            {/* Rating Filter */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">Minimum Rating</h3>
                                <div className="flex bg-black/40 rounded-xl p-1 border border-white/5">
                                    {[0, 4, 6, 8].map(r => (
                                        <button 
                                            key={r}
                                            onClick={() => setFilters(prev => ({ ...prev, rating: r }))}
                                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${filters.rating === r ? 'bg-yellow-500/20 text-yellow-500 shadow-md' : 'text-white/50 hover:text-white/80'}`}
                                        >
                                            {r === 0 ? 'Any' : `${r}+`}
                                            {r > 0 && <span className="material-symbols-outlined text-[14px]">star</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Genre Filter */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">Genres</h3>
                            <div className="flex flex-wrap gap-2">
                                {availableGenres.map(genre => (
                                    <button
                                        key={genre.id}
                                        onClick={() => handleGenreToggle(genre.id)}
                                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                                            filters.genres.includes(genre.id) 
                                            ? 'bg-primary border-primary text-on-primary shadow-[0_0_15px_rgba(229,9,20,0.4)]' 
                                            : 'bg-black/40 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        {genre.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Productions Filter */}
                        <div className="space-y-3 lg:col-span-3 border-t border-white/10 pt-8 mt-2">
                            <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">Productions / Streaming</h3>
                            <div className="flex flex-wrap gap-3">
                                {AVAILABLE_PROVIDERS.map(prov => (
                                    <button
                                        key={prov.id}
                                        onClick={() => handleProviderToggle(prov.id)}
                                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                                            filters.providers.includes(prov.id) 
                                            ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                                            : 'bg-black/40 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        {prov.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Results Area */}
            <div className="max-w-7xl mx-auto">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : results.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                        {results.map((item) => (
                            <div 
                                key={item.id} 
                                onClick={() => navigateTo(`#/${item.type}/${item.id}`)}
                                className="group relative rounded-xl overflow-hidden cursor-pointer aspect-[2/3] bg-white/10 border border-white/10 backdrop-blur-lg premium-hover opacity-90 hover:opacity-100"
                            >
                                <img 
                                    src={item.poster} 
                                    alt={item.title} 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    loading="lazy"
                                />
                                {/* Unified Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 transition-opacity duration-300">
                                    <h3 className="text-white font-bold text-sm md:text-base leading-tight mb-2 line-clamp-2 drop-shadow-md">{item.title}</h3>
                                    <div className="flex items-center gap-2 text-xs text-white/70">
                                        <span className="flex items-center gap-0.5 text-yellow-500 font-bold">
                                            <span className="material-symbols-outlined text-sm">star</span> {item.rating}
                                        </span>
                                        <span>•</span>
                                        <span>{item.year}</span>
                                        <span>•</span>
                                        <span className="uppercase">{item.type}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    query || filters.genres.length > 0 || filters.providers.length > 0 || filters.year || filters.rating > 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center">
                            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                                <span className="material-symbols-outlined text-4xl text-white/30">search_off</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">No results found</h3>
                            <p className="text-white/50 max-w-md">
                                We couldn't find any movies or TV shows matching your criteria. Try adjusting your filters or searching for a different title.
                            </p>
                            <button 
                                onClick={handleClearFilters}
                                className="mt-8 px-6 py-3 rounded-full bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors border border-white/10"
                            >
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 text-center opacity-50">
                            <span className="material-symbols-outlined text-6xl text-white/20 mb-4">movie_filter</span>
                            <h3 className="text-xl font-medium text-white/50">Search our entire catalog</h3>
                            <p className="text-white/30 text-sm mt-2">Use the filters above to find your next favorite movie or series.</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default Search;
