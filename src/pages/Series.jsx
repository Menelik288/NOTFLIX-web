import { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { TMDBService, normalizeListResponse } from '../services/tmdb';
import { HeroBanner } from '../components/HeroBanner';
import { MediaRow } from '../components/MediaRow';

export const Series = () => {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [heroIndex, setHeroIndex] = useState(0);
    const [trendingTV, setTrendingTV] = useState([]);
    const [actionTV, setActionTV] = useState([]);
    const [popularTV, setPopularTV] = useState([]);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                
                const [
                    trendingData,
                    actionData,
                    popularData
                ] = await Promise.all([
                    TMDBService.getTrendingTV(),
                    TMDBService.getActionTV(),
                    TMDBService.getPopularTV()
                ]);

                setTrendingTV(normalizeListResponse(trendingData));
                setActionTV(normalizeListResponse(actionData));
                setPopularTV(normalizeListResponse(popularData));

            } catch (error) {
                console.error("Error fetching TMDB data for Series:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    // Cycle the hero banner every 5 seconds
    useEffect(() => {
        if (trendingTV.length === 0) return;
        const interval = setInterval(() => {
            setHeroIndex((prev) => (prev + 1) % Math.min(5, trendingTV.length));
        }, 5000);
        return () => clearInterval(interval);
    }, [trendingTV]);

    const heroMedia = trendingTV.length > 0 
        ? { ...trendingTV[heroIndex], tag: "Trending Series" } 
        : null;

    if (loading) {
        return (
            <div className="w-full h-screen flex flex-col items-center justify-center space-y-4 text-white">
                <div className="w-12 h-12 border-4 border-primary-container border-t-transparent rounded-full animate-spin"></div>
                <h2 className="text-xl font-bold tracking-widest text-white/50">{t.tv.loading}</h2>
            </div>
        );
    }

    return (
        <div className="w-full pb-16">
            {/* Cinematic Hero Banner */}
            {heroMedia && <HeroBanner media={heroMedia} />}

            {/* Content Lists Container */}
            <div className="space-y-section-gap relative z-20 -mt-10 md:-mt-20 px-4 md:px-edge-margin max-w-container-max mx-auto">
                
                {/* Trending TV Now */}
                {trendingTV.length > 0 && (
                    <MediaRow 
                        title={t.tv.trending} 
                        items={trendingTV} 
                        type="poster" 
                    />
                )}

                {/* Action and Adventure */}
                {actionTV.length > 0 && (
                    <MediaRow 
                        title={t.movies.action} 
                        items={actionTV} 
                        type="poster" 
                    />
                )}

                {/* Popular Series */}
                {popularTV.length > 0 && (
                    <MediaRow 
                        title={t.tv.topRated} 
                        items={popularTV} 
                        type="latest" 
                    />
                )}
            </div>
        </div>
    );
};
export default Series;
