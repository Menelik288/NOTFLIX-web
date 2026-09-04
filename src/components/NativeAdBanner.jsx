import { useEffect, useRef } from 'react';

export const NativeAdBanner = ({ className = '', title = 'Sponsored Recommendations', compact = false }) => {
    const iframeRef = useRef(null);

    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;

        const htmlContent = `
            <!DOCTYPE html>
            <html style="background: transparent; margin: 0; padding: 0;">
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        * { box-sizing: border-box; }
                        body { margin: 0; padding: 0; background: transparent; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; justify-content: center; }
                        #container-fa5671a96b2087bde086040d5a8719fc { width: 100%; max-width: 100%; display: flex; justify-content: center; overflow: hidden; }
                    </style>
                </head>
                <body>
                    <script async="async" data-cfasync="false" src="https://paralysisfoxbullet.com/fa5671a96b2087bde086040d5a8719fc/invoke.js"></script>
                    <div id="container-fa5671a96b2087bde086040d5a8719fc"></div>
                </body>
            </html>
        `;

        iframe.srcdoc = htmlContent;
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

                {/* Adsterra Mount Frame (Isolated per instance to support multiple 2x ads per page) */}
                <div className="w-full min-h-[140px] flex items-center justify-center overflow-hidden">
                    <iframe
                        ref={iframeRef}
                        title="Sponsored Ad Content"
                        className="w-full min-h-[150px] border-0 overflow-hidden"
                        scrolling="no"
                        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
                    />
                </div>
            </div>
        </div>
    );
};

export default NativeAdBanner;
