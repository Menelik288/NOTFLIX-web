import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { TMDBService } from './tmdbProxy.js';
import { AnimeProxyService } from './animeProxy.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check endpoint for uptime monitors and Vercel/Railway
app.get(['/health', '/api/health'], (req, res) => {
    const availableEnvKeys = Object.keys(process.env);
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        hasTmdbKey: Boolean(process.env.TMDB_API_KEY || process.env.VITE_TMDB_API_KEY),
        hasHiAnimeUrl: Boolean(process.env.HIANIME_API_URL || process.env.VITE_HIANIME_API_URL),
        hianimeUrl: process.env.HIANIME_API_URL || 'http://localhost:3030',
        nodeEnv: process.env.NODE_ENV || 'production',
        matchingKeys: availableEnvKeys.filter(k => k.includes('TMDB') || k.includes('API') || k.includes('VITE') || k.includes('HIANIME'))
    });
});

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
        res.status(500).json({ error: error.message || 'Failed to fetch trending movies' });
    }
});

app.get('/api/tmdb/trending/movies', async (req, res) => {
    try {
        const data = await TMDBService.getTrendingMovies();
        res.json(data);
    } catch (error) {
        console.error('TMDB error:', error.message);
        res.status(500).json({ error: error.message || 'Failed to fetch trending movies' });
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

// ═══════════════════════════════════════════════════════════════
// ANIME API ROUTES (AniList Metadata + HiAnime Streaming/Episodes)
// ═══════════════════════════════════════════════════════════════

app.get('/api/anime/home', async (req, res) => {
    try {
        const data = await AnimeProxyService.getHome();
        res.json(data);
    } catch (error) {
        console.error('Anime home error:', error.message);
        res.status(500).json({ error: 'Failed to fetch anime home' });
    }
});

app.get('/api/anime/trending', async (req, res) => {
    try {
        const page = sanitizeNumber(req.query.page, 1, 100) || 1;
        const data = await AnimeProxyService.getList('trending', page);
        res.json(data);
    } catch (error) {
        console.error('Anime trending error:', error.message);
        res.status(500).json({ error: 'Failed to fetch trending anime' });
    }
});

app.get('/api/anime/popular', async (req, res) => {
    try {
        const page = sanitizeNumber(req.query.page, 1, 100) || 1;
        const data = await AnimeProxyService.getList('popular', page);
        res.json(data);
    } catch (error) {
        console.error('Anime popular error:', error.message);
        res.status(500).json({ error: 'Failed to fetch popular anime' });
    }
});

app.get('/api/anime/top-rated', async (req, res) => {
    try {
        const page = sanitizeNumber(req.query.page, 1, 100) || 1;
        const data = await AnimeProxyService.getList('top-rated', page);
        res.json(data);
    } catch (error) {
        console.error('Anime top-rated error:', error.message);
        res.status(500).json({ error: 'Failed to fetch top rated anime' });
    }
});

app.get('/api/anime/upcoming', async (req, res) => {
    try {
        const page = sanitizeNumber(req.query.page, 1, 100) || 1;
        const data = await AnimeProxyService.getList('upcoming', page);
        res.json(data);
    } catch (error) {
        console.error('Anime upcoming error:', error.message);
        res.status(500).json({ error: 'Failed to fetch upcoming anime' });
    }
});

app.get('/api/anime/search', async (req, res) => {
    try {
        const query = sanitizeString(req.query.query || req.query.keyword || req.query.q || '');
        const page = sanitizeNumber(req.query.page, 1, 100) || 1;
        const genre = sanitizeString(req.query.genre || '');
        const data = await AnimeProxyService.search(query, page, genre || null);
        res.json(data);
    } catch (error) {
        console.error('Anime search error:', error.message);
        res.status(500).json({ error: 'Anime search failed' });
    }
});

app.get('/api/anime/details/:id', async (req, res) => {
    const id = sanitizeString(req.params.id);
    if (!id) return res.status(400).json({ error: 'Anime ID is required' });

    try {
        const data = await AnimeProxyService.getDetails(id);
        if (!data) return res.status(404).json({ error: 'Anime not found' });
        res.json(data);
    } catch (error) {
        console.error('Anime details error:', error.message);
        res.status(500).json({ error: 'Failed to fetch anime details' });
    }
});

app.get('/api/anime/episodes/:id', async (req, res) => {
    const id = sanitizeString(req.params.id);
    const season = req.query.season ? sanitizeNumber(req.query.season, 1, 100) : 1;
    if (!id) return res.status(400).json({ error: 'Anime ID is required' });

    try {
        const data = await AnimeProxyService.getEpisodes(id, season);
        res.json(data);
    } catch (error) {
        console.error('Anime episodes error:', error.message);
        res.status(500).json({ error: 'Failed to fetch anime episodes' });
    }
});

app.get('/api/anime/servers', async (req, res) => {
    const episodeId = sanitizeString(req.query.id || req.query.episodeId || '');
    if (!episodeId) return res.status(400).json({ error: 'Episode ID is required' });

    try {
        const data = await AnimeProxyService.getServers(episodeId);
        res.json(data);
    } catch (error) {
        console.error('Anime servers error:', error.message);
        res.status(500).json({ error: 'Failed to fetch episode servers' });
    }
});

app.get('/api/anime/stream', async (req, res) => {
    const episodeId = sanitizeString(req.query.id || req.query.episodeId || '');
    const server = sanitizeString(req.query.server || 'HD-1');
    const type = sanitizeString(req.query.type || 'sub');
    const title = sanitizeString(req.query.title || '');

    if (!episodeId) return res.status(400).json({ error: 'Episode ID is required' });

    try {
        const data = await AnimeProxyService.getStream(episodeId, server, type, title);
        res.json(data);
    } catch (error) {
        console.error('Anime stream error:', error.message);
        res.status(500).json({ error: 'Failed to fetch anime stream' });
    }
});

// HLS Stream & Segment Proxy with CORS and Referer header injection
app.get('/api/anime/hls-proxy', async (req, res) => {
    const rawUrl = req.query.url;
    const referer = req.query.referer || 'https://megacloud.tv';

    if (!rawUrl) {
        return res.status(400).send('URL is required');
    }

    try {
        const decodedUrl = decodeURIComponent(rawUrl);
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': referer,
            'Origin': referer,
            'Accept': '*/*'
        };

        if (req.headers.range) {
            headers['Range'] = req.headers.range;
        }

        const upstreamRes = await fetch(decodedUrl, {
            headers,
            signal: AbortSignal.timeout(12000)
        });

        if (!upstreamRes.ok) {
            return res.status(upstreamRes.status).send(`Upstream error: ${upstreamRes.status}`);
        }

        const contentType = upstreamRes.headers.get('content-type') || 'application/vnd.apple.mpegurl';

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type, Accept');
        res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');
        res.setHeader('Content-Type', contentType);

        if (decodedUrl.endsWith('.m3u8') || contentType.includes('mpegurl') || contentType.includes('application/x-mpegURL')) {
            res.setHeader('Cache-Control', 'no-cache');
            const content = await upstreamRes.text();
            const basePath = decodedUrl.substring(0, decodedUrl.lastIndexOf('/') + 1);

            const rewrittenLines = content.split('\n').map(line => {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) return line;

                let target = trimmed;
                if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
                    target = basePath + trimmed;
                }
                return `/api/anime/hls-proxy?url=${encodeURIComponent(target)}&referer=${encodeURIComponent(referer)}`;
            });

            return res.send(rewrittenLines.join('\n'));
        }

        // For .ts chunks or video binary data
        res.setHeader('Cache-Control', 'public, max-age=86400');
        const arrayBuf = await upstreamRes.arrayBuffer();
        return res.send(Buffer.from(arrayBuf));
    } catch (e) {
        return res.status(500).send(`HLS proxy error: ${e.message}`);
    }
});


// Serve static frontend build if dist folder exists (when running standalone outside Vercel)
if (!process.env.VERCEL && fs.existsSync(distPath)) {
    app.use(express.static(distPath));

    app.get('*', (req, res) => {
        if (req.path.startsWith('/api')) {
            return res.status(404).json({ error: 'API route not found' });
        }
        const indexPath = path.join(distPath, 'index.html');
        if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
        } else {
            res.status(404).send('NotFlix frontend index not found.');
        }
    });
}

// Only listen on port when running as a standalone server, not as a serverless function
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`NotFlix API server running on port ${PORT}`);
    });
}

export default app;