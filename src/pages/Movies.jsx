import { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { TMDBService, normalizeListResponse } from '../services/tmdb';
import { HeroBanner } from '../components/HeroBanner';
import { MediaRow } from '../components/MediaRow';

export const Movies = () => {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [heroIndex, setHeroIndex] = useState(0);
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [actionMovies, setActionMovies] = useState([]);
    const [comedyMovies, setComedyMovies] = useState([]);
    const [popularMovies, setPopularMovies] = useState([]);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                const [trendingData, actionData, comedyData, popularData] = await Promise.all([
                    TMDBService.getTrendingMovies(),
                    TMDBService.getActionMovies(),
                    TMDBService.getComedyMovies(),
                    TMDBService.getPopularMovies()
                ]);
                setTrendingMovies(normalizeListResponse(trendingData));
                setActionMovies(normalizeListResponse(actionData));
                setComedyMovies(normalizeListResponse(comedyData));
                setPopularMovies(normalizeListResponse(popularData));
            } catch (error) {
                console.error("Error fetching TMDB data for Movies:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

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
                <h2 className="text-xl font-bold tracking-widest text-white/50">{t.movies.loading}</h2>
            </div>
        );
    }

    return (
        <div className="w-full pb-16">
            {heroMedia && <HeroBanner media={heroMedia} />}
            <div className="space-y-section-gap relative z-20 -mt-10 md:-mt-20 px-4 md:px-edge-margin max-w-container-max mx-auto">
                {trendingMovies.length > 0 && (
                    <MediaRow title={t.movies.trending} items={trendingMovies} type="poster" />
                )}
                {actionMovies.length > 0 && (
                    <MediaRow title={t.movies.action} items={actionMovies} type="poster" />
                )}
                {comedyMovies.length > 0 && (
                    <MediaRow title={t.movies.comedy} items={comedyMovies} type="poster" />
                )}
                {popularMovies.length > 0 && (
                    <MediaRow title={t.movies.popular} items={popularMovies} type="latest" />
                )}
            </div>
        </div>
    );
};
export default Movies;
