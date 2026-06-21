import { TMDBService } from './tmdb.js';
import { notflixCatalog } from '../data/catalog.js';

const isValidMedia = (item) => item && item.id !== undefined && item.id !== null && item.id !== '';

const normalizeArray = (items) => Array.isArray(items) ? items.filter(isValidMedia) : [];

const normalizeSuppressedIds = (suppressedIds = []) => {
    const values = Array.isArray(suppressedIds) ? suppressedIds : [];
    return new Set(values.map(id => String(id)));
};

const isSuppressed = (item, suppressedSet) => suppressedSet.has(String(item.id));

const dedupe = (items) => Array.from(
    new Map(normalizeArray(items).map(item => [String(item.id), item])).values()
);

const localFallback = dedupe(notflixCatalog.filter(isValidMedia));

const getLocalFallback = (suppressedIds = []) => {
    const suppressedSet = normalizeSuppressedIds(suppressedIds);
    return localFallback.filter(item => !isSuppressed(item, suppressedSet));
};

const safeCall = async (label, fetcher, fallback = []) => {
    try {
        const data = await fetcher();
        return Array.isArray(data) ? data : fallback;
    } catch (error) {
        console.error(`Error fetching ${label}:`, error);
        return fallback;
    }
};

const blendTrending = (movies = [], tv = [], suppressedIds = []) => {
    const suppressedSet = normalizeSuppressedIds(suppressedIds);
    const blended = [];
    const maxLen = Math.max(movies.length, tv.length);

    for (let i = 0; i < maxLen; i++) {
        if (movies[i]) blended.push(movies[i]);
        if (tv[i]) blended.push(tv[i]);
    }

    return dedupe(blended.filter(item => !isSuppressed(item, suppressedSet)));
};

