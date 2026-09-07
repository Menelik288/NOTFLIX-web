// Dual-Network Smartlink Ad Service (Adsterra + Monetag)
const SMARTLINKS = [
    { name: 'Adsterra', url: 'https://paralysisfoxbullet.com/bb1w2rs69?key=648ecbff3033816c3e4806c9d2eeaca6' },
    { name: 'Monetag', url: 'https://omg10.com/4/11745214' }
];

const STORAGE_PREFIX = 'notflix_last_smartlink_time_';
const STORAGE_INDEX_KEY = 'notflix_last_smartlink_idx';

// 3.5 minutes frequency cap per trigger category
const FREQUENCY_CAP_MS = 3.5 * 60 * 1000;

export const AdService = {
    /**
     * Triggers a Smartlink ad in a new tab if frequency cap allows for the specific category.
     * Keeps user playback seamless on the current tab.
     * Alternates 50/50 between Adsterra and Monetag.
     * 
     * @param {'watch' | 'server' | string} category - Independent category ('watch' for play/episodes, 'server' for server switches)
     */
    triggerSmartlink: (category = 'watch') => {
        try {
            const now = Date.now();
            const storageKey = `${STORAGE_PREFIX}${category}`;
            const lastTrigger = localStorage.getItem(storageKey);

            if (!lastTrigger || now - Number(lastTrigger) > FREQUENCY_CAP_MS) {
                localStorage.setItem(storageKey, String(now));

                // Get current rotation index and calculate next
                const currentIndex = Number(localStorage.getItem(STORAGE_INDEX_KEY) || '0');
                const nextIndex = (currentIndex + 1) % SMARTLINKS.length;
                localStorage.setItem(STORAGE_INDEX_KEY, String(nextIndex));

                const selectedNetwork = SMARTLINKS[currentIndex];
                // Open selected high-yield direct link in a new background tab
                window.open(selectedNetwork.url, '_blank');
                return true;
            }
        } catch (e) {
            console.warn('Smartlink trigger error:', e);
        }
        return false;
    },

    triggerWatchSmartlink: () => AdService.triggerSmartlink('watch'),
    triggerServerSmartlink: () => AdService.triggerSmartlink('server')
};

export default AdService;
