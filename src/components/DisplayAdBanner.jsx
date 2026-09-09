import { useEffect, useRef } from 'react';

export const DisplayAdBanner = ({ className = '', title = 'Sponsored Deals' }) => {
    const iframeRef = useRef(null);

    useEffect(() => {
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
            console.warn('Error loading display ad iframe:', e);
        }
    }, []);

    return (
        <div className={`w-full my-6 flex flex-col items-center justify-center ${className}`}>
            <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-4 sm:p-6 shadow-xl transition-all duration-300 hover:border-white/20 flex flex-col items-center justify-center max-w-[340px] sm:max-w-[400px] w-full">
                {/* Header Badge */}
                <div className="flex items-center justify-between w-full mb-3 text-xs text-white/50 font-medium tracking-wider uppercase">
                    <span className="flex items-center gap-1.5 truncate pr-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse shrink-0"></span>
                        <span className="truncate font-bold tracking-wide text-white/70">{title}</span>
                    </span>
                    <span className="text-[10px] bg-white/10 text-white/70 px-2 py-0.5 rounded border border-white/10 font-bold tracking-wider shrink-0">
                        AD
                    </span>
                </div>

                {/* 300x250 Sandboxed Iframe Container */}
                <div className="w-[300px] h-[250px] flex items-center justify-center overflow-hidden rounded-xl bg-black/40 shadow-inner">
                    <iframe
                        ref={iframeRef}
                        title="Display Ad"
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

export default DisplayAdBanner;
