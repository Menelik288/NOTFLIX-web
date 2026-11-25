/**
 * DMCA & Copyright Compliance Blocklist
 * 
 * Contains IDs of media titles that have received valid takedown requests.
 * Blocked titles will not load any video embed, player, or streaming sources,
 * and will display an official content removal notice with robots noindex.
 */

export const DMCA_BLOCKED_MEDIA = {
    movie: [
        '1422041', // 'La Bola Negra' - Claim by Altitude Film Sales / CTW Anti-Piracy
        '83533',   // 'Avatar: Fire and Ash' - Claim by MediaStory
    ],
    tv: [],
    anime: []
};

/**
 * Check if a media item is blocked due to copyright/DMCA notice
 * @param {string} type - 'movie', 'tv', or 'anime'
 * @param {string|number} id - TMDB or Anime ID
 * @returns {boolean}
 */
export function isMediaBlocked(type, id) {
    if (!type || !id) return false;
    const list = DMCA_BLOCKED_MEDIA[type.toLowerCase()] || [];
    return list.includes(String(id));
}

/**
 * Get the removal statement for blocked media
 * @param {string} type 
 * @param {string|number} id 
 * @returns {object}
 */
export function getBlockedMediaNotice(type, id) {
    return {
        title: "Content Unavailable",
        message: "Access to this title has been disabled in compliance with a copyright notification pursuant to our Copyright & DMCA Policy.",
        referenceId: `DMCA-${type.toUpperCase()}-${id}`,
        supportEmail: "dmca@notflix.pro.et"
    };
}
