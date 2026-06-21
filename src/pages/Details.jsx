import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../hooks/useLanguage';
import { TMDBService } from '../services/tmdb';
import { SupabaseDB } from '../services/db';
import { RatingBadge } from '../components/RatingBadge';

export const Details = ({ id }) => {
    const {
        toggleWatchlist,
        watchlist,
        navigateTo,
        saveProgress,
        user,
        setAuthModalOpen,
        addNotification
    } = useApp();
    const { t } = useLanguage();

    const mediaId = id;
    const type = window.location.hash.includes('/tv/') ? 'tv' : 'movie';

    // Core data
    const [media, setMedia] = useState(null);
    const [cast, setCast] = useState([]);
    const [similar, setSimilar] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);

    // Review form state
    const [newReviewRating, setNewReviewRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [newReviewText, setNewReviewText] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);

    // Actor Modal State
    const [selectedActor, setSelectedActor] = useState(null);
    const [actorCredits, setActorCredits] = useState([]);
    const [isActorModalOpen, setIsActorModalOpen] = useState(false);
    const [loadingActorCredits, setLoadingActorCredits] = useState(false);

    // Player state
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentServer, setCurrentServer] = useState('vidsrc');

    // TV show state
    const [selectedSeason, setSelectedSeason] = useState(1);
    const [selectedEpisode, setSelectedEpisode] = useState(1);
    const [seasonData, setSeasonData] = useState(null);
    const [loadingEpisodes, setLoadingEpisodes] = useState(false);

    const carouselRef = useRef(null);

    // ─── Fetch main details ───
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setIsPlaying(false);
            setCurrentServer('vidbing');
            setMedia(null);
            setCast([]);
            setSimilar([]);
            setSeasonData(null);
            window.scrollTo(0, 0);

            try {
                const detailsData = await TMDBService.getMediaDetails(mediaId, type);
                if (!detailsData || !detailsData.id) {
                    throw new Error('Invalid details response');
                }

                setMedia(detailsData);

                const [castData, similarData] = await Promise.all([
                    TMDBService.getMediaCast(mediaId, type).catch((error) => {
                        console.error("Error fetching cast:", error);
                        return [];
                    }),
                    TMDBService.getSimilarMedia(mediaId, type).catch((error) => {
                        console.error("Error fetching similar media:", error);
                        return [];
                    })
                ]);

                setCast(Array.isArray(castData) ? castData : []);
                setSimilar(Array.isArray(similarData) ? similarData : []);

                const reviewsData = await SupabaseDB.getMediaReviews(mediaId).catch((error) => {
                    console.error("Error fetching reviews:", error);
                    return [];
                });
                setReviews(Array.isArray(reviewsData) ? reviewsData : []);

                if (type === 'tv' && detailsData.totalSeasons > 0) {
                    setSelectedSeason(1);
                    setSelectedEpisode(1);
                    try {
                        const season = await TMDBService.getSeasonDetails(mediaId, 1);
                        setSeasonData(season && season.episodes ? season : { ...season, episodes: [] });
                    } catch (seasonError) {
                        console.error("Error fetching season details:", seasonError);
                        setSeasonData({ episodes: [] });
                    }
                }
            } catch (error) {
                console.error("Error fetching media details:", error);
                setMedia(null);
            } finally {
                setLoading(false);
            }
        };
        if (mediaId) loadData();
    }, [mediaId, type]);

    // ─── Build player URL ───
    const getPlayerUrl = () => {
        if (type === 'movie') {
            switch (currentServer) {
                case 'vidsrc': return `https://vidsrc-embed.ru/embed/movie/${mediaId}`;
                case 'vidcore': return `https://vidcore.net/movie/${mediaId}?autoPlay=true`;
                case 'vidbing': return `https://moviesapi.to/movie/${mediaId}`;
                case 'vidfast': return `https://www.vidsrc.wtf/3/movie/${mediaId}?color=e01621`;
                case 'srcwtf': return `https://www.vidsrc.wtf/1/movie/${mediaId}?color=e01621`;
                case 'premium': return `https://www.vidsrc.wtf/4/movie/${mediaId}?color=e01621`;
                case 'vidzee': return `https://player.vidzee.wtf/embed/movie/${mediaId}`;
                case 'primesrc': return `https://primesrc.me/embed/movie?tmdb=${mediaId}`;
                default: return `https://vidsrc-embed.ru/embed/movie/${mediaId}`;
            }
        } else {
            switch (currentServer) {
                case 'vidsrc': return `https://vidsrc-embed.ru/embed/tv/${mediaId}/${selectedSeason}/${selectedEpisode}`;
                case 'vidcore': return `https://vidcore.net/tv/${mediaId}/${selectedSeason}/${selectedEpisode}?autoPlay=true`;
                case 'vidbing': return `https://moviesapi.to/tv/${mediaId}-${selectedSeason}-${selectedEpisode}`;
                case 'vidfast': return `https://www.vidsrc.wtf/3/tv/${mediaId}/${selectedSeason}/${selectedEpisode}?color=e01621`;
                case 'srcwtf': return `https://www.vidsrc.wtf/1/tv/${mediaId}/${selectedSeason}/${selectedEpisode}?color=e01621`;
                case 'premium': return `https://www.vidsrc.wtf/4/tv/${mediaId}/${selectedSeason}/${selectedEpisode}?color=e01621`;
                case 'vidzee': return `https://player.vidzee.wtf/embed/tv/${mediaId}/${selectedSeason}/${selectedEpisode}`;
                case 'primesrc': return `https://primesrc.me/embed/tv?tmdb=${mediaId}&season=${selectedSeason}&episode=${selectedEpisode}`;
                default: return `https://vidsrc-embed.ru/embed/tv/${mediaId}/${selectedSeason}/${selectedEpisode}`;
            }
        }
    };

    // ─── Handlers ───
    const handleReviewSubmit = async () => {
        if (!user) {
            setAuthModalOpen(true);
            return;
        }
        if (newReviewRating === 0) {
            addNotification('Rating Required', 'Please select a star rating first.', 'error');
            return;
        }
        if (!newReviewText.trim()) {
            addNotification('Comment Required', 'Please write a review comment.', 'error');
            return;
        }
        
        setIsSubmittingReview(true);
        try {
            const result = await SupabaseDB.submitReview(user.id, mediaId, newReviewRating, newReviewText);
            
            if (result && !result.success) {
                // If it's a Failed to fetch error, it's likely a browser/antivirus network block.
                const isNetworkError = result.error?.message?.includes('Failed to fetch');
                addNotification(
                    isNetworkError ? 'Network Blocked' : 'Error', 
                    isNetworkError ? 'Your browser or antivirus blocked the request.' : 'Failed to post review. Please try again.', 
                    'error'
                );
                return;
            }
            
            addNotification('Success', 'Your review has been posted!', 'check_circle');
            
            // Optimistic update so the UI feels perfectly synchronized and instant
            const optimisticReview = {
                id: Math.random(),
                user_id: user.id,
                username: user.user_metadata?.name || user.email?.split('@')[0] || 'You',
                avatar: user.user_metadata?.avatar_url || '',
                rating: newReviewRating,
                comment: newReviewText,
                timestamp: new Date().toISOString()
            };
            setReviews(prev => [optimisticReview, ...prev]);
            
            // Refresh from DB seamlessly to ensure accuracy
            const reviewsData = await SupabaseDB.getMediaReviews(mediaId);
            setReviews(reviewsData);
            
            setNewReviewRating(0);
            setHoverRating(0);
            setNewReviewText('');
        } catch (error) {
            console.error('Failed to submit review', error);
            addNotification('Error', 'Failed to post review. Please try again.', 'error');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const handleWatchNow = () => {
        if (!media?.id) return;
        if (saveProgress) {
            saveProgress(
                media.id,
                0,
                null,
                null,
                null,
                media.type || 'movie',
                media.title,
                media.poster || media.backdrop
            );
        } else {
            console.error('saveProgress function not available in context');
        }
        // Start playback in the hero section
        setIsPlaying(true);
        // For TV shows, ensure a season/episode is selected (default to 1 if not set)
        if (type === 'tv') {
            setSelectedSeason(selectedSeason || 1);
            setSelectedEpisode(selectedEpisode || 1);
        }
        // Scroll to top so the hero playback is visible
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSeasonChange = async (seasonNum) => {
        if (!mediaId || !seasonNum) return;
        setSelectedSeason(seasonNum);
        setLoadingEpisodes(true);
        try {
            const season = await TMDBService.getSeasonDetails(mediaId, seasonNum);
            setSeasonData(season && season.episodes ? season : { ...season, episodes: [] });
            if (season?.episodes?.length > 0) {
                setSelectedEpisode(season.episodes[0].episodeNumber);
            }
        } catch (error) {
            console.error("Error fetching season details:", error);
            setSeasonData({ episodes: [] });
        } finally {
            setLoadingEpisodes(false);
        }
    };

    const handleEpisodeClick = async (epNumber) => {
        if (!media?.id || !epNumber) return;
        setSelectedEpisode(epNumber);
        setIsPlaying(true);
        // Record that the user started watching this episode
        if (user && saveProgress) {
            await saveProgress(
                mediaId,
                0,
                null,
                selectedSeason,
                epNumber,
                'tv',
                media.title,
                media.poster || media.backdrop
            );
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleScrollCarousel = (direction) => {
        if (carouselRef.current) {
            const scrollAmount = direction === 'next' ? 400 : -400;
            carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const handleActorClick = async (actor) => {
        if (!actor?.id) return;
        setSelectedActor(actor);
        setIsActorModalOpen(true);
        setLoadingActorCredits(true);
        try {
            const credits = await TMDBService.getActorCredits(actor.id);
            setActorCredits(Array.isArray(credits) ? credits : []);
        } catch (error) {
            console.error("Error fetching actor credits:", error);
            setActorCredits([]);
        } finally {
            setLoadingActorCredits(false);
        }
    };

    // ─── Loading ───
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen space-y-4">
                <div className="w-12 h-12 border-4 border-white/20 border-t-primary-container rounded-full animate-spin"></div>
                <p className="text-white/60 font-bold tracking-widest uppercase">Loading Cinematic Experience...</p>
            </div>
        );
    }

    // ─── Error ───
    if (!media) {
        return (
            <div className="flex flex-col items-center justify-center h-screen text-center px-4">
                <span className="material-symbols-outlined text-6xl text-primary-container mb-4">error</span>
                <h2 className="text-2xl font-bold text-white">Content Not Found</h2>
                <button onClick={() => window.history.back()} className="mt-4 px-6 py-2 btn-primary rounded-lg">Go Back</button>
            </div>
        );
    }

    const inWatchlist = watchlist.some(item => String(item.id) === String(media.id));
    const currentEpisodeData = seasonData?.episodes?.find(ep => ep.episodeNumber === selectedEpisode);

    return (
        <div className="w-full pb-20 text-left bg-background relative">

            {/* ═══════════════ HERO SECTION ═══════════════ */}
            <section className="relative w-full overflow-hidden">
                {isPlaying ? (
                    /* ──── Player Mode ──── */
                    <div className="w-full bg-black">
                        <div className="max-w-[1400px] mx-auto">
                            <div className="relative w-full aspect-video">
                                <iframe
                                    key={getPlayerUrl()}
                                    src={getPlayerUrl()}
                                    className="absolute inset-0 w-full h-full"
                                    frameBorder="0"
                                    allowFullScreen
                                    allow="autoplay; fullscreen; encrypted-media"
                                    title={media.title}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    /* ──── Normal Hero Backdrop ──── */
                    <div className="relative w-full h-[50vh] md:h-[600px]">
                        <div className="absolute inset-0 z-0">
                            <img
                                className="w-full h-full object-cover"
                                src={media.backdrop || media.poster}
                                alt={media.title}
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/500x281?text=No+Image'; }}
                            />
                            <div className="absolute inset-0 vignette-left z-10"></div>
                            <div className="absolute inset-0 vignette-bottom z-10"></div>
                        </div>

                        {/* Overlay Content */}
                        <div className="relative z-20 h-full flex flex-col justify-end px-4 md:px-edge-margin pb-8 md:pb-16 max-w-container-max mx-auto">
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-lg p-5 md:p-8 rounded-xl max-w-xl transform hover:scale-[1.01] transition-transform">
                                <div className="flex items-center gap-3 mb-3">
                                    {media.tag && (
                                        <span className="bg-primary-container text-white font-bold text-[9px] md:text-[10px] px-2 py-0.5 rounded">
                                            {media.tag.toUpperCase()}
                                        </span>
                                    )}
                                    <RatingBadge rating={media.rating} />
                                </div>

                                <h1 className="font-display-lg text-2xl md:text-4xl lg:text-5xl mb-3 leading-tight tracking-tight font-extrabold text-white drop-shadow-md">
                                    {media.title}
                                </h1>

                                <div className="flex flex-wrap items-center gap-4 text-white/70 font-body-md mb-6 text-sm md:text-base detail-meta">
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-base">calendar_today</span> {media.year || 'N/A'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-base">schedule</span> {media.duration || 'N/A'}
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {(media.genres || []).slice(0, 3).map(g => (
                                            <span key={g} className="px-2 py-0.5 border border-white/20 rounded-md text-xs">
                                                {g}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <p className="text-white/80 font-body-lg text-sm md:text-lg mb-8 line-clamp-4 md:line-clamp-3 leading-relaxed detail-description">
                                    {media.overview}
                                </p>

                                <div className="flex flex-wrap items-center gap-4 hero-buttons">
                                    <button
                                        onClick={handleWatchNow}
                                        className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-3 transition-all active:scale-95 shadow-lg shadow-red-600/30"
                                    >
                                        <span className="material-symbols-outlined fill" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                                        {t.details.watchNow}
                                    </button>
                                    <button
                                        onClick={() => toggleWatchlist(media.id, type, media.poster, media.title)}
                                        className="glass-panel px-8 py-3 rounded-lg font-bold flex items-center gap-3 transition-all hover:bg-white/10 active:scale-95 text-white"
                                    >
                                        <span className="material-symbols-outlined">{inWatchlist ? 'check' : 'add'}</span>
                                        {t.details.addToList}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* ═══════════════ SERVER SELECTION (only when playing) ═══════════════ */}
            {isPlaying && (
                <section className="px-4 md:px-edge-margin py-4 max-w-container-max mx-auto">
                    <div className="glass-panel rounded-xl p-4 flex flex-wrap items-center gap-4">
                        {/* Now Playing Info */}
                        <div className="flex items-center gap-3 mr-auto min-w-0">
                            <span className="material-symbols-outlined text-red-500 text-2xl flex-shrink-0">play_circle</span>
                            <div className="min-w-0">
                                <p className="font-bold text-white text-sm truncate">{media.title}</p>
                                {type === 'tv' && currentEpisodeData && (
                                    <p className="text-white/50 text-xs truncate">
                                        S{selectedSeason} · E{selectedEpisode} — {currentEpisodeData.name}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Server Buttons */}
                        <div className="flex items-center gap-2 flex-shrink-0 overflow-x-auto pb-1 custom-scrollbar">
                            <span className="text-white/40 text-xs font-bold uppercase tracking-wider mr-1 hidden sm:inline">Server</span>
                            {[
                                { id: 'vidsrc', label: 'VidSrc' },
                                { id: 'vidbing', label: 'Vidbing' },
                                { id: 'vidcore', label: 'Vidcore' },
                                { id: 'vidfast', label: 'Vidfast' },
                                { id: 'srcwtf', label: 'src.wtf' },
                                { id: 'premium', label: 'PREMIUM EMBEDS' },
                                { id: 'vidzee', label: 'VidZee' },
                                { id: 'primesrc', label: 'Primesrc' }
                            ].map(server => (
                                <button
                                    key={server.id}
                                    onClick={() => setCurrentServer(server.id)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                                        currentServer === server.id
                                            ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                                            : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    {server.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ═══════════════ SEASON / EPISODE SELECTOR (TV only) ═══════════════ */}
            {type === 'tv' && media.totalSeasons > 0 && (
                <section className="px-4 md:px-edge-margin py-6 md:py-10 max-w-container-max mx-auto">
                    {/* Section Header + Season Dropdown */}
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                        <h2 className="text-xl md:text-2xl font-extrabold flex items-center gap-3 text-white">
                            <span className="w-1.5 h-8 bg-red-600 rounded-full"></span>
                            {t.details.episodes}
                        </h2>
                        <div className="relative">
                            <select
                                value={selectedSeason}
                                onChange={(e) => handleSeasonChange(parseInt(e.target.value))}
                                className="glass-panel appearance-none pr-10 pl-4 py-2.5 rounded-lg text-white font-bold text-sm cursor-pointer outline-none focus:ring-1 focus:ring-red-500/50"
                            >
                                {Array.from({ length: media.totalSeasons }, (_, i) => i + 1).map(s => (
                                    <option key={s} value={s} style={{ background: '#1a1a1a', color: 'white' }}>
                                        {t.details.season} {s}
                                    </option>
                                ))}
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/50 text-lg">
                                expand_more
                            </span>
                        </div>
                    </div>

                    {/* Episode Cards */}
                    {loadingEpisodes ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="w-8 h-8 border-[3px] border-white/20 border-t-red-600 rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar scroll-smooth hide-scrollbar">
                            {seasonData?.episodes?.map(ep => {
                                const isActive = selectedEpisode === ep.episodeNumber && isPlaying;
                                return (
                                    <div
                                        key={ep.episodeNumber}
                                        onClick={() => handleEpisodeClick(ep.episodeNumber)}
                                        className={`flex-shrink-0 w-[260px] md:w-[300px] rounded-xl overflow-hidden cursor-pointer group transition-all duration-300 ${
                                            isActive
                                                ? 'ring-2 ring-red-500 shadow-lg shadow-red-600/20 scale-[1.02]'
                                                : 'border border-white/10 hover:border-white/25 hover:shadow-xl'
                                        }`}
                                    >
                                        {/* Episode Thumbnail */}
                                        <div className="relative aspect-video bg-white/5">
                                            {ep.still ? (
                                                <img
                                                    src={ep.still}
                                                    alt={ep.name}
                                                    className="w-full h-full object-cover group-hover:brightness-90 transition-all duration-300"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-4xl text-white/15">movie</span>
                                                </div>
                                            )}
                                            {/* Play overlay on hover */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <div className="w-12 h-12 bg-red-600/90 rounded-full flex items-center justify-center shadow-xl backdrop-blur-sm">
                                                    <span className="material-symbols-outlined text-white text-2xl fill" style={{ fontVariationSettings: "'FILL' 1" }}>
                                                        play_arrow
                                                    </span>
                                                </div>
                                            </div>
                                            {/* Episode number badge */}
                                            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-white/80">
                                                E{ep.episodeNumber}
                                            </div>
                                            {/* Currently playing indicator */}
                                            {isActive && (
                                                <div className="absolute top-2 right-2 bg-red-600 px-2 py-0.5 rounded text-[10px] font-bold text-white flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                                                    Playing
                                                </div>
                                            )}
                                        </div>
                                        {/* Episode Info */}
                                        <div className="p-3 bg-white/[0.03]">
                                            <h4 className="font-bold text-sm text-white line-clamp-1 mb-1">{ep.name}</h4>
                                            <div className="flex items-center gap-3 text-white/40 text-xs">
                                                {ep.runtime > 0 && (
                                                    <span className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-xs">schedule</span>
                                                        {ep.runtime}m
                                                    </span>
                                                )}
                                                {ep.airDate && (
                                                    <span>{new Date(ep.airDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            )}

            {/* ═══════════════ CAST SECTION ═══════════════ */}
            {cast.length > 0 && (
                <section className="px-4 md:px-edge-margin py-6 md:py-10 max-w-container-max mx-auto">
                    <h2 className="text-2xl md:text-3xl font-extrabold mb-6 flex items-center gap-3 text-white">
                        <span className="w-1.5 h-8 bg-primary-container rounded-full"></span>
                        {t.details.leadCast}
                    </h2>
                    <div className="flex gap-8 overflow-x-auto pb-4 custom-scrollbar scroll-smooth">
                        {cast.map((actor, idx) => (
                            <div 
                                key={idx} 
                                className="flex-shrink-0 flex flex-col items-center gap-3 group cursor-pointer w-32 hover:-translate-y-2 transition-transform duration-300"
                                onClick={() => handleActorClick(actor)}
                            >
                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary-container transition-all duration-500 shadow-xl bg-surface-container-high">
                                    <img
                                        className="w-full h-full object-cover transition-all duration-500 group-hover:brightness-110 group-hover:scale-105"
                                        src={actor.avatar}
                                        alt={actor.name}
                                        loading="lazy"
                                        onError={(e) => { e.target.src = "https://via.placeholder.com/150"; }}
                                    />
                                </div>
                                <div className="text-center w-full">
                                    <p className="font-bold text-sm text-white leading-tight truncate">{actor.name}</p>
                                    <p className="text-xs text-white/50 truncate">{actor.character}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ═══════════════ REVIEWS SECTION ═══════════════ */}
            <section className="px-4 md:px-edge-margin py-8 md:py-10 max-w-container-max mx-auto border-t border-white/5 mt-4">
                <h2 className="text-2xl md:text-3xl font-extrabold mb-6 flex items-center gap-3 text-white">
                    <span className="w-1.5 h-8 bg-primary-container rounded-full shadow-[0_0_15px_rgba(229,9,20,0.6)]"></span>
                    {t.details.reviewsAndRatings}
                </h2>

                <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
                    
                    {/* Left/Top Column: Summary & Input Form */}
                    <div className="w-full lg:w-1/3 flex flex-col gap-6 sticky top-24">
                        {/* Rating Summary Block */}
                        <div className="glass-panel p-8 rounded-2xl flex flex-col items-center justify-center text-center">
                            <span className="text-7xl font-extrabold text-white leading-none tracking-tighter drop-shadow-md">
                                {reviews.length > 0 ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1) : '0.0'}
                            </span>
                            <div className="flex gap-1 mt-3 mb-2">
                                {[1, 2, 3, 4, 5].map((star) => {
                                    const avg = reviews.length > 0 ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length) : 0;
                                    let icon = 'star';
                                    let colorClass = 'text-white/20';
                                    
                                    if (avg >= star) {
                                        icon = 'star';
                                        colorClass = 'text-yellow-400 fill drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]';
                                    } else if (avg >= star - 0.5) {
                                        icon = 'star_half';
                                        colorClass = 'text-yellow-400 fill drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]';
                                    }

                                    return (
                                        <span key={star} className={`material-symbols-outlined text-xl ${colorClass}`}>
                                            {icon}
                                        </span>
                                    );
                                })}
                            </div>
                            <p className="text-white/50 font-medium text-sm">
                                {t.details.basedOn} {reviews.length} {reviews.length === 1 ? t.details.viewerReview : t.details.viewerReviews}
                            </p>
                        </div>

                        {/* Inline Review Form */}
                        <div className="glass-panel p-6 rounded-2xl">
                            <h3 className="font-bold text-lg text-white mb-4">{t.details.leaveReview}</h3>
                            
                            {/* Star Selector */}
                            <div className="flex gap-2 mb-4 justify-center" onMouseLeave={() => setHoverRating(0)}>
                                {[1, 2, 3, 4, 5].map((star) => {
                                    const val = hoverRating || newReviewRating;
                                    let icon = 'star';
                                    let colorClass = 'text-white/20';
                                    
                                    if (val >= star) {
                                        icon = 'star';
                                        colorClass = 'text-yellow-400 fill drop-shadow-[0_0_12px_rgba(250,204,21,0.8)]';
                                    } else if (val >= star - 0.5) {
                                        icon = 'star_half';
                                        colorClass = 'text-yellow-400 fill drop-shadow-[0_0_12px_rgba(250,204,21,0.8)]';
                                    }

                                    return (
                                        <button 
                                            key={star} 
                                            onMouseMove={(e) => {
                                                const rect = e.currentTarget.getBoundingClientRect();
                                                const isLeftHalf = e.clientX - rect.left < rect.width / 2;
                                                setHoverRating(isLeftHalf ? star - 0.5 : star);
                                            }}
                                            onClick={() => {
                                                if (!user) setAuthModalOpen(true);
                                                else setNewReviewRating(hoverRating || star);
                                            }}
                                            className={`focus:outline-none transition-all duration-300 ${val === star || val === star - 0.5 ? 'scale-125 -translate-y-1' : 'hover:scale-110'}`}
                                        >
                                            <span className={`material-symbols-outlined text-3xl md:text-4xl transition-colors ${colorClass}`}>
                                                {icon}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            
                            {/* Comment Box */}
                            <div className="relative">
                                <textarea 
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/30 text-sm focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all resize-none"
                                    rows="3"
                                    placeholder={user ? t.details.whatDidYouThink : t.details.signInToReview}
                                    value={newReviewText}
                                    onChange={(e) => setNewReviewText(e.target.value)}
                                    onClick={() => { if (!user) setAuthModalOpen(true); }}
                                ></textarea>
                            </div>
                            
                            {/* Submit Button */}
                            <button 
                                onClick={handleReviewSubmit}
                                disabled={isSubmittingReview || (!user && newReviewText.length === 0)}
                                className={`w-full mt-4 py-3 rounded-xl font-bold text-sm transition-all ${isSubmittingReview ? 'bg-white/10 text-white/50 cursor-not-allowed' : 'btn-primary'}`}
                            >
                                {isSubmittingReview ? t.details.posting : t.details.submitReview}
                            </button>
                        </div>
                    </div>

                    {/* Right/Bottom Column: Reviews List */}
                    <div className="w-full lg:w-2/3 space-y-4">
                        {reviews.length > 0 ? (
                            <>
                                {reviews.slice(0, 5).map((rev, idx) => (
                                    <div key={idx} className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-black/50 border border-white/10 overflow-hidden shadow-lg">
                                                    <img src={rev.avatar || 'https://via.placeholder.com/150'} alt={rev.username} className="w-full h-full object-cover" onError={(e) => { e.target.src = "https://via.placeholder.com/150"; }} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-base text-white/90">{rev.username || 'Anonymous'}</p>
                                                    <p className="text-[11px] text-white/40 uppercase tracking-wider">{new Date(rev.timestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                                </div>
                                            </div>
                                            <div className="flex bg-white/5 rounded-full px-2 py-1 items-center gap-1 border border-white/5">
                                                <span className="material-symbols-outlined text-sm text-yellow-400 fill drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]">star</span>
                                                <span className="text-sm font-bold text-white">{Number(rev.rating).toFixed(1)}</span>
                                            </div>
                                        </div>
                                        <p className="text-white/70 text-sm md:text-base leading-relaxed pl-[52px]">
                                            {rev.comment}
                                        </p>
                                    </div>
                                ))}
                                
                                {reviews.length > 5 && (
                                    <button 
                                        onClick={() => setIsReviewsModalOpen(true)}
                                        className="w-full py-4 mt-4 glass-panel rounded-2xl text-white/80 font-bold hover:bg-white/10 transition-colors border border-white/10 hover:border-white/20"
                                    >
                                        {t.details.seeAllReviews} {reviews.length} {t.details.reviewsWord}
                                    </button>
                                )}
                            </>
                        ) : (
                            <div className="glass-panel p-12 rounded-2xl flex flex-col items-center justify-center text-center border-dashed border-white/10">
                                <span className="material-symbols-outlined text-5xl text-white/20 mb-4">reviews</span>
                                <h3 className="text-xl font-bold text-white/80 mb-2">{t.details.noReviewsYet}</h3>
                                <p className="text-white/50 text-sm max-w-md detail-description">{t.details.noReviewsBody} {media.title}. {t.details.noReviewsPrompt}</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ═══════════════ SIMILAR MEDIA ═══════════════ */}
            {similar.length > 0 && (
                <section className="px-4 md:px-edge-margin py-6 md:py-10 max-w-container-max mx-auto overflow-hidden">
                    <div className="flex justify-between items-end mb-6">
                        <h2 className="text-2xl md:text-3xl font-extrabold flex items-center gap-3 text-white">
                            <span className="w-1.5 h-8 bg-primary-container rounded-full"></span>
                            {t.details.moreLikeThis}
                        </h2>
                        <div className="flex gap-4">
                            <button onClick={() => handleScrollCarousel('prev')} className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:bg-white/10 transition-all active:scale-90 text-white border-white/20">
                                <span className="material-symbols-outlined">arrow_back_ios_new</span>
                            </button>
                            <button onClick={() => handleScrollCarousel('next')} className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:bg-white/10 transition-all active:scale-90 text-white border-white/20">
                                <span className="material-symbols-outlined ml-1">arrow_forward_ios</span>
                            </button>
                        </div>
                    </div>

                    <div ref={carouselRef} className="flex gap-6 overflow-x-auto pb-8 custom-scrollbar no-scrollbar scroll-smooth">
                        {similar.map((item, idx) => (
                            <div
                                key={`${item.id}-${idx}`}
                                className="flex-shrink-0 w-44 md:w-64 group cursor-pointer"
                                onClick={() => item?.id && navigateTo(`#/${item.type || 'movie'}/${item.id}`)}
                            >
                                <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-4 shadow-2xl border border-white/10 premium-hover">
                                    <img
                                        className="w-full h-full object-cover"
                                        src={item.poster}
                                        alt={item.title}
                                        loading="lazy"
                                        onError={(e) => { e.target.src = "https://via.placeholder.com/200x300"; }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                                        <p className="font-bold text-white text-sm md:text-base leading-tight">{item.title} ({item.year})</p>
                                    </div>
                                    <RatingBadge rating={item.rating} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <p className="font-bold text-sm md:text-[18px] text-white truncate">{item.title}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}
            
            {/* ═══════════════ ALL REVIEWS MODAL ═══════════════ */}
            {isReviewsModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12 animate-fade-in">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl" onClick={() => setIsReviewsModalOpen(false)}></div>
                    <div className="relative w-full max-w-4xl max-h-full glass-panel rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-white/10 animate-slide-up">
                        
                        {/* Modal Header */}
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5 sticky top-0 z-10 backdrop-blur-md">
                            <div>
                                <h3 className="text-2xl font-extrabold text-white flex items-center gap-3">
                                    <span className="material-symbols-outlined text-yellow-400">reviews</span>
                                    All Reviews
                                </h3>
                                <p className="text-white/50 text-sm mt-1">{reviews.length} viewer ratings for {media?.title}</p>
                            </div>
                            <button 
                                onClick={() => setIsReviewsModalOpen(false)}
                                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        {/* Modal Body - Scrollable Reviews List */}
                        <div className="p-6 overflow-y-auto custom-scrollbar space-y-4">
                            {reviews.map((rev, idx) => (
                                <div key={idx} className="bg-white/5 p-6 rounded-2xl relative group">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-black/50 border border-white/10 overflow-hidden shadow-lg">
                                                <img src={rev.avatar || 'https://via.placeholder.com/150'} alt={rev.username} className="w-full h-full object-cover" onError={(e) => { e.target.src = "https://via.placeholder.com/150"; }} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-base text-white/90">{rev.username || 'Anonymous'}</p>
                                                <p className="text-[11px] text-white/40 uppercase tracking-wider">{new Date(rev.timestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                            </div>
                                        </div>
                                        <div className="flex bg-white/5 rounded-full px-2 py-1 items-center gap-1 border border-white/5">
                                            <span className="material-symbols-outlined text-sm text-yellow-400 fill drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]">star</span>
                                            <span className="text-sm font-bold text-white">{Number(rev.rating).toFixed(1)}</span>
                                        </div>
                                    </div>
                                    <p className="text-white/70 text-sm md:text-base leading-relaxed pl-[52px]">
                                        {rev.comment}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
            {/* ═══════════════ ACTOR CREDITS MODAL ═══════════════ */}
            {isActorModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12 animate-fade-in">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl" onClick={() => setIsActorModalOpen(false)}></div>
                    <div className="relative w-full max-w-6xl max-h-full glass-panel rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-white/10 animate-slide-up">
                        
                        {/* Modal Header */}
                        <div className="p-6 border-b border-white/10 flex items-center gap-6 bg-white/5 sticky top-0 z-10 backdrop-blur-md">
                            {selectedActor?.avatar && (
                                <img src={selectedActor.avatar} alt={selectedActor.name} className="w-16 h-16 rounded-full object-cover shadow-lg border border-white/20" />
                            )}
                            <div className="flex-1">
                                <h3 className="text-2xl md:text-3xl font-extrabold text-white">
                                    {selectedActor?.name}
                                </h3>
                                <p className="text-white/50 text-sm mt-1">Movies & TV Shows</p>
                            </div>
                            <button 
                                onClick={() => setIsActorModalOpen(false)}
                                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        {/* Modal Body - Scrollable Credits Grid */}
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            {loadingActorCredits ? (
                                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                    <div className="w-10 h-10 border-4 border-white/20 border-t-primary-container rounded-full animate-spin"></div>
                                    <p className="text-white/50 font-bold">Loading filmography...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 pb-8">
                                    {actorCredits.map((item, idx) => (
                                        <div 
                                            key={`${item.id}-${idx}`} 
                                            className="group cursor-pointer flex flex-col"
                                            onClick={() => {
                                                setIsActorModalOpen(false);
                                                navigateTo(`#/${item.type || 'movie'}/${item.id}`);
                                            }}
                                        >
                                            <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 shadow-lg border border-white/10 premium-hover">
                                                <img 
                                                    src={item.poster || 'https://via.placeholder.com/300x450?text=No+Image'} 
                                                    alt={item.title} 
                                                    className="w-full h-full object-cover" 
                                                    loading="lazy" 
                                                    onError={(e) => { e.target.src = "https://via.placeholder.com/300x450?text=No+Image"; }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                <RatingBadge rating={item.rating} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <p className="font-bold text-sm text-white/90 truncate">{item.title}</p>
                                            <p className="text-[11px] text-white/50 truncate">
                                                {item.year} {item.type === 'tv' ? '• TV Series' : '• Movie'}
                                            </p>
                                        </div>
                                    ))}
                                    {actorCredits.length === 0 && (
                                        <div className="col-span-full text-center py-10 text-white/50">
                                            No credits found.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Details;
