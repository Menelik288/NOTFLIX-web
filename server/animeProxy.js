import fs from 'fs';
import crypto from 'crypto';
import { TMDBService } from './tmdbProxy.js';

// AES-256-CBC Decryptor for MegaPlay Encrypted Streams
function decryptMegaPlayEnc(enc) {
    if (!enc || typeof enc !== 'string') return null;
    try {
        const keyRaw = Buffer.from("i?LMTAx0Q6,:}50U", "utf8");
        const key = Buffer.alloc(32);
        keyRaw.copy(key, 0, 0, Math.min(32, keyRaw.length));
        const iv = Buffer.from("W0;27ToaUpl_P%\x27c", "utf8");

        let base64 = enc.replace(/-/g, "+").replace(/_/g, "/");
        const mod = base64.length % 4;
        if (mod) base64 += "====".slice(mod);

        const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
        let decrypted = decipher.update(base64, "base64", "utf8");
        decrypted += decipher.final("utf8");
        const parsed = JSON.parse(decrypted);
        return parsed?.file || parsed?.sources?.file || null;
    } catch (e) {
        return null;
    }
}

const ANIME_SHOW_MAP = {
    // Jujutsu Kaisen
    '113415:1': { slug: 'jujutsu-kaisen-tv-8ssye', showId: '1103' },
    '113415:2': { slug: 'jujutsu-kaisen-2nd-season-hk2c9', showId: '6542' },
    '145064:1': { slug: 'jujutsu-kaisen-tv-8ssye', showId: '1103' },
    '145064:2': { slug: 'jujutsu-kaisen-2nd-season-hk2c9', showId: '6542' },
    '131573:1': { slug: 'jujutsu-kaisen-0-movie-lmsg3', showId: '4182' },
    '95479:1': { slug: 'jujutsu-kaisen-tv-8ssye', showId: '1103' },
    '95479:2': { slug: 'jujutsu-kaisen-2nd-season-hk2c9', showId: '6542' },

    // Demon Slayer
    '85937:1': { slug: 'demon-slayer-kimetsu-no-yaiba-rzepv', showId: '1279' },
    '101922:1': { slug: 'demon-slayer-kimetsu-no-yaiba-rzepv', showId: '1279' },
    '129874:2': { slug: 'demon-slayer-kimetsu-no-yaiba-entertainment-district-arc-x80w9', showId: '3819' },
    '145139:3': { slug: 'demon-slayer-kimetsu-no-yaiba-swordsmith-village-arc-m2jqp', showId: '5482' },
    '166240:4': { slug: 'demon-slayer-kimetsu-no-yaiba-hashira-training-arc-zpj5q', showId: '7612' },

    // Attack on Titan
    '16498:1': { slug: 'attack-on-titan-002rq', showId: '809' },
    '20958:2': { slug: 'attack-on-titan-season-2-005jq', showId: '810' },
    '99147:3': { slug: 'attack-on-titan-season-3-007qq', showId: '811' },
    '110277:4': { slug: 'attack-on-titan-final-season-008mq', showId: '812' },
    '1429:1': { slug: 'attack-on-titan-002rq', showId: '809' },

    // One Piece
    '21:1': { slug: 'one-piece-351', showId: '351' },
    '37854:1': { slug: 'one-piece-351', showId: '351' },

    // Solo Leveling
    '151807:1': { slug: 'solo-leveling-82928', showId: '6892' },
    '173778:2': { slug: 'solo-leveling-season-2-arise-from-the-shadow-3eukp', showId: '8910' },
    '127532:1': { slug: 'solo-leveling-82928', showId: '6892' },

    // Chainsaw Man
    '127230:1': { slug: 'chainsaw-man-tv', showId: '4720' },
    '114410:1': { slug: 'chainsaw-man-tv', showId: '4720' },

    // Naruto & Naruto Shippuden
    '20:1': { slug: 'naruto-677', showId: '677' },
    '46260:1': { slug: 'naruto-677', showId: '677' },
    '1735:1': { slug: 'naruto-shippuden-355', showId: '355' },
    '31910:1': { slug: 'naruto-shippuden-355', showId: '355' },

    // Death Note
    '1535:1': { slug: 'death-note-60', showId: '60' },
    '13916:1': { slug: 'death-note-60', showId: '60' },

    // Bleach
    '269:1': { slug: 'bleach-tv-348', showId: '348' },
    '30984:1': { slug: 'bleach-tv-348', showId: '348' },

    // Frieren
    '154587:1': { slug: 'frieren-beyond-journey-s-end-c6fbj', showId: '6351' },
    '209867:1': { slug: 'frieren-beyond-journey-s-end-c6fbj', showId: '6351' },

    // Dandadan
    '171018:1': { slug: 'dandadan-lzcmw', showId: '4' },
    '251504:1': { slug: 'dandadan-lzcmw', showId: '4' },

    // Kaiju No. 8
    '146065:1': { slug: 'kaiju-no-8-season-2-rhi38', showId: '7983' },
    '138502:1': { slug: 'kaiju-no-8-season-2-rhi38', showId: '7983' },

    // Blue Lock
    '137822:1': { slug: 'blue-lock-x89w5', showId: '4638' },
    '163146:2': { slug: 'blue-lock-vs-u-20-japan-0ompr', showId: '7548' },

    // Spy x Family
    '140960:1': { slug: 'spy-x-family-643', showId: '4452' },
    '158871:2': { slug: 'spy-x-family-season-2-58137', showId: '6368' }
};

