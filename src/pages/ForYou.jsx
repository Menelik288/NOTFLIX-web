import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../hooks/useLanguage';
import { TMDBService } from '../services/tmdb';
import { RecommendationEngine } from '../services/recommendationEngine';

const LOCAL_STORAGE_SUPPRESSED_KEY = 'notflix_suppressed_recommendations';

const readSuppressedIds = () => {
    try {
        const raw = localStorage.getItem(LOCAL_STORAGE_SUPPRESSED_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(parsed)) throw new Error('Invalid suppressed recommendations cache');
        return parsed.map(id => String(id)).filter(Boolean);
    } catch (error) {
        console.error("Error reading suppressed recommendations:", error);
        localStorage.removeItem(LOCAL_STORAGE_SUPPRESSED_KEY);
        return [];
    }
};

const writeSuppressedIds = (ids) => {
    const normalized = Array.from(new Set(ids.map(id => String(id)).filter(Boolean)));
    localStorage.setItem(LOCAL_STORAGE_SUPPRESSED_KEY, JSON.stringify(normalized));
    return normalized;
};

export const ForYou = () => {
    const { user, watchlist, continueWatching, navigateTo, addNotification } = useApp();
    const { t } = useLanguage();
    const [feedItems, setFeedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const feedContainerRef = useRef(null);

    // Default volume state for all trailers
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        const loadFeed = async () => {
            setLoading(true);
            try {
                let suppressedIds = readSuppressedIds();
                
                let allItems = [];
                
                if (user) {
                    allItems = await RecommendationEngine.buildFeed(continueWatching, watchlist, suppressedIds, 50);
                } else {
                    allItems = await RecommendationEngine.buildTrendingFallback(suppressedIds);
                }

                if (!Array.isArray(allItems) || allItems.length === 0) {
                    allItems = await RecommendationEngine.buildTrendingFallback([]);
                }

                const safeItems = Array.isArray(allItems) ? allItems.filter(Boolean) : [];
                setFeedItems(safeItems);
            } catch (error) {
                console.error("Error building For You feed:", error);
                try {
                    const fallbackItems = await RecommendationEngine.buildTrendingFallback([]);
                    setFeedItems(Array.isArray(fallbackItems) ? fallbackItems.filter(Boolean) : []);
                } catch (fallbackError) {
                    console.error("Error loading For You fallback:", fallbackError);
                    setFeedItems([]);
                }
            } finally {
                setLoading(false);
            }
        };
        
        loadFeed();
    }, [user, watchlist, continueWatching]);

    // Keyboard navigation listeners
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!feedContainerRef.current) return;
            const container = feedContainerRef.current;
            const itemHeight = container.clientHeight;
            
            if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'PageDown') {
                e.preventDefault();
                container.scrollBy({ top: itemHeight, behavior: 'smooth' });
            } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'PageUp') {
                e.preventDefault();
                container.scrollBy({ top: -itemHeight, behavior: 'smooth' });
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const scrollNext = () => {
        if (feedContainerRef.current) {
            feedContainerRef.current.scrollBy({ top: feedContainerRef.current.clientHeight, behavior: 'smooth' });
        }
    };
    
    const scrollPrev = () => {
        if (feedContainerRef.current) {
            feedContainerRef.current.scrollBy({ top: -feedContainerRef.current.clientHeight, behavior: 'smooth' });
        }
    };

    const handleWatched = (id) => {
        if (!id) return;
        let suppressedIds = readSuppressedIds();

        const normalizedId = String(id);
        if (!suppressedIds.includes(normalizedId)) {
            suppressedIds.push(normalizedId);
            writeSuppressedIds(suppressedIds);
        }
        
        setFeedItems(prev => prev.filter(item => item.id?.toString() !== id.toString()));
        addNotification("Marked as Watched", "We won't recommend this title again.", "visibility_off");
    };

    return (
        <div className="w-full min-h-screen bg-black pt-24 pb-12 px-4 flex flex-col items-center relative">
            
            {/* Logged Out Fallback Banner */}
            {!user && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-lg pointer-events-auto">
                    <div className="glass-panel px-6 py-4 rounded-2xl border border-white/20 shadow-2xl flex items-center justify-between animate-fade-in-up bg-black/60 backdrop-blur-xl">
                        <div className="text-left">
                            <h3 className="text-white font-bold text-sm">{t.forYou.personalize}</h3>
                            <p className="text-white/60 text-xs mt-1">{t.forYou.personalizeBody}</p>
                        </div>
                        <button onClick={() => navigateTo('#/')} className="btn-primary px-4 py-2 rounded-xl text-xs font-bold shrink-0">{t.forYou.signIn}</button>
                    </div>
                </div>
            )}
            
            {loading ? (
                <div className="flex-1 w-full flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 border-4 border-white/10 border-t-primary-container rounded-full animate-spin shadow-[0_0_15px_rgba(229,9,20,0.5)]"></div>
                    <p className="text-white/50 font-bold text-sm tracking-widest uppercase">{t.forYou.buildingFeed}</p>
                </div>
            ) : feedItems.length > 0 ? (
                <div className="relative w-full max-w-[450px] md:max-w-4xl mx-auto flex items-center justify-center">
                    
                    {/* Framed Container for Desktop Balance - Intermediate height */}
                    <div 
                        ref={feedContainerRef}
                        className="w-full aspect-[9/16] md:aspect-[16/10] max-h-[85vh] md:h-[82vh] overflow-y-scroll snap-y snap-mandatory no-scrollbar relative rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10 bg-black"
                    >
                        {feedItems.map((item, idx) => (
                            <FeedItem 
                                key={`${item.id}-${idx}`} 
                                item={item} 
                                onWatched={() => handleWatched(item.id)}
                                navigateTo={navigateTo}
                                isMuted={isMuted}
                                toggleMute={() => setIsMuted(!isMuted)}
                            />
                        ))}
                    </div>

                    {/* Fixed Navigation Controls for Desktop */}
                    <div className="hidden md:flex absolute -right-20 top-1/2 -translate-y-1/2 flex-col gap-4 z-50">
                        <button 
                            onClick={scrollPrev} 
                            className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110 shadow-lg group"
                            title="Previous Recommendation (Arrow Up)"
                        >
                            <span className="material-symbols-outlined text-white text-2xl group-hover:-translate-y-1 transition-transform">keyboard_arrow_up</span>
                        </button>
                        <button 
                            onClick={scrollNext} 
                            className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110 shadow-lg group"
                            title="Next Recommendation (Arrow Down)"
                        >
                            <span className="material-symbols-outlined text-white text-2xl group-hover:translate-y-1 transition-transform">keyboard_arrow_down</span>
                        </button>
                    </div>

                </div>
            ) : (
                <div className="flex-1 w-full flex items-center justify-center text-white/50 font-bold detail-description">
                    {t.forYou.noRecommendations}
                </div>
            )}
        </div>
    );
};

