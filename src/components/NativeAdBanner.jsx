import { useEffect, useRef } from 'react';

const AD_UNITS = {
    top: 'fa5671a96b2087bde086040d5a8719fc',
    bottom: '03498da1519c107dee56f962a99645d2'
};

export const NativeAdBanner = ({ className = '', title = 'Sponsored Recommendations', compact = false, placement = 'top', unitId }) => {
    const bannerRef = useRef(null);
    const activeUnitId = unitId || AD_UNITS[placement] || AD_UNITS.top;

    useEffect(() => {
        const container = bannerRef.current;
        if (!container) return;

        // Clean any existing injected DOM elements
        container.innerHTML = '';

        // 1. Create target ad container expected by Adsterra
        const adDiv = document.createElement('div');
        adDiv.id = `container-${activeUnitId}`;
        adDiv.style.width = '100%';
        container.appendChild(adDiv);

        // 2. Create the adsterra invoke script (Anti-Adblock enabled)
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.setAttribute('data-cfasync', 'false');
        script.src = `https://paralysisfoxbullet.com/${activeUnitId}/invoke.js`;

        container.appendChild(script);

        return () => {
            if (container) {
                container.innerHTML = '';
            }
        };
    }, [activeUnitId]);

    return (
        <div className={`w-full ${compact ? 'my-3' : 'my-6'} ${className}`}>
            <div className={`relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md ${compact ? 'p-3' : 'p-4 md:p-6'} shadow-xl transition-all duration-300 hover:border-white/20`}>
                {/* Header Badge */}
                <div className="flex items-center justify-between mb-3 text-xs text-white/50 font-medium tracking-wider uppercase">
                    <span className="flex items-center gap-1.5 truncate pr-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse shrink-0"></span>
                        <span className="truncate font-bold tracking-wide text-white/70">{title}</span>
                    </span>
                    <span className="text-[10px] bg-white/10 text-white/70 px-2 py-0.5 rounded border border-white/10 font-bold tracking-wider shrink-0">
                        AD
                    </span>
                </div>

                {/* Adsterra Native Container - Naturally expands to show full image, title, and description */}
                <div 
                    ref={bannerRef}
                    className="w-full flex items-center justify-center min-h-[140px]"
                />
            </div>
        </div>
    );
};

export default NativeAdBanner;
