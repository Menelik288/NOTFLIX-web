import { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { AnimeService } from '../services/animeService';
import { HeroBanner } from '../components/HeroBanner';
import { MediaRow } from '../components/MediaRow';
import { NativeAdBanner } from '../components/NativeAdBanner';
import { DisplayAdBanner } from '../components/DisplayAdBanner';
import { MoviesPageSkeleton } from '../components/Skeleton';
import { useApp } from '../context/AppContext';

export const Anime = () => {
    const { t } = useLanguage();
    const { navigateTo } = useApp();
    const [loading, setLoading] = useState(true);
    const [heroIndex, setHeroIndex] = useState(0);

    const [spotlightAnime, setSpotlightAnime] = useState([]);
    const [trendingAnime, setTrendingAnime] = useState([]);
    const [topAiringAnime, setTopAiringAnime] = useState([]);
    const [popularAnime, setPopularAnime] = useState([]);
    const [topRatedAnime, setTopRatedAnime] = useState([]);
    const [upcomingAnime, setUpcomingAnime] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState(null);
    const [genreResults, setGenreResults] = useState([]);
    const [loadingGenre, setLoadingGenre] = useState(false);

    const GENRES = [
        'Action',
        'Adventure',
        'Comedy',
        'Drama',
        'Fantasy',
        'Horror',
        'Mystery',
        'Romance',
        'Sci-Fi',
        'Supernatural'
    ];

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                const [homeData, topRatedData, upcomingData] = await Promise.all([
                    AnimeService.getHome().catch(() => ({})),
                    AnimeService.getList('top-rated', 1).catch(() => []),
                    AnimeService.getList('upcoming', 1).catch(() => [])
                ]);

                if (homeData) {
                    setSpotlightAnime(homeData.spotlight || []);
                    setTrendingAnime(homeData.trending || []);
                    setTopAiringAnime(homeData.topAiring || []);
                    setPopularAnime(homeData.mostPopular || []);
                }
                setTopRatedAnime(topRatedData || []);
                setUpcomingAnime(upcomingData || []);
            } catch (error) {
                console.error('Error fetching anime data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    // Rotate spotlight hero banner every 6 seconds
    useEffect(() => {
        const list = spotlightAnime.length > 0 ? spotlightAnime : trendingAnime;
        if (list.length === 0) return;

        const interval = setInterval(() => {
            setHeroIndex((prev) => (prev + 1) % Math.min(5, list.length));
        }, 6000);
        return () => clearInterval(interval);
    }, [spotlightAnime, trendingAnime]);

    // Handle genre filter chip click
    const handleGenreClick = async (genre) => {
        if (selectedGenre === genre) {
            setSelectedGenre(null);
            setGenreResults([]);
            return;
        }

        setSelectedGenre(genre);
        setLoadingGenre(true);
        try {
            const results = await AnimeService.search('', 1, genre);
            setGenreResults(results || []);
        } catch (e) {
            console.error('Genre search failed:', e);
        } finally {
            setLoadingGenre(false);
        }
    };

    const heroList = spotlightAnime.length > 0 ? spotlightAnime : trendingAnime;
    const heroMedia = heroList.length > 0
        ? { ...heroList[heroIndex], tag: heroList[heroIndex]?.tag || 'Spotlight Anime' }
        : null;

    if (loading) {
        return <MoviesPageSkeleton />;
    }

    return (
        <div className="w-full pb-20 text-left">
            {/* Hero Carousel */}
            {heroMedia && <HeroBanner media={heroMedia} />}

            {/* Main Content Stack */}
            <div className="space-y-section-gap relative z-20 -mt-10 md:-mt-20 px-4 md:px-edge-margin max-w-container-max mx-auto">
                {/* Genre Filter Chips */}
                <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar py-2">
                    <span className="text-white/40 text-xs uppercase font-bold mr-2 tracking-wider flex items-center gap-1 shrink-0">
                        <span className="material-symbols-outlined text-sm">filter_alt</span>
                        Genres:
                    </span>
                    <button
                        onClick={() => { setSelectedGenre(null); setGenreResults([]); }}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                            selectedGenre === null
                                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                                : 'glass-surface text-white/70 hover:text-white border border-white/10'
                        }`}
                    >
                        All Anime
                    </button>
                    {GENRES.map((genre) => (
                        <button
                            key={genre}
                            onClick={() => handleGenreClick(genre)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                                selectedGenre === genre
                                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                                    : 'glass-surface text-white/70 hover:text-white border border-white/10'
                            }`}
                        >
                            {genre}
                        </button>
                    ))}
                </div>

                {/* Filtered Genre Results (if any selected) */}
                {selectedGenre && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex items-center justify-between">
                            <h2 className="font-headline-lg text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-red-500">category</span>
                                {selectedGenre} Anime
                            </h2>
                            <button
                                onClick={() => { setSelectedGenre(null); setGenreResults([]); }}
                                className="text-xs text-white/50 hover:text-white underline cursor-pointer"
                            >
                                Clear Filter
                            </button>
                        </div>
                        {loadingGenre ? (
                            <div className="flex justify-center py-12">
                                <div className="w-10 h-10 border-4 border-white/20 border-t-red-600 rounded-full animate-spin"></div>
                            </div>
                        ) : genreResults.length > 0 ? (
                            <MediaRow title={`${selectedGenre} Hits`} items={genreResults} type="poster" />
                        ) : (
                            <p className="text-white/50 text-sm py-8 text-center">No {selectedGenre} anime found.</p>
                        )}
                    </div>
                )}

                {/* Trending Anime Row */}
                {trendingAnime.length > 0 && (
                    <MediaRow
                        title="Trending Anime This Week"
                        items={trendingAnime}
                        type="poster"
                    />
                )}

                {/* Native Ad Banner */}
                <NativeAdBanner />

                {/* Top Airing Anime Row */}
                {topAiringAnime.length > 0 && (
                    <MediaRow
                        title="Top Airing Right Now"
                        items={topAiringAnime}
                        type="poster"
                    />
                )}

                {/* Most Popular Anime Row */}
                {popularAnime.length > 0 && (
                    <MediaRow
                        title="Most Popular All Time"
                        items={popularAnime}
                        type="latest"
                    />
                )}

                {/* Top Rated Anime Row */}
                {topRatedAnime.length > 0 && (
                    <MediaRow
                        title="Top Rated Masterpieces"
                        items={topRatedAnime}
                        type="poster"
                    />
                )}

                {/* Upcoming Anime Row */}
                {upcomingAnime.length > 0 && (
                    <MediaRow
                        title="Anticipated Upcoming Releases"
                        items={upcomingAnime}
                        type="poster"
                    />
                )}

                {/* Partner Ad Placement */}
                <NativeAdBanner placement="bottom" title="Featured Anime Gear & Deals" />
                <DisplayAdBanner title="Recommended Partner Offers" />
            </div>
        </div>
    );
};

export default Anime;
