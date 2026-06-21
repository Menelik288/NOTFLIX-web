import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../hooks/useLanguage';

const FALLBACK_HERO = {
    id: 'fallback-hero',
    type: 'movie',
    title: 'Continue Watching',
    overview: 'Trending titles will appear here once the catalog loads.',
    backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1920&q=80',
    poster: '',
    rating: 0,
    tag: 'NotFlix'
};

const FallbackHero = () => {
    const { t } = useLanguage();

    return (
        <section className="relative w-full h-[60vh] md:h-[85vh] lg:h-[90vh] overflow-hidden flex items-center">
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary-container/30 via-black to-black">
                <img
                    className="w-full h-full object-cover opacity-40"
                    src={FALLBACK_HERO.backdrop}
                    alt=""
                />
                <div className="absolute inset-0 hero-gradient"></div>
            </div>

            <div className="relative z-10 px-4 md:px-edge-margin max-w-container-max mx-auto w-full text-left">
                <div className="max-w-2xl space-y-4 md:space-y-6">
                    <span className="px-3 py-1.5 bg-red-600 rounded text-[10px] md:text-label-md text-white tracking-widest uppercase font-bold">
                        {FALLBACK_HERO.tag}
                    </span>
                    <h1 className="font-display-lg text-4xl md:text-6xl lg:text-display-lg font-extrabold uppercase tracking-tighter leading-none text-white drop-shadow-md">
                        {FALLBACK_HERO.title}
                    </h1>
                    <p className="font-body-md md:font-body-lg text-sm md:text-body-lg text-on-surface-variant line-clamp-3 max-w-xl text-white/80 drop-shadow">
                        {FALLBACK_HERO.overview}
                    </p>
                    <button
                        onClick={() => window.location.hash = '#/'}
                        className="bg-primary-container text-white px-6 md:px-10 py-3 md:py-4 rounded-lg font-bold flex items-center gap-2 md:gap-3 btn-primary active:scale-95 transition-all text-xs md:text-sm animate-glow-pulse"
                    >
                        <span className="material-symbols-outlined fill" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                        {t.hero.watchNow}
                    </button>
                </div>
            </div>
        </section>
    );
};

export const HeroBanner = ({ media }) => {
    const { toggleWatchlist, watchlist, navigateTo } = useApp();
    const { t } = useLanguage();
    const [imageFailed, setImageFailed] = useState(false);

    if (!media || !media.title || (!media.backdrop && !media.poster && !imageFailed)) {
        return <FallbackHero />;
    }

    const mediaType = media.type === 'tv' ? 'tv' : 'movie';
    const mediaId = media.id;
    const imageSrc = media.backdrop || media.poster;
    const inWatchlist = (watchlist || []).some(item => String(item.id) === String(mediaId));

    if (!mediaId) return <FallbackHero />;

    return (
        <section className="relative w-full h-[60vh] md:h-[85vh] lg:h-[90vh] overflow-hidden flex items-center">
            <div className="absolute inset-0 z-0">
                {imageSrc && !imageFailed ? (
                    <img
                        className="w-full h-full object-cover"
                        src={imageSrc}
                        alt={media.title}
                        onError={() => setImageFailed(true)}
                    />
                ) : (
                    <img
                        className="w-full h-full object-cover opacity-40"
                        src={FALLBACK_HERO.backdrop}
                        alt={media.title}
                    />
                )}
                <div className="absolute inset-0 hero-gradient"></div>
            </div>

            <div className="relative z-10 px-4 md:px-edge-margin max-w-container-max mx-auto w-full text-left">
                <div className="max-w-2xl space-y-4 md:space-y-6">
                    {media.tag && (
                        <span className="px-3 py-1.5 bg-red-600 rounded text-[10px] md:text-label-md text-white tracking-widest uppercase font-bold">
                            {media.tag}
                        </span>
                    )}

                    <h1 className="font-display-lg text-4xl md:text-6xl lg:text-display-lg font-extrabold uppercase tracking-tighter leading-none text-white drop-shadow-md">
                        {media.title}
                    </h1>

                    <p className="font-body-md md:font-body-lg text-sm md:text-body-lg text-on-surface-variant line-clamp-3 max-w-xl text-white/80 drop-shadow">
                        {media.overview || FALLBACK_HERO.overview}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-2 hero-buttons">
                        <button
                            onClick={() => navigateTo(`#/${mediaType}/${mediaId}`)}
                            className="bg-primary-container text-white px-6 md:px-10 py-3 md:py-4 rounded-lg font-bold flex items-center gap-2 md:gap-3 btn-primary active:scale-95 transition-all text-xs md:text-sm animate-glow-pulse"
                        >
                            <span className="material-symbols-outlined fill" style={{ fontVariationSettings: "'FILL' 1" }}>
                                play_arrow
                            </span>
                            {t.hero.watchNow}
                        </button>

                        <button
                            onClick={() => toggleWatchlist(mediaId, mediaType, media.poster, media.title, media.rating)}
                            className="glass-surface text-white px-6 md:px-10 py-3 md:py-4 rounded-lg font-bold flex items-center gap-2 md:gap-3 btn-glass active:scale-95 transition-all text-xs md:text-sm animate-glow-pulse-glass"
                        >
                            <span className="material-symbols-outlined">
                                {inWatchlist ? 'check' : 'add'}
                            </span>
                            {t.hero.myList}
                        </button>

                        <button
                            onClick={() => navigateTo(`#/${mediaType}/${mediaId}`)}
                            className="glass-surface text-white p-3 md:py-4 md:px-6 rounded-lg font-bold flex items-center gap-2 btn-glass active:scale-95 transition-all text-xs md:text-sm animate-glow-pulse-glass"
                        >
                            <span className="material-symbols-outlined">info</span>
                            <span className="hidden sm:inline">{t.hero.details}</span>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};
