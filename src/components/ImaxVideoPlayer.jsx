import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AdService } from '../services/adService';

/**
 * ImaxVideoPlayer
 * Dedicated cinematic player for IMAX large-format presentations.
 * 
 * CRITICAL REQUIREMENTS IMPLEMENTED:
 * 1. Native source aspect-ratio preservation (Never stretches or crops).
 * 2. Dynamic aspect ratio detection: measures actual `videoWidth` and `videoHeight`
 *    and detects 1.43:1 Expanded, 1.90:1 Digital, 16:9, or 2.39:1 Scope in real time.
 * 3. True pillarboxing: On standard widescreen displays, 1.43:1 and 1.90:1 sources
 *    scale to max height with pitch-black cinema pillarboxes, preserving 100% of the
 *    original vertical picture area.
 * 4. Technical telemetry HUD: Displays exact resolution, detected ratio, frame geometry,
 *    and source integrity readout.
 * 5. Full keyboard controls: Space (Play/Pause), F (Fullscreen), M (Mute), Arrows (Seek/Volume).
 * 6. Distraction-free playback with auto-hiding controls HUD.
 */
export const ImaxVideoPlayer = ({
    movie,
    initialRenditionId = 'expanded-143',
    onClose,
    embedded = false
}) => {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const progressRef = useRef(null);
    const controlsTimeoutRef = useRef(null);

    // Active Rendition
    const renditions = movie?.renditions || [];
    const [selectedRenditionId, setSelectedRenditionId] = useState(
        initialRenditionId || renditions[0]?.id || 'expanded-143'
    );
    const currentRendition = renditions.find(r => r.id === selectedRenditionId) || renditions[0];

    // Playback State
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.9);
    const [isMuted, setIsMuted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [playbackError, setPlaybackError] = useState(null);

    // Controls & UI State
    const [showControls, setShowControls] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showTelemetry, setShowTelemetry] = useState(true);
    const [showRenditionMenu, setShowRenditionMenu] = useState(false);
    const [showAudioMenu, setShowAudioMenu] = useState(false);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    const [showSubtitlesMenu, setShowSubtitlesMenu] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [activeAudioMode, setActiveAudioMode] = useState('imax12'); // 'imax12' | '5.1' | 'stereo'
    const [activeSubtitle, setActiveSubtitle] = useState('en');

    // Real-Time Video Source Geometry & Telemetry
    const [sourceDimensions, setSourceDimensions] = useState({ width: 0, height: 0 });
    const [detectedRatio, setDetectedRatio] = useState(null);
    const [aspectFormatName, setAspectFormatName] = useState('Detecting...');
    const [bufferProgress, setBufferProgress] = useState(0);

    // ─── Reset and Load Video when Rendition Changes ───
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        setIsLoading(true);
        setPlaybackError(null);
        setCurrentTime(0);
        setSourceDimensions({ width: 0, height: 0 });
        setDetectedRatio(null);
        setAspectFormatName('Analyzing source...');

        video.load();
        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }
    }, [selectedRenditionId]);

    // ─── Inspect Source Dimensions on Metadata Load ───
    const handleLoadedMetadata = () => {
        const video = videoRef.current;
        if (!video) return;

        setIsLoading(false);
        setDuration(video.duration || 0);

        const w = video.videoWidth || 0;
        const h = video.videoHeight || 1;
        setSourceDimensions({ width: w, height: h });

        const ratio = w / h;
        setDetectedRatio(ratio);

        // Classify Aspect Ratio
        if (Math.abs(ratio - 1.43) < 0.08) {
            setAspectFormatName('IMAX 1.43:1 Expanded Film (70mm Native)');
        } else if (Math.abs(ratio - 1.90) < 0.08) {
            setAspectFormatName('IMAX 1.90:1 Digital Large Format');
        } else if (Math.abs(ratio - (16 / 9)) < 0.08) {
            setAspectFormatName('16:9 Standard High Definition');
        } else if (ratio > 2.2) {
            setAspectFormatName('2.39:1 Anamorphic Scope');
        } else {
            setAspectFormatName(`${ratio.toFixed(2)}:1 Custom Format`);
        }
    };

    // ─── Time & Buffer Tracking ───
    const handleTimeUpdate = () => {
        const video = videoRef.current;
        if (!video) return;
        setCurrentTime(video.currentTime);

        if (video.buffered && video.buffered.length > 0) {
            try {
                const bufferedEnd = video.buffered.end(video.buffered.length - 1);
                setBufferProgress((bufferedEnd / (video.duration || 1)) * 100);
            } catch (e) {
                // Ignore buffer calculation error
            }
        }
    };

    // ─── Auto-hiding Controls HUD ───
    const handleUserActivity = useCallback(() => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        if (isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
                setShowRenditionMenu(false);
                setShowAudioMenu(false);
                setShowSpeedMenu(false);
                setShowSubtitlesMenu(false);
            }, 3200);
        }
    }, [isPlaying]);

    useEffect(() => {
        if (!isPlaying) {
            setShowControls(true);
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        }
    }, [isPlaying]);

    // ─── Keyboard Shortcuts ───
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
            const video = videoRef.current;
            if (!video) return;

            switch (e.key.toLowerCase()) {
                case ' ':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'f':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case 'm':
                    e.preventDefault();
                    toggleMute();
                    break;
                case 't':
                    e.preventDefault();
                    setShowTelemetry(prev => !prev);
                    break;
                case 'arrowright':
                    e.preventDefault();
                    seekRelative(10);
                    break;
                case 'arrowleft':
                    e.preventDefault();
                    seekRelative(-10);
                    break;
                case 'arrowup':
                    e.preventDefault();
                    adjustVolume(0.05);
                    break;
                case 'arrowdown':
                    e.preventDefault();
                    adjustVolume(-0.05);
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
    }, [isPlaying, isMuted, volume, duration, isFullscreen]);

    // ─── Fullscreen Synchronization ───
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

    // ─── Playback Control Functions ───
    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) return;
        if (isPlaying) {
            video.pause();
            setIsPlaying(false);
        } else {
            video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }
        handleUserActivity();
    };

    const toggleMute = () => {
        const video = videoRef.current;
        if (!video) return;
        const nextMuted = !isMuted;
        setIsMuted(nextMuted);
        video.muted = nextMuted;
        if (nextMuted) {
            video.volume = 0;
        } else {
            video.volume = volume;
        }
        handleUserActivity();
    };

    const adjustVolume = (delta) => {
        const video = videoRef.current;
        if (!video) return;
        const newVol = Math.max(0, Math.min(1, volume + delta));
        setVolume(newVol);
        setIsMuted(newVol === 0);
        video.volume = newVol;
        video.muted = newVol === 0;
        handleUserActivity();
    };

    const handleVolumeSlider = (e) => {
        const val = parseFloat(e.target.value);
        setVolume(val);
        setIsMuted(val === 0);
        if (videoRef.current) {
            videoRef.current.volume = val;
            videoRef.current.muted = val === 0;
        }
    };

    const seekRelative = (seconds) => {
        const video = videoRef.current;
        if (!video || !duration) return;
        const target = Math.max(0, Math.min(duration, video.currentTime + seconds));
        video.currentTime = target;
        setCurrentTime(target);
        handleUserActivity();
    };

    const handleProgressClick = (e) => {
        const video = videoRef.current;
        const bar = progressRef.current;
        if (!video || !bar || !duration) return;

        const rect = bar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const pct = Math.max(0, Math.min(1, clickX / rect.width));
        const newTime = pct * duration;
        video.currentTime = newTime;
        setCurrentTime(newTime);
        handleUserActivity();
    };

    const setSpeed = (spd) => {
        setPlaybackSpeed(spd);
        if (videoRef.current) {
            videoRef.current.playbackRate = spd;
        }
        setShowSpeedMenu(false);
        handleUserActivity();
    };

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

    const formatTime = (secs) => {
        if (isNaN(secs) || secs < 0) return '0:00';
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = Math.floor(secs % 60);
        if (h > 0) {
            return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
        }
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div
            ref={containerRef}
            onMouseMove={handleUserActivity}
            onClick={handleUserActivity}
            className={`imax-cinema-player-root relative w-full bg-black select-none overflow-hidden transition-all duration-300 font-sans ${
                embedded 
                    ? 'rounded-2xl border border-cyan-500/30 shadow-[0_0_50px_rgba(0,229,255,0.15)] aspect-[1.43/1] max-h-[82vh]' 
                    : isFullscreen 
                        ? 'fixed inset-0 z-50 h-screen w-screen' 
                        : 'relative w-full h-[85vh] rounded-2xl border border-cyan-500/25 shadow-2xl'
            }`}
        >
            {/* ═══════════════════════════════════════════════════════════
                AUTHENTIC VIEWPORT: ASPECT-RATIO PRESERVATION CONTAINER
                Uses object-contain and flex centering to guarantee:
                - 1.43:1 renders with native vertical height and natural pillarboxing.
                - 1.90:1 renders with native digital proportions.
                - ZERO stretching, ZERO cropping, ZERO artificial warping.
                ═══════════════════════════════════════════════════════════ */}
            <div className="absolute inset-0 flex items-center justify-center bg-black">
                <video
                    ref={videoRef}
                    src={currentRendition?.url}
                    className="w-full h-full object-contain cursor-pointer transition-all duration-200"
                    onClick={togglePlay}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onWaiting={() => setIsLoading(true)}
                    onPlaying={() => setIsLoading(false)}
                    onError={() => {
                        setIsLoading(false);
                        setPlaybackError("Unable to stream video rendition. Please select an alternate format.");
                    }}
                    playsInline
                />
            </div>

            {/* Loading Indicator */}
            {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-30 pointer-events-none">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 border-t-[#00E5FF] animate-spin"></div>
                        <span className="font-black italic text-[11px] tracking-widest text-[#00E5FF]">IMAX</span>
                    </div>
                    <span className="mt-3 text-xs tracking-[0.2em] font-mono text-cyan-300/80 uppercase">
                        Buffering Master Stream
                    </span>
                </div>
            )}

            {/* Error HUD */}
            {playbackError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md z-40 p-6 text-center">
                    <span className="material-symbols-outlined text-5xl text-amber-400 mb-3">warning</span>
                    <h3 className="text-xl font-bold text-white mb-2">IMAX Stream Notice</h3>
                    <p className="text-white/60 text-sm max-w-md mb-6">{playbackError}</p>
                    <div className="flex gap-2">
                        {renditions.map(r => (
                            <button
                                key={r.id}
                                onClick={() => setSelectedRenditionId(r.id)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
                                    selectedRenditionId === r.id
                                        ? 'bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]'
                                        : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20'
                                }`}
                            >
                                {r.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════
                LIVE TECHNICAL TELEMETRY OVERLAY (HUD)
                Displays actual intrinsic hardware resolution & detected ratio
                ═══════════════════════════════════════════════════════════ */}
            {showTelemetry && (
                <div className="absolute top-20 left-6 z-30 pointer-events-none max-w-sm hidden sm:block animate-fade-in">
                    <div className="bg-black/75 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-3 shadow-2xl text-[11px] font-mono space-y-1.5 text-white/90">
                        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-1 text-cyan-400 font-bold tracking-wider">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse"></span>
                                IMAX REAL-TIME TELEMETRY
                            </span>
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40">
                                {currentRendition?.shortBadge || '1.43:1'}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-white/70">
                            <div>
                                <span className="text-white/40 block">SOURCE GEOMETRY:</span>
                                <span className="text-cyan-300 font-bold">
                                    {sourceDimensions.width > 0 
                                        ? `${sourceDimensions.width} × ${sourceDimensions.height} px` 
                                        : 'Reading stream...'}
                                </span>
                            </div>
                            <div>
                                <span className="text-white/40 block">DETECTED RATIO:</span>
                                <span className="text-[#00E5FF] font-bold">
                                    {detectedRatio ? `${detectedRatio.toFixed(3)}:1` : 'Calculating...'}
                                </span>
                            </div>
                            <div>
                                <span className="text-white/40 block">PRESENTATION:</span>
                                <span className="text-white font-medium truncate block">
                                    {aspectFormatName}
                                </span>
                            </div>
                            <div>
                                <span className="text-white/40 block">WARP / CROP:</span>
                                <span className="text-emerald-400 font-bold">
                                    0% (Native Contain)
                                </span>
                            </div>
                            <div>
                                <span className="text-white/40 block">AUDIO CHANNELS:</span>
                                <span className="text-white font-medium">
                                    {activeAudioMode === 'imax12' ? '12.0 Point-Source' : activeAudioMode === '5.1' ? '5.1 Surround' : '2.0 Stereo'}
                                </span>
                            </div>
                            <div>
                                <span className="text-white/40 block">PILLARBOXING:</span>
                                <span className="text-cyan-200 font-medium">
                                    {detectedRatio && detectedRatio < 1.77 ? 'Active (Darkroom)' : 'Standard'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════
                TOP BAR CONTROLS
                Title, IMAX Badge, Close Button, Telemetry Toggle
                ═══════════════════════════════════════════════════════════ */}
            <div
                className={`absolute top-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-center justify-between z-30 transition-opacity duration-300 ${
                    showControls || !isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            >
                <div className="flex items-center gap-3">
                    <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-black italic tracking-widest text-[11px] px-2.5 py-1 rounded shadow-[0_0_15px_rgba(0,229,255,0.4)]">
                        IMAX
                    </span>
                    <div>
                        <h3 className="text-white font-bold text-sm md:text-base drop-shadow line-clamp-1">
                            {movie?.title} (2026)
                        </h3>
                        <div className="flex items-center gap-2 text-[10px] text-cyan-300/80 font-mono">
                            <span>A Christopher Nolan Film</span>
                            <span>•</span>
                            <span className="uppercase">{movie?.imaxSpecs?.cameraSystems || '15/70mm Film'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    {/* Telemetry Toggle */}
                    <button
                        onClick={() => setShowTelemetry(prev => !prev)}
                        className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-all ${
                            showTelemetry
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_10px_rgba(0,229,255,0.2)]'
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
                BOTTOM CONTROLS BAR
                ═══════════════════════════════════════════════════════════ */}
            <div
                className={`absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/95 via-black/70 to-transparent z-30 transition-opacity duration-300 ${
                    showControls || !isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            >
                {/* Timeline Progress Scrubber */}
                <div
                    ref={progressRef}
                    onClick={handleProgressClick}
                    className="w-full h-1.5 hover:h-2.5 bg-white/20 rounded-full mb-3 md:mb-4 cursor-pointer relative group/timeline transition-all duration-150"
                >
                    {/* Buffer Bar */}
                    <div
                        className="h-full bg-white/30 rounded-full absolute left-0 top-0 transition-all"
                        style={{ width: `${bufferProgress}%` }}
                    />
                    {/* Played Progress Bar */}
                    <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-[#00E5FF] rounded-full relative transition-all shadow-[0_0_10px_rgba(0,229,255,0.6)]"
                        style={{ width: `${progressPct}%` }}
                    >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg scale-0 group-hover/timeline:scale-100 transition-transform"></div>
                    </div>
                </div>

                {/* Control Row */}
                <div className="flex items-center justify-between text-white">
                    {/* Left: Play/Pause, Skip, Volume, Time */}
                    <div className="flex items-center gap-3 md:gap-4">
                        {/* Play/Pause */}
                        <button
                            onClick={togglePlay}
                            className="w-10 h-10 rounded-full bg-[#00E5FF] text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,229,255,0.5)] cursor-pointer"
                            title={isPlaying ? "Pause (Space)" : "Play (Space)"}
                        >
                            <span className="material-symbols-outlined text-2xl fill" style={{ fontVariationSettings: "'FILL' 1" }}>
                                {isPlaying ? 'pause' : 'play_arrow'}
                            </span>
                        </button>

                        {/* Rewind 10s */}
                        <button
                            onClick={() => seekRelative(-10)}
                            className="text-white/70 hover:text-white p-1 transition-colors"
                            title="Rewind 10s (Left Arrow)"
                        >
                            <span className="material-symbols-outlined text-xl">replay_10</span>
                        </button>

                        {/* Forward 10s */}
                        <button
                            onClick={() => seekRelative(10)}
                            className="text-white/70 hover:text-white p-1 transition-colors"
                            title="Forward 10s (Right Arrow)"
                        >
                            <span className="material-symbols-outlined text-xl">forward_10</span>
                        </button>

                        {/* Volume Control */}
                        <div className="flex items-center gap-2 group/volume">
                            <button
                                onClick={toggleMute}
                                className="text-white/70 hover:text-white p-1 transition-colors"
                                title={isMuted ? "Unmute (M)" : "Mute (M)"}
                            >
                                <span className="material-symbols-outlined text-xl">
                                    {isMuted ? 'volume_off' : volume < 0.4 ? 'volume_down' : 'volume_up'}
                                </span>
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeSlider}
                                className="w-14 sm:w-20 h-1 accent-[#00E5FF] bg-white/20 rounded-full cursor-pointer transition-all"
                            />
                        </div>

                        {/* Time Display */}
                        <span className="text-[11px] md:text-xs font-mono text-white/70 whitespace-nowrap">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    {/* Right: Rendition Switcher, Audio Mode, Subtitles, Speed, Fullscreen */}
                    <div className="flex items-center gap-2 md:gap-3">
                        {/* ─── Rendition / Aspect Selector ─── */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowRenditionMenu(prev => !prev);
                                    setShowAudioMenu(false);
                                    setShowSpeedMenu(false);
                                    setShowSubtitlesMenu(false);
                                }}
                                className={`px-2.5 py-1 rounded-lg border text-xs font-bold font-mono flex items-center gap-1 transition-all ${
                                    currentRendition?.isExpanded143
                                        ? 'bg-cyan-500/20 text-[#00E5FF] border-[#00E5FF]/60 shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                                        : 'bg-black/60 text-white/80 border-white/20 hover:border-white'
                                }`}
                                title="Select IMAX Presentation Rendition"
                            >
                                <span className="material-symbols-outlined text-xs">aspect_ratio</span>
                                <span>{currentRendition?.shortBadge || '1.43:1'}</span>
                                <span className="material-symbols-outlined text-xs">arrow_drop_down</span>
                            </button>

                            {showRenditionMenu && (
                                <div className="absolute right-0 bottom-full mb-3 w-72 bg-neutral-950/95 border border-cyan-500/40 rounded-xl shadow-2xl p-2 z-50 backdrop-blur-2xl animate-fade-in text-xs">
                                    <div className="px-2 py-1 border-b border-white/10 mb-1 flex items-center justify-between">
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">
                                            IMAX Presentation Source
                                        </span>
                                        <span className="text-[9px] text-white/40">Select Format</span>
                                    </div>
                                    <div className="space-y-1">
                                        {renditions.map(r => (
                                            <button
                                                key={r.id}
                                                onClick={() => {
                                                    setSelectedRenditionId(r.id);
                                                    setShowRenditionMenu(false);
                                                }}
                                                className={`w-full text-left p-2 rounded-lg transition-all flex flex-col gap-0.5 ${
                                                    selectedRenditionId === r.id
                                                        ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'
                                                        : 'hover:bg-white/10 text-white/80 border border-transparent'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-xs">{r.name}</span>
                                                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                                                        r.isExpanded143 ? 'bg-cyan-400 text-black' : 'bg-white/10 text-white/70'
                                                    }`}>
                                                        {r.targetRatio}:1
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-white/50 line-clamp-2 mt-0.5">
                                                    {r.description}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ─── Audio Mode Switcher (12-Channel / 5.1 / Stereo) ─── */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowAudioMenu(prev => !prev);
                                    setShowRenditionMenu(false);
                                    setShowSpeedMenu(false);
                                    setShowSubtitlesMenu(false);
                                }}
                                className={`p-1.5 rounded-lg border text-xs font-mono transition-all ${
                                    activeAudioMode === 'imax12'
                                        ? 'bg-cyan-500/20 text-[#00E5FF] border-cyan-400/40'
                                        : 'text-white/70 hover:text-white border-transparent'
                                }`}
                                title="IMAX Immersive Sound Array"
                            >
                                <span className="material-symbols-outlined text-lg">surround_sound</span>
                            </button>

                            {showAudioMenu && (
                                <div className="absolute right-0 bottom-full mb-3 w-52 bg-neutral-950/95 border border-cyan-500/40 rounded-xl shadow-2xl p-2 z-50 backdrop-blur-2xl animate-fade-in text-xs">
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 block px-2 py-1 border-b border-white/10 mb-1">
                                        Audio Profile
                                    </span>
                                    <button
                                        onClick={() => { setActiveAudioMode('imax12'); setShowAudioMenu(false); }}
                                        className={`w-full text-left p-2 rounded-lg flex items-center justify-between ${
                                            activeAudioMode === 'imax12' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'hover:bg-white/10 text-white/70'
                                        }`}
                                    >
                                        <div>
                                            <span className="block">IMAX 12.0 Immersive</span>
                                            <span className="text-[9px] text-white/40 block">Custom Point-Source Sub-bass</span>
                                        </div>
                                        {activeAudioMode === 'imax12' && <span className="material-symbols-outlined text-sm text-[#00E5FF]">check</span>}
                                    </button>
                                    <button
                                        onClick={() => { setActiveAudioMode('5.1'); setShowAudioMenu(false); }}
                                        className={`w-full text-left p-2 rounded-lg flex items-center justify-between ${
                                            activeAudioMode === '5.1' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'hover:bg-white/10 text-white/70'
                                        }`}
                                    >
                                        <span>5.1 Cinema Surround</span>
                                        {activeAudioMode === '5.1' && <span className="material-symbols-outlined text-sm text-[#00E5FF]">check</span>}
                                    </button>
                                    <button
                                        onClick={() => { setActiveAudioMode('stereo'); setShowAudioMenu(false); }}
                                        className={`w-full text-left p-2 rounded-lg flex items-center justify-between ${
                                            activeAudioMode === 'stereo' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'hover:bg-white/10 text-white/70'
                                        }`}
                                    >
                                        <span>Stereo 2.0</span>
                                        {activeAudioMode === 'stereo' && <span className="material-symbols-outlined text-sm text-[#00E5FF]">check</span>}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* ─── Subtitles Menu ─── */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowSubtitlesMenu(prev => !prev);
                                    setShowRenditionMenu(false);
                                    setShowAudioMenu(false);
                                    setShowSpeedMenu(false);
                                }}
                                className={`p-1.5 rounded-lg border text-xs transition-all ${
                                    activeSubtitle
                                        ? 'bg-cyan-500/20 text-[#00E5FF] border-cyan-400/40'
                                        : 'text-white/70 hover:text-white border-transparent'
                                }`}
                                title="Subtitles (CC)"
                            >
                                <span className="material-symbols-outlined text-lg">subtitles</span>
                            </button>

                            {showSubtitlesMenu && (
                                <div className="absolute right-0 bottom-full mb-3 w-44 bg-neutral-950/95 border border-cyan-500/40 rounded-xl shadow-2xl p-2 z-50 backdrop-blur-2xl animate-fade-in text-xs">
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 block px-2 py-1 border-b border-white/10 mb-1">
                                        Subtitles
                                    </span>
                                    <button
                                        onClick={() => { setActiveSubtitle(null); setShowSubtitlesMenu(false); }}
                                        className={`w-full text-left px-2 py-1.5 rounded-lg ${
                                            activeSubtitle === null ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'hover:bg-white/10 text-white/70'
                                        }`}
                                    >
                                        Off
                                    </button>
                                    {(movie?.subtitles || [
                                        { label: "English [CC]", lang: "en" },
                                        { label: "Spanish (Español)", lang: "es" },
                                        { label: "French (Français)", lang: "fr" },
                                        { label: "Amharic (አማርኛ)", lang: "am" }
                                    ]).map(sub => (
                                        <button
                                            key={sub.lang}
                                            onClick={() => { setActiveSubtitle(sub.lang); setShowSubtitlesMenu(false); }}
                                            className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between ${
                                                activeSubtitle === sub.lang ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'hover:bg-white/10 text-white/70'
                                            }`}
                                        >
                                            <span>{sub.label}</span>
                                            {activeSubtitle === sub.lang && <span className="material-symbols-outlined text-xs text-[#00E5FF]">check</span>}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ─── Speed Selector ─── */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowSpeedMenu(prev => !prev);
                                    setShowRenditionMenu(false);
                                    setShowAudioMenu(false);
                                    setShowSubtitlesMenu(false);
                                }}
                                className="text-white/70 hover:text-white p-1 text-xs font-bold font-mono"
                                title="Playback Speed"
                            >
                                {playbackSpeed}x
                            </button>

                            {showSpeedMenu && (
                                <div className="absolute right-0 bottom-full mb-3 w-28 bg-neutral-950/95 border border-cyan-500/40 rounded-xl shadow-2xl p-1.5 z-50 backdrop-blur-2xl animate-fade-in text-xs">
                                    <span className="text-[10px] text-cyan-400 px-2 py-1 uppercase font-bold block border-b border-white/10 mb-1">
                                        Speed
                                    </span>
                                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setSpeed(s)}
                                            className={`w-full text-left px-2 py-1 rounded-lg ${
                                                playbackSpeed === s ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'hover:bg-white/10 text-white/80'
                                            }`}
                                        >
                                            {s}x
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ─── Fullscreen Toggle ─── */}
                        <button
                            onClick={toggleFullscreen}
                            className="text-white hover:text-[#00E5FF] p-1.5 transition-colors cursor-pointer"
                            title={isFullscreen ? "Exit Fullscreen (F)" : "Enter Cinema Fullscreen (F)"}
                        >
                            <span className="material-symbols-outlined text-2xl">
                                {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImaxVideoPlayer;

