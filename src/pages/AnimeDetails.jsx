import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../hooks/useLanguage';
import { AnimeService } from '../services/animeService';
import { SupabaseDB } from '../services/db';
import { AdService } from '../services/adService';
import { RatingBadge } from '../components/RatingBadge';
import { NativeAdBanner } from '../components/NativeAdBanner';
import { DisplayAdBanner } from '../components/DisplayAdBanner';
import { ShareModal } from '../components/ShareModal';
import { HlsVideoPlayer } from '../components/HlsVideoPlayer';
import { DetailsPageSkeleton } from '../components/Skeleton';
import { MediaRow } from '../components/MediaRow';

const ANIME_TMDB_MAP = {
    '113415': { tmdbId: 95479 },
    '145064': { tmdbId: 95479 },
    '131573': { tmdbId: 810693 },
    '95479': { tmdbId: 95479 },
    '85937': { tmdbId: 85937 },
    '101922': { tmdbId: 85937 },
    '129874': { tmdbId: 85937 },
    '145139': { tmdbId: 85937 },
    '166240': { tmdbId: 85937 },
    '16498': { tmdbId: 1429 },
    '20958': { tmdbId: 1429 },
    '99147': { tmdbId: 1429 },
    '110277': { tmdbId: 1429 },
    '1429': { tmdbId: 1429 },
    '21': { tmdbId: 37854 },
    '37854': { tmdbId: 37854 },
    '151807': { tmdbId: 127532 },
    '173778': { tmdbId: 127532 },
    '127532': { tmdbId: 127532 },
    '127230': { tmdbId: 114410 },
    '114410': { tmdbId: 114410 },
    '20': { tmdbId: 46260 },
    '46260': { tmdbId: 46260 },
    '1735': { tmdbId: 31910 },
    '31910': { tmdbId: 31910 },
    '269': { tmdbId: 30984 },
    '30984': { tmdbId: 30984 },
    '1535': { tmdbId: 13916 },
    '13916': { tmdbId: 13916 },
    '140960': { tmdbId: 120089 },
    '158871': { tmdbId: 120089 },
    '120089': { tmdbId: 120089 },
    '21459': { tmdbId: 65930 },
    '65930': { tmdbId: 65930 },
    '171018': { tmdbId: 251504 },
    '251504': { tmdbId: 251504 },
    '154587': { tmdbId: 209867 },
    '209867': { tmdbId: 209867 },
    '146065': { tmdbId: 138502 },
    '138502': { tmdbId: 138502 },
    '137822': { tmdbId: 137822 },
    '163146': { tmdbId: 137822 }
};

