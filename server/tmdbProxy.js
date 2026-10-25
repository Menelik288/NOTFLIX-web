import fs from 'fs';

const loadServerEnv = () => {
    const envPath = decodeURIComponent(new URL('./.env', import.meta.url).pathname);
    if (!fs.existsSync(envPath)) return;

    fs.readFileSync(envPath, 'utf8')
        .split(/\r?\n/)
        .forEach(line => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) return;

            const separatorIndex = trimmed.indexOf('=');
            if (separatorIndex === -1) return;

            const key = trimmed.slice(0, separatorIndex).trim();
            const value = trimmed.slice(separatorIndex + 1).trim();
            if (key && value && process.env[key] === undefined) {
                process.env[key] = value;
            }
        });
};

loadServerEnv();

const getTMDBApiKey = () => {
    const raw = process.env.TMDB_API_KEY || process.env.VITE_TMDB_API_KEY || '';
    if (typeof raw !== 'string') return '';
    return raw.trim().replace(/^["']|["']$/g, '');
};
const getTMDBBaseUrl = () => {
    const raw = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';
    return raw.trim().replace(/^["']|["']$/g, '');
};

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';

const mapTMDBToNotFlix = (item, defaultType = 'movie') => {
    const type = item.media_type || defaultType;
    const title = item.title || item.name || 'Unknown Title';
    const match = Math.floor(Math.random() * 20) + 80;

    return {
        id: item.id.toString(),
        type: type,
        title: title,
        overview: item.overview || 'No overview available.',
        backdrop: item.backdrop_path ? `${IMAGE_BASE_URL}${item.backdrop_path}` : null,
        poster: item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : null,
        rating: item.vote_average ? parseFloat(item.vote_average.toFixed(1)) : 0,
        match: match,
        year: item.release_date ? parseInt(item.release_date.substring(0, 4)) : (item.first_air_date ? parseInt(item.first_air_date.substring(0, 4)) : null),
        genres: [],
        tag: type === 'movie' ? 'Movie' : 'Series',
        duration: type === 'movie' ? '2h' : '1 Season',
        cast: [],
        trailer: "https://www.w3schools.com/html/mov_bbb.mp4"
    };
};

const fetchTMDB = async (endpoint) => {
    const apiKey = getTMDBApiKey();
    if (!apiKey) {
        throw new Error('TMDB_API_KEY environment variable is required');
    }
    const baseUrl = getTMDBBaseUrl();
    const separator = endpoint.includes('?') ? '&' : '?';
    const url = `${baseUrl}${endpoint}${separator}api_key=${apiKey}`;

    console.log('Fetching TMDB:', endpoint);

    const response = await fetch(url);
    if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new Error(`TMDB API Error: ${response.status} ${response.statusText}${body ? ` - ${body}` : ''}`);
    }
    const data = await response.json();
    return data.results || [];
};

const fetchTMDBItem = async (endpoint) => {
    const apiKey = getTMDBApiKey();
    if (!apiKey) {
        throw new Error('TMDB_API_KEY environment variable is required');
    }
    const baseUrl = getTMDBBaseUrl();
    const separator = endpoint.includes('?') ? '&' : '?';
    const url = `${baseUrl}${endpoint}${separator}api_key=${apiKey}`;

    console.log('Fetching TMDB:', endpoint);

    const response = await fetch(url);
    if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new Error(`TMDB API Error: ${response.status} ${response.statusText}${body ? ` - ${body}` : ''}`);
    }
    return await response.json();
};

const CUSTOM_TV_MAPPINGS = {
    // Lupin: Netflix split Part 1 (5 eps) and Part 2 (5 eps), but TMDB combined them into Season 1 (10 eps).
    // Streaming embed providers (VidSrc, Vidbing/MoviesAPI, VidCore, etc.) follow Netflix/IMDb standard:
    // Season 1 = Part 1 (eps 1..5)
    // Season 2 = Part 2 (eps 1..5)
    // Season 3 = Part 3 (eps 1..7)
    // Season 4 = Part 4 (eps 1..8 - released Oct 23, 2026)
    '96677': {
        totalSeasons: 4,
        duration: '4 Seasons',
        seasons: [
            { id: 157243, name: 'Part 1', seasonNumber: 1, episodeCount: 5, airDate: '2021-01-08' },
            { id: 157243, name: 'Part 2', seasonNumber: 2, episodeCount: 5, airDate: '2021-06-11' },
            { id: 310008, name: 'Part 3', seasonNumber: 3, episodeCount: 7, airDate: '2023-10-05' },
            { id: 456251, name: 'Part 4', seasonNumber: 4, episodeCount: 8, airDate: '2026-10-23' }
        ],
        getSeason: async (seasonNumber) => {
            const num = parseInt(seasonNumber, 10);
            if (num === 1) {
                const s1 = await fetchTMDBItem('/tv/96677/season/1');
                if (!s1) return null;
                return {
                    id: s1.id,
                    seasonNumber: 1,
                    name: 'Part 1',
                    overview: s1.overview || '',
                    poster: s1.poster_path ? `${IMAGE_BASE_URL}${s1.poster_path}` : null,
                    airDate: '2021-01-08',
                    episodes: (s1.episodes || []).slice(0, 5).map(ep => ({
                        id: ep.id,
                        episodeNumber: ep.episode_number,
                        name: ep.name || `Episode ${ep.episode_number}`,
                        overview: ep.overview || '',
                        still: ep.still_path ? `${IMAGE_BASE_URL}${ep.still_path}` : null,
                        runtime: ep.runtime || 0,
                        airDate: ep.air_date
                    }))
                };
            }
            if (num === 2) {
                const s1 = await fetchTMDBItem('/tv/96677/season/1');
                if (!s1) return null;
                return {
                    id: s1.id,
                    seasonNumber: 2,
                    name: 'Part 2',
                    overview: s1.overview || '',
                    poster: s1.poster_path ? `${IMAGE_BASE_URL}${s1.poster_path}` : null,
                    airDate: '2021-06-11',
                    episodes: (s1.episodes || []).slice(5, 10).map((ep, idx) => ({
                        id: ep.id,
                        episodeNumber: idx + 1,
                        name: ep.name || `Episode ${idx + 1}`,
                        overview: ep.overview || '',
                        still: ep.still_path ? `${IMAGE_BASE_URL}${ep.still_path}` : null,
                        runtime: ep.runtime || 0,
                        airDate: ep.air_date
                    }))
                };
            }
            if (num === 3) {
                const s2 = await fetchTMDBItem('/tv/96677/season/2');
                if (!s2) return null;
                return {
                    id: s2.id,
                    seasonNumber: 3,
                    name: 'Part 3',
                    overview: s2.overview || '',
                    poster: s2.poster_path ? `${IMAGE_BASE_URL}${s2.poster_path}` : null,
                    airDate: s2.air_date,
                    episodes: (s2.episodes || []).map(ep => ({
                        id: ep.id,
                        episodeNumber: ep.episode_number,
                        name: ep.name || `Episode ${ep.episode_number}`,
                        overview: ep.overview || '',
                        still: ep.still_path ? `${IMAGE_BASE_URL}${ep.still_path}` : null,
                        runtime: ep.runtime || 0,
                        airDate: ep.air_date
                    }))
                };
            }
            if (num === 4) {
                const s3 = await fetchTMDBItem('/tv/96677/season/3');
                if (!s3) return null;
                return {
                    id: s3.id,
                    seasonNumber: 4,
                    name: 'Part 4',
                    overview: s3.overview || '',
                    poster: s3.poster_path ? `${IMAGE_BASE_URL}${s3.poster_path}` : null,
                    airDate: s3.air_date,
                    episodes: (s3.episodes || []).map(ep => ({
                        id: ep.id,
                        episodeNumber: ep.episode_number,
                        name: ep.name || `Episode ${ep.episode_number}`,
                        overview: ep.overview || '',
                        still: ep.still_path ? `${IMAGE_BASE_URL}${ep.still_path}` : null,
                        runtime: ep.runtime || 0,
                        airDate: ep.air_date
                    }))
                };
            }
            return null;
        }
    }
};

export const TMDBService = {
    getTrendingMovies: async () => {
        const results = await fetchTMDB('/trending/movie/week');
        return results.map(item => mapTMDBToNotFlix(item, 'movie')).filter(i => i.backdrop && i.poster);
    },

    getTrendingTV: async () => {
        const results = await fetchTMDB('/trending/tv/week');
        return results.map(item => mapTMDBToNotFlix(item, 'tv')).filter(i => i.backdrop && i.poster);
    },

    getTopRatedMovies: async () => {
        const results = await fetchTMDB('/discover/movie?sort_by=vote_average.desc&vote_count.gte=10000');
        return results.map(item => mapTMDBToNotFlix(item, 'movie')).filter(i => i.backdrop && i.poster);
    },

    getTopRatedTV: async () => {
        const results = await fetchTMDB('/discover/tv?sort_by=vote_average.desc&vote_count.gte=1000');
        return results.map(item => mapTMDBToNotFlix(item, 'tv')).filter(i => i.backdrop && i.poster);
    },

    getNowPlayingMovies: async () => {
        const results = await fetchTMDB('/movie/now_playing');
        return results.map(item => mapTMDBToNotFlix(item, 'movie')).filter(i => i.backdrop && i.poster);
    },

    getActionMovies: async () => {
        const results = await fetchTMDB('/discover/movie?with_genres=28');
        return results.map(item => mapTMDBToNotFlix(item, 'movie')).filter(i => i.backdrop && i.poster);
    },

    getComedyMovies: async () => {
        const results = await fetchTMDB('/discover/movie?with_genres=35');
        return results.map(item => mapTMDBToNotFlix(item, 'movie')).filter(i => i.backdrop && i.poster);
    },

    getPopularMovies: async () => {
        const results = await fetchTMDB('/discover/movie?sort_by=revenue.desc');
        return results.map(item => mapTMDBToNotFlix(item, 'movie')).filter(i => i.backdrop && i.poster);
    },

    getActionTV: async () => {
        const results = await fetchTMDB('/discover/tv?with_genres=10759');
        return results.map(item => mapTMDBToNotFlix(item, 'tv')).filter(i => i.backdrop && i.poster);
    },

    getPopularTV: async () => {
        const results = await fetchTMDB('/discover/tv?sort_by=vote_count.desc');
        return results.map(item => mapTMDBToNotFlix(item, 'tv')).filter(i => i.backdrop && i.poster);
    },

    getMediaDetails: async (id, type = 'movie') => {
        const data = await fetchTMDBItem(`/${type}/${id}`);
        const mapped = mapTMDBToNotFlix(data, type);
        mapped.genres = data.genres ? data.genres.map(g => g.name) : [];
        
        if (type === 'movie') {
            const h = Math.floor(data.runtime / 60);
            const m = data.runtime % 60;
            mapped.duration = data.runtime ? `${h}h ${m}m` : 'N/A';
        } else {
            mapped.duration = data.number_of_seasons ? `${data.number_of_seasons} Seasons` : '1 Season';
            mapped.totalSeasons = data.number_of_seasons || 1;
            mapped.totalEpisodes = data.number_of_episodes || 0;
            mapped.seasons = Array.isArray(data.seasons) ? data.seasons.map(s => ({
                id: s.id,
                name: s.name,
                seasonNumber: s.season_number,
                episodeCount: s.episode_count,
                airDate: s.air_date,
                overview: s.overview || '',
                poster: s.poster_path ? `${IMAGE_BASE_URL}${s.poster_path}` : null
            })) : [];

            // Custom show mapping overrides (e.g. Lupin)
            if (CUSTOM_TV_MAPPINGS[String(id)]) {
                const custom = CUSTOM_TV_MAPPINGS[String(id)];
                mapped.duration = custom.duration;
                mapped.totalSeasons = custom.totalSeasons;
                mapped.seasons = custom.seasons.map(s => ({
                    ...s,
                    overview: s.overview || '',
                    poster: s.poster ? s.poster : (mapped.poster || null)
                }));
            }
        }
        
        return mapped;
    },

    getMediaCast: async (id, type = 'movie') => {
        const data = await fetchTMDBItem(`/${type}/${id}/credits`);
        if (!data || !data.cast) return [];
        return data.cast.slice(0, 10).map(actor => ({
            id: actor.id,
            name: actor.name,
            character: actor.character,
            avatar: actor.profile_path ? `${IMAGE_BASE_URL}${actor.profile_path}` : 'https://via.placeholder.com/150'
        }));
    },

    getMediaVideos: async (id, type = 'movie') => {
        const data = await fetchTMDBItem(`/${type}/${id}/videos`);
        if (!data || !data.results) return [];
        return data.results.filter(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser' || v.type === 'Clip'));
    },

    getActorCredits: async (actorId) => {
        const data = await fetchTMDBItem(`/person/${actorId}/combined_credits`);
        if (!data || !data.cast) return [];
        return data.cast
            .map(item => mapTMDBToNotFlix(item, item.media_type))
            .filter(i => i.backdrop && i.poster)
            .sort((a, b) => Number(b.popularity || 0) - Number(a.popularity || 0));
    },

    getSimilarMedia: async (id, type = 'movie') => {
        const results = await fetchTMDB(`/${type}/${id}/similar`);
        return results.map(item => mapTMDBToNotFlix(item, type)).filter(i => i.backdrop && i.poster);
    },

    getSeasonDetails: async (tvId, seasonNumber) => {
        if (CUSTOM_TV_MAPPINGS[String(tvId)]) {
            const customSeason = await CUSTOM_TV_MAPPINGS[String(tvId)].getSeason(seasonNumber);
            if (customSeason) return customSeason;
        }

        const data = await fetchTMDBItem(`/tv/${tvId}/season/${seasonNumber}`);
        if (!data) return null;
        return {
            id: data.id,
            seasonNumber: data.season_number,
            name: data.name || `Season ${seasonNumber}`,
            overview: data.overview || '',
            poster: data.poster_path ? `${IMAGE_BASE_URL}${data.poster_path}` : null,
            airDate: data.air_date,
            episodes: (data.episodes || []).map(ep => ({
                id: ep.id,
                episodeNumber: ep.episode_number,
                name: ep.name || `Episode ${ep.episode_number}`,
                overview: ep.overview || '',
                still: ep.still_path ? `${IMAGE_BASE_URL}${ep.still_path}` : null,
                runtime: ep.runtime || 0,
                airDate: ep.air_date
            }))
        };
    },

    getGenres: async () => {
        const [movieData, tvData] = await Promise.all([
            fetchTMDBItem('/genre/movie/list'),
            fetchTMDBItem('/genre/tv/list')
        ]);
        
        const movieGenres = movieData?.genres || [];
        const tvGenres = tvData?.genres || [];
        
        const genreMap = new Map();
        [...movieGenres, ...tvGenres].forEach(g => {
            genreMap.set(g.id, g.name);
        });
        
        return Array.from(genreMap.entries())
            .map(([id, name]) => ({ id, name }))
            .sort((a, b) => a.name.localeCompare(b.name));
    },

    searchMedia: async (query, filters = {}) => {
        const { type = 'all', genres = [], providers = [], year, rating } = filters;
        
        let endpoint = '';
        let queryParams = '';
        
        if (query && query.trim() !== '') {
            if (type === 'movie') endpoint = '/search/movie';
            else if (type === 'tv') endpoint = '/search/tv';
            else endpoint = '/search/multi';
            
            queryParams += `&query=${encodeURIComponent(query)}`;
        } else {
            if (type === 'movie' || type === 'all') endpoint = '/discover/movie';
            else endpoint = '/discover/tv';
            
            if (genres.length > 0) {
                queryParams += `&with_genres=${encodeURIComponent(genres.join('|'))}`;
            }
            if (providers.length > 0) {
                queryParams += `&with_watch_providers=${encodeURIComponent(providers.join('|'))}&watch_region=US`;
            }
            if (year) {
                if (endpoint.includes('movie')) queryParams += `&primary_release_year=${year}`;
                if (endpoint.includes('tv')) queryParams += `&first_air_date_year=${year}`;
            }
            if (rating) {
                queryParams += `&vote_average.gte=${rating}`;
            }
        }

        const results = await fetchTMDB(`${endpoint}?include_adult=false${queryParams}`);
        
        let mapped = results.map(item => mapTMDBToNotFlix(item, endpoint.includes('tv') ? 'tv' : 'movie'))
            .filter(i => i.backdrop && i.poster);

        if (query && query.trim() !== '') {
            if (year) {
                mapped = mapped.filter(item => item.year === parseInt(year));
            }
            if (rating) {
                mapped = mapped.filter(item => item.rating >= parseInt(rating));
            }
        }
        
        if (!query && type === 'all') {
            const tvEndpoint = '/discover/tv';
            const tvResults = await fetchTMDB(`${tvEndpoint}?include_adult=false${queryParams}`);
            const tvMapped = tvResults.map(item => mapTMDBToNotFlix(item, 'tv'))
                .filter(i => i.backdrop && i.poster);
            
            let blended = [];
            const maxLen = Math.max(mapped.length, tvMapped.length);
            for (let i = 0; i < maxLen; i++) {
                if (mapped[i]) blended.push(mapped[i]);
                if (tvMapped[i]) blended.push(tvMapped[i]);
            }
            mapped = blended;
        }

        return mapped;
    }
};