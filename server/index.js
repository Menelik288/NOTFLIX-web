import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { TMDBService } from './tmdbProxy.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'production' ? 500 : 2000, // Increased limit to prevent blank pages during dev
    message: { error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

const reviewLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: { error: 'Too many reviews submitted, please wait before trying again' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', limiter);
app.use('/api/reviews', reviewLimiter);

const sanitizeString = (str) => {
    if (typeof str !== 'string') return '';
    return str.trim().substring(0, 1000);
};

const sanitizeNumber = (num, min = 0, max = 2147483647) => {
    const parsed = parseInt(num, 10);
    if (isNaN(parsed)) return null;
    return Math.max(min, Math.min(max, parsed));
};

app.get('/api/tmdb/trending', async (req, res) => {
    try {
        const data = await TMDBService.getTrendingMovies();
        res.json(data);
    } catch (error) {
        console.error('TMDB error:', error.message);
        res.status(500).json({ error: 'Failed to fetch trending movies' });
    }
});

app.get('/api/tmdb/trending/movies', async (req, res) => {
    try {
        const data = await TMDBService.getTrendingMovies();
        res.json(data);
    } catch (error) {
        console.error('TMDB error:', error.message);
        res.status(500).json({ error: 'Failed to fetch trending movies' });
    }
});

app.get('/api/tmdb/trending/tv', async (req, res) => {
    try {
        const data = await TMDBService.getTrendingTV();
        res.json(data);
    } catch (error) {
        console.error('TMDB error:', error.message);
        res.status(500).json({ error: 'Failed to fetch trending TV shows' });
    }
});

app.get('/api/tmdb/top-rated/movies', async (req, res) => {
    try {
        const data = await TMDBService.getTopRatedMovies();
        res.json(data);
    } catch (error) {
        console.error('TMDB error:', error.message);
        res.status(500).json({ error: 'Failed to fetch top rated movies' });
    }
});

app.get('/api/tmdb/top-rated/tv', async (req, res) => {
    try {
        const data = await TMDBService.getTopRatedTV();
        res.json(data);
    } catch (error) {
        console.error('TMDB error:', error.message);
        res.status(500).json({ error: 'Failed to fetch top rated TV shows' });
    }
});

app.get('/api/tmdb/now-playing', async (req, res) => {
    try {
        const data = await TMDBService.getNowPlayingMovies();
        res.json(data);
    } catch (error) {
        console.error('TMDB error:', error.message);
        res.status(500).json({ error: 'Failed to fetch now playing movies' });
    }
});

app.get('/api/tmdb/genres', async (req, res) => {
    try {
        const data = await TMDBService.getGenres();
        res.json(data);
    } catch (error) {
        console.error('TMDB error:', error.message);
        res.status(500).json({ error: 'Failed to fetch genres' });
    }
});

app.get('/api/tmdb/movie/:id', async (req, res) => {
    const id = sanitizeNumber(req.params.id);

    if (!id) {
        return res.status(400).json({ error: 'Invalid movie ID' });
    }

    try {
        const data = await TMDBService.getMediaDetails(id, 'movie');
        if (!data) {
            return res.status(404).json({ error: 'Movie not found' });
        }
        res.json(data);
    } catch (error) {
        console.error('TMDB error:', error.message);
        res.status(500).json({ error: 'Failed to fetch movie details' });
    }
});

app.get('/api/tmdb/media/:type/:id', async (req, res) => {
    const type = sanitizeString(req.params.type);
    const id = sanitizeNumber(req.params.id);
    
    if (!id) {
        return res.status(400).json({ error: 'Invalid media ID' });
    }
    
    if (type !== 'movie' && type !== 'tv') {
        return res.status(400).json({ error: 'Invalid media type' });
    }
    
    try {
        const data = await TMDBService.getMediaDetails(id, type);
        if (!data) {
            return res.status(404).json({ error: 'Media not found' });
        }
        res.json(data);
    } catch (error) {
        console.error('TMDB error:', error.message);
        res.status(500).json({ error: 'Failed to fetch media details' });
    }
});

app.get('/api/tmdb/media/:type/:id/cast', async (req, res) => {
    const type = sanitizeString(req.params.type);
    const id = sanitizeNumber(req.params.id);
    
    if (!id) {
        return res.status(400).json({ error: 'Invalid media ID' });
    }
    
    if (type !== 'movie' && type !== 'tv') {
        return res.status(400).json({ error: 'Invalid media type' });
    }
    
    try {
        const data = await TMDBService.getMediaCast(id, type);
        res.json(data);
    } catch (error) {
        console.error('TMDB error:', error.message);
        res.status(500).json({ error: 'Failed to fetch cast' });
    }
});

app.get('/api/tmdb/media/:type/:id/similar', async (req, res) => {
    const type = sanitizeString(req.params.type);
    const id = sanitizeNumber(req.params.id);
    
    if (!id) {
        return res.status(400).json({ error: 'Invalid media ID' });
    }
    
    try {
        const data = await TMDBService.getSimilarMedia(id, type);
        res.json(data);
    } catch (error) {
        console.error('TMDB error:', error.message);
        res.status(500).json({ error: 'Failed to fetch similar media' });
    }
});

app.get('/api/tmdb/media/:type/:id/videos', async (req, res) => {
    const type = sanitizeString(req.params.type);
    const id = sanitizeNumber(req.params.id);
    
    if (!id) {
        return res.status(400).json({ error: 'Invalid media ID' });
    }
    
    try {
        const data = await TMDBService.getMediaVideos(id, type);
        res.json(data);
    } catch (error) {
        console.error('TMDB error:', error.message);
        res.status(500).json({ error: 'Failed to fetch media videos' });
    }
});

app.get('/api/tmdb/tv/:id', async (req, res) => {
    const id = sanitizeNumber(req.params.id);

    if (!id) {
        return res.status(400).json({ error: 'Invalid TV ID' });
    }

    try {
        const data = await TMDBService.getMediaDetails(id, 'tv');
        if (!data) {
            return res.status(404).json({ error: 'TV show not found' });
        }
        res.json(data);
    } catch (error) {
        console.error('TMDB error:', error.message);
        res.status(500).json({ error: 'Failed to fetch TV show details' });
    }
});

app.get('/api/tmdb/tv/:id/season/:season', async (req, res) => {
    const tvId = sanitizeNumber(req.params.id);
    const season = sanitizeNumber(req.params.season);
    
    if (!tvId || !season) {
        return res.status(400).json({ error: 'Invalid TV ID or season number' });
    }
    
    try {
        const data = await TMDBService.getSeasonDetails(tvId, season);
        if (!data) {
            return res.status(404).json({ error: 'Season not found' });
        }
        res.json(data);
    } catch (error) {
        console.error('TMDB error:', error.message);
        res.status(500).json({ error: 'Failed to fetch season details' });
    }
});

app.get('/api/tmdb/search', async (req, res) => {
    const query = sanitizeString(req.query.query || '');
    const type = sanitizeString(req.query.type || 'all');
    const genres = req.query.genres ? req.query.genres.split(',').map(sanitizeNumber).filter(Boolean) : [];
    const providers = req.query.providers ? req.query.providers.split(',').map(sanitizeNumber).filter(Boolean) : [];
    const year = sanitizeNumber(req.query.year);
    const rating = sanitizeNumber(req.query.rating, 0, 10);
    
    try {
        const data = await TMDBService.searchMedia(query, { type, genres, providers, year, rating });
        res.json(data);
    } catch (error) {
        console.error('TMDB error:', error.message);
        res.status(500).json({ error: 'Search failed' });
    }
});

app.get('/api/tmdb/action/movies', async (req, res) => {
    try {
        const data = await TMDBService.getActionMovies();
        res.json(data);
    } catch (error) {
        console.error('TMDB error:', error.message);
        res.status(500).json({ error: 'Failed to fetch action movies' });
    }
});

app.get('/api/tmdb/comedy/movies', async (req, res) => {
    try {
        const data = await TMDBService.getComedyMovies();
        res.json(data);
    } catch (error) {
        console.error('TMDB error:', error.message);
        res.status(500).json({ error: 'Failed to fetch comedy movies' });
    }
});

app.get('/api/tmdb/popular/movies', async (req, res) => {
    try {
        const data = await TMDBService.getPopularMovies();
        res.json(data);
    } catch (error) {
        console.error('TMDB error:', error.message);
        res.status(500).json({ error: 'Failed to fetch popular movies' });
    }
});

app.get('/api/tmdb/action/tv', async (req, res) => {
    try {
        const data = await TMDBService.getActionTV();
        res.json(data);
    } catch (error) {
        console.error('TMDB error:', error.message);
        res.status(500).json({ error: 'Failed to fetch action TV shows' });
    }
});

app.get('/api/tmdb/popular/tv', async (req, res) => {
    try {
        const data = await TMDBService.getPopularTV();
        res.json(data);
    } catch (error) {
        console.error('TMDB error:', error.message);
        res.status(500).json({ error: 'Failed to fetch popular TV shows' });
    }
});

app.get('/api/tmdb/actor/:id/credits', async (req, res) => {
    const actorId = sanitizeNumber(req.params.id);
    
    if (!actorId) {
        return res.status(400).json({ error: 'Invalid actor ID' });
    }
    
    try {
        const data = await TMDBService.getActorCredits(actorId);
        res.json(data);
    } catch (error) {
        console.error('TMDB error:', error.message);
        res.status(500).json({ error: 'Failed to fetch actor credits' });
    }
});

app.listen(PORT, () => {
    console.log(`NotFlix API server running on port ${PORT}`);
});

export default app;