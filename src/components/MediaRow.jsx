import { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../hooks/useLanguage';
import { RatingBadge } from './RatingBadge';

export const MediaRow = ({ title, items, type = 'poster', showViewAll = false }) => {
    const { toggleWatchlist, watchlist, navigateTo, removeFromContinueWatching } = useApp();
    const { t } = useLanguage();
    const scrollContainerRef = useRef(null);

    // Mouse wheel horizontal scroll helper (from Stitch code spec)
    const handleWheel = (e) => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft += e.deltaY;
        }
    };

    if (!items || items.length === 0) return null;

    const safeItems = items.filter(Boolean);

    if (safeItems.length === 0) return null;

    return (
        <section className="space-y-3 text-left">
            <div className="flex flex-wrap justify-between items-end gap-2 media-row-header">
                <h2 className="font-headline-lg text-xl md:text-headline-lg font-bold text-white">
                    {title}
                </h2>
                {showViewAll && (
                    <button 
                        onClick={() => navigateTo('#/movies')} 
                        className="text-primary-container font-label-md hover:underline text-xs md:text-sm font-semibold"
                    >
                        {t.mediaRow.viewAll}
                    </button>
                )}
            </div>

            <div 
                ref={scrollContainerRef}
                onWheel={handleWheel}
                className="flex gap-4 md:gap-6 overflow-x-auto hide-scrollbar pb-4 scroll-smooth"
            >
                {safeItems.map((item, idx) => {
                    // Items in 'progress' mode are progress tracking objects
                    // (e.g. { id: 'the-last-signal', percent: 75, remaining: '15m remaining', season: 2, episode: 4 })
                    const media = type === 'progress' ? item : item;
                    if (!media) return null;

                    // 1. PROGRESS MODE CARDS (Continue Watching)
                    if (type === 'progress') {
                        return (
                            <div 
                                key={media.id + '-' + idx} 
                                className="flex-none w-44 md:w-56 lg:w-60 group cursor-pointer"
                                onClick={() => navigateTo(`#/${media.type || 'movie'}/${media.id}`)}
                            >
                                <div className="relative glass-surface rounded-xl overflow-hidden aspect-[2/3] border border-white/10 premium-hover">
                                    <img 
                                        src={media.backdrop || media.poster || 'https://via.placeholder.com/300x450?text=No+Image'} 
                                        alt={media.title} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                        loading="lazy" 
                                    />
                                    {/* X remove button */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeFromContinueWatching(media.id); }}
                                        className="absolute top-2 right-2 z-40 glass-surface rounded-full p-1.5 flex items-center justify-center hover:bg-white/10 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-base md:text-lg text-white">close</span>
                                    </button>
                                    {/* Progress overlay */}
                                    <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/20">
                                        {/* generate random percent 0-90 */}
                                        <div 
                                            className="h-full bg-red-600"
                                            style={{ width: `${media.percent ?? 75}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="mt-2 text-left">
                                    <h3 className="font-headline-sm text-sm md:text-headline-sm font-bold text-white line-clamp-1">
                                        {media.title || item.title || 'Untitled Title'}
                                    </h3>
                                    <p className="text-on-surface-variant text-[10px] md:text-label-md uppercase font-semibold text-white/50">
                                        {item.season ? `S${item.season} : E${item.episode}` : (media.type === 'tv' ? 'Series' : 'Movie')}
                                    </p>
                                </div>
                            </div>
                        );
                    }

                    // 2. LATEST RELEASE CARDS
                    if (type === 'latest') {
                        return (
                            <div 
                                key={media.id} 
                                className="flex-none w-[240px] md:w-[320px] glass-surface rounded-xl overflow-hidden group cursor-pointer border border-white/10"
                                onClick={() => navigateTo(`#/${media.type}/${media.id}`)}
                            >
                                <div className="relative glass-surface rounded-xl overflow-hidden aspect-video border border-white/10 premium-hover">
                                    <img 
                                        className="w-full h-full object-cover" 
                                        src={media.backdrop || media.poster || 'https://via.placeholder.com/640x360?text=No+Image'}
                                        alt={media.title}
                                        loading="lazy"
                                    />
                                    {/* Watchlist toggle button */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleWatchlist(media.id, media.type, media.poster, media.title, media.rating); }}
                                        className="absolute top-2 right-2 glass-surface p-1.5 rounded-full border-white/40 hover:border-white transition-all flex items-center text-white"
                                    >
                                        <span className="material-symbols-outlined text-base md:text-lg">                                        {watchlist.some(w => String(w.id) === String(media.id)) ? 'check' : 'bookmark_add'}</span>
                                    </button>
                                    <RatingBadge rating={media.rating} className="absolute top-2 left-2" />
                                </div>
                                <div className="p-4 space-y-1 text-left">
                                    <div className="flex justify-between items-center text-[10px] md:text-xs">
                                        <span className="text-primary font-bold">{media.tag || 'New Release'}</span>
                                        <span className="text-on-surface-variant font-medium">{media.year || ''}</span>
                                    </div>
                                    <h4 className="font-headline-sm text-xs md:text-sm font-bold text-white line-clamp-1">
                                        {media.title}
                                    </h4>
                                </div>
                            </div>
                        );
                    }

                    // 3. POSTER CARDS (Default - Trending / Movies)
                    return (
                        <div 
                            key={media.id} 
                            className="flex-none w-44 md:w-56 lg:w-60 group cursor-pointer relative"
                            onClick={() => navigateTo(`#/${media.type}/${media.id}`)}
                        >
                            {/* Image */}
                            <div className="relative glass-surface rounded-xl overflow-hidden aspect-[2/3] border border-white/10 premium-hover">
                                <img 
                                    className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-110" 
                                    src={media.poster || 'https://via.placeholder.com/300x450?text=No+Image'} 
                                    alt={media.title}
                                    loading="lazy"
                                />
                                {/* Watchlist Toggle Button */}
                                <button 
                                    onClick={(e) => { e.stopPropagation(); toggleWatchlist(media.id, media.type, media.poster, media.title, media.rating); }}
                                    className="absolute top-2 right-2 glass-surface p-1.5 rounded-full border-white/40 hover:border-white active:scale-90 transition-all flex items-center text-white"
                                >
                                    <span className="material-symbols-outlined text-base md:text-lg">
                                        {watchlist.some(w => String(w.id) === String(media.id)) ? 'check' : 'bookmark_add'}
                                    </span>
                                </button>
                                {/* Rating Badge */}
                                <RatingBadge rating={media.rating} className="absolute top-2 left-2" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};
