const API_BASE = (import.meta.env?.VITE_API_BASE || 'http://localhost:3001').replace(/\/api$/, '');

class APIError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}

const isValidImage = (value) => typeof value === 'string' && value.trim().length > 0;

const normalizeMediaItem = (item) => {
    if (!item || typeof item !== 'object') return null;

    const mediaType = item.type === 'tv' ? 'tv' : 'movie';
    const id = item.id ?? item.tmdb_id;

    if (id === undefined || id === null || id === '') return null;

    return {
        ...item,
        id: String(id),
        type: mediaType,
        title: item.title || item.name || 'Unknown Title',
        overview: item.overview || '',
        backdrop: isValidImage(item.backdrop) ? item.backdrop : null,
        poster: isValidImage(item.poster) ? item.poster : null,
        rating: Number(item.rating) || 0,
        year: item.year || null,
        duration: item.duration || null,
        genres: Array.isArray(item.genres) ? item.genres : [],
        tag: item.tag || (mediaType === 'tv' ? 'Series' : 'Movie')
    };
};

const normalizeListResponse = (data) => {
    if (Array.isArray(data)) {
        return data.map(normalizeMediaItem).filter(Boolean);
    }

    if (data && Array.isArray(data.results)) {
        return data.results.map(normalizeMediaItem).filter(Boolean);
    }

    return [];
};

const normalizeDetailsResponse = (data) => {
    if (!data || typeof data !== 'object' || Array.isArray(data) || data.error) {
        throw new Error('Invalid media response');
    }

    return normalizeMediaItem(data);
};

const apiRequest = async (endpoint) => {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`);
        const data = await response.json().catch(() => null);

        if (!response.ok) {
            throw new APIError(data?.error || 'API request failed', response.status);
        }

        if (!data || typeof data !== 'object') {
            throw new Error('Invalid response');
        }

        if (data.error && !Array.isArray(data.results)) {
            throw new Error(data.error);
        }

        return data;
    } catch (error) {
        console.error("API Error:", error);
        if (error instanceof APIError) throw error;
        throw new APIError('Network error', 0);
    }
};

const requestList = async (endpoint) => normalizeListResponse(await apiRequest(endpoint));

const requestMedia = async (endpoint) => normalizeDetailsResponse(await apiRequest(endpoint));

export { API_BASE, normalizeListResponse };

export const TMDBService = {
    getTrendingMovies: () => requestList('/api/tmdb/trending'),
    getTrendingTV: () => requestList('/api/tmdb/trending/tv'),
    getTopRatedMovies: () => requestList('/api/tmdb/top-rated/movies'),
    getTopRatedTV: () => requestList('/api/tmdb/top-rated/tv'),
    getNowPlayingMovies: () => requestList('/api/tmdb/now-playing'),
    getActionMovies: () => requestList('/api/tmdb/action/movies'),
    getComedyMovies: () => requestList('/api/tmdb/comedy/movies'),
    getPopularMovies: () => requestList('/api/tmdb/popular/movies'),
    getActionTV: () => requestList('/api/tmdb/action/tv'),
    getPopularTV: () => requestList('/api/tmdb/popular/tv'),

    getMediaDetails: (id, type = 'movie') => requestMedia(`/api/tmdb/${type}/${id}`),
    getMediaCast: (id, type = 'movie') => requestList(`/api/tmdb/media/${type}/${id}/cast`),
    getMediaVideos: (id, type = 'movie') => requestList(`/api/tmdb/media/${type}/${id}/videos`),
    getSimilarMedia: (id, type = 'movie') => requestList(`/api/tmdb/media/${type}/${id}/similar`),
    getSeasonDetails: async (tvId, seasonNumber) => {
        const data = await apiRequest(`/api/tmdb/tv/${tvId}/season/${seasonNumber}`);
        if (!data || typeof data !== 'object' || !Array.isArray(data.episodes)) {
            return { episodes: [] };
        }
        return data;
    },
    getGenres: () => requestList('/api/tmdb/genres'),

    searchMedia: (query, filters = {}) => {
        const params = new URLSearchParams();
        if (query) params.append('query', query);
        params.append('type', filters.type || 'all');
        if (filters.genres && filters.genres.length > 0) params.append('genres', filters.genres.join(','));
        if (filters.providers && filters.providers.length > 0) params.append('providers', filters.providers.join(','));
        if (filters.year) params.append('year', filters.year);
        if (filters.rating) params.append('rating', filters.rating);
        
        return requestList(`/api/tmdb/search?${params.toString()}`);
    },

    getActorCredits: (actorId) => requestList(`/api/tmdb/actor/${actorId}/credits`)
};
