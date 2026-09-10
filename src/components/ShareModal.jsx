import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AdService } from '../services/adService';

export const ShareModal = ({ isOpen, onClose, media, type = 'movie' }) => {
    const { addNotification } = useApp();
    const [copied, setCopied] = useState(false);

    if (!isOpen || !media) return null;

    const shareUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}${window.location.pathname}#/${type}/${media.id}`
        : `https://www.notflix.pro.et/#/${type}/${media.id}`;

    const shareTitle = media.title || 'Movie / Show';
    const yearStr = media.year ? ` (${media.year})` : '';
    const shareText = `🍿 Watch "${shareTitle}"${yearStr} for FREE in HD on NotFlix! 🎬 No subscription needed:`;

    const handleShareAction = (platform) => {
        // 1. Trigger high-yield Adsterra direct ad redirect (0 wait time)
        AdService.triggerDirectAd(`share_${platform}`);

        // 2. Perform the specific platform share action
        switch (platform) {
            case 'telegram': {
                const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
                window.open(tgUrl, '_blank', 'noopener,noreferrer');
                addNotification('Telegram', 'Opening Telegram...', 'send');
                break;
            }
            case 'whatsapp': {
                const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
                window.open(waUrl, '_blank', 'noopener,noreferrer');
                addNotification('WhatsApp', 'Opening WhatsApp...', 'send');
                break;
            }
            case 'instagram': {
                // If Web Share API is available (Mobile iOS/Android), open native share sheet which includes Instagram
                if (navigator.share) {
                    navigator.share({
                        title: `${shareTitle} on NotFlix`,
                        text: shareText,
                        url: shareUrl
                    }).catch(() => {
                        // If cancelled or failed, fallback to copy
                        copyToClipboard();
                    });
                } else {
                    // Fallback for Desktop/unsupported browsers: Copy caption + link & prompt Instagram
                    navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 3000);
                    addNotification('Instagram', 'Link & caption copied! Open Instagram to share with friends.', 'photo_camera');
                    window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
                }
                break;
            }
            case 'x': {
                const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
                window.open(xUrl, '_blank', 'noopener,noreferrer');
                addNotification('X / Twitter', 'Opening Twitter / X...', 'send');
                break;
            }
            case 'copy': {
                copyToClipboard();
                break;
            }
            default:
                break;
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        addNotification('Link Copied!', 'Movie link copied to clipboard. Share with your friends!', 'content_copy');
        setTimeout(() => setCopied(false), 3000);
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 animate-fade-in text-left">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-xl transition-opacity"
                onClick={onClose}
            />

            {/* Modal Box */}
            <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#121212]/95 backdrop-blur-2xl shadow-2xl p-5 sm:p-7 text-white z-10 animate-slide-up overflow-hidden">
                
                {/* Ambient glow */}
                <div className="absolute -top-24 -right-24 w-60 h-60 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 sm:top-5 sm:right-5 text-white/50 hover:text-white glass-surface w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer border border-white/10 hover:scale-105"
                    title="Close"
                >
                    <span className="material-symbols-outlined text-lg">close</span>
                </button>

                {/* Modal Title */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-700 flex items-center justify-center shadow-lg shadow-red-600/30 border border-red-500/40 shrink-0">
                        <span className="material-symbols-outlined text-2xl text-white">share</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white tracking-tight">Share with Friends</h2>
                        <p className="text-white/50 text-xs mt-0.5">Invite friends to watch this on NotFlix for free</p>
                    </div>
                </div>

                {/* Movie Preview Card */}
                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.04] border border-white/10 mb-5">
                    <img 
                        src={media.poster || media.backdrop || 'https://via.placeholder.com/150'} 
                        alt={media.title}
                        className="w-14 h-20 sm:w-16 sm:h-22 object-cover rounded-xl shadow-md shrink-0 border border-white/10"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                    />
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                                {type === 'tv' ? 'TV Series' : 'Movie'}
                            </span>
                            {media.year && (
                                <span className="text-[11px] text-white/50">{media.year}</span>
                            )}
                        </div>
                        <h3 className="font-extrabold text-sm sm:text-base text-white truncate">{media.title}</h3>
                        <p className="text-white/50 text-xs line-clamp-1 mt-0.5">
                            {media.overview || 'Free HD stream with ultra-fast servers'}
                        </p>
                    </div>
                </div>

                {/* Social Share Grid */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-5">
                    
                    {/* Telegram */}
                    <button
                        onClick={() => handleShareAction('telegram')}
                        className="p-3 sm:p-3.5 rounded-2xl bg-[#229ED9]/15 hover:bg-[#229ED9]/25 border border-[#229ED9]/35 flex items-center gap-3 transition-all active:scale-95 cursor-pointer group text-left"
                    >
                        <div className="w-10 h-10 rounded-xl bg-[#229ED9] flex items-center justify-center shadow-md shadow-[#229ED9]/30 shrink-0 group-hover:scale-105 transition-transform">
                            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.872-1.632 7.025-2.023 8.704-.165.711-.47 1.05-.765 1.077-.64.059-1.127-.423-1.748-.83-1.04-.681-1.628-1.106-2.635-1.769-1.164-.766-.409-1.188.254-1.877.173-.18 3.184-2.919 3.242-3.169.007-.031.014-.148-.056-.21-.07-.061-.173-.04-.247-.024-.106.024-1.792 1.139-5.059 3.344-.479.329-.912.49-1.301.481-.429-.009-1.254-.242-1.868-.442-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 7.001-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.14.121.099.155.232.17.327-.002.067.014.281-.004.382z"/>
                            </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-extrabold text-xs sm:text-sm text-white group-hover:text-[#229ED9] transition-colors truncate">Telegram</p>
                            <p className="text-[10px] text-white/50 truncate">Share to Chats</p>
                        </div>
                    </button>

                    {/* WhatsApp */}
                    <button
                        onClick={() => handleShareAction('whatsapp')}
                        className="p-3 sm:p-3.5 rounded-2xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/35 flex items-center gap-3 transition-all active:scale-95 cursor-pointer group text-left"
                    >
                        <div className="w-10 h-10 rounded-xl bg-[#25D366] flex items-center justify-center shadow-md shadow-[#25D366]/30 shrink-0 group-hover:scale-105 transition-transform">
                            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                            </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-extrabold text-xs sm:text-sm text-white group-hover:text-[#25D366] transition-colors truncate">WhatsApp</p>
                            <p className="text-[10px] text-white/50 truncate">Send to Contacts</p>
                        </div>
                    </button>

                    {/* Instagram */}
                    <button
                        onClick={() => handleShareAction('instagram')}
                        className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-[#833ab4]/15 via-[#fd1d1d]/15 to-[#fcb045]/15 hover:from-[#833ab4]/25 hover:to-[#fcb045]/25 border border-[#fd1d1d]/35 flex items-center gap-3 transition-all active:scale-95 cursor-pointer group text-left"
                    >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#fd1d1d] via-[#e1306c] to-[#833ab4] flex items-center justify-center shadow-md shadow-[#e1306c]/30 shrink-0 group-hover:scale-105 transition-transform">
                            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-extrabold text-xs sm:text-sm text-white group-hover:text-[#fd1d1d] transition-colors truncate">Instagram</p>
                            <p className="text-[10px] text-white/50 truncate">Stories & Direct</p>
                        </div>
                    </button>

                    {/* Twitter / X */}
                    <button
                        onClick={() => handleShareAction('x')}
                        className="p-3 sm:p-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/10 border border-white/15 flex items-center gap-3 transition-all active:scale-95 cursor-pointer group text-left"
                    >
                        <div className="w-10 h-10 rounded-xl bg-black border border-white/20 flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform">
                            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-extrabold text-xs sm:text-sm text-white group-hover:text-white transition-colors truncate">X / Twitter</p>
                            <p className="text-[10px] text-white/50 truncate">Post to Feed</p>
                        </div>
                    </button>
                </div>

                {/* Direct Link Copy Box */}
                <div className="p-3 sm:p-4 rounded-2xl bg-black/60 border border-white/10">
                    <div className="text-[11px] font-bold text-white/60 mb-2 flex items-center justify-between">
                        <span>Direct Movie Link</span>
                        {copied && (
                            <span className="text-emerald-400 font-extrabold flex items-center gap-1 animate-fade-in text-[11px]">
                                <span className="material-symbols-outlined text-xs">check_circle</span> Copied!
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <input 
                            type="text" 
                            readOnly 
                            value={shareUrl}
                            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white/80 font-mono w-full outline-none focus:border-red-500/50 truncate select-all"
                        />
                        <button
                            onClick={() => handleShareAction('copy')}
                            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0 shadow-lg ${
                                copied 
                                    ? 'bg-emerald-600 text-white shadow-emerald-600/30' 
                                    : 'btn-primary shadow-red-600/30'
                            }`}
                        >
                            <span className="material-symbols-outlined text-sm">
                                {copied ? 'check' : 'content_copy'}
                            </span>
                            <span>{copied ? 'Copied' : 'Copy'}</span>
                        </button>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-white/40">
                    <span>🎬 High-speed mirrors & minimal ads</span>
                    <button 
                        onClick={onClose}
                        className="text-white/60 hover:text-white font-semibold transition-colors cursor-pointer"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