/* ═══════════════ FEED ITEM COMPONENT ═══════════════ */

const FeedItem = ({ item, onWatched, navigateTo, isMuted, toggleMute }) => {
    const { watchlist, user, addNotification, toggleWatchlist } = useApp();
    const { t } = useLanguage();
    const [trailer, setTrailer] = useState(null);
    const [isActive, setIsActive] = useState(false);
    const containerRef = useRef(null);

    const itemId = item?.id;
    const itemType = item?.type || 'movie';
    const isSaved = itemId ? watchlist.some(w => w.id?.toString() === String(itemId)) : false;
    const rating = Number(item?.rating);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                setIsActive(entry.isIntersecting);
            });
        }, { threshold: 0.6 });
        
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);
    
    useEffect(() => {
        if (isActive && !trailer && itemId) {
            TMDBService.getMediaVideos(itemId, itemType)
                .then(videos => {
                    const trailerVideo = Array.isArray(videos)
                        ? videos.find(v => v.type === 'Trailer' || v.type === 'Teaser') || videos[0]
                        : null;
                    if (trailerVideo?.key) setTrailer(trailerVideo.key);
                })
                .catch(error => console.error("Error fetching For You trailer:", error));
        }
    }, [isActive, itemId, itemType, trailer]);

    if (!itemId) return null;

    const handleToggleWatchlist = async () => {
        if (!user) {
            addNotification("Sign In Required", "Create an account to save movies to your list.", "lock");
            return;
        }
        try {
            await toggleWatchlist(itemId, itemType, item.poster, item.title, rating || null);
            addNotification(isSaved ? "Removed from List" : "Added to List", item.title, isSaved ? "remove" : "check");
        } catch (error) {
            console.error("Error updating watchlist from For You:", error);
            addNotification("Error", "Could not update your list.", "error");
        }
    };

    return (
        <div ref={containerRef} className="w-full h-full snap-start snap-always relative overflow-hidden group">
            
            {/* Background Media Layer */}
            <div className="absolute inset-0 bg-black z-0 flex items-center justify-center overflow-hidden">
                {isActive && trailer ? (
                    <iframe 
                        src={`https://www.youtube.com/embed/${trailer}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&showinfo=0&rel=0&loop=1&playlist=${trailer}&modestbranding=1`}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250vw] h-[250vh] md:w-[150vw] md:h-[150vh] pointer-events-none opacity-80 mix-blend-screen scale-105"
                        frameBorder="0"
                        allow="autoplay; encrypted-media"
                    ></iframe>
                ) : (
                    <img 
                        src={item.backdrop || item.poster} 
                        alt={item.title} 
                        className="w-full h-full object-cover opacity-60 transition-opacity duration-1000"
                    />
                )}
                
                {/* Immersive Gradient Overlays - Made lighter so trailer is more visible */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent"></div>
            </div>

            {/* Top Right Controls (Volume) */}
            <div className="absolute top-6 right-6 z-20 pointer-events-auto">
                <button 
                    onClick={toggleMute}
                    className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all text-white"
                    title={isMuted ? "Unmute Trailer" : "Mute Trailer"}
                >
                    <span className="material-symbols-outlined text-sm">
                        {isMuted ? 'volume_off' : 'volume_up'}
                    </span>
                </button>
            </div>

            {/* Bottom Details & Captions Panel */}
            <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 z-10 flex items-end justify-between gap-6 pointer-events-none pb-10">
                
                {/* Text Content */}
                <div className="flex-1 max-w-2xl space-y-3 pointer-events-auto">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                        {itemType === 'tv' && (
                            <span className="px-2 py-0.5 rounded bg-white/20 text-white text-[10px] font-bold tracking-widest uppercase backdrop-blur-md shadow-lg border border-white/10">
                                {t.forYou.tvSeries}
                            </span>
                        )}
                        {rating > 0 && (
                            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 shadow-lg">
                                <span className="material-symbols-outlined text-primary-container text-xs">star</span>
                                <span className="text-white font-bold text-xs">{rating.toFixed(1)}</span>
                            </div>
                        )}
                        <span className="text-white/80 text-xs font-bold drop-shadow-md">{item.year}</span>
                        
                        {/* Genres moved next to rating */}
                        {item.genres && item.genres.length > 0 && (
                            <div className="flex gap-2 items-center ml-2">
                                <div className="w-1 h-1 rounded-full bg-white/50"></div>
                                {item.genres.slice(0, 2).map((g, i) => (
                                    <span key={i} className="text-[11px] font-bold text-white/70 uppercase tracking-wider">{g}</span>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <h2 className="text-3xl md:text-5xl font-black text-white leading-tight drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]">
                        {item.title}
                    </h2>
                    
                    <p className="text-white/90 text-xs md:text-sm line-clamp-3 leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-medium max-w-xl">
                        {item.overview}
                    </p>
                </div>

                {/* Right Action Bar (TikTok style controls) */}
                <div className="flex flex-col gap-4 pointer-events-auto items-center">
                    
                    {/* Watch Now Button */}
                    <div className="flex flex-col items-center gap-1 group/btn cursor-pointer" onClick={() => navigateTo(`#/${itemType}/${itemId}`)}>
                        <div className="w-12 h-12 rounded-full bg-primary-container/90 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-[0_0_20px_rgba(229,9,20,0.4)] group-hover/btn:scale-110 transition-all duration-300">
                            <span className="material-symbols-outlined text-white text-xl group-hover/btn:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                        </div>
                        <span className="text-[9px] font-bold text-white/80 group-hover/btn:text-white transition-colors uppercase tracking-widest mt-1 feed-action-label">{t.forYou.play}</span>
                    </div>
                    
                    {/* My List Button */}
                    <div className="flex flex-col items-center gap-1 group/btn cursor-pointer" onClick={handleToggleWatchlist}>
                        <div className={`w-10 h-10 rounded-full backdrop-blur-xl border flex items-center justify-center shadow-lg group-hover/btn:scale-110 transition-all duration-300 ${isSaved ? 'bg-white text-black border-white' : 'bg-black/40 text-white border-white/20 hover:bg-white/20'}`}>
                            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}>
                                {isSaved ? 'check' : 'add'}
                            </span>
                        </div>
                        <span className="text-[9px] font-bold text-white/80 group-hover/btn:text-white transition-colors uppercase tracking-widest mt-1 feed-action-label">{t.forYou.myList}</span>
                    </div>

                    {/* Mark as Watched / Hide Button */}
                    <div className="flex flex-col items-center gap-1 group/btn cursor-pointer" onClick={onWatched}>
                        <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-lg group-hover/btn:scale-110 transition-all duration-300 hover:bg-white/10 hover:border-white/40">
                            <span className="material-symbols-outlined text-white/70 group-hover/btn:text-white text-lg">visibility_off</span>
                        </div>
                        <span className="text-[9px] font-bold text-white/80 group-hover/btn:text-white transition-colors uppercase tracking-widest mt-1 feed-action-label">{t.forYou.watched}</span>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ForYou;
