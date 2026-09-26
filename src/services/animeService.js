import { API_BASE } from './api';

// Cache for client-side queries
const clientCache = new Map();
const getClientCached = (key) => {
    const entry = clientCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
        clientCache.delete(key);
        return null;
    }
    return entry.data;
};

const setClientCached = (key, data, ttlSeconds = 180) => {
    clientCache.set(key, {
        data,
        expiry: Date.now() + ttlSeconds * 1000
    });
};

const apiFetch = async (endpoint) => {
    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            headers: { 'Accept': 'application/json' }
        });
        if (!res.ok) throw new Error(`API error ${res.status}`);
        return await res.json();
    } catch (err) {
        console.warn(`[AnimeService] Failed to fetch ${endpoint}:`, err.message);
        throw err;
    }
};

// Client-side AniList fallback if backend proxy is down or during standalone preview
const fallbackAniListQuery = async (query, variables = {}) => {
    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ query, variables })
        });
        if (!response.ok) return null;
        const json = await response.json();
        return json.data;
    } catch (e) {
        return null;
    }
};

const ANIME_TMDB_MAP = {
    '113415': { tmdbId: 95479, season: 1, totalSeasons: 2, seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: 24, id: '113415' }, { seasonNumber: 2, name: 'Season 2: Shibuya Incident', episodeCount: 23, id: '145064' }] },
    '145064': { tmdbId: 95479, season: 2, totalSeasons: 2, seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: 24, id: '113415' }, { seasonNumber: 2, name: 'Season 2: Shibuya Incident', episodeCount: 23, id: '145064' }] },
    '131573': { tmdbId: 810693, isMovie: true, seasons: [{ seasonNumber: 1, name: 'Movie: JUJUTSU KAISEN 0', episodeCount: 1, id: '131573' }] },
    '85937': { tmdbId: 85937, totalSeasons: 4, seasons: [{ seasonNumber: 1, name: 'Season 1: Unwavering Resolve', episodeCount: 26, id: '101922' }, { seasonNumber: 2, name: 'Season 2: Entertainment District', episodeCount: 18, id: '129874' }, { seasonNumber: 3, name: 'Season 3: Swordsmith Village', episodeCount: 11, id: '145139' }, { seasonNumber: 4, name: 'Season 4: Hashira Training', episodeCount: 8, id: '166240' }] },
    '101922': { tmdbId: 85937, season: 1, totalSeasons: 4, seasons: [{ seasonNumber: 1, name: 'Season 1: Unwavering Resolve', episodeCount: 26, id: '101922' }, { seasonNumber: 2, name: 'Season 2: Entertainment District', episodeCount: 18, id: '129874' }, { seasonNumber: 3, name: 'Season 3: Swordsmith Village', episodeCount: 11, id: '145139' }, { seasonNumber: 4, name: 'Season 4: Hashira Training', episodeCount: 8, id: '166240' }] },
    '129874': { tmdbId: 85937, season: 2, totalSeasons: 4, seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: 26, id: '101922' }, { seasonNumber: 2, name: 'Season 2', episodeCount: 18, id: '129874' }, { seasonNumber: 3, name: 'Season 3', episodeCount: 11, id: '145139' }, { seasonNumber: 4, name: 'Season 4', episodeCount: 8, id: '166240' }] },
    '145139': { tmdbId: 85937, season: 3, totalSeasons: 4, seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: 26, id: '101922' }, { seasonNumber: 2, name: 'Season 2', episodeCount: 18, id: '129874' }, { seasonNumber: 3, name: 'Season 3', episodeCount: 11, id: '145139' }, { seasonNumber: 4, name: 'Season 4', episodeCount: 8, id: '166240' }] },
    '166240': { tmdbId: 85937, season: 4, totalSeasons: 4, seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: 26, id: '101922' }, { seasonNumber: 2, name: 'Season 2', episodeCount: 18, id: '129874' }, { seasonNumber: 3, name: 'Season 3', episodeCount: 11, id: '145139' }, { seasonNumber: 4, name: 'Season 4', episodeCount: 8, id: '166240' }] },
    '16498': { tmdbId: 1429, season: 1, totalSeasons: 4, seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: 25, id: '16498' }, { seasonNumber: 2, name: 'Season 2', episodeCount: 12, id: '20958' }, { seasonNumber: 3, name: 'Season 3', episodeCount: 22, id: '99147' }, { seasonNumber: 4, name: 'Season 4: Final Season', episodeCount: 28, id: '110277' }] },
    '20958': { tmdbId: 1429, season: 2, totalSeasons: 4, seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: 25, id: '16498' }, { seasonNumber: 2, name: 'Season 2', episodeCount: 12, id: '20958' }, { seasonNumber: 3, name: 'Season 3', episodeCount: 22, id: '99147' }, { seasonNumber: 4, name: 'Season 4: Final Season', episodeCount: 28, id: '110277' }] },
    '99147': { tmdbId: 1429, season: 3, totalSeasons: 4, seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: 25, id: '16498' }, { seasonNumber: 2, name: 'Season 2', episodeCount: 12, id: '20958' }, { seasonNumber: 3, name: 'Season 3', episodeCount: 22, id: '99147' }, { seasonNumber: 4, name: 'Season 4: Final Season', episodeCount: 28, id: '110277' }] },
    '110277': { tmdbId: 1429, season: 4, totalSeasons: 4, seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: 25, id: '16498' }, { seasonNumber: 2, name: 'Season 2', episodeCount: 12, id: '20958' }, { seasonNumber: 3, name: 'Season 3', episodeCount: 22, id: '99147' }, { seasonNumber: 4, name: 'Season 4: Final Season', episodeCount: 28, id: '110277' }] },
    '21': { tmdbId: 37854, totalSeasons: 1, seasons: [{ seasonNumber: 1, name: 'All Episodes', episodeCount: 1120, id: '21' }] },
    '151807': { tmdbId: 127532, season: 1, totalSeasons: 2, seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: 12, id: '151807' }, { seasonNumber: 2, name: 'Season 2: Arise from the Shadow', episodeCount: 12, id: '173778' }] },
    '173778': { tmdbId: 127532, season: 2, totalSeasons: 2, seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: 12, id: '151807' }, { seasonNumber: 2, name: 'Season 2: Arise from the Shadow', episodeCount: 12, id: '173778' }] },
    '127230': { tmdbId: 114410, season: 1, totalSeasons: 1, seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: 12, id: '127230' }] },
    '20': { tmdbId: 46260, totalSeasons: 5, seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: 52 }, { seasonNumber: 2, name: 'Season 2', episodeCount: 52 }, { seasonNumber: 3, name: 'Season 3', episodeCount: 52 }, { seasonNumber: 4, name: 'Season 4', episodeCount: 52 }, { seasonNumber: 5, name: 'Season 5', episodeCount: 12 }] },
    '1735': { tmdbId: 31910, totalSeasons: 21, seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: 32 }, { seasonNumber: 2, name: 'Season 2', episodeCount: 21 }, { seasonNumber: 3, name: 'Season 3', episodeCount: 18 }, { seasonNumber: 4, name: 'Season 4', episodeCount: 17 }] },
    '269': { tmdbId: 30984, totalSeasons: 16, seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: 20 }, { seasonNumber: 2, name: 'Season 2', episodeCount: 21 }, { seasonNumber: 3, name: 'Season 3', episodeCount: 22 }] },
    '1535': { tmdbId: 13916, totalSeasons: 1, seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: 37, id: '1535' }] },
    '140960': { tmdbId: 120089, season: 1, totalSeasons: 2, seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: 25, id: '140960' }, { seasonNumber: 2, name: 'Season 2', episodeCount: 12, id: '158871' }] },
    '21459': { tmdbId: 65930, season: 1, totalSeasons: 7, seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: 13 }, { seasonNumber: 2, name: 'Season 2', episodeCount: 25 }, { seasonNumber: 3, name: 'Season 3', episodeCount: 25 }, { seasonNumber: 4, name: 'Season 4', episodeCount: 25 }, { seasonNumber: 5, name: 'Season 5', episodeCount: 25 }, { seasonNumber: 6, name: 'Season 6', episodeCount: 25 }, { seasonNumber: 7, name: 'Season 7', episodeCount: 21 }] },
    '171018': { tmdbId: 251504, season: 1, totalSeasons: 1, seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: 12, id: '171018' }] },
    '154587': { tmdbId: 209867, season: 1, totalSeasons: 1, seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: 28, id: '154587' }] },
    '146065': { tmdbId: 138502, season: 1, totalSeasons: 1, seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: 12, id: '146065' }] },
    '137822': { tmdbId: 137822, season: 1, totalSeasons: 2, seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: 24, id: '137822' }, { seasonNumber: 2, name: 'Season 2: vs. U-20 Japan', episodeCount: 14, id: '163146' }] }
};

