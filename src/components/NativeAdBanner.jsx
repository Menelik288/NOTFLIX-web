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
                        html, body {
                            margin: 0;
                            padding: 0;
                            background: transparent;
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                            color: #f3f4f6;
                            width: 100%;
                            overflow: hidden;
                        }
                        #container-fa5671a96b2087bde086040d5a8719fc {
                            width: 100%;
                            max-width: 100%;
                            display: flex;
                            justify-content: center;
                            overflow: visible;
                        }
                        /* Ensure ad thumbnails have modern rounded corners */
                        img {
                            border-radius: 10px !important;
                            transition: transform 0.3s ease !important;
                        }
                        img:hover {
                            transform: scale(1.03) !important;
                        }
                        /* Ensure ad text is clean and legible */
                        a {
                            color: #e5e7eb !important;
                            text-decoration: none !important;
                            font-size: 13px !important;
                            line-height: 1.3 !important;
                            font-weight: 600 !important;
                        }
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
            <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md ${compact ? 'p-3' : 'p-4 md:p-5'} shadow-xl transition-all duration-300 hover:border-white/25`}>
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

                {/* Ad Frame with generous height to display full image + full text */}
                <div className="w-full flex items-center justify-center overflow-hidden">
                    <iframe
                        ref={iframeRef}
                        title="Sponsored Recommendations"
                        className={`w-full border-0 overflow-hidden ${compact ? 'h-[260px]' : 'h-[230px] sm:h-[245px] md:h-[235px]'}`}
                        scrolling="no"
                        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
                    />
                </div>
            </div>
        </div>
    );
};

export default NativeAdBanner;