async function resolveShowForAnime(animeId, seasonNum = 1, animeTitle = '') {
    const key = `${animeId}:${seasonNum}`;
    if (ANIME_SHOW_MAP[key]) return ANIME_SHOW_MAP[key];

    const searchTerms = [animeTitle].filter(Boolean);

    if (!animeTitle && /^\d+$/.test(animeId)) {
        try {
            const aniRes = await fetch('https://graphql.anilist.co', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: 'query ($id: Int) { Media(id: $id, type: ANIME) { title { english romaji native } } }',
                    variables: { id: parseInt(animeId, 10) }
                }),
                signal: AbortSignal.timeout(3000)
            });
            if (aniRes.ok) {
                const aniData = await aniRes.json();
                const t = aniData?.data?.Media?.title;
                if (t?.english) searchTerms.push(t.english);
                if (t?.romaji) searchTerms.push(t.romaji);
            }
        } catch (e) {}
    } else if (typeof animeId === 'string' && !/^\d+$/.test(animeId)) {
        searchTerms.push(animeId);
    }

    for (const term of searchTerms) {
        if (!term || typeof term !== 'string') continue;
        const clean = term.replace(/[:\-]/g, ' ').replace(/\s+/g, ' ').trim();
        if (clean.length < 2) continue;
        try {
            const res = await fetch(`https://anikototv.to/filter?keyword=${encodeURIComponent(clean)}`, {
                headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://anikototv.to/" },
                signal: AbortSignal.timeout(4000)
            });
            if (!res.ok) continue;
            const html = await res.text();
            const re = /<a\s+class="name d-title"\s+href="https:\/\/anikototv\.to\/watch\/([^"/]+)(?:\/ep-\d+)?"[^>]*data-jp="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g;
            let m;
            const candidates = [];
            while ((m = re.exec(html)) !== null) {
                candidates.push({ slug: m[1], name: m[3].replace(/<[^>]*>/g, '').trim(), dataJp: m[2] });
            }
            if (candidates.length > 0) {
                const normTerm = clean.toLowerCase().replace(/[^a-z0-9]/g, '');
                const exact = candidates.find(c => {
                    const normName = c.name.toLowerCase().replace(/[^a-z0-9]/g, '');
                    const normJp = (c.dataJp || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                    return normName === normTerm || normJp === normTerm || normName.startsWith(normTerm);
                });
                const nonSpecial = candidates.filter(c => !c.name.toLowerCase().includes('mini anime') && !c.name.toLowerCase().includes('ova'));
                const chosen = exact || nonSpecial[0] || candidates[0];

                const watchRes = await fetch(`https://anikototv.to/watch/${chosen.slug}`, {
                    headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://anikototv.to/" },
                    signal: AbortSignal.timeout(4000)
                });
                const watchHtml = await watchRes.text();
                const showIdMatch = watchHtml.match(/data-id="(\d+)"/);
                if (showIdMatch) {
                    const found = { slug: chosen.slug, showId: showIdMatch[1], title: chosen.name };
                    ANIME_SHOW_MAP[key] = found;
                    return found;
                }
            }
        } catch (e) {}
    }
    return null;
}

// Top Anime TMDB Mapping & Season configurations
const ANIME_TMDB_MAP = {
    // Jujutsu Kaisen
    '113415': { tmdbId: 95479, season: 1, totalSeasons: 2, seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: 24, id: '113415' }, { seasonNumber: 2, name: 'Season 2: Shibuya Incident', episodeCount: 23, id: '145064' }] },
    '145064': { tmdbId: 95479, season: 2, totalSeasons: 2, seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: 24, id: '113415' }, { seasonNumber: 2, name: 'Season 2: Shibuya Incident', episodeCount: 23, id: '145064' }] },
    '131573': { tmdbId: 810693, isMovie: true, seasons: [{ seasonNumber: 1, name: 'Movie: JUJUTSU KAISEN 0', episodeCount: 1, id: '131573' }] },

    // Demon Slayer
    '85937': { tmdbId: 85937, totalSeasons: 4, seasons: [{ seasonNumber: 1, name: 'Season 1: Unwavering Resolve', episodeCount: 26, id: '101922' }, { seasonNumber: 2, name: 'Season 2: Entertainment District', episodeCount: 18, id: '129874' }, { seasonNumber: 3, name: 'Season 3: Swordsmith Village', episodeCount: 11, id: '145139' }, { seasonNumber: 4, name: 'Season 4: Hashira Training', episodeCount: 8, id: '166240' }] },
    '101922': { tmdbId: 85937, season: 1, totalSeasons: 4, seasons: [{ seasonNumber: 1, name: 'Season 1: Unwavering Resolve', episodeCount: 26, id: '101922' }, { seasonNumber: 2, name: 'Season 2: Entertainment District', episodeCount: 18, id: '129874' }, { seasonNumber: 3, name: 'Season 3: Swordsmith Village', episodeCount: 11, id: '145139' }, { seasonNumber: 4, name: 'Season 4: Hashira Training', episodeCount: 8, id: '166240' }] },
    '129874': { tmdbId: 85937, season: 2, totalSeasons: 4, seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: 26, id: '101922' }, { seasonNumber: 2, name: 'Season 2', episodeCount: 18, id: '129874' }, { seasonNumber: 3, name: 'Season 3', episodeCount: 11, id: '145139' }, { seasonNumber: 4, name: 'Season 4', episodeCount: 8, id: '166240' }] },
    '145139': { tmdbId: 85937, season: 3, totalSeasons: 4, seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: 26, id: '101922' }, { seasonNumber: 2, name: 'Season 2', episodeCount: 18, id: '129874' }, { seasonNumber: 3, name: 'Season 3', episodeCount: 11, id: '145139' }, { seasonNumber: 4, name: 'Season 4', episodeCount: 8, id: '166240' }] },
    '166240': { tmdbId: 85937, season: 4, totalSeasons: 4, seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: 26, id: '101922' }, { seasonNumber: 2, name: 'Season 2', episodeCount: 18, id: '129874' }, { seasonNumber: 3, name: 'Season 3', episodeCount: 11, id: '145139' }, { seasonNumber: 4, name: 'Season 4', episodeCount: 8, id: '166240' }] },

    // Attack on Titan
    '16498': { tmdbId: 1429, season: 1, totalSeasons: 4, seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: 25, id: '16498' }, { seasonNumber: 2, name: 'Season 2', episodeCount: 12, id: '20958' }, { seasonNumber: 3, name: 'Season 3', episodeCount: 22, id: '99147' }, { seasonNumber: 4, name: 'Season 4: Final Season', episodeCount: 28, id: '110277' }] },
    '20958': { tmdbId: 1429, season: 2, totalSeasons: 4, seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: 25, id: '16498' }, { seasonNumber: 2, name: 'Season 2', episodeCount: 12, id: '20958' }, { seasonNumber: 3, name: 'Season 3', episodeCount: 22, id: '99147' }, { seasonNumber: 4, name: 'Season 4: Final Season', episodeCount: 28, id: '110277' }] },
    '99147': { tmdbId: 1429, season: 3, totalSeasons: 4, seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: 25, id: '16498' }, { seasonNumber: 2, name: 'Season 2', episodeCount: 12, id: '20958' }, { seasonNumber: 3, name: 'Season 3', episodeCount: 22, id: '99147' }, { seasonNumber: 4, name: 'Season 4: Final Season', episodeCount: 28, id: '110277' }] },
    '110277': { tmdbId: 1429, season: 4, totalSeasons: 4, seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: 25, id: '16498' }, { seasonNumber: 2, name: 'Season 2', episodeCount: 12, id: '20958' }, { seasonNumber: 3, name: 'Season 3', episodeCount: 22, id: '99147' }, { seasonNumber: 4, name: 'Season 4: Final Season', episodeCount: 28, id: '110277' }] },

    // One Piece
    '21': { tmdbId: 37854, totalSeasons: 1, seasons: [{ seasonNumber: 1, name: 'All Episodes', episodeCount: 1120, id: '21' }] },

    // Solo Leveling
    '151807': { tmdbId: 127532, season: 1, totalSeasons: 2, seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: 12, id: '151807' }, { seasonNumber: 2, name: 'Season 2: Arise from the Shadow', episodeCount: 12, id: '173778' }] },
    '173778': { tmdbId: 127532, season: 2, totalSeasons: 2, seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: 12, id: '151807' }, { seasonNumber: 2, name: 'Season 2: Arise from the Shadow', episodeCount: 12, id: '173778' }] },

    // Chainsaw Man
    '127230': { tmdbId: 114410, season: 1, totalSeasons: 1, seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: 12, id: '127230' }] },

    // Naruto & Naruto Shippuden
    '20': { tmdbId: 46260, totalSeasons: 5, seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: 52 }, { seasonNumber: 2, name: 'Season 2', episodeCount: 52 }, { seasonNumber: 3, name: 'Season 3', episodeCount: 52 }, { seasonNumber: 4, name: 'Season 4', episodeCount: 52 }, { seasonNumber: 5, name: 'Season 5', episodeCount: 12 }] },
    '1735': { tmdbId: 31910, totalSeasons: 21, seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: 32 }, { seasonNumber: 2, name: 'Season 2', episodeCount: 21 }, { seasonNumber: 3, name: 'Season 3', episodeCount: 18 }, { seasonNumber: 4, name: 'Season 4', episodeCount: 17 }] },

    // Bleach
    '269': { tmdbId: 30984, totalSeasons: 16, seasons: [{ seasonNumber: 1, name: 'Season 1: Agent of the Shinigami', episodeCount: 20 }, { seasonNumber: 2, name: 'Season 2: Soul Society', episodeCount: 21 }, { seasonNumber: 3, name: 'Season 3: The Rescue', episodeCount: 22 }] },

    // Death Note
    '1535': { tmdbId: 13916, totalSeasons: 1, seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: 37, id: '1535' }] },

    // Spy x Family
    '140960': { tmdbId: 120089, season: 1, totalSeasons: 2, seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: 25, id: '140960' }, { seasonNumber: 2, name: 'Season 2', episodeCount: 12, id: '158871' }] },

    // My Hero Academia
    '21459': { tmdbId: 65930, season: 1, totalSeasons: 7, seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: 13 }, { seasonNumber: 2, name: 'Season 2', episodeCount: 25 }, { seasonNumber: 3, name: 'Season 3', episodeCount: 25 }, { seasonNumber: 4, name: 'Season 4', episodeCount: 25 }, { seasonNumber: 5, name: 'Season 5', episodeCount: 25 }, { seasonNumber: 6, name: 'Season 6', episodeCount: 25 }, { seasonNumber: 7, name: 'Season 7', episodeCount: 21 }] },

    // Dandadan
    '171018': { tmdbId: 251504, season: 1, totalSeasons: 1, seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: 12, id: '171018' }] },

    // Frieren
    '154587': { tmdbId: 209867, season: 1, totalSeasons: 1, seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: 28, id: '154587' }] },

    // Kaiju No. 8
    '146065': { tmdbId: 138502, season: 1, totalSeasons: 1, seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: 12, id: '146065' }] },

    // Blue Lock
    '137822': { tmdbId: 137822, season: 1, totalSeasons: 2, seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: 24, id: '137822' }, { seasonNumber: 2, name: 'Season 2: vs. U-20 Japan', episodeCount: 14, id: '163146' }] }
};

