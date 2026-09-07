import React from 'react';

/**
 * Base Primitive Skeleton Component
 * Hardware-accelerated GPU shimmer with zero layout shifts.
 */
export const Skeleton = ({
    className = '',
    variant = 'rect', // 'rect' | 'circle' | 'text' | 'pill'
    style = {},
    ...props
}) => {
    let variantStyles = 'rounded-lg';
    if (variant === 'circle') variantStyles = 'rounded-full';
    if (variant === 'pill') variantStyles = 'rounded-full';
    if (variant === 'text') variantStyles = 'rounded h-4 my-1';

    return (
        <div
            className={`skeleton-shimmer ${variantStyles} ${className}`}
            style={style}
            aria-hidden="true"
            {...props}
        />
    );
};

/**
 * Hero Banner Skeleton (Home, Movies, Series)
 * Matches exact aspect ratio and position of HeroBanner.jsx
 */
export const HeroSkeleton = () => {
    return (
        <section className="relative w-full h-[60vh] md:h-[85vh] lg:h-[90vh] overflow-hidden flex items-center bg-black/40">
            {/* Subtle background ambient glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent z-10" />

            <div className="relative z-20 px-4 md:px-edge-margin max-w-container-max mx-auto w-full text-left">
                <div className="max-w-2xl space-y-4 md:space-y-6">
                    {/* Category Tag Pill */}
                    <Skeleton className="w-28 h-6 rounded" />

                    {/* Title Placeholder */}
                    <div className="space-y-3">
                        <Skeleton className="w-4/5 h-10 md:h-14 lg:h-16 rounded-xl" />
                        <Skeleton className="w-3/5 h-10 md:h-14 lg:h-16 rounded-xl" />
                    </div>

                    {/* Description Paragraph */}
                    <div className="space-y-2 pt-2 max-w-xl">
                        <Skeleton className="w-full h-4 rounded" />
                        <Skeleton className="w-11/12 h-4 rounded" />
                        <Skeleton className="w-4/6 h-4 rounded" />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3 md:gap-4 pt-2">
                        <Skeleton className="w-36 md:w-44 h-11 md:h-14 rounded-lg" />
                        <Skeleton className="w-32 md:w-36 h-11 md:h-14 rounded-lg" />
                    </div>
                </div>
            </div>
        </section>
    );
};

/**
 * Media Card Skeleton (Single Poster Card)
 */
export const MediaCardSkeleton = ({ aspect = 'poster', className = '' }) => {
    const isPoster = aspect === 'poster';
    return (
        <div className={`relative rounded-xl overflow-hidden glass-surface border border-white/5 ${className}`}>
            <Skeleton className={`w-full ${isPoster ? 'aspect-[2/3]' : 'aspect-video'} rounded-xl`} />
        </div>
    );
};

/**
 * Media Row Carousel Skeleton
 * Matches MediaRow.jsx horizontal scrolling layout
 */
