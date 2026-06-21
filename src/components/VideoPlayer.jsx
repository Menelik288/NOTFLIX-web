import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

export const VideoPlayer = () => {
    const { 
        currentMedia, 
        closePlayer, 
        currentSource, 
        setCurrentSource, 
        saveProgress 
    } = useApp();

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [isMuted, setIsMuted] = useState(false);
    const [showSourceDropdown, setShowSourceDropdown] = useState(false);
    
    const videoRef = useRef(null);
    const progressRef = useRef(null);
    const dropdownRef = useRef(null);

    // Auto-play when media changes
    useEffect(() => {
        if (currentMedia) {
            setIsPlaying(true);
            setCurrentTime(0);
            setDuration(0);
        }
    }, [currentMedia]);

    // Handle clicks outside of dropdown menu
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowSourceDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Periodic progress saver for HTML5 Video
    useEffect(() => {
        if (!currentMedia || currentSource !== 'demo' || !videoRef.current) return;

        const interval = setInterval(() => {
            if (videoRef.current && !videoRef.current.paused) {
                const cur = videoRef.current.currentTime;
                const dur = videoRef.current.duration || 1;
                const pct = Math.floor((cur / dur) * 100);
                const rem = formatTime(dur - cur) + " remaining";
                saveProgress(currentMedia.id, pct, rem);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [currentMedia, currentSource]);

    if (!currentMedia) return null;

    // Source link formatting
    const getEmbedUrl = () => {
        // We use standard placeholder/mock IDs for iframe embed if not real imdb
        const mockImdbId = "tt0000000"; // Fallback placeholder
        if (currentSource === 'vidsrc') {
            return currentMedia.type === 'movie' 
                ? `https://vidsrc.to/embed/movie/${currentMedia.id}`
                : `https://vidsrc.to/embed/tv/${currentMedia.id}/1/1`;
        } else if (currentSource === 'superembed') {
            return `https://multiembed.to/get.php?video_id=${currentMedia.id}&tmdb=1`;
        }
        return '';
    };

    // Playback control functions (HTML5 video only)
    const togglePlay = () => {
        if (currentSource !== 'demo' || !videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play().catch(console.error);
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handleVolumeChange = (e) => {
        const vol = parseFloat(e.target.value);
        setVolume(vol);
        setIsMuted(vol === 0);
        if (videoRef.current) {
            videoRef.current.volume = vol;
            videoRef.current.muted = vol === 0;
        }
    };

    const toggleMute = () => {
        const nextMuted = !isMuted;
        setIsMuted(nextMuted);
        if (videoRef.current) {
            videoRef.current.muted = nextMuted;
            if (nextMuted) {
                videoRef.current.volume = 0;
            } else {
                videoRef.current.volume = volume;
            }
        }
    };

    const handleProgressBarClick = (e) => {
        if (currentSource !== 'demo' || !videoRef.current || !progressRef.current) return;
        const rect = progressRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const percentage = clickX / width;
        const seekTime = percentage * duration;
        videoRef.current.currentTime = seekTime;
        setCurrentTime(seekTime);
    };

    const toggleFullscreen = () => {
        const playerContainer = document.getElementById('player-video-viewport');
        if (playerContainer) {
            if (!document.fullscreenElement) {
                playerContainer.requestFullscreen().catch(err => {
                    console.error("Error attempting to enable full-screen:", err.message);
                });
            } else {
                document.exitFullscreen();
            }
        }
    };

    const handleClose = () => {
        // Save progress upon closing if in HTML5 mode
        if (currentSource === 'demo' && videoRef.current) {
            const cur = videoRef.current.currentTime;
            const dur = videoRef.current.duration || 1;
            const pct = Math.floor((cur / dur) * 100);
            const rem = formatTime(dur - cur) + " remaining";
            saveProgress(currentMedia.id, pct, rem);
        }
        closePlayer();
    };

    // Time formatting helper (e.g. 125 -> 2:05)
    const formatTime = (secs) => {
        if (isNaN(secs)) return '0:00';
        const mins = Math.floor(secs / 60);
        const remSecs = Math.floor(secs % 60);
        return `${mins}:${remSecs < 10 ? '0' : ''}${remSecs}`;
    };

    const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="video-player-overlay fixed inset-0 z-50 bg-black flex flex-col justify-center items-center animate-fade-in">
            {/* Close Button */}
            <button 
                onClick={handleClose}
                className="absolute top-6 right-6 text-white/60 hover:text-white glass-surface w-12 h-12 rounded-full flex items-center justify-center z-50 cursor-pointer border border-white/10"
            >
                <span className="material-symbols-outlined text-3xl">close</span>
            </button>

            {/* Video Viewport Wrapper */}
            <div id="player-video-viewport" className="w-full h-full relative flex items-center justify-center">
                {currentSource === 'demo' ? (
                    <video 
                        ref={videoRef}
                        src={currentMedia.trailer}
                        className="w-full h-full object-contain"
                        
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onClick={togglePlay}
                    />
                ) : (
                    <div className="w-full h-full bg-neutral-900 flex items-center justify-center relative">
                        <iframe 
                            src={getEmbedUrl()}
                            className="w-full h-full border-0"
                            allowFullScreen
                            allow="autoplay; encrypted-media"
                            title={currentMedia.title}
                        />
                        {/* Stream Disclaimer HUD */}
                        <div className="absolute top-6 left-6 pointer-events-none glass-surface px-4 py-2 rounded-lg border border-white/10 text-left text-xs bg-black/40">
                            <span className="text-white/60 block">Streaming Server:</span>
                            <span className="text-primary-container font-bold uppercase">{currentSource}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Controls HUD Panel */}
            <div 
                id="player-controls-hud" 
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 glass-surface px-6 md:px-8 py-3.5 rounded-full flex items-center gap-6 md:gap-8 shadow-2xl w-[92%] max-w-2xl justify-between border border-white/10"
            >
                {/* Play controls (For HTML5 demo mode) */}
                <div className="flex items-center gap-4 md:gap-6">
                    <button className="text-white hover:text-primary-container transition-colors cursor-pointer flex items-center">
                        <span className="material-symbols-outlined text-xl md:text-2xl">skip_previous</span>
                    </button>
                    
                    <button 
                        onClick={togglePlay}
                        disabled={currentSource !== 'demo'}
                        className={`text-white hover:text-primary-container transition-colors flex items-center ${currentSource !== 'demo' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        <span className="material-symbols-outlined text-3xl md:text-4xl fill" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {isPlaying && currentSource === 'demo' ? 'pause' : 'play_arrow'}
                        </span>
                    </button>
                    
                    <button className="text-white hover:text-primary-container transition-colors cursor-pointer flex items-center">
                        <span className="material-symbols-outlined text-xl md:text-2xl">skip_next</span>
                    </button>
                </div>
                
                {/* Progress Bar (For HTML5 demo mode) */}
                <div className="flex-grow mx-2 md:mx-4 relative group cursor-pointer flex items-center h-4">
                    <div 
                        ref={progressRef}
                        onClick={handleProgressBarClick}
                        className={`w-full h-1 bg-white/20 rounded-full transition-all group-hover:h-1.5 ${currentSource !== 'demo' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        <div 
                            className="h-full bg-primary-container rounded-full relative" 
                            style={{ width: `${currentSource === 'demo' ? progressPercentage : 100}%` }}
                        >
                            {currentSource === 'demo' && (
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            )}
                        </div>
                    </div>
                    <span className="text-[9px] font-semibold text-white/60 ml-3 whitespace-nowrap">
                        {currentSource === 'demo' 
                            ? `${formatTime(currentTime)} / ${formatTime(duration)}`
                            : 'iFrame Embed'
                        }
                    </span>
                </div>

                {/* Sound, Fullscreen, and Server Select */}
                <div className="flex items-center gap-4 md:gap-6" onClick={(e) => e.stopPropagation()}>
                    {/* Source Selector Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button 
                            onClick={() => setShowSourceDropdown(!showSourceDropdown)}
                            className="glass-surface px-3 py-1 rounded-md text-[10px] md:text-xs font-bold text-white flex items-center gap-1 border border-white/20 cursor-pointer hover:border-white/50"
                        >
                            <span>{currentSource === 'vidsrc' ? 'VidSrc' : currentSource === 'superembed' ? 'SuperEmbed' : 'Demo Trailer'}</span>
                            <span className="material-symbols-outlined text-xs">arrow_drop_down</span>
                        </button>
                        
                        {showSourceDropdown && (
                            <div className="absolute bottom-10 right-0 w-36 bg-surface border border-white/10 rounded-lg shadow-2xl p-1 z-50 flex flex-col gap-1 text-[11px] animate-fade-in">
                                <button 
                                    onClick={() => { setCurrentSource('vidsrc'); setShowSourceDropdown(false); }}
                                    className={`w-full text-left px-2 py-1.5 rounded hover:bg-white/10 ${currentSource === 'vidsrc' ? 'text-primary-container font-bold' : 'text-white'}`}
                                >
                                    VidSrc Server
                                </button>
                                <button 
                                    onClick={() => { setCurrentSource('superembed'); setShowSourceDropdown(false); }}
                                    className={`w-full text-left px-2 py-1.5 rounded hover:bg-white/10 ${currentSource === 'superembed' ? 'text-primary-container font-bold' : 'text-white'}`}
                                >
                                    SuperEmbed Server
                                </button>
                                <button 
                                    onClick={() => { setCurrentSource('demo'); setShowSourceDropdown(false); }}
                                    className={`w-full text-left px-2 py-1.5 rounded hover:bg-white/10 ${currentSource === 'demo' ? 'text-primary-container font-bold' : 'text-white'}`}
                                >
                                    Demo Trailer (HTML5)
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Volume (For HTML5 demo mode) */}
                    <div className="hidden sm:flex items-center gap-2">
                        <button 
                            onClick={toggleMute}
                            disabled={currentSource !== 'demo'}
                            className={`text-white hover:text-primary-container transition-colors ${currentSource !== 'demo' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                            <span className="material-symbols-outlined text-xl md:text-2xl">
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
                            disabled={currentSource !== 'demo'}
                            className={`w-14 md:w-20 h-1 bg-white/20 rounded-full accent-primary-container appearance-none ${currentSource !== 'demo' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                        />
                    </div>

                    {/* Fullscreen */}
                    <button 
                        onClick={toggleFullscreen}
                        className="text-white hover:text-primary-container transition-colors cursor-pointer flex items-center"
                    >
                        <span className="material-symbols-outlined text-xl md:text-2xl">fullscreen</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
