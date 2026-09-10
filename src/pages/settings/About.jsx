import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const About = () => {
    const { navigateTo, addNotification } = useApp();
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText('908057169');
        setIsCopied(true);
        addNotification('Copied', 'Binance UID copied to clipboard!', 'content_copy');
        setTimeout(() => setIsCopied(false), 3000);
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-16 min-h-screen text-white animate-fade-in">
            <button 
                onClick={() => window.history.back()} 
                className="mb-8 glass-surface w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
            >
                <span className="material-symbols-outlined">arrow_back</span>
            </button>
            
            <h1 className="text-3xl font-black mb-6">About NotFlix</h1>
            
            <div className="glass-surface rounded-2xl p-5 md:p-6 space-y-4">
                <div>
                    <p className="text-white/80 leading-relaxed">
                        NotFlix is a modern movie and TV discovery platform designed to provide personalized recommendations, seamless browsing, and an elegant viewing experience. It leverages real-time data and intelligent filtering to help users find content they love.
                    </p>
                </div>

                <div className="pt-4 border-t border-white/10">
                    <h2 className="text-lg font-bold mb-4 text-primary">Creator</h2>
                    <p className="font-semibold text-lg mb-4">Menelik Alemayehu</p>
                    <div className="flex flex-col gap-3">
                        <a href="https://github.com/Menelik288" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-white/70 hover:text-white transition-colors">
                            <span className="material-symbols-outlined">code</span>
                            GitHub: Menelik288
                        </a>
                        <a href="https://instagram.com/bi9ears" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-white/70 hover:text-white transition-colors">
                            <span className="material-symbols-outlined">photo_camera</span>
                            Instagram: @bi9ears
                        </a>
                        <a href="https://et.linkedin.com/in/menelik-alemayehu-61727b371" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-white/70 hover:text-white transition-colors">
                            <span className="material-symbols-outlined">work</span>
                            LinkedIn: Menelik Alemayehu
                        </a>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                    <h2 className="text-lg font-bold mb-4 text-primary flex items-center gap-2">
                        Support NotFlix <span className="material-symbols-outlined text-red-500 fill" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                    </h2>
                    <p className="text-white/70 mb-6 leading-relaxed">
                        If you enjoy using NotFlix and would like to support its development, you can donate using the options below. Your support helps improve features and future updates.
                    </p>
                    
                    <div className="space-y-4">
                        {/* 1. USDT (TRC-20) Card */}
                        <div className="glass-surface p-4 md:p-6 rounded-2xl border border-emerald-500/20 hover:border-emerald-500/40 transition-all flex flex-col md:flex-row items-center gap-6">
                            <div className="flex-1 text-center md:text-left w-full">
                                <div className="flex items-center gap-2 mb-1 justify-center md:justify-start">
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                        TRON Network (TRC-20)
                                    </span>
                                </div>
                                <div className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1">USDT Deposit Address</div>
                                <div className="font-mono text-xs text-white bg-black/60 p-2.5 rounded-xl border border-white/10 break-all select-all font-bold mb-3">
                                    TTe76gvM4VqDqw8GYUBSbzxT82VF6LdWFA
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2 justify-center md:justify-start">
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText('TTe76gvM4VqDqw8GYUBSbzxT82VF6LdWFA');
                                            addNotification('Copied', 'USDT TRC-20 Address copied to clipboard!', 'content_copy');
                                        }}
                                        className="btn-primary px-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-600/30 active:scale-95"
                                    >
                                        <span className="material-symbols-outlined text-sm">content_copy</span>
                                        <span>Copy Address</span>
                                    </button>
                                    <a
                                        href="tron:TTe76gvM4VqDqw8GYUBSbzxT82VF6LdWFA?token=USDT"
                                        className="py-2.5 px-4 rounded-xl text-sm font-bold bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 flex items-center justify-center gap-1.5 transition-all active:scale-95"
                                    >
                                        <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
                                        <span>Open Wallet</span>
                                    </a>
                                </div>
                            </div>
                            
                            <div className="bg-white p-2.5 rounded-2xl shrink-0 shadow-lg flex flex-col items-center">
                                <img 
                                    src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=tron%3ATTe76gvM4VqDqw8GYUBSbzxT82VF6LdWFA%3Ftoken%3DUSDT&margin=2" 
                                    alt="USDT TRC-20 QR Code" 
                                    className="w-24 h-24 md:w-28 md:h-28 rounded-xl object-contain"
                                    loading="lazy"
                                />
                                <span className="text-[8px] font-bold text-black/60 mt-1 uppercase">Scan with Crypto App</span>
                            </div>
                        </div>

                        {/* 2. Binance Pay UID Card */}
                        <div className="glass-surface p-4 md:p-6 rounded-2xl border border-yellow-500/20 hover:border-yellow-500/40 transition-all flex flex-col md:flex-row items-center gap-6">
                            <div className="flex-1 text-center md:text-left w-full">
                                <div className="flex items-center gap-2 mb-1 justify-center md:justify-start">
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                                        Binance Pay • 0% Fees
                                    </span>
                                </div>
                                <div className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1">Binance Donation UID</div>
                                <div className="text-2xl font-black mb-4 tracking-wider text-yellow-400">908057169</div>
                                <div className="flex flex-col sm:flex-row gap-2 justify-center md:justify-start">
                                    <button
                                        onClick={handleCopy}
                                        className="btn-primary px-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-600/30 active:scale-95"
                                    >
                                        <span className="material-symbols-outlined text-sm">
                                            {isCopied ? 'check' : 'content_copy'}
                                        </span>
                                        {isCopied ? 'Copied' : 'Copy UID'}
                                    </button>
                                    <a
                                        href="https://pay.binance.com/en/send?uid=908057169"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="py-2.5 px-4 rounded-xl text-sm font-bold bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/40 text-yellow-300 flex items-center justify-center gap-1.5 transition-all active:scale-95"
                                    >
                                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                                        <span>Open Binance</span>
                                    </a>
                                </div>
                            </div>
                            
                            <div className="bg-white p-2.5 rounded-2xl shrink-0 shadow-lg flex flex-col items-center">
                                <img 
                                    src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https%3A%2F%2Fpay.binance.com%2Fen%2Fsend%3Fuid%3D908057169&margin=2" 
                                    alt="Binance QR Code" 
                                    className="w-24 h-24 md:w-28 md:h-28 rounded-xl"
                                    loading="lazy"
                                />
                                <span className="text-[8px] font-bold text-black/60 mt-1 uppercase">Scan with Binance / Cam</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-between items-center text-sm text-white/40 font-semibold uppercase tracking-wider">
                    <span>Version 2.0</span>
                    <span className="flex items-center gap-1">
                        Crafted with <span className="text-red-500 material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default About;