export const MediaRowSkeleton = ({ title = true, count = 6, type = 'poster' }) => {
    return (
        <section className="space-y-3 text-left">
            {title && (
                <div className="flex justify-between items-center px-1">
                    <Skeleton className="w-44 md:w-64 h-7 rounded-md" />
                </div>
            )}
            <div className="flex gap-4 md:gap-6 overflow-hidden pb-4">
                {Array.from({ length: count }).map((_, idx) => (
                    <div
                        key={idx}
                        className={`flex-none ${
                            type === 'progress' ? 'w-44 md:w-56 lg:w-60' : 'w-36 sm:w-44 md:w-52 lg:w-56'
                        }`}
                    >
                        <MediaCardSkeleton aspect={type === 'backdrop' ? 'backdrop' : 'poster'} />
                        {type === 'progress' && (
                            <div className="mt-2 space-y-1.5 px-1">
                                <Skeleton className="w-3/4 h-3.5 rounded" />
                                <Skeleton className="w-1/2 h-2.5 rounded" />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
};

/**
 * Responsive Media Grid Skeleton (2 to 6 columns)
 * Used across Search, TVShows, Watchlist, ViewingHistory
 */
export const MediaGridSkeleton = ({ count = 12 }) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-gutter">
            {Array.from({ length: count }).map((_, idx) => (
                <div key={idx} className="space-y-2">
                    <MediaCardSkeleton aspect="poster" />
                    <div className="space-y-1.5 px-1 pt-1">
                        <Skeleton className="w-4/5 h-3.5 rounded" />
                        <div className="flex items-center gap-2">
                            <Skeleton className="w-8 h-3 rounded" />
                            <Skeleton className="w-10 h-3 rounded" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

/**
 * Episode Card Skeleton for TV Series
 */
export const EpisodeCardSkeleton = () => {
    return (
        <div className="flex-shrink-0 w-[260px] md:w-[300px] rounded-xl overflow-hidden border border-white/10 glass-surface">
            {/* Thumbnail */}
            <Skeleton className="w-full aspect-video" />
            {/* Info */}
            <div className="p-3 bg-white/[0.02] space-y-2">
                <Skeleton className="w-3/4 h-4 rounded" />
                <Skeleton className="w-1/3 h-3 rounded" />
                <div className="space-y-1 pt-1">
                    <Skeleton className="w-full h-2.5 rounded" />
                    <Skeleton className="w-4/5 h-2.5 rounded" />
                </div>
            </div>
        </div>
    );
};

/**
 * Episode List Skeleton
 */
export const EpisodeListSkeleton = ({ count = 5 }) => {
    return (
        <div className="flex gap-4 overflow-hidden pb-4">
            {Array.from({ length: count }).map((_, idx) => (
                <EpisodeCardSkeleton key={idx} />
            ))}
        </div>
    );
};

/**
 * Actor Credits Filmography Skeleton
 */
export const ActorCreditsSkeleton = ({ count = 6 }) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: count }).map((_, idx) => (
                <div key={idx} className="space-y-2">
                    <Skeleton className="w-full aspect-[2/3] rounded-xl" />
                    <Skeleton className="w-3/4 h-3.5 rounded" />
                    <Skeleton className="w-1/2 h-2.5 rounded" />
                </div>
            ))}
        </div>
    );
};

/**
 * Details Page Skeleton
 * Replaces old "Loading Cinematic Experience..." screen with rich zero-shift skeleton
 */
export const DetailsPageSkeleton = () => {
    return (
        <div className="w-full pb-20 text-left bg-background relative animate-fade-in">
            {/* Hero Backdrop Section */}
            <section className="relative w-full h-[55vh] md:h-[620px] overflow-hidden flex items-end">
                <div className="absolute inset-0 bg-white/[0.02]">
                    <div className="absolute inset-0 vignette-left z-10" />
                    <div className="absolute inset-0 vignette-bottom z-10" />
                </div>

                {/* Hero Glass Info Box */}
                <div className="relative z-20 w-full px-4 md:px-edge-margin pb-8 md:pb-16 max-w-container-max mx-auto">
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-lg p-5 md:p-8 rounded-xl max-w-xl space-y-4">
                        {/* Tag & Rating */}
                        <div className="flex items-center gap-3">
                            <Skeleton className="w-20 h-5 rounded" />
                            <Skeleton className="w-14 h-5 rounded-full" />
                        </div>

                        {/* Title */}
                        <Skeleton className="w-4/5 h-8 md:h-12 rounded-lg" />

                        {/* Metadata Pills */}
                        <div className="flex flex-wrap items-center gap-3 py-1">
                            <Skeleton className="w-16 h-4 rounded" />
                            <Skeleton className="w-16 h-4 rounded" />
                            <Skeleton className="w-14 h-5 rounded-md" />
                            <Skeleton className="w-14 h-5 rounded-md" />
                        </div>

                        {/* Overview Lines */}
                        <div className="space-y-2 pt-1">
                            <Skeleton className="w-full h-3.5 rounded" />
                            <Skeleton className="w-11/12 h-3.5 rounded" />
                            <Skeleton className="w-4/5 h-3.5 rounded" />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                            <Skeleton className="w-36 h-12 rounded-lg" />
                            <Skeleton className="w-36 h-12 rounded-lg" />
                            <Skeleton className="w-12 h-12 rounded-lg" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Body */}
            <div className="px-4 md:px-edge-margin py-8 max-w-container-max mx-auto space-y-12">
                {/* Tabs Bar Skeleton */}
                <div className="flex gap-4 border-b border-white/10 pb-3">
                    <Skeleton className="w-24 h-8 rounded-lg" />
                    <Skeleton className="w-28 h-8 rounded-lg" />
                    <Skeleton className="w-32 h-8 rounded-lg" />
                    <Skeleton className="w-24 h-8 rounded-lg" />
                </div>

                {/* Cast Avatars Row Skeleton */}
                <div className="space-y-4">
                    <Skeleton className="w-36 h-6 rounded" />
                    <div className="flex gap-4 overflow-hidden">
                        {Array.from({ length: 6 }).map((_, idx) => (
                            <div key={idx} className="flex-none flex flex-col items-center space-y-2 w-20">
                                <Skeleton variant="circle" className="w-16 h-16" />
                                <Skeleton className="w-14 h-3 rounded" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recommended Carousel Skeleton */}
                <MediaRowSkeleton title={true} count={6} />
            </div>
        </div>
    );
};

/**
 * For You Feed Skeleton
 */
export const ForYouSkeleton = () => {
    return (
        <div className="w-full min-h-screen bg-black pt-24 pb-12 px-4 flex flex-col items-center relative animate-fade-in">
            <div className="w-full max-w-[1550px] mx-auto flex flex-col xl:flex-row items-center justify-center gap-6 px-2">
                {/* Left Sidebar Ad Skeleton (Desktop) */}
                <aside className="hidden xl:flex flex-col w-72 shrink-0 space-y-4">
                    <div className="glass-panel p-4 rounded-3xl border border-white/10 bg-white/[0.02] space-y-3">
                        <Skeleton className="w-24 h-4 rounded" />
                        <Skeleton className="w-full aspect-[4/3] rounded-2xl" />
                        <Skeleton className="w-3/4 h-4 rounded" />
                    </div>
                </aside>

                {/* Main Feed Card Skeleton */}
                <div className="relative w-full max-w-[450px] md:max-w-3xl flex-1 flex items-center justify-center">
                    <div className="w-full aspect-[9/16] md:aspect-[16/10] max-h-[85vh] md:h-[82vh] relative rounded-3xl border border-white/10 bg-black/60 overflow-hidden shadow-2xl p-6 flex flex-col justify-between">
                        {/* Top tag */}
                        <div className="flex justify-between items-center">
                            <Skeleton className="w-24 h-6 rounded-full" />
                            <Skeleton variant="circle" className="w-9 h-9" />
                        </div>

                        {/* Bottom Overlay & Right Action Buttons */}
                        <div className="flex items-end justify-between gap-4">
                            <div className="space-y-3 flex-1 max-w-md">
                                <Skeleton className="w-3/4 h-7 rounded-lg" />
                                <div className="space-y-1.5">
                                    <Skeleton className="w-full h-3.5 rounded" />
                                    <Skeleton className="w-4/5 h-3.5 rounded" />
                                </div>
                                <div className="flex gap-2 pt-1">
                                    <Skeleton className="w-28 h-9 rounded-lg" />
                                    <Skeleton className="w-24 h-9 rounded-lg" />
                                </div>
                            </div>

                            {/* Right action pills */}
                            <div className="flex flex-col gap-3">
                                <Skeleton variant="circle" className="w-11 h-11" />
                                <Skeleton variant="circle" className="w-11 h-11" />
                                <Skeleton variant="circle" className="w-11 h-11" />
                                <Skeleton variant="circle" className="w-11 h-11" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Full Page Skeletons
 */
export const HomePageSkeleton = () => {
    return (
        <div className="w-full pb-16 animate-fade-in">
            <HeroSkeleton />
            <div className="space-y-section-gap relative z-20 -mt-10 md:-mt-20 px-4 md:px-edge-margin max-w-container-max mx-auto">
                <MediaRowSkeleton title={true} count={6} />
                <MediaRowSkeleton title={true} count={6} />
                <MediaRowSkeleton title={true} count={6} />
            </div>
        </div>
    );
};

export const MoviesPageSkeleton = () => {
    return (
        <div className="w-full pb-16 animate-fade-in">
            <HeroSkeleton />
            <div className="space-y-section-gap relative z-20 -mt-10 md:-mt-20 px-4 md:px-edge-margin max-w-container-max mx-auto">
                <MediaRowSkeleton title={true} count={6} />
                <MediaRowSkeleton title={true} count={6} />
                <MediaRowSkeleton title={true} count={6} />
            </div>
        </div>
    );
};

export const SeriesPageSkeleton = () => {
    return (
        <div className="w-full pb-16 animate-fade-in">
            <HeroSkeleton />
            <div className="space-y-section-gap relative z-20 -mt-10 md:-mt-20 px-4 md:px-edge-margin max-w-container-max mx-auto">
                <MediaRowSkeleton title={true} count={6} />
                <MediaRowSkeleton title={true} count={6} />
                <MediaRowSkeleton title={true} count={6} />
            </div>
        </div>
    );
};

export const GridPageSkeleton = ({ title = '', subtitle = '' }) => {
    return (
        <div className="px-4 md:px-edge-margin py-28 max-w-container-max mx-auto space-y-8 text-left min-h-[80vh] animate-fade-in">
            <div className="space-y-2">
                {title ? (
                    <h1 className="text-3xl md:text-headline-lg font-extrabold text-white">{title}</h1>
                ) : (
                    <Skeleton className="w-48 h-8 rounded-lg" />
                )}
                {subtitle ? (
                    <p className="text-white/50 text-xs md:text-sm">{subtitle}</p>
                ) : (
                    <Skeleton className="w-64 h-4 rounded" />
                )}
            </div>
            <MediaGridSkeleton count={12} />
        </div>
    );
};

export default Skeleton;
