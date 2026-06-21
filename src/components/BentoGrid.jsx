import React from 'react';
import { useApp } from '../context/AppContext';

export const BentoGrid = ({ title, items }) => {
    const { playMedia, navigateTo } = useApp();

    if (!items || items.length === 0) return null;

    // We will place up to 3 items in our bento: 
    // Item 0 is the featured double-width card (aspect-video)
    // Item 1 & 2 are standard aspect-video cards
    const featuredMedia = items[0];
    const secondaryItems = items.slice(1, 3);

    return (
        <section className="space-y-4 text-left">
            <h2 className="font-headline-lg text-xl md:text-headline-lg font-bold text-white">
                {title}
            </h2>
            
            <div className="bento-grid">
                {/* Featured Double Card */}
                {featuredMedia && (
                    <div 
                        onClick={() => navigateTo(`#/${featuredMedia.type}/${featuredMedia.id}`)}
                        className="col-span-1 lg:col-span-2 aspect-video group cursor-pointer relative glass-surface rounded-2xl overflow-hidden border border-white/10"
                    >
                        <img 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                            src={featuredMedia.backdrop} 
                            alt={featuredMedia.title}
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent p-6 md:p-8 flex flex-col justify-end text-left">
                            <h3 className="font-display-md text-2xl md:text-display-md font-extrabold leading-tight text-white uppercase drop-shadow-md">
                                {featuredMedia.title}
                            </h3>
                            <p className="text-white/70 text-xs md:text-sm max-w-md mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 line-clamp-2">
                                {featuredMedia.overview}
                            </p>
                        </div>
                    </div>
                )}

                {/* Regular Bento Cards */}
                {secondaryItems.map((media) => (
                    <div 
                        key={media.id}
                        onClick={() => navigateTo(`#/${media.type}/${media.id}`)}
                        className="aspect-video glass-surface rounded-2xl overflow-hidden relative group cursor-pointer border border-white/10"
                    >
                        <img 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                            src={media.backdrop} 
                            alt={media.title}
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    playMedia(media);
                                }}
                                className="bg-primary-container text-white p-4 rounded-full hover:scale-110 active:scale-95 transition-all flex items-center shadow-lg shadow-primary-container/20"
                            >
                                <span className="material-symbols-outlined text-3xl fill" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    play_arrow
                                </span>
                            </button>
                        </div>
                        {/* Overlay Title on Small Screens */}
                        <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent lg:hidden text-left">
                            <span className="text-white font-bold text-xs">{media.title}</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};
