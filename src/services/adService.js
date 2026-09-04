// Adsterra Smartlink Ad Service
const SMARTLINK_URL = 'https://paralysisfoxbullet.com/bb1w2rs69?key=648ecbff3033816c3e4806c9d2eeaca6';
const STORAGE_KEY = 'notflix_last_smartlink_time';
// 6 minutes frequency cap between new-tab ad triggers
const FREQUENCY_CAP_MS = 6 * 60 * 1000;

export const AdService = {
    /**
     * Triggers a Smartlink ad in a new tab if frequency cap allows.
     * Keeps user playback seamless on the current tab.
     */
    triggerSmartlink: () => {
        try {
            const now = Date.now();
            const lastTrigger = localStorage.getItem(STORAGE_KEY);

            if (!lastTrigger || now - Number(lastTrigger) > FREQUENCY_CAP_MS) {
                localStorage.setItem(STORAGE_KEY, String(now));
                // Open ad in a new tab
                window.open(SMARTLINK_URL, '_blank');
                return true;
            }
        } catch (e) {
            console.warn('Smartlink trigger error:', e);
        }
        return false;
    }
};

export default AdService;
