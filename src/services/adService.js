// 100% Adsterra High-Yield Smartlink Ad Service
const ADSTERRA_LINK = { name: 'Adsterra', url: 'https://paralysisfoxbullet.com/bb1w2rs69?key=648ecbff3033816c3e4806c9d2eeaca6' };

const STORAGE_PREFIX = 'notflix_last_smartlink_time_';

// 3.5 minutes frequency cap per trigger category
const FREQUENCY_CAP_MS = 3.5 * 60 * 1000;

export const AdService = {
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
    triggerDownloadSmartlink: () => AdService.triggerSmartlink('download'),

    /**
     * Triggers Adsterra ad redirect and simultaneously initiates the APK download on PC & Mobile.
     * Works exactly like Watch Now: opens the Adsterra redirect in a new tab and performs the download seamlessly.
     */
    triggerAppDownload: (apkUrl = '/Notflix_v1.0.1.APK', filename = 'Notflix_v1.0.1.apk') => {
        try {
            // 1. Trigger 100% Adsterra Smartlink ad redirect
            AdService.triggerSmartlink('download');

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
