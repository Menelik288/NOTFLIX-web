import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../hooks/useLanguage';
import { ImaxData } from '../data/imaxCatalog';

export const ImaxCatalogue = () => {
    const { navigateTo } = useApp();
    const { t } = useLanguage();

    const imaxMovies = ImaxData.getAll();
    const featuredMovie = ImaxData.getFeatured();

    // Interactive Aspect Ratio Visualizer state
    const [activeRatioMode, setActiveRatioMode] = useState('1.43'); // '1.43' | '2.39'

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = "NotFlix IMAX – Dedicated Large-Format Cinema Experience";
        let descTag = document.querySelector('meta[name="description"]');
        const prevDesc = descTag ? descTag.getAttribute('content') : '';
        if (descTag) {
            descTag.setAttribute('content', 'Experience the dedicated NotFlix IMAX cinema catalogue featuring expanded 1.43:1 aspect ratio film presentations, 15/70mm captures, and immersive 12-channel audio.');
        }
        return () => {
            if (descTag && prevDesc) descTag.setAttribute('content', prevDesc);
        };
    }, []);

    if (!featuredMovie) return null;

    return (
        <div className="imax-experience-page min-h-screen bg-[#141414] text-white selection:bg-red-600 selection:text-white">
            {/* ═══════════════════════════════════════════════════════════
                SECTION 1: GRAND CINEMATIC HERO SECTION
                ═══════════════════════════════════════════════════════════ */}
            <section className="relative w-full min-h-[92vh] flex items-end overflow-hidden pb-16 md:pb-24 pt-24">
                {/* Background Artwork Layer with Atmospheric Vignette Gradients */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={featuredMovie.backdrop}
                        alt={featuredMovie.title}
                        className="w-full h-full object-cover object-center scale-105 animate-subtle-zoom brightness-[0.78] contrast-[1.12]"
                    />
                    {/* Deep Cinematic Black Gradients & Atmospheric Notflix Vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/75 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/80 to-transparent"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-black/20 via-transparent to-black/70"></div>
                    {/* Subtle IMAX Film Perforations Border Accents */}
                    <div className="absolute left-0 top-0 bottom-0 w-2.5 opacity-20 pointer-events-none flex flex-col justify-between py-4">
                        {Array.from({ length: 30 }).map((_, i) => (
                            <div key={i} className="w-1.5 h-2 bg-white/40 rounded-xs mx-auto my-1"></div>
                        ))}
                    </div>
                </div>

                {/* Hero Foreground Content */}
                <div className="relative z-10 w-full max-w-container-max mx-auto px-4 md:px-edge-margin">
                    <div className="max-w-3xl space-y-5 animate-fade-in">
                        {/* Official Badges */}
                        <div className="flex flex-wrap items-center gap-2.5">
                            <span className="inline-flex items-center gap-1.5 bg-red-600 text-white font-black italic tracking-[0.2em] text-xs px-3 py-1 rounded shadow-lg shadow-red-600/40">
                                <span className="material-symbols-outlined text-sm">camera_indoor</span>
                                FILMED FOR IMAX
                            </span>
                            <span className="inline-flex items-center gap-1 bg-black/70 border border-white/20 text-white/90 font-mono text-[11px] font-bold px-3 py-1 rounded backdrop-blur-md">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                                1.43:1 EXPANDED RATIO
                            </span>
                            <span className="inline-flex items-center gap-1 bg-white/10 text-white/80 font-mono text-[11px] px-2.5 py-1 rounded backdrop-blur-md border border-white/10">
                                15/70MM PRESENTATION
                            </span>
                        </div>

                        {/* Director Credit Line */}
                        <p className="text-red-500 font-mono tracking-[0.3em] uppercase text-xs font-bold drop-shadow">
                            A Christopher Nolan Film
                        </p>

                        {/* Title */}
                        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white uppercase drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)] leading-none font-sans">
                            {featuredMovie.title}
                        </h1>

                        {/* Film Metadata */}
                        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-white/70 font-mono">
                            <span className="text-white font-bold">{featuredMovie.year}</span>
                            <span>•</span>
                            <span>{featuredMovie.duration}</span>
                            <span>•</span>
                            <span className="text-white font-bold">18K Capture Master</span>
                            <span>•</span>
                            <span>IMAX 12-Channel Audio</span>
                            <span>•</span>
                            <span className="px-2 py-0.5 rounded bg-white/10 text-white text-[10px]">
                                {featuredMovie.genres.slice(0, 3).join(' / ')}
                            </span>
                        </div>

                        {/* Description */}
                        <p className="text-base sm:text-lg text-white/85 leading-relaxed font-normal max-w-2xl drop-shadow line-clamp-3">
                            {featuredMovie.overview}
                        </p>

                        {/* Call to Actions */}
                        <div className="flex flex-wrap items-center gap-3.5 pt-2">
                            <button
                                onClick={() => navigateTo(`/imax/${featuredMovie.id}`)}
                                className="group bg-red-600 hover:bg-red-700 text-white px-7 py-3.5 rounded-xl font-black italic tracking-wider flex items-center gap-2.5 transition-all duration-300 shadow-xl shadow-red-600/40 hover:shadow-red-600/60 active:scale-95 cursor-pointer text-sm sm:text-base"
                            >
                                <span className="material-symbols-outlined text-2xl fill group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    play_arrow
                                </span>
                                <span>WATCH NOW</span>
                            </button>

                            <button
                                onClick={() => navigateTo(`/imax/${featuredMovie.id}`)}
                                className="bg-black/60 hover:bg-black/80 text-white border border-white/20 hover:border-red-500/50 px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all backdrop-blur-xl active:scale-95 cursor-pointer text-sm sm:text-base"
                            >
                                <span className="material-symbols-outlined text-red-500 text-xl">info</span>
                                <span>Movie Details & Specs</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
                SECTION 2: THE IMAX SIGNATURE CATALOGUE SHOWCASE
                Clean, future-proof grid architecture designed to host 1 or many
                IMAX titles with high-end presentation without empty appearance
                ═══════════════════════════════════════════════════════════ */}
            <section className="relative py-12 md:py-16 px-4 md:px-edge-margin max-w-container-max mx-auto border-t border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-red-500 font-mono text-xs tracking-[0.25em] uppercase font-bold mb-1">
                            <span className="material-symbols-outlined text-sm">movie</span>
                            <span>IMAX 70MM REPERTOIRE</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                            IMAX Cinema Showcase
                        </h2>
                    </div>
                    <span className="text-xs text-white/50 font-mono">
                        Showing {imaxMovies.length} Available Large-Format Presentation
                    </span>
                </div>

                {/* Showcase Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {imaxMovies.map((movie) => (
                        <div
                            key={movie.id}
                            onClick={() => navigateTo(`/imax/${movie.id}`)}
                            className="group relative bg-[#181818] rounded-2xl border border-white/10 hover:border-red-500/50 overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-[0_0_35px_rgba(229,9,20,0.25)] hover:-translate-y-1 cursor-pointer flex flex-col"
                        >
                            {/* Card Media Preview */}
                            <div className="relative aspect-[16/10] overflow-hidden bg-black">
                                <img
                                    src={movie.backdrop || movie.poster}
                                    alt={movie.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90 group-hover:brightness-100"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent"></div>

                                {/* Aspect Ratio Pill */}
                                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                                    <span className="bg-black/80 backdrop-blur-md border border-white/20 text-white text-[10px] font-mono font-bold px-2.5 py-0.5 rounded shadow">
                                        1.43:1 EXPANDED
                                    </span>
                                </div>

                                {/* Hover Play Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-xs">
                                    <div className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/50 transform group-hover:scale-105 transition-transform">
                                        <span className="material-symbols-outlined text-3xl fill" style={{ fontVariationSettings: "'FILL' 1" }}>
                                            play_arrow
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Card Details */}
                            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                                <div>
                                    <div className="flex items-center justify-between text-xs text-white/50 font-mono mb-1">
                                        <span>{movie.year}</span>
                                        <span className="text-red-400 font-bold">{movie.duration}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors leading-snug">
                                        {movie.title}
                                    </h3>
                                    <p className="text-xs text-white/60 line-clamp-2 mt-1.5 font-normal leading-relaxed">
                                        {movie.shortDescription || movie.overview}
                                    </p>
                                </div>

                                {/* Technical Specs Pills */}
                                <div className="pt-2 border-t border-white/5 flex flex-wrap gap-1.5 text-[10px] font-mono text-white/60">
                                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">15/70mm Film</span>
                                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">18K Master</span>
                                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">12-Ch Audio</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
                SECTION 3: INTERACTIVE 1.43:1 ASPECT RATIO VISUALIZER
                Educational, cinematic demonstration of the 1.43:1 expansion
                ═══════════════════════════════════════════════════════════ */}
            <section className="py-14 px-4 md:px-edge-margin max-w-container-max mx-auto border-t border-white/10">
                <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
                    <span className="text-red-500 font-mono text-xs tracking-[0.25em] uppercase font-bold block">
                        THE POWER OF EXPANDED GEOMETRY
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-extrabold text-white uppercase tracking-tight">
                        Expanded Aspect Ratio Comparison
                    </h2>
                    <p className="text-sm text-white/65 leading-relaxed">
                        Shot with 15-perf 70mm cameras, genuine 1.43:1 IMAX expands the frame vertically by up to 64% more image area compared to standard 2.39:1 scope widescreen.
                    </p>

                    {/* Interactive Toggle */}
                    <div className="inline-flex rounded-xl bg-black/60 border border-white/20 p-1 mt-4">
                        <button
                            onClick={() => setActiveRatioMode('1.43')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer ${
                                activeRatioMode === '1.43'
                                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/40'
                                    : 'text-white/70 hover:text-white'
                            }`}
                        >
                            <span className="material-symbols-outlined text-sm">fullscreen</span>
                            <span>IMAX 1.43:1 Full Expanded</span>
                        </button>
                        <button
                            onClick={() => setActiveRatioMode('2.39')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer ${
                                activeRatioMode === '2.39'
                                    ? 'bg-white/20 text-white shadow'
                                    : 'text-white/70 hover:text-white'
                            }`}
                        >
                            <span className="material-symbols-outlined text-sm">crop_16_9</span>
                            <span>Standard 2.39:1 Scope</span>
                        </button>
                    </div>
                </div>

                {/* Simulated Screen Comparison Frame */}
                <div className="relative max-w-4xl mx-auto aspect-[16/10] sm:aspect-[1.43/1] max-h-[580px] bg-black rounded-2xl border border-white/20 overflow-hidden shadow-2xl flex items-center justify-center transition-all duration-500">
                    {/* Background Full 1.43 Image */}
                    <img
                        src={featuredMovie.backdrop}
                        alt="IMAX 1.43 Preview"
                        className="w-full h-full object-cover transition-all duration-700 filter brightness-95"
                    />

                    {/* Top & Bottom Matte Masking for 2.39:1 Simulation */}
                    <div
                        className={`absolute top-0 left-0 right-0 bg-black/90 backdrop-blur-xs transition-all duration-500 flex items-center justify-center text-white/40 text-xs font-mono border-b border-white/10 ${
                            activeRatioMode === '2.39' ? 'h-[20%]' : 'h-0 opacity-0 pointer-events-none'
                        }`}
                    >
                        <span>[STANDARD 2.39:1 MATTE: TOP 20% CROPPED OUT]</span>
                    </div>

                    <div
                        className={`absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xs transition-all duration-500 flex items-center justify-center text-white/40 text-xs font-mono border-t border-white/10 ${
                            activeRatioMode === '2.39' ? 'h-[20%]' : 'h-0 opacity-0 pointer-events-none'
                        }`}
                    >
                        <span>[STANDARD 2.39:1 MATTE: BOTTOM 20% CROPPED OUT]</span>
                    </div>

                    {/* HUD Label Overlay */}
                    <div className="absolute bottom-5 left-5 z-20 bg-black/85 backdrop-blur-md border border-white/20 px-3.5 py-2 rounded-xl text-xs font-mono shadow-xl">
                        <div className="text-red-500 font-bold flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                            <span>CURRENT MODE: {activeRatioMode === '1.43' ? '1.43:1 (100% Full Height Frame)' : '2.39:1 (Standard Scope Crop)'}</span>
                        </div>
                        <span className="text-white/60 text-[10px]">
                            {activeRatioMode === '1.43' ? 'Reveals ceiling-to-floor visual scale' : 'Restricted by letterbox matting'}
                        </span>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
                SECTION 4: THE FOUR PILLARS OF IMAX LARGE-FORMAT CINEMA
                ═══════════════════════════════════════════════════════════ */}
            <section className="py-14 px-4 md:px-edge-margin max-w-container-max mx-auto border-t border-white/10">
                <div className="mb-10 text-center max-w-xl mx-auto">
                    <span className="text-red-500 font-mono text-xs tracking-[0.25em] uppercase font-bold">
                        ENGINEERED FOR SUPREMACY
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1">
                        The IMAX Technical Pillars
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-6 rounded-2xl bg-[#181818] border border-white/10 hover:border-red-500/40 transition-all flex flex-col space-y-3">
                        <div className="w-12 h-12 rounded-xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500">
                            <span className="material-symbols-outlined text-2xl">photo_camera</span>
                        </div>
                        <h3 className="text-lg font-bold text-white">15-Perf 70mm Cameras</h3>
                        <p className="text-xs text-white/60 leading-relaxed">
                            Film feeds horizontally through the gate at 15 perforations per frame, capturing an image area 10 times larger than standard 35mm film.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-[#181818] border border-white/10 hover:border-red-500/40 transition-all flex flex-col space-y-3">
                        <div className="w-12 h-12 rounded-xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500">
                            <span className="material-symbols-outlined text-2xl">aspect_ratio</span>
                        </div>
                        <h3 className="text-lg font-bold text-white">1.43:1 Ceiling-to-Floor</h3>
                        <p className="text-xs text-white/60 leading-relaxed">
                            A towering aspect ratio engineered to exceed the viewer’s peripheral field of view, generating an unmistakable sensation of vertigo and presence.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-[#181818] border border-white/10 hover:border-red-500/40 transition-all flex flex-col space-y-3">
                        <div className="w-12 h-12 rounded-xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500">
                            <span className="material-symbols-outlined text-2xl">surround_sound</span>
                        </div>
                        <h3 className="text-lg font-bold text-white">12-Channel Laser Audio</h3>
                        <p className="text-xs text-white/60 leading-relaxed">
                            Point-source acoustic arrays with sub-bass capable of shaking audiences at 20Hz, delivering uncompressed dynamic range.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-[#181818] border border-white/10 hover:border-red-500/40 transition-all flex flex-col space-y-3">
                        <div className="w-12 h-12 rounded-xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500">
                            <span className="material-symbols-outlined text-2xl">verified</span>
                        </div>
                        <h3 className="text-lg font-bold text-white">Zero Distortion / Zero Crop</h3>
                        <p className="text-xs text-white/60 leading-relaxed">
                            Our dedicated player preserves the source dimensions without stretching or artificial frame interpolation, honoring cinema purism.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ImaxCatalogue;