// Normalize AniList media object into standard Notflix media schema
const normalizeAniListMedia = (media) => {
    if (!media) return null;
    const title = media.title?.english || media.title?.romaji || media.title?.native || 'Unknown Anime';
    const altTitle = media.title?.native || media.title?.romaji || '';
    const rating = media.averageScore ? (media.averageScore / 10).toFixed(1) : (media.meanScore ? (media.meanScore / 10).toFixed(1) : null);
    
    const mediaIdStr = String(media.id);
    const malIdStr = media.idMal ? String(media.idMal) : null;
    const extra = ANIME_TMDB_MAP[mediaIdStr] || (malIdStr ? ANIME_TMDB_MAP[malIdStr] : null) || {};

    // Build relations list
    const relations = media.relations?.edges?.map(rel => ({
        relationType: rel.relationType,
        id: String(rel.node?.id),
        title: rel.node?.title?.english || rel.node?.title?.romaji,
        poster: rel.node?.coverImage?.large,
        format: rel.node?.format,
        status: rel.node?.status
    })) || [];

    // Compute seasons
    let seasons = extra.seasons;
    let totalSeasons = extra.totalSeasons;

    if (!seasons) {
        const sequels = relations.filter(r => r.relationType === 'SEQUEL' && r.format !== 'MANGA');
        if (sequels.length > 0) {
            totalSeasons = 1 + sequels.length;
            seasons = [
                { seasonNumber: 1, name: 'Season 1', episodeCount: media.episodes || 12, id: mediaIdStr },
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
                { seasonNumber: 1, name: media.format === 'MOVIE' ? 'Movie' : 'Season 1', episodeCount: media.episodes || 12, id: mediaIdStr }
            ];
        }
    }

    return {
        id: mediaIdStr,
        malId: malIdStr,
        tmdbId: extra.tmdbId ? String(extra.tmdbId) : null,
        type: 'anime',
        title,
        alternativeTitle: altTitle,
        poster: media.coverImage?.extraLarge || media.coverImage?.large || null,
        backdrop: media.bannerImage || media.coverImage?.extraLarge || null,
        rating: Number(rating) || 8.0,
        year: media.seasonYear || media.startDate?.year || (media.startDate?.year ? String(media.startDate.year) : null),
        duration: media.duration ? `${media.duration}m` : null,
        genres: Array.isArray(media.genres) ? media.genres : [],
        tag: media.format === 'MOVIE' ? 'Anime Movie' : 'Anime Series',
        format: media.format || 'TV',
        status: media.status || 'COMPLETED',
        totalSeasons: totalSeasons || 1,
        seasons,
        episodesCount: media.episodes || null,
        episodes: {
            sub: media.episodes || 12,
            dub: media.episodes ? Math.floor(media.episodes * 0.8) : null,
            eps: media.episodes || 12
        },
        overview: media.description ? media.description.replace(/<[^>]*>/g, '').trim() : '',
        synopsis: media.description ? media.description.replace(/<[^>]*>/g, '').trim() : '',
        studios: media.studios?.nodes?.map(s => s.name) || [],
        characters: media.characters?.edges?.map(edge => ({
            role: edge.role,
            id: edge.node?.id,
            name: edge.node?.name?.full || edge.node?.name?.native,
            image: edge.node?.image?.large,
            voiceActor: edge.voiceActors?.[0] ? {
                id: edge.voiceActors[0].id,
                name: edge.voiceActors[0].name?.full || edge.voiceActors[0].name?.native,
                image: edge.voiceActors[0].image?.large
            } : null
        })) || [],
        recommendations: media.recommendations?.nodes?.map(rec => {
            const m = rec.mediaRecommendation;
            if (!m) return null;
            return {
                id: String(m.id),
                type: 'anime',
                title: m.title?.english || m.title?.romaji || 'Anime',
                poster: m.coverImage?.large || null,
                backdrop: m.bannerImage || m.coverImage?.large || null,
                rating: m.averageScore ? Number((m.averageScore / 10).toFixed(1)) : 8.0,
                year: m.seasonYear || null,
                format: m.format
            };
        }).filter(Boolean) || [],
        relations
    };
};

