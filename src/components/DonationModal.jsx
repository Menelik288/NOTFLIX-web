import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AdService } from '../services/adService';

export const DonationModal = ({ isOpen, onClose }) => {
    const { addNotification } = useApp();
    const [activeTab, setActiveTab] = useState('usdt'); // 'usdt' | 'binance' | 'free'
    const [copiedField, setCopiedField] = useState(null);

    if (!isOpen) return null;

    const USDT_TRC20_ADDRESS = 'TTe76gvM4VqDqw8GYUBSbzxT82VF6LdWFA';
    const BINANCE_UID = '908057169';

    const handleCopy = (text, type, label) => {
        navigator.clipboard.writeText(text);
        setCopiedField(type);
        addNotification('Copied', `${label} copied to clipboard!`, 'content_copy');
        setTimeout(() => setCopiedField(null), 2500);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-xl transition-opacity"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#121212]/95 backdrop-blur-2xl shadow-2xl p-6 sm:p-8 text-white z-10 animate-slide-up overflow-hidden">
                
                {/* Background glow effects */}
                <div className="absolute -top-24 -right-24 w-60 h-60 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-5 right-5 text-white/50 hover:text-white glass-surface w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer border border-white/10 hover:scale-105"
                >
                    <span className="material-symbols-outlined text-lg">close</span>
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-red-800 shadow-xl shadow-red-600/30 mb-3 border border-red-500/40">
                        <span className="material-symbols-outlined text-3xl text-white fill" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Support NotFlix</h2>
                    <p className="text-white/60 text-xs sm:text-sm mt-1 max-w-sm mx-auto">
                        NotFlix is free with minimal ads. Help cover high-speed streaming servers and ongoing updates!
                    </p>
                </div>

                {/* Tab Selectors */}
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/40 rounded-2xl border border-white/10 mb-6">
                    <button
                        onClick={() => setActiveTab('usdt')}
                        className={`py-2 px-2 sm:px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            activeTab === 'usdt' 
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg' 
                                : 'text-white/60 hover:text-white'
                        }`}
                    >
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span>USDT (TRC20)</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('binance')}
                        className={`py-2 px-2 sm:px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            activeTab === 'binance' 
                                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 shadow-lg' 
                                : 'text-white/60 hover:text-white'
                        }`}
                    >
                        <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                        <span>Binance Pay</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('free')}
                        className={`py-2 px-2 sm:px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            activeTab === 'free' 
                                ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-lg' 
                                : 'text-white/60 hover:text-white'
                        }`}
                    >
                        <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
                        <span>Support Free</span>
                    </button>
                </div>

                {/* Tab 1: USDT (TRC-20) */}
                {activeTab === 'usdt' && (
                    <div className="space-y-4 animate-fade-in text-center">
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                            <div className="bg-white p-2 rounded-2xl shadow-xl shrink-0">
                                <img 
                                    src="/usdt_trc20_qr.jpg" 
                                    alt="USDT TRC20 QR Code" 
                                    className="w-32 h-32 sm:w-36 sm:h-36 rounded-xl object-contain"
                                />
                            </div>
                            <div className="flex-1 text-left w-full">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                        TRON Network (TRC-20)
                                    </span>
                                </div>
                                <div className="text-[11px] text-white/50 mb-1">USDT Deposit Address:</div>
                                <div className="font-mono text-xs text-white bg-black/60 p-2.5 rounded-xl border border-white/10 break-all select-all font-bold mb-3">
                                    {USDT_TRC20_ADDRESS}
                                </div>
                                <button
                                    onClick={() => handleCopy(USDT_TRC20_ADDRESS, 'usdt', 'USDT TRC-20 Address')}
                                    className="w-full btn-primary py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-600/30 active:scale-95"
                                >
                                    <span className="material-symbols-outlined text-sm">
                                        {copiedField === 'usdt' ? 'check' : 'content_copy'}
                                    </span>
                                    {copiedField === 'usdt' ? 'Address Copied!' : 'Copy USDT Address'}
                                </button>
                            </div>
                        </div>
                        <p className="text-[11px] text-white/40 flex items-center justify-center gap-1">
                            <span className="material-symbols-outlined text-xs text-yellow-500">warning</span>
                            Send only Tether (USDT) on the Tron TRC-20 blockchain.
                        </p>
                    </div>
                )}

                {/* Tab 2: Binance Pay */}
                {activeTab === 'binance' && (
                    <div className="space-y-4 animate-fade-in text-center">
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                            <div className="bg-white p-2 rounded-2xl shadow-xl shrink-0">
                                <img 
                                    src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Donate%20to%20NotFlix%20(Binance%20UID:%20908057169)&margin=2" 
                                    alt="Binance Pay QR Code" 
                                    className="w-32 h-32 sm:w-36 sm:h-36 rounded-xl"
                                />
                            </div>
                            <div className="flex-1 text-left w-full">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                                        Binance Pay • 0% Fees
                                    </span>
                                </div>
                                <div className="text-[11px] text-white/50 mb-1">Binance Donation UID:</div>
                                <div className="font-mono text-xl text-yellow-400 font-extrabold bg-black/60 p-2.5 rounded-xl border border-white/10 tracking-widest text-center mb-3">
                                    {BINANCE_UID}
                                </div>
                                <button
                                    onClick={() => handleCopy(BINANCE_UID, 'binance', 'Binance UID')}
                                    className="w-full btn-primary py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-600/30 active:scale-95"
                                >
                                    <span className="material-symbols-outlined text-sm">
                                        {copiedField === 'binance' ? 'check' : 'content_copy'}
                                    </span>
                                    {copiedField === 'binance' ? 'UID Copied!' : 'Copy Binance UID'}
                                </button>
                            </div>
                        </div>
                        <p className="text-[11px] text-white/40">
                            Open Binance App → Tap <strong>Pay</strong> → Enter UID <strong>{BINANCE_UID}</strong> (Instant & Zero Fees).
                        </p>
                    </div>
                )}

                {/* Tab 3: Free Support (Triggers Adsterra Direct Link & App Download) */}
                {activeTab === 'free' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 text-left space-y-3">
                            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-red-500 text-lg">volunteer_activism</span>
                                Support Without Spending a Cent!
                            </h3>
                            <p className="text-xs text-white/60 leading-relaxed">
                                Every time you try out our Android app or explore our verified sponsor links, you help fund NotFlix's daily server uptime for free.
                            </p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                <button
                                    onClick={() => {
                                        AdService.triggerAppDownload('/Notflix_v1.0.1.APK', 'Notflix_v1.0.1.apk');
                                        onClose();
                                    }}
                                    className="p-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 border border-red-500/40 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 cursor-pointer active:scale-95 transition-all"
                                >
                                    <span className="material-symbols-outlined text-lg">android</span>
                                    <span>Download Mobile App</span>
                                </button>
                                
                                <button
                                    onClick={() => {
                                        AdService.triggerSmartlink('support');
                                        onClose();
                                    }}
                                    className="p-3 rounded-xl glass-surface border border-white/20 hover:border-white/50 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                                >
                                    <span className="material-symbols-outlined text-lg text-yellow-400">explore</span>
                                    <span>Browse Sponsor Deals</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Note */}
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
                    <span className="flex items-center gap-1">
                        Crafted with <span className="text-red-500 material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span> for stream lovers
                    </span>
                    <button 
                        onClick={onClose}
                        className="text-white/60 hover:text-white font-semibold transition-colors cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DonationModal;
