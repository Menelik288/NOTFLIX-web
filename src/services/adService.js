// 100% Adsterra High-Yield Smartlink & Ad Management Service
const ADSTERRA_LINK = { name: 'Adsterra', url: 'https://paralysisfoxbullet.com/bb1w2rs69?key=648ecbff3033816c3e4806c9d2eeaca6' };

const STORAGE_PREFIX = 'notflix_last_smartlink_time_';

// 5 minutes frequency cap for background smartlinks
const FREQUENCY_CAP_MS = 5 * 60 * 1000;

// 20 minutes frequency cap for full-page popunders to prevent ad fatigue & protect CPM tier
const POPUNDER_CAP_MS = 20 * 60 * 1000;

export const AdService = {
    /**
     * Initializes Adsterra Popunder with a strict 20-minute frequency cap per user.
     * Prevents multi-tab spam, boosts user retention, and improves Adsterra eCPM quality.
     */
    initPopunder: () => {
        try {
            if (typeof window === 'undefined') return;
            const lastLoaded = localStorage.getItem('notflix_last_popunder_time');
            const now = Date.now();

            if (!lastLoaded || now - Number(lastLoaded) > POPUNDER_CAP_MS) {
                localStorage.setItem('notflix_last_popunder_time', String(now));
                const script = document.createElement('script');
                script.src = 'https://paralysisfoxbullet.com/a5/24/7a/a5247ac583674e6bb4ff14678909ce1a.js';
                script.async = true;
                script.setAttribute('data-cfasync', 'false');
                document.body.appendChild(script);
            }
        } catch (e) {
            console.warn('Popunder init error:', e);
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
