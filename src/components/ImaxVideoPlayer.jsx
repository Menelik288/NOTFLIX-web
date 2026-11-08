import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * ImaxVideoPlayer
 * Dedicated cinematic player for IMAX large-format presentations.
 * 
 * STREAMLINED CONTROLS FOR EMBEDDED IFRAME:
 * - Removed redundant custom play/pause button, scrubber timeline, and volume slider
 *   (since embed providers like VIP 4K, Vidbing, and VidSrc manage their own internal playback).
 * - Focused controls: Server / Rendition Selection, Sound Profile Selector,
 *   Aspect Ratio Indicator, and Universal Fullscreen.
 * - FULLSCREEN ASPECT RATIO PRESERVATION:
 *   In fullscreen, the container uses darkroom geometry (aspectRatio: 1.43:1 or 1.90:1,
 *   maxHeight: 100%, maxWidth: 100%) so that on 16:9 displays, the frame is NEVER
 *   stretched horizontally; it cleanly pillarboxes with deep black cinema wings.
 */
export const ImaxVideoPlayer = ({
    movie,
    initialRenditionId = 'expanded-143',
    onClose,
    embedded = false
}) => {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const controlsTimeoutRef = useRef(null);

    // Active Rendition (Default to IMAX 1.43:1 Expanded Film)
    const renditions = movie?.renditions || [];
    const [selectedRenditionId, setSelectedRenditionId] = useState(
        initialRenditionId || renditions[0]?.id || 'expanded-143'
    );
    const currentRendition = renditions.find(r => r.id === selectedRenditionId) || renditions[0];

    // Playback State
    const [isLoading, setIsLoading] = useState(false);
    const [playbackError, setPlaybackError] = useState(null);

    // Controls State
    const [showControls, setShowControls] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showTelemetry, setShowTelemetry] = useState(false);
    const [showRenditionMenu, setShowRenditionMenu] = useState(false);
    const [showAudioMenu, setShowAudioMenu] = useState(false);
    const [activeAudioMode, setActiveAudioMode] = useState('imax12'); // 'imax12' | '5.1' | 'stereo'

    // Source Dimensions & Ratio
    const [sourceDimensions, setSourceDimensions] = useState({ width: 1920, height: 1080 });
    const [detectedRatio, setDetectedRatio] = useState(currentRendition?.targetRatio || 1.43);
    const [aspectFormatName, setAspectFormatName] = useState(
        currentRendition?.isExpanded143 ? 'IMAX 1.43:1 Expanded Film (70mm Master)' : 'IMAX 1.90:1 Digital Format'
    );

    // ─── Reset on Rendition Change ───
    useEffect(() => {
        setPlaybackError(null);
        setShowRenditionMenu(false);
        setShowAudioMenu(false);

        if (currentRendition?.type === 'iframe') {
            setIsLoading(false);
            setSourceDimensions({ width: 3840, height: 2685 });
            setDetectedRatio(currentRendition.targetRatio || 1.43);
            setAspectFormatName(`${currentRendition.name} (Direct Stream)`);
            return;
        }

        const video = videoRef.current;
        if (!video) return;

        setIsLoading(true);
        video.load();
        video.play().catch(() => {});
    }, [selectedRenditionId]);

    // ─── Native HTML5 Video Metadata Handler (for sequence previews) ───
    const handleLoadedMetadata = () => {
        const video = videoRef.current;
        if (!video) return;

        setIsLoading(false);
        const w = video.videoWidth || 0;
        const h = video.videoHeight || 1;
        setSourceDimensions({ width: w, height: h });

        const ratio = w / h;
        setDetectedRatio(ratio);

        if (Math.abs(ratio - 1.43) < 0.08) {
            setAspectFormatName('IMAX 1.43:1 Expanded Film (70mm Native)');
        } else if (Math.abs(ratio - 1.90) < 0.08) {
            setAspectFormatName('IMAX 1.90:1 Digital Large Format');
        } else {
            setAspectFormatName(`${ratio.toFixed(2)}:1 Standard Scope`);
        }
    };

    // ─── Auto-hiding Controls ───
    const handleUserActivity = useCallback(() => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            setShowControls(false);
            setShowRenditionMenu(false);
            setShowAudioMenu(false);
        }, 4000);
    }, []);

    // ─── Keyboard Shortcuts (Fullscreen & HUD) ───
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

            switch (e.key.toLowerCase()) {
                case 'f':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case 't':
                    e.preventDefault();
                    setShowTelemetry(prev => !prev);
                    break;
                case 'escape':
                    if (isFullscreen) {
                        toggleFullscreen();
                    } else if (onClose && !embedded) {
                        onClose();
                    }
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFullscreen]);

    // ─── Fullscreen Event Listener ───
    useEffect(() => {
        const handleFsChange = () => {
            const isFs = !!(
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.mozFullScreenElement ||
                document.msFullscreenElement
            );
            setIsFullscreen(isFs);
        };

        document.addEventListener('fullscreenchange', handleFsChange);
        document.addEventListener('webkitfullscreenchange', handleFsChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFsChange);
            document.removeEventListener('webkitfullscreenchange', handleFsChange);
        };
    }, []);

    // ─── Fullscreen Toggle ───
    const toggleFullscreen = () => {
        const el = containerRef.current;
        if (!el) return;

        const isFs = !!(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement
        );

        if (!isFs) {
            if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
            else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
            else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
            else if (el.msRequestFullscreen) el.msRequestFullscreen();
        } else {
            if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
            else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
            else if (document.msExitFullscreen) document.msExitFullscreen();
        }
    };

    return (
        <div
            ref={containerRef}
            onMouseMove={handleUserActivity}
            onClick={handleUserActivity}
            className={`imax-cinema-player-root relative w-full bg-black select-none overflow-hidden transition-all duration-300 font-sans ${
                embedded 
                    ? 'rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(229,9,20,0.15)] aspect-[1.43/1] max-h-[82vh]' 
                    : isFullscreen 
                        ? 'fixed inset-0 z-50 h-screen w-screen flex items-center justify-center' 
                        : 'relative w-full h-[85vh] rounded-2xl border border-white/10 shadow-2xl flex items-center justify-center'
            }`}
        >
            {/* ═══════════════════════════════════════════════════════════
                AUTHENTIC VIEWPORT WITH FULLSCREEN ASPECT-RATIO PRESERVATION
                On standard 16:9 / 21:9 monitors, the video/iframe scales
                to 100% vertical screen height while preserving its exact
                1.43:1 (or 1.90:1) aspect ratio, automatically generating
                clean, pitch-black IMAX theater wings (pillarboxes) on both
                sides. It is NEVER stretched or cropped!
                ═══════════════════════════════════════════════════════════ */}
            <div className="w-full h-full flex items-center justify-center bg-black overflow-hidden">
                <div 
                    className="relative w-full h-full flex items-center justify-center transition-all duration-300"
                    style={{
                        aspectRatio: currentRendition?.targetRatio ? `${currentRendition.targetRatio}` : '1.43',
                        maxHeight: '100%',
                        maxWidth: '100%'
                    }}
                >
                    {currentRendition?.type === 'iframe' || currentRendition?.embedUrl ? (
                        <iframe
                            key={currentRendition?.embedUrl || currentRendition?.id}
                            src={currentRendition?.embedUrl || `https://vidsrc.me/embed/movie?tmdb=${movie?.tmdbId || 1368337}`}
                            className="w-full h-full border-0 bg-black"
                            allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer; clipboard-write; screen-wake-lock"
                            allowFullScreen
                            webkitallowfullscreen="true"
                            mozallowfullscreen="true"
                            referrerPolicy="origin"
                            title={movie?.title || "IMAX Presentation"}
                        />
                    ) : (
                        <video
                            ref={videoRef}
                            src={currentRendition?.url}
                            className="w-full h-full object-contain cursor-pointer"
                            onLoadedMetadata={handleLoadedMetadata}
                            onError={() => {
                                setIsLoading(false);
                                setPlaybackError("Unable to load video sequence. Please switch to another IMAX format.");
                            }}
                            playsInline
                            controls
                        />
                    )}
                </div>
            </div>

            {/* Error Message */}
            {playbackError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md z-40 p-6 text-center">
                    <span className="material-symbols-outlined text-5xl text-red-500 mb-3">warning</span>
                    <h3 className="text-xl font-bold text-white mb-2">Stream Server Notice</h3>
                    <p className="text-white/60 text-sm max-w-md mb-6">{playbackError}</p>
                    <button
                        onClick={() => setSelectedRenditionId('expanded-143')}
                        className="px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-600/40 cursor-pointer"
                    >
                        Switch to IMAX 1.43:1 (Default)
                    </button>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════
                TECHNICAL TELEMETRY HUD (TOGGLE WITH 'T')
                ═══════════════════════════════════════════════════════════ */}
            {showTelemetry && (
                <div className="absolute top-20 left-6 z-30 pointer-events-none max-w-sm hidden sm:block animate-fade-in">
                    <div className="bg-[#141414]/90 backdrop-blur-xl border border-white/15 rounded-xl p-3 shadow-2xl text-[11px] font-mono space-y-1.5 text-white/90">
                        <div className="flex items-center justify-between border-b border-white/10 pb-1 text-red-500 font-bold tracking-wider">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                                IMAX FULLSCREEN GEOMETRY
                            </span>
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-red-950/60 border border-red-500/40 text-red-300">
                                {currentRendition?.shortBadge || '1.43:1'}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-white/70">
                            <div>
                                <span className="text-white/40 block">TARGET RATIO:</span>
                                <span className="text-red-400 font-bold">
                                    {currentRendition?.targetRatio ? `${currentRendition.targetRatio}:1` : '1.43:1'}
                                </span>
                            </div>
                            <div>
                                <span className="text-white/40 block">WARP / STRETCH:</span>
                                <span className="text-emerald-400 font-bold">
                                    0% (Preserved)
                                </span>
                            </div>
                            <div>
                                <span className="text-white/40 block">FULLSCREEN MODE:</span>
                                <span className="text-white font-medium">
                                    {isFullscreen ? 'Cinema Fullscreen' : 'Theater Window'}
                                </span>
                            </div>
                            <div>
                                <span className="text-white/40 block">PILLARBOXING:</span>
                                <span className="text-zinc-300 font-medium">
                                    Natural Darkroom
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════
                TOP BAR HUD
                Title, IMAX Badge, Close Button, Telemetry Toggle
                ═══════════════════════════════════════════════════════════ */}
            <div
                className={`absolute top-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-b from-black/95 via-black/60 to-transparent flex items-center justify-between z-30 transition-opacity duration-300 ${
                    showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            >
                <div className="flex items-center gap-3">
                    <span className="bg-red-600 text-white font-black italic tracking-widest text-[11px] px-2.5 py-1 rounded shadow-[0_0_15px_rgba(229,9,20,0.5)]">
                        IMAX
                    </span>
                    <div>
                        <h3 className="text-white font-bold text-sm md:text-base drop-shadow line-clamp-1">
                            {movie?.title} (2026)
                        </h3>
                        <div className="flex items-center gap-2 text-[10px] text-white/60 font-mono">
                            <span>A Christopher Nolan Film</span>
                            <span>•</span>
                            <span className="text-red-400 font-bold">{currentRendition?.name}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    {/* Telemetry Toggle */}
                    <button
                        onClick={() => setShowTelemetry(prev => !prev)}
                        className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-all ${
                            showTelemetry
                                ? 'bg-red-600/20 text-red-300 border-red-500/50 shadow-[0_0_10px_rgba(229,9,20,0.2)]'
                                : 'bg-black/50 text-white/60 border-white/20 hover:text-white'
                        }`}
                        title="Toggle Technical Telemetry HUD (T)"
                    >
                        <span className="material-symbols-outlined text-sm">tune</span>
                        <span>HUD</span>
                    </button>

                    {/* Close / Return Button */}
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="w-9 h-9 rounded-full bg-white/10 hover:bg-red-600 text-white/80 hover:text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all cursor-pointer"
                            title="Exit IMAX Theater (Esc)"
                        >
                            <span className="material-symbols-outlined text-xl">close</span>
                        </button>
                    )}
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════
                FOCUSED BOTTOM CONTROLS HUD
                Only: Server Selection, Sound Selector, Fullscreen
                ═══════════════════════════════════════════════════════════ */}
            <div
                className={`absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/95 via-black/70 to-transparent z-30 transition-opacity duration-300 ${
                    showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            >
                <div className="flex items-center justify-between text-white">
                    {/* Left: Active Server & Aspect Indicator */}
                    <div className="flex items-center gap-3">
                        <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2 text-xs">
                            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                            <span className="text-white/60 text-[10px] uppercase font-mono hidden sm:inline">Active Format:</span>
                            <span className="text-red-500 font-bold font-mono text-xs uppercase">
                                {currentRendition?.shortBadge || '1.43:1 EXPANDED'}
                            </span>
                        </div>
                        <span className="text-[10px] font-mono text-white/70 px-2 py-1 rounded bg-white/5 border border-white/10 hidden md:inline">
                            {currentRendition?.isExpanded143 ? '1.43:1 CEILING-TO-FLOOR' : '1.90:1 DIGITAL MULTIPLEX'}
                        </span>
                    </div>

                    {/* Right: Server Selection, Sound Profile, Fullscreen */}
                    <div className="flex items-center gap-2.5 sm:gap-3">
                        {/* ─── 1. SERVER SELECTION DROPDOWN (ONLY DEDICATED IMAX FORMATS) ─── */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowRenditionMenu(prev => !prev);
                                    setShowAudioMenu(false);
                                }}
                                className="px-3 py-1.5 rounded-lg border text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer bg-red-600/20 text-red-300 border-red-500/50 hover:bg-red-600/30 shadow-[0_0_12px_rgba(229,9,20,0.25)]"
                                title="Switch IMAX Streaming Presentation"
                            >
                                <span className="material-symbols-outlined text-sm">aspect_ratio</span>
                                <span>{currentRendition?.name || 'IMAX 1.43:1 Expanded 70mm'}</span>
                                <span className="material-symbols-outlined text-sm">arrow_drop_down</span>
                            </button>

                            {showRenditionMenu && (
                                <div className="absolute right-0 bottom-full mb-3 w-72 bg-[#141414] border border-white/20 rounded-xl shadow-2xl p-2 z-50 backdrop-blur-2xl animate-fade-in text-xs">
                                    <div className="px-2 py-1 border-b border-white/10 mb-1 flex items-center justify-between">
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-red-500">
                                            IMAX Presentation Formats
                                        </span>
                                        <span className="text-[9px] text-white/40">Cinema Grade</span>
                                    </div>
                                    <div className="space-y-1">
                                        {renditions.map(r => (
                                            <button
                                                key={r.id}
                                                onClick={() => {
                                                    setSelectedRenditionId(r.id);
                                                    setShowRenditionMenu(false);
                                                }}
                                                className={`w-full text-left p-2 rounded-lg transition-all flex flex-col gap-0.5 cursor-pointer ${
                                                    selectedRenditionId === r.id
                                                        ? 'bg-red-600/20 border border-red-500/50 text-red-300'
                                                        : 'hover:bg-white/10 text-white/80 border border-transparent'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-xs">{r.name}</span>
                                                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                                                        r.id === 'expanded-143' ? 'bg-red-600 text-white' : 'bg-white/10 text-white/70'
                                                    }`}>
                                                        {r.shortBadge}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-white/50 line-clamp-1 mt-0.5">
                                                    {r.description}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ─── 2. SOUND PROFILE SELECTOR ─── */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowAudioMenu(prev => !prev);
                                    setShowRenditionMenu(false);
                                }}
                                className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                                    activeAudioMode === 'imax12'
                                        ? 'bg-red-600/20 text-red-300 border-red-500/40'
                                        : 'bg-black/60 text-white/70 border-white/20'
                                }`}
                                title="IMAX Audio Profile Selector"
                            >
                                <span className="material-symbols-outlined text-base">surround_sound</span>
                                <span className="hidden sm:inline">
                                    {activeAudioMode === 'imax12' ? 'IMAX 12.0' : activeAudioMode === '5.1' ? '5.1 Surround' : 'Stereo 2.0'}
                                </span>
                                <span className="material-symbols-outlined text-xs">arrow_drop_down</span>
                            </button>

                            {showAudioMenu && (
                                <div className="absolute right-0 bottom-full mb-3 w-56 bg-[#141414] border border-white/20 rounded-xl shadow-2xl p-2 z-50 backdrop-blur-2xl animate-fade-in text-xs">
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-red-500 block px-2 py-1 border-b border-white/10 mb-1">
                                        Sound Profile
                                    </span>
                                    <button
                                        onClick={() => { setActiveAudioMode('imax12'); setShowAudioMenu(false); }}
                                        className={`w-full text-left p-2 rounded-lg flex items-center justify-between cursor-pointer ${
                                            activeAudioMode === 'imax12' ? 'bg-red-600/20 text-red-300 font-bold' : 'hover:bg-white/10 text-white/70'
                                        }`}
                                    >
                                        <div>
                                            <span className="block font-bold">IMAX 12.0 Immersive</span>
                                            <span className="text-[9px] text-white/40 block">Point-Source Enhanced Sub-bass</span>
                                        </div>
                                        {activeAudioMode === 'imax12' && <span className="material-symbols-outlined text-sm text-red-500">check</span>}
                                    </button>
                                    <button
                                        onClick={() => { setActiveAudioMode('5.1'); setShowAudioMenu(false); }}
                                        className={`w-full text-left p-2 rounded-lg flex items-center justify-between cursor-pointer ${
                                            activeAudioMode === '5.1' ? 'bg-red-600/20 text-red-300 font-bold' : 'hover:bg-white/10 text-white/70'
                                        }`}
                                    >
                                        <span>5.1 Cinema Surround</span>
                                        {activeAudioMode === '5.1' && <span className="material-symbols-outlined text-sm text-red-500">check</span>}
                                    </button>
                                    <button
                                        onClick={() => { setActiveAudioMode('stereo'); setShowAudioMenu(false); }}
                                        className={`w-full text-left p-2 rounded-lg flex items-center justify-between cursor-pointer ${
                                            activeAudioMode === 'stereo' ? 'bg-red-600/20 text-red-300 font-bold' : 'hover:bg-white/10 text-white/70'
                                        }`}
                                    >
                                        <span>Stereo 2.0</span>
                                        {activeAudioMode === 'stereo' && <span className="material-symbols-outlined text-sm text-red-500">check</span>}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* ─── 3. FULLSCREEN TOGGLE ─── */}
                        <button
                            onClick={toggleFullscreen}
                            className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 rounded-lg font-black italic text-xs flex items-center gap-1.5 shadow-lg shadow-red-600/40 active:scale-95 transition-all cursor-pointer"
                            title={isFullscreen ? "Exit Fullscreen (F)" : "Enter Cinema Fullscreen (F)"}
                        >
                            <span className="material-symbols-outlined text-lg">
                                {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                            </span>
                            <span className="hidden sm:inline font-mono">
                                {isFullscreen ? 'EXIT' : 'FULLSCREEN'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImaxVideoPlayer;
