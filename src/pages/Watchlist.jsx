import React from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../hooks/useLanguage';
import { NotFlixData } from '../data/catalog';


export const Watchlist = () => {
    const { watchlist, playMedia, toggleWatchlist, navigateTo } = useApp();
    const { t } = useLanguage();
    const watchlistItems = watchlist || [];

    return (
        <div className="px-4 md:px-edge-margin py-28 max-w-container-max mx-auto space-y-8 text-left min-h-[80vh]">
            <div>
                <h1 className="text-3xl md:text-headline-lg font-extrabold text-white">{t.watchlist.title}</h1>
                <p className="text-white/50 text-xs md:text-sm mt-1">
                    {t.watchlist.youHave}{' '}
                    <strong className="text-primary-container">{watchlistItems.length}</strong>{' '}
                    {watchlistItems.length === 1 ? t.watchlist.subtitle_one : t.watchlist.subtitle_other}
                </p>
            </div>

            {/* Watchlist Grid */}
            {watchlistItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center text-white/40">
                    <span className="material-symbols-outlined text-6xl mb-4 text-white/20">bookmark_border</span>
                    <h3 className="text-lg font-bold text-white/60 mb-2">{t.watchlist.emptyTitle}</h3>
                    <p className="text-xs md:text-sm max-w-xs mb-6">
                        {t.watchlist.emptyBody}
                    </p>
                    <button 
                        onClick={() => navigateTo('#/')}
                        className="px-6 py-2.5 btn-primary rounded-lg font-bold text-xs cursor-pointer shadow-lg active:scale-95"
                    >
                        {t.watchlist.browseContent}
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-gutter">
                    {watchlistItems.map(media => {
                        return (
                            <div 
                                key={media.id} 
                                className="group cursor-pointer aspect-[2/3] relative rounded-xl overflow-hidden border border-white/10 glass-surface premium-hover"
                                onClick={() => navigateTo(`#/${media.type || 'movie'}/${media.id}`)}
                            >
                                <img 
                                    src={media.poster || NotFlixData.getById(media.id)?.poster || 'https://via.placeholder.com/300x450?text=No+Image'} 
                                    alt={media.title} 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    loading="lazy"
                                />
                                {/* Watchlist Toggle Button */}
                                <button 
                                    onClick={(e) => { e.stopPropagation(); toggleWatchlist(media.id, media.type, media.poster, media.title); }}
                                    className="absolute top-2 right-2 glass-surface p-1.5 rounded-full border-white/40 hover:border-white active:scale-90 transition-all flex items-center text-white"
                                >
                                    <span className="material-symbols-outlined text-base md:text-lg">
                                        {watchlist.some(item => item.id === media.id) ? 'check' : 'bookmark_add'}
                                    </span>
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
export default Watchlist;
