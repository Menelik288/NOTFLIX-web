import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../hooks/useLanguage';
import { TMDBService, normalizeListResponse } from '../services/tmdb';
import { HeroBanner } from '../components/HeroBanner';
import { MediaRow } from '../components/MediaRow';

export const Home = () => {
    const { continueWatching } = useApp();
    const { t } = useLanguage();

    const [loading, setLoading] = useState(true);
    const [heroIndex, setHeroIndex] = useState(0);
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [trendingTV, setTrendingTV] = useState([]);
    const [topRatedMovies, setTopRatedMovies] = useState([]);
    const [topRatedTV, setTopRatedTV] = useState([]);
    const [nowPlaying, setNowPlaying] = useState([]);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                const [
                    trendingMoviesData,
                    trendingTVData,
                    topRatedMoviesData,
                    topRatedTVData,
                    nowPlayingData
                ] = await Promise.all([
                    TMDBService.getTrendingMovies(),
                    TMDBService.getTrendingTV(),
                    TMDBService.getTopRatedMovies(),
                    TMDBService.getTopRatedTV(),
                    TMDBService.getNowPlayingMovies()
                ]);
                setTrendingMovies(normalizeListResponse(trendingMoviesData));
                setTrendingTV(normalizeListResponse(trendingTVData));
                setTopRatedMovies(normalizeListResponse(topRatedMoviesData));
                setTopRatedTV(normalizeListResponse(topRatedTVData));
                setNowPlaying(normalizeListResponse(nowPlayingData));
            } catch (error) {
                console.error("Error fetching TMDB data for Home:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    // Cycle the hero banner every 5 seconds
    useEffect(() => {
        if (trendingMovies.length === 0) return;
        const interval = setInterval(() => {
            setHeroIndex((prev) => (prev + 1) % Math.min(5, trendingMovies.length));
        }, 5000);
        return () => clearInterval(interval);
    }, [trendingMovies]);

    const heroMedia = trendingMovies.length > 0 
        ? { ...trendingMovies[heroIndex], tag: "Trending This Week" } 
        : null;

    if (loading) {
        return (
            <div className="w-full h-screen flex flex-col items-center justify-center space-y-4 text-white">
                <div className="w-12 h-12 border-4 border-primary-container border-t-transparent rounded-full animate-spin"></div>
                <h2 className="text-xl font-bold tracking-widest text-white/50">{t.home.loading}</h2>
            </div>
        );
    }

    return (
        <div className="w-full pb-16">
            {heroMedia && <HeroBanner media={heroMedia} />}

            <div className="space-y-section-gap relative z-20 -mt-10 md:-mt-20 px-4 md:px-edge-margin max-w-container-max mx-auto">
                {continueWatching.length > 0 && (
                    <MediaRow title={t.home.continueWatching} items={continueWatching} type="progress" showViewAll={false} />
                )}
                {trendingMovies.length > 0 && (
                    <MediaRow title={t.home.trendingMovies} items={trendingMovies} type="poster" />
                )}
                {trendingTV.length > 0 && (
                    <MediaRow title={t.home.trendingTV} items={trendingTV} type="poster" />
                )}
                {topRatedMovies.length > 0 && (
                    <MediaRow title={t.home.topRatedMovies} items={topRatedMovies} type="latest" />
                )}
                {topRatedTV.length > 0 && (
                    <MediaRow title={t.home.topRatedTV} items={topRatedTV} type="latest" />
                )}
                {nowPlaying.length > 0 && (
                    <MediaRow title={t.home.nowPlaying} items={nowPlaying} type="latest" />
                )}
            </div>
        </div>
    );
};
export default Home;