export const RecommendationEngine = {
    buildFeed: async (continueWatching = [], watchlist = [], suppressedIds = [], targetFeedSize = 50) => {
        const normalizedContinueWatching = normalizeArray(continueWatching);
        const normalizedWatchlist = normalizeArray(watchlist);
        const suppressedSet = normalizeSuppressedIds(suppressedIds);
        const limit = Math.max(1, Number(targetFeedSize) || 50);

        if (normalizedContinueWatching.length === 0 && normalizedWatchlist.length === 0) {
            return await RecommendationEngine.buildTrendingFallback(suppressedIds);
        }

        const seeds = [];
        const addSeed = (item, sourceOrigin, weight) => {
            if (!isValidMedia(item)) return;
            const type = item.type === 'tv' ? 'tv' : 'movie';
            seeds.push({
                ...item,
                id: String(item.id),
                type,
                sourceOrigin,
                weight
            });
        };

        normalizedContinueWatching.slice(0, 3).forEach(item => addSeed(item, 'history', 1.5));
        normalizedWatchlist.slice(0, 2).forEach(item => addSeed(item, 'watchlist', 1.0));

        const [tMovies, tTV] = await Promise.all([
            safeCall('trending movies', TMDBService.getTrendingMovies, []),
            safeCall('trending TV', TMDBService.getTrendingTV, [])
        ]);

        if (tMovies.length > 0) {
            seeds.push({ ...tMovies[0], id: String(tMovies[0].id), type: 'movie', sourceOrigin: 'trending', weight: 0.8 });
        }
        if (tTV.length > 0) {
            seeds.push({ ...tTV[0], id: String(tTV[0].id), type: 'tv', sourceOrigin: 'trending', weight: 0.8 });
        }

        if (seeds.length === 0 || (tMovies.length === 0 && tTV.length === 0)) {
            return await RecommendationEngine.buildTrendingFallback(suppressedIds);
        }

        const genreCount = {};
        const typeCount = { movie: 0, tv: 0 };
        normalizedContinueWatching.concat(normalizedWatchlist).forEach(item => {
            const type = item.type === 'tv' ? 'tv' : 'movie';
            typeCount[type] = (typeCount[type] || 0) + 1;
            if (Array.isArray(item.genre_ids)) {
                item.genre_ids.forEach(g => {
                    genreCount[g] = (genreCount[g] || 0) + 1;
                });
            }
        });

        const topGenres = Object.entries(genreCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(entry => parseInt(entry[0], 10));
        const dominantType = typeCount.movie >= typeCount.tv ? 'movie' : 'tv';
        const candidatesMap = new Map();

        const seedPromises = seeds.map(async (seed) => {
            const similar = await safeCall(
                `similar media for ${seed.title}`,
                () => TMDBService.getSimilarMedia(seed.id, seed.type),
                []
            );

            similar.forEach(item => {
                if (!isValidMedia(item)) return;

                const idStr = String(item.id);
                if (isSuppressed(item, suppressedSet)) return;
                if (normalizedContinueWatching.some(c => String(c.id) === idStr)) return;
                if (normalizedWatchlist.some(w => String(w.id) === idStr)) return;
                if (item.year) {
                    const yearNum = parseInt(item.year, 10);
                    if (!isNaN(yearNum) && yearNum <= 2004) return;
                }

                if (candidatesMap.has(idStr)) {
                    const existing = candidatesMap.get(idStr);
                    existing.recommendedByCount += 1;
                    existing.seedWeightsSum += seed.weight;
                    existing.recommendedBySeeds.push(seed.id);
                } else {
                    candidatesMap.set(idStr, {
                        media: item,
                        recommendedByCount: 1,
                        seedWeightsSum: seed.weight,
                        primarySeedId: seed.id,
                        primarySeedTitle: seed.title,
                        sourceOrigin: seed.sourceOrigin,
                        recommendedBySeeds: [seed.id]
                    });
                }
            });
        });

        await Promise.all(seedPromises);

        if (candidatesMap.size === 0) {
            return await RecommendationEngine.buildTrendingFallback(suppressedIds);
        }

        const scoredCandidates = Array.from(candidatesMap.values()).map(candidate => {
            const baseScore = (candidate.media.popularity || 0) * 0.1 + ((candidate.media.rating || 0) * 5);
            const overlapMultiplier = 1 + ((candidate.recommendedByCount - 1) * 0.5);
            const candidateGenres = Array.isArray(candidate.media.genre_ids) ? candidate.media.genre_ids : [];
            const genreOverlap = candidateGenres.filter(g => topGenres.includes(g)).length;
            const genreMultiplier = 1 + genreOverlap * 0.2;
            const typeMultiplier = candidate.media.type === dominantType ? 1.1 : 0.9;
            const finalScore = baseScore * candidate.seedWeightsSum * overlapMultiplier * genreMultiplier * typeMultiplier;

            return {
                ...candidate,
                score: finalScore
            };
        });

        const buckets = new Map();
        scoredCandidates.forEach(candidate => {
            const bucketId = candidate.primarySeedId;
            if (!buckets.has(bucketId)) {
                buckets.set(bucketId, {
                    seedId: bucketId,
                    items: []
                });
            }
            buckets.get(bucketId).items.push(candidate);
        });

        const bucketKeys = Array.from(buckets.keys());
        bucketKeys.forEach(key => {
            buckets.get(key).items.sort((a, b) => b.score - a.score);
        });

        if (bucketKeys.length === 0) {
            return await RecommendationEngine.buildTrendingFallback(suppressedIds);
        }

        const finalFeed = [];
        let bucketIndex = 0;
        let bucketsExhausted = 0;
        let lastSeedId = null;
        let lastTypeCount = 0;
        let lastType = null;

        while (finalFeed.length < limit && bucketsExhausted < bucketKeys.length) {
            const currentBucketId = bucketKeys[bucketIndex];
            const bucket = buckets.get(currentBucketId);

            if (bucket.items.length > 0) {
                let itemIndexToPull = 0;
                let foundValidItem = false;

                for (let i = 0; i < bucket.items.length; i++) {
                    const candidateItem = bucket.items[i];

                    if (lastSeedId === currentBucketId && bucketKeys.length > 2) {
                        if (i < bucket.items.length - 1) continue;
                    }

                    if (lastType === candidateItem.media.type && lastTypeCount >= 1) {
                        if (i < bucket.items.length - 1) continue;
                    }

                    itemIndexToPull = i;
                    foundValidItem = true;
                    break;
                }

                if (!foundValidItem && bucket.items.length > 0) {
                    itemIndexToPull = 0;
                    foundValidItem = true;
                }

                if (foundValidItem) {
                    const selected = bucket.items.splice(itemIndexToPull, 1)[0];
                    finalFeed.push(selected.media);

                    lastSeedId = currentBucketId;
                    if (lastType === selected.media.type) {
                        lastTypeCount++;
                    } else {
                        lastType = selected.media.type;
                        lastTypeCount = 1;
                    }
                }
            }

            bucketsExhausted = bucketKeys.filter(k => buckets.get(k).items.length === 0).length;
            bucketIndex = (bucketIndex + 1) % bucketKeys.length;
        }

        const fallbackItems = await RecommendationEngine.buildTrendingFallback(suppressedIds);
        const uniqueFeed = dedupe([...finalFeed, ...fallbackItems]);

        return uniqueFeed.slice(0, limit);
    },

    buildTrendingFallback: async (suppressedIds = []) => {
        const [movies, tv] = await Promise.all([
            safeCall('trending movies', TMDBService.getTrendingMovies, []),
            safeCall('trending TV', TMDBService.getTrendingTV, [])
        ]);

        const blended = blendTrending(movies, tv, suppressedIds);
        if (blended.length > 0) {
            return blended;
        }

        const popularMovies = await safeCall('popular movies', TMDBService.getPopularMovies, []);
        if (popularMovies.length > 0) {
            return dedupe(popularMovies.filter(item => !isSuppressed(item, normalizeSuppressedIds(suppressedIds))));
        }

        return getLocalFallback(suppressedIds);
    }
};
