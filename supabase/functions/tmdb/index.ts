import { TMDBService as TMDBProxy } from '../../server/tmdbProxy.js';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/original';

export async function serve(req, res) {
    if (req.method === 'OPTIONS') {
        return res.json({ success: true }, { headers: corsHeaders });
    }

    const url = new URL(req.url);
    const path = url.pathname.replace('/functions/v1/tmdb', '').replace(/\/+$/, '');
    
    try {
        let data;
        
        if (path === '/trending/movies') {
            data = await TMDBProxy.getTrendingMovies();
        } else if (path === '/trending/tv') {
            data = await TMDBProxy.getTrendingTV();
        } else if (path === '/top-rated/movies') {
            data = await TMDBProxy.getTopRatedMovies();
        } else if (path === '/top-rated/tv') {
            data = await TMDBProxy.getTopRatedTV();
        } else if (path === '/now-playing') {
            data = await TMDBProxy.getNowPlayingMovies();
        } else if (path === '/action/movies') {
            data = await TMDBProxy.getActionMovies();
        } else if (path === '/comedy/movies') {
            data = await TMDBProxy.getComedyMovies();
        } else if (path === '/popular/movies') {
            data = await TMDBProxy.getPopularMovies();
        } else if (path === '/action/tv') {
            data = await TMDBProxy.getActionTV();
        } else if (path === '/popular/tv') {
            data = await TMDBProxy.getPopularTV();
        } else if (path === '/genres') {
            data = await TMDBProxy.getGenres();
        } else if (match = path.match(/^\/media\/(movie|tv)\/(\d+)$/)) {
            data = await TMDBProxy.getMediaDetails(match[2], match[1]);
        } else if (match = path.match(/^\/media\/(movie|tv)\/(\d+)\/cast$/)) {
            data = await TMDBProxy.getMediaCast(match[2], match[1]);
        } else if (match = path.match(/^\/media\/(movie|tv)\/(\d+)\/similar$/)) {
            data = await TMDBProxy.getSimilarMedia(match[2], match[1]);
        } else if (match = path.match(/^\/tv\/(\d+)\/season\/(\d+)$/)) {
            data = await TMDBProxy.getSeasonDetails(match[1], match[2]);
        } else if (path === '/search') {
            data = await TMDBProxy.searchMedia(
                url.searchParams.get('query') || '',
                {
                    type: url.searchParams.get('type'),
                    genres: url.searchParams.get('genres')?.split(','),
                    year: url.searchParams.get('year'),
                    rating: url.searchParams.get('rating')
                }
            );
        } else if (match = path.match(/^\/actor\/(\d+)\/credits$/)) {
            data = await TMDBProxy.getActorCredits(match[1]);
        } else {
            return res.status(404, { error: 'Not found' }, { headers: corsHeaders });
        }

        return res.json(data, { headers: corsHeaders });
    } catch (error) {
        console.error('TMDB Proxy error:', error);
        return res.status(500, { error: 'Internal server error' }, { headers: corsHeaders });
    }
}