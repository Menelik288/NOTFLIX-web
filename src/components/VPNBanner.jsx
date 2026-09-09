import React from 'react';
import { AFFILIATE_CONFIG } from '../config/affiliateConfig';
import { AdService } from '../services/adService';

export const VPNBanner = ({ compact = false, className = '' }) => {
    const config = AFFILIATE_CONFIG.vpn;
    if (!config || !config.enabled) return null;

    const handleClick = () => {
        // Open affiliate destination in new tab
        window.open(config.link, '_blank', 'noopener,noreferrer');
        // Smartlink monetization fallback
        AdService.triggerSmartlink('vpn_affiliate');
    };

    if (compact) {
        return (
            <div 
                onClick={handleClick}
                className={`glass-surface px-3 py-2 rounded-xl border border-cyan-500/30 hover:border-cyan-400 bg-gradient-to-r from-cyan-950/40 via-black/60 to-black flex items-center justify-between gap-3 cursor-pointer shadow-lg hover:scale-[1.02] active:scale-98 transition-all duration-300 group ${className}`}
                title="Unlock 4K Buffer-Free Streaming"
            >
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0 shadow-md shadow-cyan-500/30 group-hover:rotate-6 transition-transform">
                        <span className="material-symbols-outlined text-white text-base">shield_lock</span>
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <span className="text-white font-bold text-xs truncate">Stream in 4K Buffer-Free</span>
                            <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[9px] font-extrabold px-1.5 py-0.2 rounded shrink-0">
                                {config.discount}
                            </span>
                        </div>
                        <p className="text-white/50 text-[10px] truncate hidden sm:block">
                            Bypass ISP speed limits & unblock geo-restrictions.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1 text-cyan-400 text-xs font-bold shrink-0 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20 group-hover:bg-cyan-500 group-hover:text-black transition-all">
                    <span>Unlock</span>
                    <span className="material-symbols-outlined text-xs group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
                </div>
            </div>
        );
    }

    return (
        <section 
            onClick={handleClick}
            className={`w-full relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/50 via-[#0a121e]/80 to-black p-6 sm:p-7 shadow-2xl transition-all duration-300 hover:border-cyan-400/60 hover:shadow-cyan-900/20 group cursor-pointer ${className}`}
        >
            {/* Background Ambient Glows */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-500/10 via-blue-600/5 to-transparent rounded-full blur-3xl pointer-events-none group-hover:from-cyan-500/20 transition-all duration-500" />
            
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                {/* Left Side Info */}
                <div className="flex items-start gap-4 sm:gap-5 min-w-0">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-cyan-500 via-cyan-600 to-blue-700 flex items-center justify-center shrink-0 shadow-xl shadow-cyan-500/30 border border-cyan-400/40 group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300">
                        <span className="material-symbols-outlined text-3xl sm:text-4xl text-white">vpn_key</span>
                    </div>

                    <div className="min-w-0 text-left">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] sm:text-xs font-mono font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                Official Partner Offer
                            </span>
                            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">star</span> {config.rating}
                            </span>
                            <span className="bg-gradient-to-r from-red-600 to-red-700 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full animate-pulse">
                                {config.discount}
                            </span>
                        </div>

                        <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-cyan-300 transition-colors">
                            {config.title}
                        </h3>
                        <p className="text-white/60 text-xs sm:text-sm mt-1 max-w-xl">
                            {config.tagline}
                        </p>

                        {/* Feature Badges */}
                        <div className="flex flex-wrap gap-2 mt-3">
                            {config.features.map((feat, idx) => (
                                <span key={idx} className="flex items-center gap-1 text-[11px] text-white/80 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                                    <span className="material-symbols-outlined text-xs text-cyan-400">check_circle</span>
                                    {feat}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side CTA Button */}
                <div className="w-full lg:w-auto shrink-0 pt-2 lg:pt-0">
                    <button 
                        className="w-full lg:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/30 group-hover:shadow-cyan-500/50 group-hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                    >
                        <span className="material-symbols-outlined text-xl">speed</span>
                        <span>Get Special 82% Deal</span>
                        <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </button>
                    <span className="block text-center text-[10px] text-white/40 mt-1.5 font-medium">
                        30-Day Money-Back Guarantee
                    </span>
                </div>
            </div>
        </section>
    );
};

export default VPNBanner;