const normalizeFallbackMedia = (m) => {
    if (!m) return null;
    const title = m.title?.english || m.title?.romaji || m.title?.native || 'Anime';
    const idStr = String(m.id);
    const malIdStr = m.idMal ? String(m.idMal) : null;
    const extra = ANIME_TMDB_MAP[idStr] || (malIdStr ? ANIME_TMDB_MAP[malIdStr] : null) || {};

    const relations = m.relations?.edges?.map(rel => ({
        relationType: rel.relationType,
        id: String(rel.node?.id),
        title: rel.node?.title?.english || rel.node?.title?.romaji,
        poster: rel.node?.coverImage?.large,
        format: rel.node?.format,
        status: rel.node?.status
    })) || [];

    let seasons = extra.seasons;
    let totalSeasons = extra.totalSeasons;

    if (!seasons) {
        const sequels = relations.filter(r => r.relationType === 'SEQUEL' && r.format !== 'MANGA');
        if (sequels.length > 0) {
            totalSeasons = 1 + sequels.length;
            seasons = [
                { seasonNumber: 1, name: 'Season 1', episodeCount: m.episodes || 12, id: idStr },
                ...sequels.map((seq, idx) => ({
                    seasonNumber: idx + 2,
                    name: seq.title || `Season ${idx + 2}`,
                    episodeCount: null,
                    id: String(seq.id)
                }))
            ];
        } else {
            totalSeasons = 1;
            seasons = [
                { seasonNumber: 1, name: m.format === 'MOVIE' ? 'Movie' : 'Season 1', episodeCount: m.episodes || 12, id: idStr }
            ];
        }
    }

    return {
        id: idStr,
        malId: malIdStr,
        tmdbId: extra.tmdbId ? String(extra.tmdbId) : null,
        type: 'anime',
        title,
        alternativeTitle: m.title?.native || m.title?.romaji || '',
        poster: m.coverImage?.extraLarge || m.coverImage?.large,
        backdrop: m.bannerImage || m.coverImage?.extraLarge,
        rating: m.averageScore ? Number((m.averageScore / 10).toFixed(1)) : 8.0,
        year: m.seasonYear || m.startDate?.year || null,
        duration: m.duration ? `${m.duration}m` : null,
        genres: m.genres || [],
        tag: 'Anime',
        status: m.status || 'COMPLETED',
        totalSeasons: totalSeasons || 1,
        seasons,
        episodesCount: m.episodes || 12,
        episodes: { sub: m.episodes || 12, dub: null, eps: m.episodes || 12 },
        overview: m.description ? m.description.replace(/<[^>]*>/g, '').trim() : '',
        synopsis: m.description ? m.description.replace(/<[^>]*>/g, '').trim() : '',
        studios: m.studios?.nodes?.map(s => s.name) || [],
        characters: m.characters?.edges?.map(edge => ({
            role: edge.role,
            id: edge.node?.id,
            name: edge.node?.name?.full,
            image: edge.node?.image?.large,
            voiceActor: edge.voiceActors?.[0] ? {
                id: edge.voiceActors[0].id,
                name: edge.voiceActors[0].name?.full,
                image: edge.voiceActors[0].image?.large
            } : null
        })) || [],
        recommendations: m.recommendations?.nodes?.map(n => n.mediaRecommendation ? {
            id: String(n.mediaRecommendation.id),
            type: 'anime',
            title: n.mediaRecommendation.title?.english || n.mediaRecommendation.title?.romaji,
            poster: n.mediaRecommendation.coverImage?.large,
            rating: n.mediaRecommendation.averageScore ? Number((n.mediaRecommendation.averageScore / 10).toFixed(1)) : 8.0
        } : null).filter(Boolean) || [],
        relations
    };
};

