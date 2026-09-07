// Dual-Network Smartlink Ad Service (Adsterra + Monetag)
const SMARTLINKS = [
    { name: 'Adsterra', url: 'https://paralysisfoxbullet.com/bb1w2rs69?key=648ecbff3033816c3e4806c9d2eeaca6' },
    { name: 'Monetag', url: 'https://omg10.com/4/11745214' }
];

const STORAGE_TIME_KEY = 'notflix_last_smartlink_time';
const STORAGE_INDEX_KEY = 'notflix_last_smartlink_idx';

// 3.5 minutes frequency cap between new-tab ad triggers
const FREQUENCY_CAP_MS = 3.5 * 60 * 1000;

export const AdService = {
    /**
     * Triggers a Smartlink ad in a new tab if frequency cap allows.
     * Alternates 50/50 between Adsterra and Monetag for maximum revenue.
     * Keeps user playback seamless on the current tab.
     */
    triggerSmartlink: () => {
        try {
            const now = Date.now();
            const lastTrigger = localStorage.getItem(STORAGE_TIME_KEY);

            if (!lastTrigger || now - Number(lastTrigger) > FREQUENCY_CAP_MS) {
                localStorage.setItem(STORAGE_TIME_KEY, String(now));

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
    }
};

export default AdService;