// Load server .env if present
const loadServerEnv = () => {
    try {
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
    } catch (e) {
        // Ignore
    }
};

loadServerEnv();

// In-memory cache with TTL
const cache = new Map();
const getCached = (key) => {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
        cache.delete(key);
        return null;
    }
    return entry.data;
};

const setCached = (key, data, ttlSeconds = 300) => {
    cache.set(key, {
        data,
        expiry: Date.now() + ttlSeconds * 1000
    });
};

const getHiAnimeBaseUrl = () => {
    return (process.env.HIANIME_API_URL || 'http://localhost:3030').replace(/\/+$/, '');
};

// AniList GraphQL helper using native fetch
const anilistGraphQL = async (query, variables = {}) => {
    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Notflix-Web/1.0'
            },
            body: JSON.stringify({ query, variables }),
            signal: AbortSignal.timeout(8000)
        });
        if (!response.ok) return null;
        const data = await response.json();
        return data?.data;
    } catch (err) {
        console.error('AniList GraphQL request failed:', err.message);
        return null;
    }
};

// Fetch helper with timeout
const fetchJsonWithTimeout = async (url, options = {}, timeoutMs = 4000) => {
    try {
        const response = await fetch(url, {
            ...options,
            signal: AbortSignal.timeout(timeoutMs)
        });
        if (!response.ok) return null;
        return await response.json();
    } catch (e) {
        return null;
    }
};



