import { useEffect, useRef } from 'react';

export const NativeAdBanner = ({ className = '', title = 'Sponsored Recommendations', compact = false }) => {
    const bannerRef = useRef(null);

    useEffect(() => {
        const container = bannerRef.current;
        if (!container) return;

        // Clean any existing injected DOM elements
        container.innerHTML = '';

        // 1. Create target ad container expected by Adsterra
        const adDiv = document.createElement('div');
        adDiv.id = 'container-fa5671a96b2087bde086040d5a8719fc';
        adDiv.style.width = '100%';
        container.appendChild(adDiv);

        // 2. Create the adsterra invoke script (Anti-Adblock enabled)
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.setAttribute('data-cfasync', 'false');
        script.src = 'https://paralysisfoxbullet.com/fa5671a96b2087bde086040d5a8719fc/invoke.js';

        container.appendChild(script);

        return () => {
            if (container) {
                container.innerHTML = '';
            }
        };
    }, []);

    return (
        <div className={`w-full max-w-full overflow-hidden ${compact ? 'my-3' : 'my-4 sm:my-6'} ${className}`}>
            <div className={`relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md ${compact ? 'p-2.5 sm:p-3' : 'p-3 sm:p-4 md:p-6'} shadow-xl transition-all duration-300 hover:border-white/20 overflow-hidden`}>
                {/* Header Badge */}
                <div className="flex items-center justify-between mb-2.5 sm:mb-3 text-xs text-white/50 font-medium tracking-wider uppercase">
                    <span className="flex items-center gap-1.5 truncate pr-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse shrink-0"></span>
                        <span className="truncate font-bold tracking-wide text-white/70">{title}</span>
                    </span>
                    <span className="text-[10px] bg-white/10 text-white/70 px-2 py-0.5 rounded border border-white/10 font-bold tracking-wider shrink-0">
                        AD
                    </span>
                </div>

                {/* Adsterra Native Container - Horizontal Swipeable Carousel on Mobile */}
                <div 
                    ref={bannerRef}
                    className="w-full max-w-full overflow-x-auto overflow-y-hidden custom-scrollbar flex items-center min-h-[90px]"
                />
            </div>
        </div>
    );
};

export default NativeAdBanner;
