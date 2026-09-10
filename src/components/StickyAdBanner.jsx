import React, { useState, useEffect, useRef } from 'react';
import { AdService } from '../services/adService';

export const StickyAdBanner = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [isMinimized, setIsMinimized] = useState(false);
    const iframeRef = useRef(null);

    useEffect(() => {
        if (!isVisible || isMinimized) return;

        const iframe = iframeRef.current;
        if (!iframe) return;

        try {
            const doc = iframe.contentWindow?.document || iframe.contentDocument;
            if (!doc) return;

            doc.open();
            doc.write(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <meta charset="UTF-8">
                        <style>
                            * { margin: 0; padding: 0; box-sizing: border-box; }
                            body {
                                margin: 0;
                                padding: 0;
                                background: transparent;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                width: 300px;
                                height: 250px;
                                overflow: hidden;
                            }
                        </style>
                    </head>
                    <body>
                        <script type="text/javascript">
                            atOptions = {
                                'key' : 'f79e5fa787885d9b0ed848ac4734b4f4',
                                'format' : 'iframe',
                                'height' : 250,
                                'width' : 300,
                                'params' : {}
                            };
                        </script>
                        <script type="text/javascript" src="https://paralysisfoxbullet.com/f79e5fa787885d9b0ed848ac4734b4f4/invoke.js"></script>
                    </body>
                </html>
            `);
            doc.close();
        } catch (e) {
            console.warn('Error loading sticky ad iframe:', e);
        }
    }, [isVisible, isMinimized]);

    if (!isVisible) return null;

    if (isMinimized) {
        return (
            <div className="fixed bottom-20 md:bottom-4 right-4 z-40 animate-fade-in">
                <button
                    onClick={() => setIsMinimized(false)}
                    className="glass-surface px-3 py-1.5 rounded-full border border-white/20 text-[11px] font-bold text-white flex items-center gap-1.5 shadow-2xl hover:border-white/40 active:scale-95 transition-all bg-black/80 cursor-pointer"
                    title="Show Sponsor Deals"
                >
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    <span>Deals (Ad)</span>
                    <span className="material-symbols-outlined text-xs">expand_less</span>
                </button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-40 animate-slide-up max-w-[340px] w-full px-2">
            <div className="relative rounded-2xl border border-white/15 bg-black/90 backdrop-blur-2xl p-2 sm:p-3 shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex flex-col items-center">
                
                {/* Header Bar with Minimize & Close */}
                <div className="flex items-center justify-between w-full mb-1.5 px-1 text-[10px] text-white/50 font-bold tracking-wider uppercase">
                    <span className="flex items-center gap-1 text-white/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                        <span>Sponsored Deals</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                        <button 
                            onClick={() => setIsMinimized(true)}
                            className="text-white/50 hover:text-white p-0.5 rounded transition-colors cursor-pointer"
                            title="Minimize Ad"
                        >
                            <span className="material-symbols-outlined text-sm">minimize</span>
                        </button>
                        <button 
                            onClick={() => setIsVisible(false)}
                            className="text-white/50 hover:text-white p-0.5 rounded transition-colors cursor-pointer"
                            title="Close"
                        >
                            <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                    </div>
                </div>

                {/* 300x250 Sandboxed Iframe Container */}
                <div className="w-[300px] h-[250px] flex items-center justify-center overflow-hidden rounded-xl bg-black/50 shadow-inner">
                    <iframe
                        ref={iframeRef}
                        title="Sticky Display Ad"
                        width="300"
                        height="250"
                        frameBorder="0"
                        scrolling="no"
                        className="w-[300px] h-[250px] border-0"
                    />
                </div>
            </div>
        </div>
    );
};

export default StickyAdBanner;
