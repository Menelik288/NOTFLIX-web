import React, { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { AdService } from '../services/adService';

export const HlsVideoPlayer = ({
    streamData,
    animeTitle,
    episodeNumber,
    onNextEpisode,
    onPrevEpisode,
    hasNextEpisode,
    hasPrevEpisode,
    servers,
    currentServer,
    onServerChange,
    audioMode = 'sub',
    onAudioModeChange,
    onErrorFallback
}) => {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const hlsRef = useRef(null);
    const progressRef = useRef(null);

    // Playback state
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.85);
    const [isMuted, setIsMuted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [playbackError, setPlaybackError] = useState(null);

    // Controls state
    const [showControls, setShowControls] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const controlsTimeoutRef = useRef(null);

    // Quality levels
    const [qualities, setQualities] = useState([]);
    const [currentQuality, setCurrentQuality] = useState(-1); // -1 = Auto
    const [showQualityMenu, setShowQualityMenu] = useState(false);

    // Subtitles
    const [subtitles, setSubtitles] = useState([]);
    const [currentSubtitle, setCurrentSubtitle] = useState('en'); // Default to 'en' or first track
    const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);

    // Servers / Settings
    const [showServerMenu, setShowServerMenu] = useState(false);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);

    // Skip Intro / Outro
    const [showSkipIntro, setShowSkipIntro] = useState(false);
    const [showSkipOutro, setShowSkipOutro] = useState(false);

    const streamUrl = streamData?.sources?.[0]?.url;

    // Reset and initialize player when streamUrl changes
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (!streamUrl) {
            if (streamData) {
                setIsLoading(false);
                setPlaybackError('Stream is resolving or unavailable on this server. Please try switching servers below.');
            }
            return;
        }

        setIsLoading(true);
        setPlaybackError(null);
        setCurrentTime(0);
        setDuration(0);

        // Destroy previous HLS instance
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        // Subtitles from streamData
        const rawTracks = streamData.subtitles || [];
        setSubtitles(rawTracks);

        if (Hls.isSupported()) {
            const hls = new Hls({
                capLevelToPlayerSize: true,
                autoStartLoad: true,
                debug: false
            });
            hlsRef.current = hls;

            hls.loadSource(streamUrl);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
                setIsLoading(false);
                const levels = data.levels.map((lvl, index) => ({
                    index,
                    height: lvl.height || `${lvl.bitrate / 1000}k`,
                    label: lvl.height ? `${lvl.height}p` : `Level ${index}`
                }));
                setQualities(levels);
                video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
            });

            hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
                setCurrentQuality(data.level);
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                console.warn('[HlsPlayer] HLS error:', data);
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.warn('[HlsPlayer] Fatal network error, recovering...');
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.warn('[HlsPlayer] Fatal media error, recovering...');
                            hls.recoverMediaError();
                            break;
                        default:
                            hls.destroy();
                            setPlaybackError('Stream failed to load on this server. Please try switching servers.');
                            if (onErrorFallback) onErrorFallback();
                            break;
                    }
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Native Safari HLS
            video.src = streamUrl;
            video.addEventListener('loadedmetadata', () => {
                setIsLoading(false);
                video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
            });
            video.addEventListener('error', () => {
                setPlaybackError('Stream could not be played. Please try switching servers.');
            });
        } else {
            setPlaybackError('Your browser does not support HLS video streaming.');
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }, [streamUrl]);

    // Track active subtitle and apply to textTracks
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        Array.from(video.textTracks || []).forEach(track => {
            if (!currentSubtitle) {
                track.mode = 'disabled';
            } else {
                track.mode = (track.language === currentSubtitle || track.label?.toLowerCase().includes(currentSubtitle))
                    ? 'showing'
                    : 'disabled';
            }
        });
    }, [currentSubtitle, subtitles]);

    // Fullscreen event listener
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isFs = !!(
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.mozFullScreenElement ||
                document.msFullscreenElement
            );
            setIsFullscreen(isFs);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        };
    }, []);

    // Keyboard shortcuts
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
                case 'arrowright':
                    e.preventDefault();
                    seekRelative(10);
                    break;
                case 'arrowleft':
                    e.preventDefault();
                    seekRelative(-10);
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying, isMuted, duration]);

    // Activity tracker for showing/hiding controls HUD
    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) setShowControls(false);
        }, 3500);
    };

    // Playback control helpers
    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) return;
        if (isPlaying) {
            video.pause();
            setIsPlaying(false);
        } else {
            video.play().then(() => setIsPlaying(true)).catch(console.error);
        }
    };

    const handleTimeUpdate = () => {
        const video = videoRef.current;
        if (!video) return;
        const cur = video.currentTime;
        setCurrentTime(cur);

        // Check intro/outro timestamps
        const intro = streamData?.intro;
        if (intro && intro.end > 0 && cur >= intro.start && cur < intro.end) {
            setShowSkipIntro(true);
        } else {
            setShowSkipIntro(false);
        }

        const outro = streamData?.outro;
        if (outro && outro.end > 0 && cur >= outro.start && cur < outro.end) {
            setShowSkipOutro(true);
        } else {
            setShowSkipOutro(false);
        }
    };

    const handleLoadedMetadata = () => {
        const video = videoRef.current;
        if (video) setDuration(video.duration || 0);
    };

    const handleEnded = () => {
        setIsPlaying(false);
        if (hasNextEpisode && onNextEpisode) {
            onNextEpisode();
        }
    };

    const seekRelative = (seconds) => {
        const video = videoRef.current;
        if (!video) return;
        video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
    };

    const handleProgressBarClick = (e) => {
        const video = videoRef.current;
        const bar = progressRef.current;
        if (!video || !bar || !duration) return;

        const rect = bar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const pct = Math.max(0, Math.min(1, clickX / rect.width));
        const newTime = pct * duration;
        video.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const handleVolumeChange = (e) => {
        const val = parseFloat(e.target.value);
        setVolume(val);
        setIsMuted(val === 0);
        if (videoRef.current) {
            videoRef.current.volume = val;
            videoRef.current.muted = val === 0;
        }
    };

    const toggleMute = () => {
        const next = !isMuted;
        setIsMuted(next);
        if (videoRef.current) {
            videoRef.current.muted = next;
            videoRef.current.volume = next ? 0 : volume;
        }
    };

    const setQuality = (levelIndex) => {
        setCurrentQuality(levelIndex);
        if (hlsRef.current) {
            hlsRef.current.currentLevel = levelIndex;
        }
        setShowQualityMenu(false);
    };

    const setSpeed = (speed) => {
        setPlaybackSpeed(speed);
        if (videoRef.current) {
            videoRef.current.playbackRate = speed;
        }
        setShowSpeedMenu(false);
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
        const mins = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${mins}:${s < 10 ? '0' : ''}${s}`;
    };

    const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
            className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl select-none group border border-white/10"
        >
            {/* HTML5 Video Element */}
            <video
                ref={videoRef}
                className="w-full h-full object-contain cursor-pointer"
                onClick={togglePlay}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
                crossOrigin="anonymous"
                playsInline
            >
                {subtitles.map((track, i) => (
                    <track
                        key={i}
                        src={track.file}
                        kind="captions"
                        label={track.label}
                        srcLang={track.label?.substring(0, 2)?.toLowerCase() || 'en'}
                        default={track.default}
                    />
                ))}
            </video>

            {/* Loading Spinner */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-30 pointer-events-none">
                    <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-red-600 animate-spin"></div>
                </div>
            )}

            {/* Error Message HUD */}
            {playbackError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md z-40 p-6 text-center">
                    <span className="material-symbols-outlined text-5xl text-red-500 mb-3">error_outline</span>
                    <h3 className="text-xl font-bold text-white mb-2">Stream Playback Error</h3>
                    <p className="text-white/60 text-sm max-w-md mb-6">{playbackError}</p>
                    <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                        <button
                            onClick={() => {
                                setPlaybackError(null);
                                if (onServerChange) onServerChange('embed-vidlink');
                            }}
                            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-lg shadow-red-600/30 border border-red-500 flex items-center gap-1.5 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-sm">play_circle</span>
                            Switch to VidLink (Default)
                        </button>
                        {(servers?.sub || [
                            { id: 'HD-1', name: 'HD-1 (MegaCloud)' },
                            { id: 'HD-2', name: 'HD-2 (MegaPlay)' }
                        ]).filter(srv => srv.id !== 'embed-vidlink').map(srv => (
                            <button
                                key={srv.id || srv.name}
                                onClick={() => {
                                    setPlaybackError(null);
                                    if (onServerChange) onServerChange(srv.id || srv.name);
                                }}
                                className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors border border-white/20 cursor-pointer"
                            >
                                Switch to {srv.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Skip Intro Button */}
            {showSkipIntro && (
                <button
                    onClick={() => {
                        if (videoRef.current && streamData?.intro?.end) {
                            videoRef.current.currentTime = streamData.intro.end;
                            setShowSkipIntro(false);
                        }
                    }}
                    className="absolute bottom-24 left-6 z-40 px-4 py-2 rounded-lg bg-black/80 hover:bg-red-600 text-white font-bold text-xs border border-white/20 backdrop-blur-md shadow-2xl flex items-center gap-1.5 transition-all animate-bounce"
                >
                    <span className="material-symbols-outlined text-sm">fast_forward</span>
                    <span>Skip Intro</span>
                </button>
            )}

            {/* Skip Outro Button */}
            {showSkipOutro && (
                <button
                    onClick={() => {
                        if (videoRef.current && streamData?.outro?.end) {
                            videoRef.current.currentTime = streamData.outro.end;
                            setShowSkipOutro(false);
                        }
                    }}
                    className="absolute bottom-24 right-6 z-40 px-4 py-2 rounded-lg bg-black/80 hover:bg-red-600 text-white font-bold text-xs border border-white/20 backdrop-blur-md shadow-2xl flex items-center gap-1.5 transition-all"
                >
                    <span className="material-symbols-outlined text-sm">fast_forward</span>
                    <span>Skip Outro</span>
                </button>
            )}

            {/* Top Bar HUD (Title, Episode, Sub/Dub Switcher, Servers) */}
            <div
                className={`absolute top-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between z-30 transition-opacity duration-300 ${
                    showControls || !isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            >
                <div className="flex items-center gap-3">
                    <span className="bg-red-600 text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
                        HLS STREAM
                    </span>
                    <h3 className="text-white font-bold text-sm md:text-base line-clamp-1 drop-shadow">
                        {animeTitle} {episodeNumber ? `• Episode ${episodeNumber}` : ''}
                    </h3>
                </div>

                <div className="flex items-center gap-2">
                    {/* SUB / DUB Toggle */}
                    <div className="flex rounded-lg bg-black/50 border border-white/20 p-0.5">
                        <button
                            onClick={() => onAudioModeChange && onAudioModeChange('sub')}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                                audioMode === 'sub' ? 'bg-red-600 text-white' : 'text-white/60 hover:text-white'
                            }`}
                        >
                            SUB
                        </button>
                        <button
                            onClick={() => onAudioModeChange && onAudioModeChange('dub')}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                                audioMode === 'dub' ? 'bg-red-600 text-white' : 'text-white/60 hover:text-white'
                            }`}
                        >
                            DUB
                        </button>
                    </div>

                    {/* Server Selection Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowServerMenu(!showServerMenu)}
                            className="px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                        >
                            <span className="material-symbols-outlined text-xs text-amber-400">dns</span>
                            <span>{currentServer || 'HD-1'}</span>
                            <span className="material-symbols-outlined text-xs">arrow_drop_down</span>
                        </button>

                        {showServerMenu && (
                            <div className="absolute right-0 top-full mt-2 w-44 bg-surface border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 flex flex-col gap-1 text-xs backdrop-blur-xl animate-fade-in">
                                <span className="text-[10px] text-white/40 px-2 py-1 uppercase font-bold">Available Servers</span>
                                {(servers?.[audioMode] || servers?.sub || [
                                    { name: 'HD-1 (HLS)' },
                                    { name: 'HD-2 (MegaCloud)' },
                                    { name: 'HD-4 (Ultra)' }
                                ]).map(s => (
                                    <button
                                        key={s.name}
                                        onClick={() => {
                                            onServerChange(s.name);
                                            setShowServerMenu(false);
                                        }}
                                        className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                                            currentServer === s.name ? 'bg-red-600/20 text-red-400 font-bold' : 'hover:bg-white/10 text-white/80'
                                        }`}
                                    >
                                        <span>{s.name}</span>
                                        {currentServer === s.name && (
                                            <span className="material-symbols-outlined text-xs text-red-500">check</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Controls HUD */}
            <div
                className={`absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-30 transition-opacity duration-300 ${
                    showControls || !isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            >
                {/* Timeline scrubber bar */}
                <div
                    ref={progressRef}
                    onClick={handleProgressBarClick}
                    className="w-full h-1.5 hover:h-2.5 bg-white/20 rounded-full mb-3 md:mb-4 cursor-pointer relative group/bar transition-all"
                >
                    <div
                        className="h-full bg-red-600 rounded-full relative"
                        style={{ width: `${progressPct}%` }}
                    >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md scale-0 group-hover/bar:scale-100 transition-transform"></div>
                    </div>
                </div>

                {/* Controls Row */}
                <div className="flex items-center justify-between">
                    {/* Left: Play/Pause, Next, Prev, Volume, Time */}
                    <div className="flex items-center gap-2 md:gap-4">
                        {/* Prev Episode */}
                        <button
                            onClick={onPrevEpisode}
                            disabled={!hasPrevEpisode}
                            className={`p-1 text-white hover:text-red-400 transition-colors ${
                                !hasPrevEpisode ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                            title="Previous Episode"
                        >
                            <span className="material-symbols-outlined text-xl md:text-2xl">skip_previous</span>
                        </button>

                        {/* Play / Pause */}
                        <button
                            onClick={togglePlay}
                            className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-2xl md:text-3xl fill" style={{ fontVariationSettings: "'FILL' 1" }}>
                                {isPlaying ? 'pause' : 'play_arrow'}
                            </span>
                        </button>

                        {/* Next Episode */}
                        <button
                            onClick={onNextEpisode}
                            disabled={!hasNextEpisode}
                            className={`p-1 text-white hover:text-red-400 transition-colors ${
                                !hasNextEpisode ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                            title="Next Episode"
                        >
                            <span className="material-symbols-outlined text-xl md:text-2xl">skip_next</span>
                        </button>

                        {/* Volume */}
                        <div className="hidden sm:flex items-center gap-1.5 group/vol">
                            <button onClick={toggleMute} className="text-white hover:text-red-400 p-1">
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
                                onChange={handleVolumeChange}
                                className="w-16 md:w-20 h-1 accent-red-600 bg-white/30 rounded-full cursor-pointer"
                            />
                        </div>

                        {/* Time display */}
                        <span className="text-[11px] md:text-xs font-mono text-white/70 ml-1">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    {/* Right: Subtitles, Speed, Quality, Fullscreen */}
                    <div className="flex items-center gap-2 md:gap-3">
                        {/* Subtitles Menu */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowSubtitleMenu(!showSubtitleMenu);
                                    setShowQualityMenu(false);
                                    setShowSpeedMenu(false);
                                }}
                                className={`p-1.5 rounded-lg border transition-all ${
                                    currentSubtitle
                                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                                        : 'text-white/70 hover:text-white border-transparent'
                                }`}
                                title="Subtitles (CC)"
                            >
                                <span className="material-symbols-outlined text-xl">subtitles</span>
                            </button>

                            {showSubtitleMenu && (
                                <div className="absolute right-0 bottom-full mb-3 w-40 bg-surface border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 flex flex-col gap-1 text-xs backdrop-blur-xl animate-fade-in">
                                    <span className="text-[10px] text-white/40 px-2 py-1 uppercase font-bold">Subtitles</span>
                                    <button
                                        onClick={() => {
                                            setCurrentSubtitle(null);
                                            setShowSubtitleMenu(false);
                                        }}
                                        className={`w-full text-left px-2.5 py-1.5 rounded-lg ${
                                            currentSubtitle === null ? 'bg-red-600/20 text-red-400 font-bold' : 'hover:bg-white/10 text-white/80'
                                        }`}
                                    >
                                        Off
                                    </button>
                                    {subtitles.map((track, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                setCurrentSubtitle(track.label?.substring(0, 2)?.toLowerCase() || 'en');
                                                setShowSubtitleMenu(false);
                                            }}
                                            className={`w-full text-left px-2.5 py-1.5 rounded-lg ${
                                                currentSubtitle === (track.label?.substring(0, 2)?.toLowerCase() || 'en')
                                                    ? 'bg-red-600/20 text-red-400 font-bold'
                                                    : 'hover:bg-white/10 text-white/80'
                                            }`}
                                        >
                                            {track.label || `Track ${i + 1}`}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Quality Selector */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowQualityMenu(!showQualityMenu);
                                    setShowSubtitleMenu(false);
                                    setShowSpeedMenu(false);
                                }}
                                className="px-2 py-1 rounded border border-white/20 text-white hover:border-white text-[11px] font-bold transition-all"
                                title="Stream Quality"
                            >
                                {currentQuality === -1 ? 'AUTO' : qualities[currentQuality]?.label || 'AUTO'}
                            </button>

                            {showQualityMenu && (
                                <div className="absolute right-0 bottom-full mb-3 w-36 bg-surface border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 flex flex-col gap-1 text-xs backdrop-blur-xl animate-fade-in">
                                    <span className="text-[10px] text-white/40 px-2 py-1 uppercase font-bold">Quality</span>
                                    <button
                                        onClick={() => setQuality(-1)}
                                        className={`w-full text-left px-2.5 py-1.5 rounded-lg ${
                                            currentQuality === -1 ? 'bg-red-600/20 text-red-400 font-bold' : 'hover:bg-white/10 text-white/80'
                                        }`}
                                    >
                                        Auto (Dynamic)
                                    </button>
                                    {qualities.map(q => (
                                        <button
                                            key={q.index}
                                            onClick={() => setQuality(q.index)}
                                            className={`w-full text-left px-2.5 py-1.5 rounded-lg ${
                                                currentQuality === q.index ? 'bg-red-600/20 text-red-400 font-bold' : 'hover:bg-white/10 text-white/80'
                                            }`}
                                        >
                                            {q.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Speed Selector */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowSpeedMenu(!showSpeedMenu);
                                    setShowQualityMenu(false);
                                    setShowSubtitleMenu(false);
                                }}
                                className="text-white/70 hover:text-white p-1 text-xs font-bold font-mono"
                                title="Playback Speed"
                            >
                                {playbackSpeed}x
                            </button>

                            {showSpeedMenu && (
                                <div className="absolute right-0 bottom-full mb-3 w-28 bg-surface border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 flex flex-col gap-1 text-xs backdrop-blur-xl animate-fade-in">
                                    <span className="text-[10px] text-white/40 px-2 py-1 uppercase font-bold">Speed</span>
                                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setSpeed(s)}
                                            className={`w-full text-left px-2.5 py-1 rounded-lg ${
                                                playbackSpeed === s ? 'bg-red-600/20 text-red-400 font-bold' : 'hover:bg-white/10 text-white/80'
                                            }`}
                                        >
                                            {s}x
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Fullscreen */}
                        <button
                            onClick={toggleFullscreen}
                            className="text-white hover:text-red-400 p-1.5 transition-colors cursor-pointer"
                            title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
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

export default HlsVideoPlayer;