export const AnimeProxyService = {
    // 1. HOME / SPOTLIGHT / SECTIONS
    getHome: async () => {
        const cacheKey = 'anime:home';
        const cached = getCached(cacheKey);
        if (cached) return cached;

        const hiAnimeUrl = getHiAnimeBaseUrl();
        // Try HiAnime API first if available
        try {
            let hianimeData = await fetchJsonWithTimeout(`${hiAnimeUrl}/api/v1/home`, {}, 3000);
            if (!hianimeData) {
                hianimeData = await fetchJsonWithTimeout(`${hiAnimeUrl}/home`, {}, 3000);
            }

            if (hianimeData?.success && hianimeData.data) {
                const d = hianimeData.data;
                const normalizeHiAnimeItem = (item) => ({
                    id: String(item.id),
                    type: 'anime',
                    title: item.title || item.name,
                    alternativeTitle: item.alternativeTitle || item.japanese || '',
                    poster: item.poster,
                    backdrop: item.backdrop || item.poster,
                    rating: item.rating ? Number(item.rating) : 8.2,
                    duration: item.duration,
                    genres: item.genres || [],
                    episodes: item.episodes || { sub: 12, dub: null, eps: 12 },
                    overview: item.synopsis || item.overview || '',
                    tag: 'Anime'
                });

                const result = {
                    spotlight: (d.spotlight || []).map(normalizeHiAnimeItem),
                    trending: (d.trending || []).map(normalizeHiAnimeItem),
                    topAiring: (d.topAiring || []).map(normalizeHiAnimeItem),
                    mostPopular: (d.mostPopular || []).map(normalizeHiAnimeItem),
                    latestEpisodes: (d.latestEpisode || []).map(normalizeHiAnimeItem),
                    topUpcoming: (d.topUpcoming || []).map(normalizeHiAnimeItem),
                    genres: d.genres || ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Supernatural']
                };
                setCached(cacheKey, result, 1800); // 30 min cache
                return result;
            }
        } catch (e) {
            // Silently fallback to AniList
        }

        // AniList Multi-Section Query for Home
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
          topRated: Page(page: 1, perPage: 12) {
            media(type: ANIME, sort: SCORE_DESC) {
              id idMal title { romaji english native } coverImage { extraLarge large } bannerImage averageScore episodes genres status seasonYear description(asHtml: false)
            }
          }
          upcoming: Page(page: 1, perPage: 12) {
            media(type: ANIME, sort: POPULARITY_DESC, status: NOT_YET_RELEASED) {
              id idMal title { romaji english native } coverImage { extraLarge large } bannerImage averageScore episodes genres status seasonYear description(asHtml: false)
            }
          }
        }
        `;

        const data = await anilistGraphQL(query);
        if (!data) {
            return {
                spotlight: [],
                trending: [],
                topAiring: [],
                mostPopular: [],
                latestEpisodes: [],
                topUpcoming: [],
                genres: []
            };
        }

        const trending = (data.trending?.media || []).map(normalizeAniListMedia).filter(Boolean);
        const popular = (data.popular?.media || []).map(normalizeAniListMedia).filter(Boolean);
        const topAiring = (data.topAiring?.media || []).map(normalizeAniListMedia).filter(Boolean);
        const topRated = (data.topRated?.media || []).map(normalizeAniListMedia).filter(Boolean);
        const upcoming = (data.upcoming?.media || []).map(normalizeAniListMedia).filter(Boolean);

        const spotlight = trending.slice(0, 5).map((item, idx) => ({
            ...item,
            rank: idx + 1,
            tag: 'Trending Spotlight'
        }));

        const result = {
            spotlight,
            trending,
            topAiring,
            mostPopular: popular,
            latestEpisodes: topRated,
            topUpcoming: upcoming,
            genres: ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller']
        };

        setCached(cacheKey, result, 1800);
        return result;
    },

    // 2. CATEGORY LISTS (Trending, Popular, Top Rated, Upcoming)
    getList: async (category = 'trending', page = 1) => {
        const cacheKey = `anime:list:${category}:${page}`;
        const cached = getCached(cacheKey);
        if (cached) return cached;

        let sortType = 'TRENDING_DESC';
        let filterStatus = undefined;

        switch (category) {
            case 'popular':
            case 'most-popular':
                sortType = 'POPULARITY_DESC';
                break;
            case 'top-rated':
                sortType = 'SCORE_DESC';
                break;
            case 'top-airing':
                sortType = 'SCORE_DESC';
                filterStatus = 'RELEASING';
                break;
            case 'upcoming':
            case 'top-upcoming':
                sortType = 'POPULARITY_DESC';
                filterStatus = 'NOT_YET_RELEASED';
                break;
            case 'completed':
                sortType = 'POPULARITY_DESC';
                filterStatus = 'FINISHED';
                break;
            default:
                sortType = 'TRENDING_DESC';
        }

        const query = `
        query ($page: Int, $perPage: Int, $sort: [MediaSort], $status: MediaStatus) {
          Page(page: $page, perPage: $perPage) {
            pageInfo { total currentPage hasNextPage lastPage }
            media(type: ANIME, sort: $sort, status: $status) {
              id idMal title { romaji english native } coverImage { extraLarge large } bannerImage averageScore episodes genres status seasonYear description(asHtml: false) format
            }
          }
        }
        `;

        const data = await anilistGraphQL(query, {
            page: Number(page) || 1,
            perPage: 24,
            sort: [sortType],
            status: filterStatus
        });

        const list = (data?.Page?.media || []).map(normalizeAniListMedia).filter(Boolean);
        setCached(cacheKey, list, 900); // 15 min cache
        return list;
    },

    // 3. SEARCH ANIME
    search: async (keyword, page = 1, genre = null) => {
        const sanitizedKey = (keyword || '').trim().toLowerCase();
        const cacheKey = `anime:search:${sanitizedKey}:${page}:${genre || ''}`;
        const cached = getCached(cacheKey);
        if (cached) return cached;

        if (!sanitizedKey && !genre) {
            return [];
        }

        const hiAnimeUrl = getHiAnimeBaseUrl();
        // Try HiAnime API if configured
        if (sanitizedKey) {
            try {
                let hianimeData = await fetchJsonWithTimeout(
                    `${hiAnimeUrl}/api/v1/search?keyword=${encodeURIComponent(sanitizedKey)}&page=${page}`,
                    {},
                    3000
                );
                if (!hianimeData) {
                    hianimeData = await fetchJsonWithTimeout(
                        `${hiAnimeUrl}/search?keyword=${encodeURIComponent(sanitizedKey)}&page=${page}`,
                        {},
                        3000
                    );
                }

                if (hianimeData?.success && Array.isArray(hianimeData.data?.response)) {
                    const results = hianimeData.data.response.map(item => ({
                        id: String(item.id),
                        type: 'anime',
                        title: item.title,
                        alternativeTitle: item.alternativeTitle || '',
                        poster: item.poster,
                        backdrop: item.backdrop || item.poster,
                        rating: 8.0,
                        duration: item.duration,
                        episodes: item.episodes || { sub: 12, eps: 12 },
                        tag: 'Anime'
                    }));
                    setCached(cacheKey, results, 600);
                    return results;
                }
            } catch (e) {
                // Fall through to AniList
            }
        }

        // AniList search fallback
        const query = `
        query ($search: String, $page: Int, $genre: String) {
          Page(page: $page, perPage: 24) {
            media(type: ANIME, search: $search, genre: $genre, sort: POPULARITY_DESC) {
              id idMal title { romaji english native } coverImage { extraLarge large } bannerImage averageScore episodes genres status seasonYear description(asHtml: false) format
            }
          }
        }
        `;

        const variables = {
            page: Number(page) || 1,
            search: sanitizedKey || undefined,
            genre: genre || undefined
        };

        const data = await anilistGraphQL(query, variables);
        const results = (data?.Page?.media || []).map(normalizeAniListMedia).filter(Boolean);
        setCached(cacheKey, results, 600);
        return results;
    },

    // 4. ANIME DETAILS
    getDetails: async (id) => {
        const cacheKey = `anime:details:${id}`;
        const cached = getCached(cacheKey);
        if (cached) return cached;

        const isNumeric = /^\d+$/.test(id);
        const hiAnimeUrl = getHiAnimeBaseUrl();

        // If string slug, check HiAnime API first
        if (!isNumeric) {
            try {
                let hianimeData = await fetchJsonWithTimeout(`${hiAnimeUrl}/api/v1/anime/${id}`, {}, 3500);
                if (!hianimeData) {
                    hianimeData = await fetchJsonWithTimeout(`${hiAnimeUrl}/anime/${id}`, {}, 3500);
                }

                if (hianimeData?.success && hianimeData.data) {
                    const d = hianimeData.data;
                    const result = {
                        id: String(d.id || id),
                        type: 'anime',
                        title: d.title || d.alternativeTitle,
                        alternativeTitle: d.alternativeTitle || d.japanese || '',
                        poster: d.poster,
                        backdrop: d.poster,
                        rating: d.rating ? Number(d.rating) : (d.MAL_score ? Number(d.MAL_score) : 8.5),
                        duration: d.duration,
                        year: d.aired?.from ? d.aired.from.split(',').pop()?.trim() : null,
                        genres: d.genres || [],
                        status: d.status || 'Finished Airing',
                        studios: d.studios || [],
                        producers: d.producers || [],
                        episodes: d.episodes || { sub: 12, dub: null, eps: 12 },
                        overview: d.synopsis || '',
                        synopsis: d.synopsis || '',
                        characters: [],
                        recommendations: (d.recommended || []).map(r => ({
                            id: String(r.id),
                            type: 'anime',
                            title: r.title,
                            poster: r.poster,
                            rating: 8.0,
                            episodes: r.episodes
                        })),
                        relations: (d.moreSeasons || []).map(s => ({
                            id: String(s.id),
                            title: s.title,
                            poster: s.poster
                        }))
                    };
                    setCached(cacheKey, result, 3600);
                    return result;
                }
            } catch (e) {
                // Fall through to AniList
            }
        }

        // AniList Query by ID (or search if slug)
        const query = isNumeric
            ? `
            query ($id: Int) {
              Media(id: $id, type: ANIME) {
                id idMal title { romaji english native } coverImage { extraLarge large } bannerImage
                startDate { year month day } endDate { year month day } description(asHtml: false)
                season seasonYear type format status episodes duration genres synonyms averageScore meanScore
                studios(isMain: true) { nodes { id name } }
                trailer { id site thumbnail }
                characters(sort: ROLE, perPage: 12) {
                  edges {
                    role
                    node { id name { full native } image { large } }
                    voiceActors(language: JAPANESE) { id name { full native } image { large } }
                  }
                }
                recommendations(perPage: 10, sort: RATING_DESC) {
                  nodes {
                    mediaRecommendation {
                      id title { romaji english } coverImage { large } bannerImage averageScore episodes format
                    }
                  }
                }
                relations {
                  edges {
                    relationType
                    node { id title { romaji english } format status coverImage { large } }
                  }
                }
              }
            }
            `
            : `
            query ($search: String) {
              Media(search: $search, type: ANIME) {
                id idMal title { romaji english native } coverImage { extraLarge large } bannerImage
                startDate { year month day } endDate { year month day } description(asHtml: false)
                season seasonYear type format status episodes duration genres synonyms averageScore meanScore
                studios(isMain: true) { nodes { id name } }
                trailer { id site thumbnail }
                characters(sort: ROLE, perPage: 12) {
                  edges {
                    role
                    node { id name { full native } image { large } }
                    voiceActors(language: JAPANESE) { id name { full native } image { large } }
                  }
                }
                recommendations(perPage: 10, sort: RATING_DESC) {
                  nodes {
                    mediaRecommendation {
                      id title { romaji english } coverImage { large } bannerImage averageScore episodes format
                    }
                  }
                }
                relations {
                  edges {
                    relationType
                    node { id title { romaji english } format status coverImage { large } }
                  }
                }
              }
            }
            `;

        const variables = isNumeric
            ? { id: parseInt(id, 10) }
            : { search: id.replace(/-(\d+)$/, '').replace(/-/g, ' ') };

        const data = await anilistGraphQL(query, variables);
        const result = normalizeAniListMedia(data?.Media);
        if (result) {
            // If tmdbId not found in static map, attempt TMDB search resolution dynamically
            if (!result.tmdbId && result.title) {
                try {
                    const cleanTitle = result.title.replace(/[^\w\s]/gi, ' ').trim();
                    const searchResults = await TMDBService.searchMedia(cleanTitle, {
                        type: result.format === 'MOVIE' ? 'movie' : 'tv'
                    });
                    if (searchResults && searchResults.length > 0) {
                        const match = searchResults[0];
                        result.tmdbId = String(match.id);
                        if (match.totalSeasons && match.totalSeasons > 1 && result.seasons.length <= 1) {
                            result.totalSeasons = match.totalSeasons;
                            result.seasons = Array.from({ length: match.totalSeasons }, (_, i) => ({
                                seasonNumber: i + 1,
                                name: `Season ${i + 1}`,
                                episodeCount: null,
                                id: String(result.id)
                            }));
                        }
                    }
                } catch (e) {
                    // Silently continue
                }
            }
            setCached(cacheKey, result, 3600);
        }
        return result;
    },

    // 5. ANIME EPISODES LIST (Season-Aware)
    getEpisodes: async (id, season = 1) => {
        const seasonNum = parseInt(season, 10) || 1;
        const cacheKey = `anime:episodes:${id}:s${seasonNum}`;
        const cached = getCached(cacheKey);
        if (cached) return cached;

        const hiAnimeUrl = getHiAnimeBaseUrl();
        // 1. Try HiAnime API if season is 1
        if (seasonNum === 1) {
            try {
                let hianimeData = await fetchJsonWithTimeout(`${hiAnimeUrl}/api/v1/episodes/${id}`, {}, 3500);
                if (!hianimeData) {
                    hianimeData = await fetchJsonWithTimeout(`${hiAnimeUrl}/episodes/${id}`, {}, 3500);
                }

                if (hianimeData?.success && Array.isArray(hianimeData.data) && hianimeData.data.length > 0) {
                    const episodes = hianimeData.data.map((ep, i) => ({
                        episodeNumber: ep.episodeNumber || i + 1,
                        title: ep.title || `Episode ${ep.episodeNumber || i + 1}`,
                        alternativeTitle: ep.alternativeTitle || '',
                        id: String(ep.id || `${id}?ep=${ep.episodeNumber || i + 1}`),
                        isFiller: Boolean(ep.isFiller)
                    }));
                    setCached(cacheKey, episodes, 1800);
                    return episodes;
                }
            } catch (e) {
                // HiAnime not reachable, synthesize episodes
            }
        }

        // 2. Resolve Anime details to check for TMDB or specific series mappings
        const details = await AnimeProxyService.getDetails(id);
        const tmdbId = details?.tmdbId || ANIME_TMDB_MAP[id]?.tmdbId;

        // Special curated handling for Jujutsu Kaisen
        if (String(id) === '113415' || String(tmdbId) === '95479' || details?.title?.toLowerCase().includes('jujutsu kaisen')) {
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
            const episodes = activeTitles.map((title, i) => ({
                episodeNumber: i + 1,
                title: `${i + 1}. ${title}`,
                alternativeTitle: '',
                id: `${id}::s=${seasonNum}::ep=${i + 1}`,
                isFiller: false
            }));
            setCached(cacheKey, episodes, 1800);
            return episodes;
        }

        // 3. Try TMDB season details if tmdbId is present
        if (tmdbId) {
            try {
                const tmdbSeason = await TMDBService.getSeasonDetails(tmdbId, seasonNum);
                if (tmdbSeason && Array.isArray(tmdbSeason.episodes) && tmdbSeason.episodes.length > 0) {
                    const episodes = tmdbSeason.episodes.map(ep => ({
                        episodeNumber: ep.episodeNumber,
                        title: ep.name ? `${ep.episodeNumber}. ${ep.name}` : `Episode ${ep.episodeNumber}`,
                        alternativeTitle: '',
                        overview: ep.overview || '',
                        still: ep.still || null,
                        id: `${id}::s=${seasonNum}::ep=${ep.episodeNumber}`,
                        isFiller: false
                    }));
                    setCached(cacheKey, episodes, 1800);
                    return episodes;
                }
            } catch (e) {
                // Fall through to count-based synthesis
            }
        }

        // 4. Fallback: Synthesize episodes list from details
        const seasonInfo = (details?.seasons || []).find(s => s.seasonNumber === seasonNum);
        const count = seasonInfo?.episodeCount || (seasonNum === 1 ? (details?.episodesCount || details?.episodes?.eps || 12) : 12);
        const total = Math.min(Math.max(count, 1), 2000);

        const episodes = Array.from({ length: total }, (_, i) => ({
            episodeNumber: i + 1,
            title: `Episode ${i + 1}`,
            alternativeTitle: '',
            id: `${id}::s=${seasonNum}::ep=${i + 1}`,
            isFiller: false
        }));

        setCached(cacheKey, episodes, 1800);
        return episodes;
    },

    // 6. EPISODE SERVERS
    getServers: async (episodeId) => {
        const cacheKey = `anime:servers:${episodeId}`;
        const cached = getCached(cacheKey);
        if (cached) return cached;

        const hiAnimeUrl = getHiAnimeBaseUrl();
        try {
            let hianimeData = await fetchJsonWithTimeout(`${hiAnimeUrl}/api/v1/servers?id=${encodeURIComponent(episodeId)}`, {}, 3000);
            if (!hianimeData) {
                hianimeData = await fetchJsonWithTimeout(`${hiAnimeUrl}/servers?id=${encodeURIComponent(episodeId)}`, {}, 3000);
            }

            if (hianimeData?.success && hianimeData.data) {
                setCached(cacheKey, hianimeData.data, 300);
                return hianimeData.data;
            }
        } catch (e) {
            // Server fallback
        }

        const fallbackServers = {
            sub: [
                { index: 1, type: 'sub', id: 'HD-1', name: 'HD-1 (MegaPlay 1080p HLS)' },
                { index: 2, type: 'sub', id: 'HD-2', name: 'HD-2 (MegaCloud HLS)' },
                { index: 3, type: 'sub', id: 'HD-3', name: 'HD-3 (Ultra HLS)' }
            ],
            dub: [
                { index: 1, type: 'dub', id: 'HD-1-dub', name: 'HD-1 (Dub HLS)' },
                { index: 2, type: 'dub', id: 'HD-2-dub', name: 'HD-2 (Dub HLS)' }
            ]
        };
        setCached(cacheKey, fallbackServers, 300);
        return fallbackServers;
    },

    // 7. STREAMING LINK (HLS & Subtitles) - Season/Episode Aware & Pure Anime HLS (Strictly NO Big Buck Bunny)
    getStream: async (episodeId, server = 'HD-1', type = 'sub', animeTitle = '') => {
        const cacheKey = `anime:stream:${episodeId}:${server}:${type}`;
        const cached = getCached(cacheKey);
        if (cached) return cached;

        let animeId = episodeId;
        let seasonNum = 1;
        let episodeNum = 1;

        if (typeof episodeId === 'string') {
            if (episodeId.includes('::')) {
                const parts = episodeId.split('::');
                animeId = parts[0];
                for (const p of parts.slice(1)) {
                    if (p.startsWith('s=')) seasonNum = parseInt(p.replace('s=', ''), 10) || 1;
                    if (p.startsWith('ep=')) episodeNum = parseInt(p.replace('ep=', ''), 10) || 1;
                }
            } else if (episodeId.includes('?ep=')) {
                const parts = episodeId.split('?ep=');
                animeId = parts[0];
                episodeNum = parseInt(parts[1], 10) || 1;
            }
        }

        const isDub = String(type).toLowerCase().includes('dub');
        const audioKey = isDub ? 'dub' : 'sub';

        // 1. Autonomous MegaPlay / Anikoto HLS stream resolution
        try {
            const show = await resolveShowForAnime(animeId, seasonNum, animeTitle);
            if (show && show.showId) {
                const listRes = await fetch(`https://anikototv.to/ajax/episode/list/${show.showId}`, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'X-Requested-With': 'XMLHttpRequest',
                        'Referer': `https://anikototv.to/watch/${show.slug}`
                    },
                    signal: AbortSignal.timeout(6000)
                });
                if (listRes.ok) {
                    const listJson = await listRes.json();
                    const epRe = /<a\s+[^>]*data-id="([^"]*)"[^>]*>/g;
                    let targetEp = null;
                    let epM;
                    while ((epM = epRe.exec(listJson.result || '')) !== null) {
                        const tag = epM[0];
                        const num = tag.match(/data-num="([^"]*)"/)?.[1];
                        if (parseInt(num, 10) === episodeNum) {
                            targetEp = { ids: tag.match(/data-ids="([^"]*)"/)?.[1] };
                            break;
                        }
                    }

                    if (targetEp?.ids) {
                        const srvListRes = await fetch(`https://anikototv.to/ajax/server/list?servers=${encodeURIComponent(targetEp.ids)}`, {
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                                'X-Requested-With': 'XMLHttpRequest',
                                'Referer': 'https://anikototv.to/'
                            },
                            signal: AbortSignal.timeout(6000)
                        });
                        const srvListJson = await srvListRes.json();
                        const srvHtml = srvListJson.result || '';

                        // Pick server for audio type (or fallback to sub if dub missing)
                        let typeMatch = srvHtml.match(new RegExp(`<div class="type" data-type="${audioKey}">([\\s\\S]*?)<\\/ul>`, 'i'));
                        if (!typeMatch && isDub) {
                            typeMatch = srvHtml.match(/<div class="type" data-type="sub">([\s\S]*?)<\/ul>/i);
                        }

                        if (typeMatch) {
                            const linkIds = [...typeMatch[1].matchAll(/data-link-id="([^"]+)"/g)].map(m => m[1]);
                            const selectedLinkId = (server.includes('2') && linkIds[1]) ? linkIds[1] : (linkIds[0] || linkIds[1]);

                            if (selectedLinkId) {
                                const srvGetRes = await fetch(`https://anikototv.to/ajax/server?get=${encodeURIComponent(selectedLinkId)}`, {
                                    headers: {
                                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                                        'X-Requested-With': 'XMLHttpRequest',
                                        'Referer': 'https://anikototv.to/'
                                    },
                                    signal: AbortSignal.timeout(6000)
                                });
                                const srvGetJson = await srvGetRes.json();
                                const embedUrl = srvGetJson?.result?.url;
                                const skipData = srvGetJson?.result?.skip_data;

                                if (embedUrl) {
                                    const embedRes = await fetch(embedUrl, {
                                        headers: { 'Referer': 'https://megaplay.buzz/', 'User-Agent': 'Mozilla/5.0' },
                                        signal: AbortSignal.timeout(6000)
                                    });
                                    const embedHtml = await embedRes.text();
                                    const fileId = embedHtml.match(/data-id=["\x27]([^"\x27]+)["\x27]/i)?.[1];

                                    if (fileId) {
                                        const sourcesRes = await fetch(`https://megaplay.buzz/stream/getSources?id=${fileId}&s=tcdn`, {
                                            headers: {
                                                'X-Requested-With': 'XMLHttpRequest',
                                                'Referer': 'https://megaplay.buzz/',
                                                'User-Agent': 'Mozilla/5.0'
                                            },
                                            signal: AbortSignal.timeout(6000)
                                        });
                                        const sourcesData = await sourcesRes.json();
                                        const rawM3u8 = sourcesData.enc ? decryptMegaPlayEnc(sourcesData.enc) : (sourcesData.sources?.[0]?.file || sourcesData.file);

                                        if (rawM3u8 && typeof rawM3u8 === 'string' && rawM3u8.includes('.m3u8')) {
                                            const proxiedUrl = `/api/anime/hls-proxy?url=${encodeURIComponent(rawM3u8)}&referer=${encodeURIComponent('https://megaplay.buzz/')}`;

                                            const tracks = (sourcesData.tracks || []).map(t => ({
                                                file: t.file?.startsWith('http')
                                                    ? `/api/anime/hls-proxy?url=${encodeURIComponent(t.file)}&referer=${encodeURIComponent('https://megaplay.buzz/')}`
                                                    : t.file,
                                                label: t.label || 'Subtitles',
                                                kind: t.kind || 'captions',
                                                default: Boolean(t.default)
                                            }));

                                            const result = {
                                                sources: [
                                                    {
                                                        url: proxiedUrl,
                                                        type: 'hls',
                                                        isM3U8: true,
                                                        quality: 'auto'
                                                    }
                                                ],
                                                subtitles: tracks,
                                                intro: (skipData?.intro?.length === 2 && (skipData.intro[0] || skipData.intro[1]))
                                                    ? { start: Number(skipData.intro[0]) || 0, end: Number(skipData.intro[1]) || 0 }
                                                    : (sourcesData.intro || { start: 90, end: 180 }),
                                                outro: (skipData?.outro?.length === 2 && (skipData.outro[0] || skipData.outro[1]))
                                                    ? { start: Number(skipData.outro[0]) || 0, end: Number(skipData.outro[1]) || 0 }
                                                    : (sourcesData.outro || { start: 1350, end: 1440 }),
                                                serverUsed: server,
                                                typeUsed: type,
                                                hasHls: true
                                            };

                                            setCached(cacheKey, result, 1800);
                                            return result;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } catch (err) {
            console.warn('MegaPlay extraction failed, checking HiAnime fallback:', err.message);
        }

        // 2. Secondary fallback: HiAnime API if active
        const hiAnimeUrl = getHiAnimeBaseUrl();
        try {
            let hianimeData = await fetchJsonWithTimeout(
                `${hiAnimeUrl}/api/v1/stream?id=${encodeURIComponent(episodeId)}&server=${encodeURIComponent(server)}&type=${encodeURIComponent(type)}`,
                {},
                3000
            );
            if (!hianimeData) {
                hianimeData = await fetchJsonWithTimeout(
                    `${hiAnimeUrl}/stream?id=${encodeURIComponent(episodeId)}&server=${encodeURIComponent(server)}&type=${encodeURIComponent(type)}`,
                    {},
                    3000
                );
            }

            if (hianimeData?.success && hianimeData.data) {
                const streamData = hianimeData.data;
                const fileUrl = streamData.link?.file || streamData.link?.directUrl || streamData.streamingLink;
                if (fileUrl && typeof fileUrl === 'string' && (fileUrl.includes('.m3u8') || fileUrl.includes('.mp4'))) {
                    const tracks = (streamData.tracks || []).map(t => ({
                        file: t.file?.startsWith('http')
                            ? `/api/anime/hls-proxy?url=${encodeURIComponent(t.file)}&referer=${encodeURIComponent('https://megacloud.tv')}`
                            : t.file,
                        label: t.label || 'Subtitles',
                        kind: t.kind || 'captions',
                        default: Boolean(t.default)
                    }));

                    const proxiedUrl = fileUrl.includes('.m3u8')
                        ? `/api/anime/hls-proxy?url=${encodeURIComponent(fileUrl)}&referer=${encodeURIComponent('https://megacloud.tv')}`
                        : fileUrl;

                    const result = {
                        sources: [
                            {
                                url: proxiedUrl,
                                type: fileUrl.includes('.m3u8') ? 'hls' : 'mp4',
                                isM3U8: fileUrl.includes('.m3u8'),
                                quality: 'auto'
                            }
                        ],
                        subtitles: tracks,
                        intro: streamData.intro || { start: 90, end: 180 },
                        outro: streamData.outro || { start: 1350, end: 1440 },
                        serverUsed: server,
                        typeUsed: type,
                        hasHls: true
                    };
                    setCached(cacheKey, result, 1800);
                    return result;
                }
            }
        } catch (e) {
            // Fall through
        }

        // Return clean state without stream (STRICTLY NO Big Buck Bunny)
        const result = {
            sources: [],
            subtitles: [],
            intro: { start: 90, end: 180 },
            outro: { start: 1350, end: 1440 },
            hasHls: false,
            serverUsed: server,
            typeUsed: type,
            isFallback: true
        };

        setCached(cacheKey, result, 30);
        return result;
    }
};
