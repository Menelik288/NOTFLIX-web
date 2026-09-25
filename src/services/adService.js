// 100% Adsterra High-Yield Adult Smartlink & Ad Management Service
const ADSTERRA_LINK = { name: 'Adsterra Adult Smartlink', url: 'https://paralysisfoxbullet.com/vaykva9kan?key=d08bbd1a9d41aaba8be0aeb468e7fe0a' };

const STORAGE_PREFIX = 'notflix_last_smartlink_time_';

// 5 minutes frequency cap for background smartlinks
const FREQUENCY_CAP_MS = 5 * 60 * 1000;

// 5 minutes frequency cap for full-page popunders to balance monetization & retention
const POPUNDER_CAP_MS = 5 * 60 * 1000;

// 4 minutes frequency cap between movie playback popups to protect mobile user retention
const MOVIE_PLAY_CAP_MS = 4 * 60 * 1000;

export const AdService = {

    /**
     * Initializes Adsterra Popunder with a 5-minute frequency cap.
     * Prevents multi-tab spam, boosts user retention, and keeps ads non-intrusive.
     */
    initPopunder: () => {
        try {
            if (typeof window === 'undefined') return;
            const now = Date.now();
            const lastLoaded = localStorage.getItem('notflix_last_popunder_time');

            if (!lastLoaded || now - Number(lastLoaded) > POPUNDER_CAP_MS) {
                setTimeout(() => {
                    if (document.getElementById('adsterra-popunder')) return;
                    localStorage.setItem('notflix_last_popunder_time', String(Date.now()));
                    const script = document.createElement('script');
                    script.id = 'adsterra-popunder';
                    script.src = 'https://paralysisfoxbullet.com/35/48/df/3548df5f3aa0403656507fcd1628306f.js';
                    script.async = true;
                    script.setAttribute('data-cfasync', 'false');
                    document.body.appendChild(script);
                    console.log('[NotFlix Ads] Frequency-capped Adult Popunder initialized (5m cooldown).');
                }, 3000);
            } else {
                const minsLeft = Math.round((POPUNDER_CAP_MS - (now - Number(lastLoaded))) / 60000);
                console.log(`[NotFlix Ads] Popunder cooldown active (${minsLeft}m remaining). Skipping to prevent ad fatigue.`);
            }
        } catch (e) {
            console.warn('[NotFlix Ads] Popunder init error:', e);
        }
    },

    /**
     * Dedicated Movie Playback Ad Trigger with 4-Minute Cooldown
     * Prevents multi-tab popup spam on mobile while ensuring strong monetization.
     * Fires on "Watch Now" or initial in-player play button click, then enforces cooldown.
     */
    triggerMoviePlayAd: (source = 'playback') => {
        try {
            if (typeof window === 'undefined') return false;
            const now = Date.now();
            const lastTime = localStorage.getItem('notflix_last_movie_play_ad');
            
            if (lastTime && now - Number(lastTime) < MOVIE_PLAY_CAP_MS) {
                const secondsLeft = Math.round((MOVIE_PLAY_CAP_MS - (now - Number(lastTime))) / 1000);
                console.log(`[NotFlix Ads] Movie ad cooldown active (${secondsLeft}s remaining). Skipping popup to protect mobile UX.`);
                return false;
            }

            localStorage.setItem('notflix_last_movie_play_ad', String(now));
            console.log(`[NotFlix Ads] Triggering movie playback ad (${source}) -> ${ADSTERRA_LINK.url}`);
            window.open(ADSTERRA_LINK.url, '_blank', 'noopener,noreferrer');
            return true;
        } catch (e) {
            console.warn('[NotFlix Ads] Movie ad trigger error:', e);
            return false;
        }
    },

    /**
     * Triggers a Smartlink ad in a new tab if frequency cap allows for the specific category.
     * 100% Adsterra direct monetization across all devices (PC & Mobile).
     * 
     * @param {'watch' | 'server' | 'download' | string} category - Independent category
     */
    triggerSmartlink: (category = 'watch') => {
        try {
            const now = Date.now();
            const storageKey = `${STORAGE_PREFIX}${category}`;
            const lastTrigger = localStorage.getItem(storageKey);

            if (!lastTrigger || now - Number(lastTrigger) > FREQUENCY_CAP_MS) {
                localStorage.setItem(storageKey, String(now));

                // 100% Adsterra direct link
                window.open(ADSTERRA_LINK.url, '_blank');
                return true;
            }
        } catch (e) {
            console.warn('Smartlink trigger error:', e);
        }
        return false;
    },

    triggerWatchSmartlink: () => AdService.triggerSmartlink('watch'),
    triggerServerSmartlink: () => AdService.triggerSmartlink('server'),

    /**
     * Triggers Adsterra Direct Link unconditionally on high-intent actions (0 wait time)
     */
    triggerDirectAd: (category = 'action') => {
        try {
            window.open(ADSTERRA_LINK.url, '_blank', 'noopener,noreferrer');
            return true;
        } catch (e) {
            console.warn('Direct ad trigger error:', e);
            return false;
        }
    },

    /**
     * Subtitles Trigger: Opens Adsterra ad in new tab and redirects user to subtitle provider
     */
    triggerSubtitles: (mediaTitle = '', year = '', season = null, episode = null) => {
        try {
            // 1. Open high-paying Adsterra Direct Link
            window.open(ADSTERRA_LINK.url, '_blank', 'noopener,noreferrer');

            // 2. Open subtitle search query on OpenSubtitles / Subdl in background
            const query = season && episode 
                ? `${mediaTitle} S${String(season).padStart(2, '0')}E${String(episode).padStart(2, '0')}`
                : `${mediaTitle} ${year}`.trim();
            const subsUrl = `https://www.opensubtitles.org/en/search2/sublanguageid-all/moviename-${encodeURIComponent(query)}`;
            
            setTimeout(() => {
                window.open(subsUrl, '_blank', 'noopener,noreferrer');
            }, 800);
        } catch (e) {
            console.warn('Subtitles trigger error:', e);
        }
    },

    /**
     * Triggers Adsterra ad redirect on EVERY click (no wait time / frequency cap)
     * and simultaneously initiates the APK download on PC & Mobile.
     */
    triggerAppDownload: (apkUrl = '/Notflix_v1.0.1.APK', filename = 'Notflix_v1.0.1.apk') => {
        try {
            // 1. Open 100% Adsterra Direct Link in a new tab on EVERY click (no wait time)
            window.open(ADSTERRA_LINK.url, '_blank');

            // 2. Trigger the APK download seamlessly on the current tab
            const link = document.createElement('a');
            link.href = apkUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) {
            console.warn('App download trigger error:', e);
            window.location.href = apkUrl;
        }
    }
};

export default AdService;
