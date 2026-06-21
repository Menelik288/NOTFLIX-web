import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NotFlixData } from '../data/catalog';
import { RatingBadge } from '../components/RatingBadge';

export const TVShows = () => {
    const { playMedia, toggleWatchlist, watchlist, navigateTo } = useApp();
    const [selectedGenre, setSelectedGenre] = useState('All');

    const tvShows = NotFlixData.getTVShows();
    const genres = ['All', ...NotFlixData.getGenresList().filter(g => 
        tvShows.some(t => t.genres.includes(g))
    )];

    const filteredTV = selectedGenre === 'All' 
        ? tvShows 
        : tvShows.filter(t => t.genres.includes(selectedGenre));

    return (
        <div className="px-4 md:px-edge-margin py-28 max-w-container-max mx-auto space-y-8 text-left min-h-[80vh]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-headline-lg font-extrabold text-white">TV Series</h1>
                    <p className="text-white/50 text-xs md:text-sm mt-1">Discover binge-worthy television serials and documentaries.</p>
                </div>
                
                {/* Genre Filters Row */}
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 w-full md:w-auto scroll-smooth">
                    {genres.map(genre => (
                        <button
                            key={genre}
                            onClick={() => setSelectedGenre(genre)}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap cursor-pointer ${
                                selectedGenre === genre 
                                    ? 'bg-primary-container border-primary-container text-white shadow-lg shadow-primary-container/20' 
                                    : 'glass-surface border-white/10 text-white/70 hover:text-white'
                            }`}
                        >
                            {genre}
                        </button>
                    ))}
                </div>
            </div>

            {/* TV Series Grid */}
            {filteredTV.length === 0 ? (
                <div className="text-center py-20 text-white/40 text-sm">
                    No TV series found in this genre.
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-gutter">
                    {filteredTV.map(show => {
                        const isFav = watchlist.includes(show.id);
                        return (
                            <div 
                                key={show.id} 
                                className="group cursor-pointer aspect-[2/3] relative rounded-xl overflow-hidden border border-white/10 glass-surface premium-hover"
                            >
                                <img 
                                    src={show.poster} 
                                    alt={show.title} 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    loading="lazy"
                                />
                                {/* Hover Dropdown Details (Stitch screen) */}
                                <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 space-y-2 text-left">
                                    <h4 className="font-bold text-white text-xs md:text-sm leading-tight line-clamp-2">
                                        {show.title}
                                    </h4>
                                    <div className="flex items-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                                        <button 
                                            onClick={() => playMedia(show)}
                                            className="bg-white text-black p-1.5 rounded-full hover:bg-white/80 active:scale-90 transition-all flex items-center"
                                        >
                                            <span className="material-symbols-outlined text-base md:text-lg fill" style={{ fontVariationSettings: "'FILL' 1" }}>
                                                play_arrow
                                            </span>
                                        </button>
                                        <button 
                                            onClick={() => toggleWatchlist(show.id)}
                                            className="glass-surface p-1.5 rounded-full border-white/40 hover:border-white active:scale-90 transition-all flex items-center text-white"
                                        >
                                            <span className="material-symbols-outlined text-base md:text-lg">
                                                {isFav ? 'check' : 'add'}
                                            </span>
                                        </button>
                                        <button 
                                            onClick={() => navigateTo(`#/tv/${show.id}`)}
                                            className="glass-surface p-1.5 rounded-full border-white/40 hover:border-white active:scale-90 transition-all flex items-center text-white"
                                        >
                                            <span className="material-symbols-outlined text-base md:text-lg">
                                                info
                                            </span>
                                        </button>
                                    </div>
                                </div>
                                <RatingBadge rating={show.rating} className="absolute top-2 right-2" />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
export default TVShows;