export const AnimeService = {
    // 1. Get Home Page
    getHome: async () => {
        const cacheKey = 'client:anime:home';
        const cached = getClientCached(cacheKey);
        if (cached) return cached;

        try {
            const data = await apiFetch('/api/anime/home');
            if (data && (data.spotlight?.length || data.trending?.length)) {
                setClientCached(cacheKey, data, 300);
                return data;
            }
        } catch (e) {
            // Fallback to client-side AniList
        }

        const query = `
        query {
          trending: Page(page: 1, perPage: 12) {
            media(type: ANIME, sort: TRENDING_DESC) {
              id idMal title { romaji english native } coverImage { extraLarge large } bannerImage averageScore episodes genres status seasonYear description(asHtml: false)
            }
          }
          popular: Page(page: 1, perPage: 12) {
            media(type: ANIME, sort: POPULARITY_DESC) {
              id idMal title { romaji english native } coverImage { extraLarge large } bannerImage averageScore episodes genres status seasonYear description(asHtml: false)
            }
          }
          topAiring: Page(page: 1, perPage: 12) {
            media(type: ANIME, sort: SCORE_DESC, status: RELEASING) {
              id idMal title { romaji english native } coverImage { extraLarge large } bannerImage averageScore episodes genres status seasonYear description(asHtml: false)
            }
          }
        }
        `;
        const data = await fallbackAniListQuery(query);
        const trending = (data?.trending?.media || []).map(normalizeFallbackMedia).filter(Boolean);
        const popular = (data?.popular?.media || []).map(normalizeFallbackMedia).filter(Boolean);
        const topAiring = (data?.topAiring?.media || []).map(normalizeFallbackMedia).filter(Boolean);

        const result = {
            spotlight: trending.slice(0, 5).map((item, idx) => ({ ...item, rank: idx + 1, tag: 'Trending Spotlight' })),
            trending,
            topAiring,
            mostPopular: popular,
            latestEpisodes: trending.slice(4),
            topUpcoming: popular.slice(4),
            genres: ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Supernatural']
        };

        setClientCached(cacheKey, result, 300);
        return result;
    },

    // 2. Category list
    getList: async (category = 'trending', page = 1) => {
        const cacheKey = `client:anime:list:${category}:${page}`;
        const cached = getClientCached(cacheKey);
        if (cached) return cached;

        try {
            const data = await apiFetch(`/api/anime/${category}?page=${page}`);
            if (Array.isArray(data)) {
                setClientCached(cacheKey, data, 180);
                return data;
            }
        } catch (e) {
            // Fallback
        }

        const query = `
        query ($page: Int) {
          Page(page: $page, perPage: 24) {
            media(type: ANIME, sort: TRENDING_DESC) {
              id idMal title { romaji english native } coverImage { extraLarge large } bannerImage averageScore episodes genres status seasonYear description(asHtml: false)
            }
          }
        }
        `;
        const data = await fallbackAniListQuery(query, { page: Number(page) || 1 });
        const list = (data?.Page?.media || []).map(normalizeFallbackMedia).filter(Boolean);
        setClientCached(cacheKey, list, 180);
        return list;
    },

    // 3. Search anime
    search: async (keyword, page = 1, genre = null) => {
        const q = (keyword || '').trim();
        const cacheKey = `client:anime:search:${q}:${page}:${genre || ''}`;
        const cached = getClientCached(cacheKey);
        if (cached) return cached;

        try {
            const params = new URLSearchParams();
            if (q) params.append('query', q);
            if (page) params.append('page', page);
            if (genre) params.append('genre', genre);

            const data = await apiFetch(`/api/anime/search?${params.toString()}`);
            if (Array.isArray(data)) {
                setClientCached(cacheKey, data, 120);
                return data;
            }
        } catch (e) {
            // Fallback
        }

        const query = `
        query ($search: String, $page: Int, $genre: String) {
          Page(page: $page, perPage: 20) {
            media(type: ANIME, search: $search, genre: $genre, sort: POPULARITY_DESC) {
              id idMal title { romaji english native } coverImage { extraLarge large } bannerImage averageScore episodes genres status seasonYear description(asHtml: false)
            }
          }
        }
        `;
        const data = await fallbackAniListQuery(query, { search: q || undefined, page: Number(page) || 1, genre: genre || undefined });
        const list = (data?.Page?.media || []).map(normalizeFallbackMedia).filter(Boolean);
        setClientCached(cacheKey, list, 120);
        return list;
    },

    // 4. Details
    getDetails: async (id) => {
        const cacheKey = `client:anime:details:${id}`;
        const cached = getClientCached(cacheKey);
        if (cached) return cached;

        try {
            const data = await apiFetch(`/api/anime/details/${id}`);
            if (data && data.title) {
                setClientCached(cacheKey, data, 600);
                return data;
            }
        } catch (e) {
            // Fallback
        }

        const isNumeric = /^\d+$/.test(id);
        const query = isNumeric
            ? `
            query ($id: Int) {
              Media(id: $id, type: ANIME) {
                id idMal title { romaji english native } coverImage { extraLarge large } bannerImage
                startDate { year month day } description(asHtml: false) format status episodes duration genres averageScore
                studios(isMain: true) { nodes { id name } }
                characters(sort: ROLE, perPage: 8) {
                  edges {
                    role node { id name { full } image { large } }
                    voiceActors(language: JAPANESE) { id name { full } image { large } }
                  }
                }
                recommendations(perPage: 8) {
                  nodes {
                    mediaRecommendation { id title { romaji english } coverImage { large } averageScore episodes }
                  }
                }
              }
            }
            `
            : `
            query ($search: String) {
              Media(search: $search, type: ANIME) {
                id idMal title { romaji english native } coverImage { extraLarge large } bannerImage
                startDate { year month day } description(asHtml: false) format status episodes duration genres averageScore
                studios(isMain: true) { nodes { id name } }
                characters(sort: ROLE, perPage: 8) {
                  edges {
                    role node { id name { full } image { large } }
                    voiceActors(language: JAPANESE) { id name { full } image { large } }
                  }
                }
                recommendations(perPage: 8) {
                  nodes {
                    mediaRecommendation { id title { romaji english } coverImage { large } averageScore episodes }
                  }
                }
              }
            }
            `;

        const variables = isNumeric ? { id: parseInt(id, 10) } : { search: id.replace(/-/g, ' ') };
        const data = await fallbackAniListQuery(query, variables);
        const result = normalizeFallbackMedia(data?.Media);
        if (result) {
            setClientCached(cacheKey, result, 600);
        }
        return result;
    },

    // 5. Episodes (Season-Aware)
    getEpisodes: async (id, season = 1) => {
        const seasonNum = parseInt(season, 10) || 1;
        const cacheKey = `client:anime:episodes:${id}:s${seasonNum}`;
        const cached = getClientCached(cacheKey);
        if (cached) return cached;

        try {
            const data = await apiFetch(`/api/anime/episodes/${id}?season=${seasonNum}`);
            if (Array.isArray(data) && data.length > 0) {
                setClientCached(cacheKey, data, 600);
                return data;
            }
        } catch (e) {
            // Synthesize fallback episodes
        }

        // Special curated handling for Jujutsu Kaisen
        if (String(id) === '113415' || String(id) === '95479') {
            const jjkS1Titles = [
                'Ryomen Sukuna', 'For Myself', 'Girl of Steel', 'Curse Womb Must Die',
                'Curse Womb Must Die -II-', 'After Rain', 'Assault', 'Boredom',
                'Small Fry and Reverse Retribution', 'Idle Transfiguration', 'Narrow-minded',
                'To You, Someday', 'Tomorrow', 'Kyoto Sister School Exchange Event - Group Battle 0 -',
                'Kyoto Sister School Exchange Event - Group Battle 1 -', 'Kyoto Sister School Exchange Event - Group Battle 2 -',
                'Kyoto Sister School Exchange Event - Group Battle 3 -', 'Sage', 'Black Flash',
                'Nonstandard', 'Jujutsu Koshien', 'The Origin of Blind Obedience',
                'The Origin of Blind Obedience - 2 -', 'Accomplices'
            ];
            const jjkS2Titles = [
                'Hidden Inventory', 'Hidden Inventory 2', 'Hidden Inventory 3', 'Hidden Inventory 4',
                'Premature Death', "It's Like That", 'Evening Festival', 'The Shibuya Incident',
                'The Shibuya Incident - Gate, Open', 'Pandemonium', 'Seance', 'Dull Knife',
                'Red Scale', 'Fluctuations', 'Fluctuations, Part 2', 'Thunderclap',
                'Thunderclap, Part 2', 'Right and Wrong', 'Right and Wrong, Part 2', 'Right and Wrong, Part 3',
                'Metamorphosis', 'Metamorphosis, Part 2', 'Shibuya Incident - Gate, Close'
            ];

            const activeTitles = seasonNum === 2 ? jjkS2Titles : jjkS1Titles;
            const eps = activeTitles.map((title, i) => ({
                episodeNumber: i + 1,
                title: `${i + 1}. ${title}`,
                alternativeTitle: '',
                id: `${id}::s=${seasonNum}::ep=${i + 1}`,
                isFiller: false
            }));
            setClientCached(cacheKey, eps, 600);
            return eps;
        }

        const details = await AnimeService.getDetails(id);
        const seasonInfo = (details?.seasons || []).find(s => s.seasonNumber === seasonNum);
        const count = seasonInfo?.episodeCount || (seasonNum === 1 ? (details?.episodesCount || 12) : 12);
        const total = Math.min(Math.max(count, 1), 2000);
        const eps = Array.from({ length: total }, (_, i) => ({
            episodeNumber: i + 1,
            title: `Episode ${i + 1}`,
            alternativeTitle: '',
            id: `${id}::s=${seasonNum}::ep=${i + 1}`,
            isFiller: false
        }));
        setClientCached(cacheKey, eps, 600);
        return eps;
    },

    // 6. Servers
    getServers: async (episodeId) => {
        try {
            const data = await apiFetch(`/api/anime/servers?id=${encodeURIComponent(episodeId)}`);
            if (data && (data.sub || data.dub)) return data;
        } catch (e) {
            // Fallback
        }

        return {
            sub: [
                { index: 1, type: 'sub', id: 'hd-1', name: 'HD-1 (HLS)' },
                { index: 2, type: 'sub', id: 'hd-2', name: 'HD-2 (MegaCloud)' },
                { index: 4, type: 'sub', id: 'hd-4', name: 'HD-4 (Ultra)' }
            ],
            dub: [
                { index: 1, type: 'dub', id: 'hd-1-dub', name: 'HD-1 (Dub)' },
                { index: 2, type: 'dub', id: 'hd-2-dub', name: 'HD-2 (Dub)' }
            ]
        };
    },

    // 7. Stream (No Big Buck Bunny fallback)
    getStream: async (episodeId, server = 'HD-1', type = 'sub', title = '') => {
        try {
            const titleParam = title ? `&title=${encodeURIComponent(title)}` : '';
            const data = await apiFetch(`/api/anime/stream?id=${encodeURIComponent(episodeId)}&server=${encodeURIComponent(server)}&type=${encodeURIComponent(type)}${titleParam}`);
            if (data && data.sources?.length && data.hasHls) return data;
        } catch (e) {
            // Fallback
        }

        return {
            sources: [],
            subtitles: [],
            hasHls: false,
            serverUsed: server,
            typeUsed: type,
            isFallback: true
        };
    }
};

export default AnimeService;
