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
        container.appendChild(adDiv);

        // 2. Create the adsterra invoke script
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.setAttribute('data-cfasync', 'false');
        script.src = 'https://pl31176481.profitableratecpmnetwork.com/fa5671a96b2087bde086040d5a8719fc/invoke.js';

        container.appendChild(script);

        return () => {
            if (container) {
                container.innerHTML = '';
            }
        };
    }, []);

    return (
        <div className={`w-full ${compact ? 'my-2' : 'my-6'} ${className}`}>
            <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md ${compact ? 'p-3' : 'p-4 md:p-6'} shadow-xl transition-all duration-300 hover:border-white/20`}>
                {/* Header Badge */}
                <div className="flex items-center justify-between mb-2 text-xs text-white/40 font-medium tracking-wider uppercase">
                    <span className="flex items-center gap-1.5 truncate pr-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0"></span>
                        <span className="truncate">{title}</span>
                    </span>
                    <span className="text-[10px] bg-white/10 text-white/60 px-1.5 py-0.5 rounded border border-white/10 font-semibold shrink-0">
                        AD
                    </span>
                </div>

                {/* Adsterra Mount Container */}
                <div 
                    ref={bannerRef}
                    className="min-h-[120px] flex items-center justify-center w-full overflow-hidden"
                />
            </div>
        </div>
    );
};

export default NativeAdBanner;