export const AnimeDetails = ({ id }) => {
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

    const animeId = id;

    // Core anime data
    const [anime, setAnime] = useState(null);
    const [loading, setLoading] = useState(true);
    const [episodes, setEpisodes] = useState([]);
    const [loadingEpisodes, setLoadingEpisodes] = useState(true);
    const [selectedSeason, setSelectedSeason] = useState(1);
    const [seasons, setSeasons] = useState([]);
    const [selectedEpisodeNum, setSelectedEpisodeNum] = useState(1);

    // Episode chunking/pagination state for high performance
    const [chunkIndex, setChunkIndex] = useState(0);
    const EPISODES_PER_CHUNK = 50;

    // Player state (Default server is VidLink)
    const [isPlaying, setIsPlaying] = useState(false);
    const [servers, setServers] = useState({ sub: [], dub: [] });
    const [currentServer, setCurrentServer] = useState('embed-vidlink');
    const [audioMode, setAudioMode] = useState('sub'); // 'sub' or 'dub'
    const [streamData, setStreamData] = useState(null);
    const [loadingStream, setLoadingStream] = useState(false);
    const [isUniversalFullscreen, setIsUniversalFullscreen] = useState(false);

    // Reviews & Modal State
    const [reviews, setReviews] = useState([]);
    const [newReviewRating, setNewReviewRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [newReviewText, setNewReviewText] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    const playerContainerRef = useRef(null);

    // Universal Fullscreen & keyboard shortcut ('F')
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isFs = !!(
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.mozFullScreenElement ||
                document.msFullscreenElement
            );
            setIsUniversalFullscreen(isFs);
        };

        const handleKeyDown = (e) => {
            if (isPlaying && (e.key === 'f' || e.key === 'F') && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
                e.preventDefault();
                toggleUniversalFullscreen();
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isPlaying]);

    const toggleUniversalFullscreen = () => {
        const el = playerContainerRef.current;
        if (!el) return;

        const isFs = !!(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement
        );

        if (!isFs) {
            if (el.requestFullscreen) {
                el.requestFullscreen().catch(err => console.warn("Fullscreen error:", err));
            } else if (el.webkitRequestFullscreen) {
                el.webkitRequestFullscreen();
            } else if (el.mozRequestFullScreen) {
                el.mozRequestFullScreen();
            } else if (el.msRequestFullscreen) {
                el.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(err => console.warn("Exit fullscreen error:", err));
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    };

    // 1. Fetch Anime Details & Episode List
    useEffect(() => {
        const loadAnimeData = async () => {
            setLoading(true);
            setIsPlaying(false);
            setStreamData(null);
            setCurrentServer('embed-vidlink');
            window.scrollTo(0, 0);

            try {
                const data = await AnimeService.getDetails(animeId);
                setAnime(data);

                // Build seasons list
                const availableSeasons = data?.seasons && data.seasons.length > 0
                    ? data.seasons
                    : (data?.totalSeasons > 1
                        ? Array.from({ length: data.totalSeasons }, (_, i) => ({
                            seasonNumber: i + 1,
                            name: `Season ${i + 1}`,
                            id: animeId
                        }))
                        : [{ seasonNumber: 1, name: data?.format === 'MOVIE' ? 'Movie' : 'Season 1', id: animeId }]
                    );
                setSeasons(availableSeasons);
                setSelectedSeason(1);

                // Fetch reviews from SupabaseDB
                SupabaseDB.getMediaReviews(animeId).then(revs => {
                    setReviews(Array.isArray(revs) ? revs : []);
                }).catch(() => {});

                // Fetch episode list for Season 1
                setLoadingEpisodes(true);
                const epList = await AnimeService.getEpisodes(animeId, 1);
                setEpisodes(epList || []);
                if (epList && epList.length > 0) {
                    setSelectedEpisodeNum(epList[0].episodeNumber || 1);
                }
            } catch (err) {
                console.error('Failed to load anime details:', err);
            } finally {
                setLoading(false);
                setLoadingEpisodes(false);
            }
        };

        if (animeId) {
            loadAnimeData();
        }
    }, [animeId]);

    // 2. Load Streaming Source and Servers when playing or when episode/server/audio changes
    useEffect(() => {
        if (!isPlaying || episodes.length === 0) return;

        const currentEp = episodes.find(e => e.episodeNumber === selectedEpisodeNum) || episodes[0];
        if (!currentEp) return;

        const loadStream = async () => {
            setLoadingStream(true);
            try {
                // Try HiAnime API servers / stream if available
                const serverData = await AnimeService.getServers(currentEp.id);
                setServers(serverData || { sub: [], dub: [] });

                const stream = await AnimeService.getStream(currentEp.id, currentServer, audioMode, anime?.title);
                setStreamData(stream);

                // Save progress
                if (user && anime) {
                    saveProgress(
                        anime.id,
                        0,
                        null,
                        selectedSeason,
                        selectedEpisodeNum,
                        'anime',
                        anime.title,
                        anime.poster || anime.backdrop
                    );
                }
            } catch (err) {
                console.error('Failed to load stream:', err);
            } finally {
                setLoadingStream(false);
            }
        };

        loadStream();
    }, [isPlaying, selectedEpisodeNum, selectedSeason, currentServer, audioMode]);

    // Handle Season Change
    const handleSeasonChange = async (seasonNum) => {
        AdService.triggerDirectAd('season_change');
        setSelectedSeason(seasonNum);
        setSelectedEpisodeNum(1);
        setChunkIndex(0);
        setLoadingEpisodes(true);

        // Check if this season corresponds to another anime ID (e.g. sequel/prequel on AniList)
        const sObj = seasons.find(s => s.seasonNumber === seasonNum);
        if (sObj?.id && String(sObj.id) !== String(animeId)) {
            navigateTo(`#/anime/${sObj.id}`);
            return;
        }

        try {
            const epList = await AnimeService.getEpisodes(animeId, seasonNum);
            setEpisodes(epList || []);
            if (epList && epList.length > 0) {
                setSelectedEpisodeNum(epList[0].episodeNumber || 1);
            }
        } catch (e) {
            console.error('Failed to load season episodes:', e);
        } finally {
            setLoadingEpisodes(false);
        }
    };

    // Navigation handlers
    const currentEpisodeIndex = episodes.findIndex(e => e.episodeNumber === selectedEpisodeNum);
    const hasNextEpisode = currentEpisodeIndex < episodes.length - 1;
    const hasPrevEpisode = currentEpisodeIndex > 0;

    const handleNextEpisode = () => {
        if (hasNextEpisode) {
            AdService.triggerDirectAd('episode_change');
            const nextEp = episodes[currentEpisodeIndex + 1];
            setSelectedEpisodeNum(nextEp.episodeNumber);
            const nextChunk = Math.floor((nextEp.episodeNumber - 1) / EPISODES_PER_CHUNK);
            if (nextChunk !== chunkIndex) setChunkIndex(nextChunk);
        }
    };

    const handlePrevEpisode = () => {
        if (hasPrevEpisode) {
            AdService.triggerDirectAd('episode_change');
            const prevEp = episodes[currentEpisodeIndex - 1];
            setSelectedEpisodeNum(prevEp.episodeNumber);
            const prevChunk = Math.floor((prevEp.episodeNumber - 1) / EPISODES_PER_CHUNK);
            if (prevChunk !== chunkIndex) setChunkIndex(prevChunk);
        }
    };

    const handleSelectEpisode = (epNum) => {
        AdService.triggerDirectAd('episode_change');
        setSelectedEpisodeNum(epNum);
        setIsPlaying(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleWatchNow = () => {
        AdService.triggerMoviePlayAd('watch_now_button');
        setIsPlaying(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Construct embed URL for VidLink (Default) / VidSrc
    const getAnimeEmbedUrl = () => {
        const mediaIdStr = String(anime?.id || animeId);
        const resolvedId = anime?.tmdbId || ANIME_TMDB_MAP[mediaIdStr]?.tmdbId || anime?.id || animeId;
        const s = selectedSeason || 1;
        const ep = selectedEpisodeNum || 1;

        if (anime?.format === 'MOVIE' || anime?.isMovie) {
            switch (currentServer) {
                case 'embed-vidsrc': return `https://vidsrc.pm/embed/movie/${resolvedId}`;
                case 'embed-vidlink':
                default: return `https://vidlink.pro/movie/${resolvedId}`;
            }
        } else {
            switch (currentServer) {
                case 'embed-vidsrc': return `https://vidsrc.pm/embed/tv/${resolvedId}/${s}/${ep}`;
                case 'embed-vidlink':
                default: return `https://vidlink.pro/tv/${resolvedId}/${s}/${ep}`;
            }
        }
    };

    // Review submit
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
            await SupabaseDB.submitReview(user.id, animeId, newReviewRating, newReviewText);
            addNotification('Success', 'Your anime review has been posted!', 'check_circle');
            setReviews(prev => [
                {
                    id: Date.now(),
                    user_id: user.id,
                    username: user.email?.split('@')[0] || 'User',
                    rating: newReviewRating,
                    comment: newReviewText,
                    created_at: new Date().toISOString()
                },
                ...prev
            ]);
            setNewReviewText('');
            setNewReviewRating(0);
        } catch (e) {
            addNotification('Error', 'Failed to post review.', 'error');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    if (loading) {
        return <DetailsPageSkeleton />;
    }

    if (!anime) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <span className="material-symbols-outlined text-6xl text-red-500 mb-4">search_off</span>
                <h2 className="text-2xl font-bold text-white mb-2">Anime Not Found</h2>
                <p className="text-white/60 mb-6">We couldn't retrieve the details for this anime.</p>
                <button onClick={() => navigateTo('#/anime')} className="btn-primary px-6 py-2.5 rounded-xl font-bold text-sm">
                    Back to Anime
                </button>
            </div>
        );
    }

    const inWatchlist = watchlist.some(item => String(item.id) === String(anime.id));

    // Calculate chunks for episodes pagination
    const totalChunks = Math.ceil(episodes.length / EPISODES_PER_CHUNK);
    const visibleEpisodes = episodes.slice(
        chunkIndex * EPISODES_PER_CHUNK,
        (chunkIndex + 1) * EPISODES_PER_CHUNK
    );

    return (
        <div className="w-full pb-20 text-left bg-background relative">
            {/* ═══════════════ PLAYER / HERO BACKDROP SECTION ═══════════════ */}
            <section className="relative w-full overflow-hidden" ref={playerContainerRef}>
                {isPlaying ? (
                    <div className="w-full bg-black relative max-w-[1400px] mx-auto pt-2 md:pt-4 px-0 md:px-4">
                        {/* Video Viewport Container */}
                        <div className="w-full aspect-video bg-neutral-950 relative rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                            {currentServer.startsWith('embed-') ? (
                                <iframe
                                    key={`${currentServer}-${selectedSeason}-${selectedEpisodeNum}`}
                                    src={getAnimeEmbedUrl()}
                                    className="w-full h-full border-0"
                                    allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer; clipboard-write; screen-wake-lock"
                                    allowFullScreen
                                    webkitallowfullscreen="true"
                                    mozallowfullscreen="true"
                                    referrerPolicy="origin"
                                    title={`${anime.title} - Season ${selectedSeason} Episode ${selectedEpisodeNum}`}
                                />
                            ) : loadingStream ? (
                                <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center bg-black/90">
                                    <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-red-600 animate-spin mb-4"></div>
                                    <span className="text-white/70 text-sm font-semibold">Loading Episode {selectedEpisodeNum}...</span>
                                </div>
                            ) : (
                                <HlsVideoPlayer
                                    streamData={streamData}
                                    animeTitle={anime.title}
                                    episodeNumber={selectedEpisodeNum}
                                    onNextEpisode={handleNextEpisode}
                                    onPrevEpisode={handlePrevEpisode}
                                    hasNextEpisode={hasNextEpisode}
                                    hasPrevEpisode={hasPrevEpisode}
                                    servers={servers}
                                    currentServer={currentServer}
                                    onServerChange={(srv) => {
                                        AdService.triggerDirectAd('server_change');
                                        setCurrentServer(srv);
                                    }}
                                    audioMode={audioMode}
                                    onAudioModeChange={(mode) => setAudioMode(mode)}
                                    onErrorFallback={() => {
                                        AdService.triggerDirectAd('server_change');
                                        setCurrentServer('embed-vidlink');
                                    }}
                                />
                            )}
                        </div>

                        {/* Stream Action Toolbar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 py-3 px-2 text-xs border-b border-white/10">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="text-white/40">Watching:</span>
                                <span className="font-bold text-white truncate max-w-[200px] sm:max-w-none">{anime.title}</span>
                                <span className="text-red-500 font-bold whitespace-nowrap">• S{selectedSeason} · E{selectedEpisodeNum}</span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                {/* Season dropdown in player */}
                                {seasons && seasons.length > 1 && (
                                    <div className="relative">
                                        <select
                                            value={selectedSeason}
                                            onChange={(e) => handleSeasonChange(parseInt(e.target.value, 10))}
                                            className="glass-surface appearance-none pr-7 pl-3 py-1.5 rounded-lg text-white font-bold text-xs cursor-pointer outline-none border border-white/20 bg-black/60"
                                        >
                                            {seasons.map(s => (
                                                <option key={s.seasonNumber} value={s.seasonNumber} style={{ background: '#1a1a1a', color: 'white' }}>
                                                    {s.name || `Season ${s.seasonNumber}`}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-white/50 text-sm">
                                            expand_more
                                        </span>
                                    </div>
                                )}

                                {/* Prev/Next Episode buttons */}
                                <button
                                    onClick={handlePrevEpisode}
                                    disabled={!hasPrevEpisode}
                                    className="glass-surface px-2.5 py-1.5 rounded-lg border border-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 flex items-center gap-1 cursor-pointer"
                                    title="Previous Episode"
                                >
                                    <span className="material-symbols-outlined text-sm">skip_previous</span>
                                    <span className="hidden sm:inline">Prev</span>
                                </button>
                                <button
                                    onClick={handleNextEpisode}
                                    disabled={!hasNextEpisode}
                                    className="glass-surface px-2.5 py-1.5 rounded-lg border border-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 flex items-center gap-1 cursor-pointer"
                                    title="Next Episode"
                                >
                                    <span className="hidden sm:inline">Next</span>
                                    <span className="material-symbols-outlined text-sm">skip_next</span>
                                </button>

                                <button
                                    onClick={() => toggleWatchlist(anime.id, 'anime', anime.poster, anime.title, anime.rating)}
                                    className="glass-surface px-3 py-1.5 rounded-lg border border-white/20 text-white flex items-center gap-1.5 hover:bg-white/10 cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-sm">{inWatchlist ? 'check' : 'bookmark_add'}</span>
                                    <span className="hidden sm:inline">{inWatchlist ? 'In List' : 'Save'}</span>
                                </button>

                                <button
                                    onClick={() => setIsShareModalOpen(true)}
                                    className="glass-surface px-3 py-1.5 rounded-lg border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5 hover:bg-emerald-500/20 cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-sm">share</span>
                                    <span className="hidden sm:inline">Share</span>
                                </button>

                                <button
                                    onClick={toggleUniversalFullscreen}
                                    className="glass-surface px-3 py-1.5 rounded-lg border border-white/20 text-white hover:bg-white/10 flex items-center gap-1.5 cursor-pointer"
                                    title="Toggle Fullscreen (F)"
                                >
                                    <span className="material-symbols-outlined text-sm">
                                        {isUniversalFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                                    </span>
                                </button>

                                <button
                                    onClick={() => setIsPlaying(false)}
                                    className="glass-surface px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-white cursor-pointer font-bold"
                                >
                                    Close
                                </button>
                            </div>
                        </div>

                        {/* Server Selection Toolbar */}
                        <div className="glass-panel rounded-2xl p-3 sm:p-4 my-3 flex flex-col md:flex-row md:items-center justify-between gap-3 overflow-hidden w-full">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <span className="material-symbols-outlined text-red-500 text-2xl flex-shrink-0">play_circle</span>
                                <div className="min-w-0">
                                    <p className="font-bold text-white text-xs sm:text-sm truncate">{anime.title}</p>
                                    <p className="text-white/50 text-[11px] sm:text-xs truncate">
                                        Season {selectedSeason} · Episode {selectedEpisodeNum}
                                    </p>
                                </div>
                            </div>

                            {/* Audio Mode and Anime Servers List */}
                            <div className="w-full md:w-auto md:flex-1 min-w-0 flex items-center gap-2 overflow-x-auto hide-scrollbar py-1">
                                {/* Sub / Dub Audio Toggle */}
                                <div className="flex items-center bg-white/10 p-0.5 rounded-lg shrink-0 border border-white/10 mr-1">
                                    <button
                                        onClick={() => setAudioMode('sub')}
                                        className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                                            audioMode === 'sub' ? 'bg-red-600 text-white shadow' : 'text-white/60 hover:text-white'
                                        }`}
                                    >
                                        SUB
                                    </button>
                                    <button
                                        onClick={() => setAudioMode('dub')}
                                        className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                                            audioMode === 'dub' ? 'bg-red-600 text-white shadow' : 'text-white/60 hover:text-white'
                                        }`}
                                    >
                                        DUB
                                    </button>
                                </div>

                                <span className="text-white/40 text-xs font-bold uppercase tracking-wider mr-1 hidden lg:inline shrink-0">Server</span>

                                {[
                                    { id: 'embed-vidlink', label: 'VidLink (Default)', isEmbed: true },
                                    { id: 'embed-vidsrc', label: 'VidSrc (Mirror)', isEmbed: true },
                                    { id: 'HD-1', label: 'HD-1 (MegaCloud HLS)', isHls: true },
                                    { id: 'HD-2', label: 'HD-2 (MegaPlay HLS)', isHls: true },
                                    { id: 'HD-3', label: 'HD-3 (Ultra HLS)', isHls: true }
                                ].map(srv => (
                                    <button
                                        key={srv.id}
                                        onClick={() => {
                                            AdService.triggerDirectAd('server_change');
                                            setCurrentServer(srv.id);
                                        }}
                                        className={`shrink-0 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                                            currentServer === srv.id
                                                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/40 border border-red-500'
                                                : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                                        }`}
                                    >
                                        {srv.isEmbed && <span className="material-symbols-outlined text-xs text-amber-400">play_circle</span>}
                                        {srv.isHls && <span className="material-symbols-outlined text-xs text-cyan-400">bolt</span>}
                                        <span>{srv.label}</span>
                                    </button>
                                ))}

                                {/* Subtitles Button */}
                                <button
                                    onClick={() => AdService.triggerSubtitles(anime.title, anime.year, selectedSeason, selectedEpisodeNum)}
                                    className="shrink-0 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
                                    title="Search OpenSubtitles"
                                >
                                    <span className="material-symbols-outlined text-sm text-cyan-400">subtitles</span>
                                    <span className="hidden sm:inline">Subtitles</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Hero Backdrop Mode */
                    <div className="relative w-full h-[55vh] md:h-[620px]">
                        <div className="absolute inset-0 z-0">
                            <img
                                className="w-full h-full object-cover"
                                src={anime.backdrop || anime.poster}
                                alt={anime.title}
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/1280x720?text=No+Backdrop'; }}
                            />
                            <div className="absolute inset-0 vignette-left z-10"></div>
                            <div className="absolute inset-0 vignette-bottom z-10"></div>
                        </div>

                        {/* Overlay Content */}
                        <div className="relative z-20 h-full flex flex-col justify-end px-4 md:px-edge-margin pb-8 md:pb-16 max-w-container-max mx-auto">
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl p-5 md:p-8 rounded-2xl max-w-2xl transform hover:scale-[1.01] transition-transform">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="bg-red-600 text-white font-mono font-bold text-[10px] px-2.5 py-0.5 rounded tracking-wide">
                                        ANIME
                                    </span>
                                    {anime.format && (
                                        <span className="border border-white/20 text-white/80 font-bold text-[10px] px-2 py-0.5 rounded uppercase">
                                            {anime.format}
                                        </span>
                                    )}
                                    <RatingBadge rating={anime.rating} />
                                </div>

                                <h1 className="font-display-lg text-2xl md:text-4xl lg:text-5xl mb-2 font-extrabold text-white drop-shadow-md leading-tight">
                                    {anime.title}
                                </h1>

                                {anime.alternativeTitle && anime.alternativeTitle !== anime.title && (
                                    <p className="text-white/60 text-xs md:text-sm font-medium mb-3 italic">
                                        {anime.alternativeTitle}
                                    </p>
                                )}

                                <div className="flex flex-wrap items-center gap-4 text-white/70 text-xs md:text-sm mb-5">
                                    {anime.year && (
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">calendar_today</span> {anime.year}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">layers</span> {seasons.length} {seasons.length === 1 ? 'Season' : 'Seasons'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">movie_filter</span> {episodes.length || anime.episodesCount || 12} Episodes
                                    </span>
                                    {anime.duration && (
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">schedule</span> {anime.duration}
                                        </span>
                                    )}
                                    <div className="flex flex-wrap gap-1.5">
                                        {(anime.genres || []).slice(0, 4).map(g => (
                                            <span key={g} className="px-2 py-0.5 bg-white/10 rounded text-[11px]">
                                                {g}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <p className="text-white/85 text-xs md:text-sm mb-6 line-clamp-3 leading-relaxed">
                                    {anime.overview || anime.synopsis}
                                </p>

                                <div className="flex flex-wrap items-center gap-3">
                                    <button
                                        onClick={handleWatchNow}
                                        className="bg-red-600 hover:bg-red-700 text-white px-7 py-3 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-red-600/40 cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined fill" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                                        <span>Start Episode 1</span>
                                    </button>

                                    <button
                                        onClick={() => toggleWatchlist(anime.id, 'anime', anime.poster, anime.title, anime.rating)}
                                        className="glass-surface hover:bg-white/10 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 border border-white/20 transition-all active:scale-95 cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined">{inWatchlist ? 'check' : 'bookmark_add'}</span>
                                        <span>{inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
                                    </button>

                                    <button
                                        onClick={() => setIsShareModalOpen(true)}
                                        className="glass-surface hover:bg-white/10 text-white/80 hover:text-white p-3 rounded-xl border border-white/20 transition-all active:scale-95 cursor-pointer"
                                        title="Share Anime"
                                    >
                                        <span className="material-symbols-outlined text-emerald-400">share</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* ═══════════════ MAIN DETAILS & EPISODE BROWSER ═══════════════ */}
            <div className="max-w-container-max mx-auto px-4 md:px-edge-margin py-8 space-y-12">
                
                {/* 1. EPISODES SYSTEM WITH SEASON SELECTOR */}
                <section className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                        <div className="flex flex-wrap items-center gap-4">
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-red-500">playlist_play</span>
                                    Episodes
                                    <span className="text-xs text-white/40 font-normal">({episodes.length} Episodes)</span>
                                </h2>
                                <p className="text-white/50 text-xs mt-1">Select an episode to stream in high definition.</p>
                            </div>

                            {/* Season Selector Dropdown */}
                            {seasons && seasons.length > 0 && (
                                <div className="relative ml-0 sm:ml-4">
                                    <select
                                        value={selectedSeason}
                                        onChange={(e) => handleSeasonChange(parseInt(e.target.value, 10))}
                                        className="glass-panel appearance-none pr-10 pl-4 py-2.5 rounded-xl text-white font-bold text-sm cursor-pointer outline-none focus:ring-2 focus:ring-red-500/50 bg-[#141414] border border-white/20 hover:border-red-500/50 transition-all shadow-md"
                                        aria-label="Season Selector"
                                    >
                                        {seasons.map(s => (
                                            <option key={s.seasonNumber} value={s.seasonNumber} style={{ background: '#1a1a1a', color: 'white' }}>
                                                {s.name || `Season ${s.seasonNumber}`} {s.episodeCount ? `(${s.episodeCount} eps)` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/50 text-lg">
                                        expand_more
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Chunk Range Switcher for Large Episode Lists (One Piece, Naruto, etc.) */}
                        {totalChunks > 1 && (
                            <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar max-w-full py-1">
                                {Array.from({ length: totalChunks }, (_, idx) => {
                                    const start = idx * EPISODES_PER_CHUNK + 1;
                                    const end = Math.min((idx + 1) * EPISODES_PER_CHUNK, episodes.length);
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => setChunkIndex(idx)}
                                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                                                chunkIndex === idx
                                                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                                                    : 'glass-surface text-white/60 hover:text-white border border-white/10'
                                            }`}
                                        >
                                            {start}-{end}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Episode Grid */}
                    {loadingEpisodes ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-2.5">
                            {Array.from({ length: 20 }).map((_, i) => (
                                <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : visibleEpisodes.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2.5">
                            {visibleEpisodes.map((ep) => {
                                const isCurrent = ep.episodeNumber === selectedEpisodeNum;
                                return (
                                    <button
                                        key={ep.id || ep.episodeNumber}
                                        onClick={() => handleSelectEpisode(ep.episodeNumber)}
                                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all group cursor-pointer ${
                                            isCurrent
                                                ? 'bg-red-600/20 border-red-500 text-white shadow-lg shadow-red-600/20 ring-1 ring-red-500'
                                                : 'glass-surface border-white/10 hover:border-white/30 text-white/70 hover:text-white'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between w-full mb-1">
                                            <span className={`text-xs font-mono font-bold ${isCurrent ? 'text-red-400' : 'text-white/40'}`}>
                                                #{ep.episodeNumber}
                                            </span>
                                            {ep.isFiller && (
                                                <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded uppercase font-bold">
                                                    Filler
                                                </span>
                                            )}
                                            {isCurrent && isPlaying && (
                                                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                                            )}
                                        </div>
                                        <span className="text-xs font-semibold line-clamp-1 group-hover:text-red-400 transition-colors">
                                            {ep.title}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-white/50 text-sm py-8 text-center">No episodes found for this season.</p>
                    )}
                </section>

                <NativeAdBanner />

                {/* 2. CHARACTERS & VOICE ACTORS */}
                {anime.characters && anime.characters.length > 0 && (
                    <section className="space-y-4">
                        <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-red-500">record_voice_over</span>
                            Characters & Voice Actors
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {anime.characters.slice(0, 8).map((char) => (
                                <div
                                    key={char.id}
                                    className="glass-surface p-3 rounded-xl border border-white/10 flex items-center justify-between gap-3 hover:border-white/20 transition-all"
                                >
                                    {/* Character info */}
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <img
                                            src={char.image || 'https://via.placeholder.com/60x60?text=?'}
                                            alt={char.name}
                                            className="w-12 h-12 rounded-lg object-cover border border-white/10 shrink-0"
                                        />
                                        <div className="min-w-0">
                                            <h4 className="text-xs font-bold text-white truncate">{char.name}</h4>
                                            <span className="text-[10px] text-white/40 uppercase">{char.role || 'Main'}</span>
                                        </div>
                                    </div>

                                    {/* Voice Actor info */}
                                    {char.voiceActor && (
                                        <div className="flex items-center gap-2 text-right shrink-0">
                                            <div className="text-right">
                                                <h5 className="text-[11px] font-semibold text-white/80 line-clamp-1">{char.voiceActor.name}</h5>
                                                <span className="text-[9px] text-red-400">Japanese VA</span>
                                            </div>
                                            <img
                                                src={char.voiceActor.image || 'https://via.placeholder.com/60x60?text=VA'}
                                                alt={char.voiceActor.name}
                                                className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 3. RECOMMENDED ANIME ROW */}
                {anime.recommendations && anime.recommendations.length > 0 && (
                    <MediaRow
                        title="Fans Also Liked"
                        items={anime.recommendations}
                        type="poster"
                    />
                )}

                {/* 4. USER REVIEWS SECTION */}
                <section className="space-y-6 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-400 fill" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            Community Reviews
                            <span className="text-xs text-white/40 font-normal">({reviews.length})</span>
                        </h2>
                    </div>

                    {/* Write Review Form */}
                    <div className="glass-surface p-5 rounded-2xl border border-white/10 space-y-4">
                        <h4 className="text-sm font-bold text-white">Leave your review for {anime.title}</h4>
                        
                        {/* Rating stars */}
                        <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setNewReviewRating(star)}
                                    className="cursor-pointer text-white/30 hover:scale-110 transition-transform"
                                >
                                    <span
                                        className={`material-symbols-outlined text-xl ${
                                            (hoverRating || newReviewRating) >= star ? 'text-amber-400 fill' : 'text-white/30'
                                        }`}
                                        style={{ fontVariationSettings: (hoverRating || newReviewRating) >= star ? "'FILL' 1" : "'FILL' 0" }}
                                    >
                                        star
                                    </span>
                                </button>
                            ))}
                            <span className="text-xs font-mono text-white/60 ml-2">
                                {hoverRating || newReviewRating ? `${hoverRating || newReviewRating} / 10` : 'Select score'}
                            </span>
                        </div>

                        <textarea
                            value={newReviewText}
                            onChange={(e) => setNewReviewText(e.target.value)}
                            placeholder="Share your thoughts about the animation, storyline, pacing..."
                            rows="3"
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-white/40 focus:border-red-500 focus:outline-none resize-none"
                        />

                        <div className="flex justify-end">
                            <button
                                onClick={handleReviewSubmit}
                                disabled={isSubmittingReview}
                                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-6 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                            >
                                {isSubmittingReview ? 'Posting...' : 'Post Review'}
                            </button>
                        </div>
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-3">
                        {reviews.length === 0 ? (
                            <p className="text-white/40 text-xs py-4 text-center">Be the first to review this anime!</p>
                        ) : (
                            reviews.map((rev) => (
                                <div key={rev.id} className="glass-surface p-4 rounded-xl border border-white/5 space-y-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-white">{rev.username || 'Anonymous'}</span>
                                            <span className="bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded text-[10px]">
                                                ★ {rev.rating}/10
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-white/40">
                                            {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'Recent'}
                                        </span>
                                    </div>
                                    <p className="text-white/80 text-xs leading-relaxed">{rev.comment}</p>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                <DisplayAdBanner title="Featured Anime Collectibles" />
            </div>

            {/* Share Modal */}
            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                media={anime}
                type="anime"
            />
        </div>
    );
};

export default AnimeDetails;
