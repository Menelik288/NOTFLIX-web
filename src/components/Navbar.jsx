import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../hooks/useLanguage';
import { TMDBService, normalizeListResponse } from '../services/tmdb';
import debounce from 'lodash/debounce';

const HighlightText = ({ text, highlight }) => {
    if (!highlight || !highlight.trim()) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
        <span>
            {parts.map((part, i) => 
                part.toLowerCase() === highlight.toLowerCase() 
                    ? <span key={i} className="text-red-500 font-bold">{part}</span> 
                    : <span key={i}>{part}</span>
            )}
        </span>
    );
};

export const Navbar = () => {
    const { 
        profile, 
        user,
        setAuthModalOpen,
        notifications, 
        clearNotifications, 
        currentRoute, 
        navigateTo 
    } = useApp();
    const { t, language, changeLanguage } = useLanguage();
    
    const [searchVal, setSearchVal] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationsRef = useRef(null);

    // Autocomplete state
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchContainerRef = useRef(null);

    // Sync search input if hash changes
    useEffect(() => {
        if (!currentRoute.startsWith('#/search')) {
            setSearchVal('');
            setIsSearchExpanded(false);
        } else {
            const queryParams = new URLSearchParams(currentRoute.split('?')[1] || '');
            const q = queryParams.get('q');
            if (q) {
                setSearchVal(q);
                setIsSearchExpanded(true);
            }
        }
    }, [currentRoute]);

    // Close panels on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
                setShowNotifications(false);
            }
            if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
                setShowSuggestions(false);
                // Collapse if empty and clicked outside
                if (!document.getElementById('navbar-search-input')?.value) {
                    setIsSearchExpanded(false);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced fetch for suggestions
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const fetchSuggestions = useCallback(
        debounce(async (q) => {
            if (q.length < 2) {
                setSuggestions([]);
                return;
            }
            setIsSearching(true);
            try {
                const results = normalizeListResponse(await TMDBService.searchMedia(q, { type: 'all' }));
                const filtered = results.filter(item => !(item.title || '').toLowerCase().includes('ai'));
                setSuggestions(filtered.slice(0, 8));
            } catch (error) {
                console.error(error);
            } finally {
                setIsSearching(false);
            }
        }, 400),
        []
    );

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchVal(val);
        setShowSuggestions(true);
        fetchSuggestions(val);
    };

    const handleSearchSubmit = (e) => {
        if (e.key === 'Enter') {
            setShowSuggestions(false);
            const query = searchVal.trim();
            if (query) {
                navigateTo(`#/search?q=${encodeURIComponent(query)}`);
            } else {
                navigateTo('#/search');
            }
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
            if (!searchVal) setIsSearchExpanded(false);
        }
    };

    const isLinkActive = (routeKey) => {
        const cleanPath = currentRoute.replace('#', '') || '/';
        if (routeKey === 'home') return cleanPath === '/' || cleanPath.startsWith('/movie/') || cleanPath.startsWith('/tv/');
        return cleanPath.startsWith(`/${routeKey}`);
    };

    return (
        <>
            {/* Desktop / Tablet Navigation Header */}
            <header className="sticky top-0 w-full z-40 bg-black/30 backdrop-blur-2xl border-b border-white/10 shadow-2xl transition-all duration-300">
                <nav className="flex justify-between items-center px-4 md:px-edge-margin h-20 max-w-container-max mx-auto">
                    <div className="flex items-center gap-6 md:gap-12">
                        <a className="logo-pixel text-3xl md:text-4xl cursor-pointer logo-glow" onClick={() => navigateTo('#/')}>
                            NOTFLIX
                        </a>
                        {/* Desktop Links */}
                        <div className="hidden md:flex items-center gap-6 lg:gap-8 nav-links">
                            <button onClick={() => navigateTo('#/')} className={`nav-pixel-link pb-1 text-sm lg:text-base ${isLinkActive('home') ? 'active-link' : 'text-white/70 hover:text-white'}`}>{t.nav.home}</button>
                            <button onClick={() => navigateTo('#/movies')} className={`nav-pixel-link pb-1 text-sm lg:text-base ${isLinkActive('movies') ? 'active-link' : 'text-white/70 hover:text-white'}`}>{t.nav.movies}</button>
                            <button onClick={() => navigateTo('#/for-you')} className={`nav-pixel-link pb-1 text-sm lg:text-base ${isLinkActive('for-you') ? 'active-link' : 'text-white/70 hover:text-white'}`}>{t.nav.forYou}</button>
                            <button onClick={() => navigateTo('#/tv')} className={`nav-pixel-link pb-1 text-sm lg:text-base ${isLinkActive('tv') ? 'active-link' : 'text-white/70 hover:text-white'}`}>{t.nav.tv}</button>
                            <button onClick={() => navigateTo('#/watchlist')} className={`nav-pixel-link pb-1 text-sm lg:text-base ${isLinkActive('watchlist') ? 'active-link' : 'text-white/70 hover:text-white'}`}>{t.nav.watchlist}</button>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 md:gap-6">
                        {/* Expandable Search Bar with Autocomplete */}
                        <div className="relative flex items-center" ref={searchContainerRef}>
                            <div className={`flex items-center transition-all duration-300 overflow-hidden ${isSearchExpanded || searchVal ? 'w-48 md:w-64 bg-black/40 border border-white/10 rounded-full px-3 py-1.5 focus-within:border-primary-container focus-within:ring-1 focus-within:ring-primary-container' : 'w-8 md:w-6 bg-transparent border-transparent'}`}>
                                <button 
                                    className="text-on-surface-variant hover:text-white flex items-center justify-center transition-colors shrink-0"
                                    onClick={() => {
                                        if (!isSearchExpanded) {
                                            setIsSearchExpanded(true);
                                            setTimeout(() => document.getElementById('navbar-search-input')?.focus(), 100);
                                        } else if (!searchVal) {
                                            setIsSearchExpanded(false);
                                        } else {
                                            navigateTo(`#/search?q=${encodeURIComponent(searchVal)}`);
                                        }
                                    }}
                                    title={t.nav.search}
                                >
                                    <span className="material-symbols-outlined text-[28px] md:text-[24px]">search</span>
                                </button>
                                
                                <input
                                    id="navbar-search-input"
                                    type="text"
                                    value={searchVal}
                                    onChange={handleSearchChange}
                                    onKeyDown={handleSearchSubmit}
                                    placeholder={t.nav.search || "Titles, people, genres"}
                                    className={`bg-transparent border-none outline-none text-sm text-white w-full placeholder-white/40 ml-2 transition-opacity duration-300 ${isSearchExpanded || searchVal ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                                />
                                {(isSearchExpanded || searchVal) && (
                                    <div className="flex items-center shrink-0 ml-1">
                                        {searchVal && (
                                            <button 
                                                onClick={() => { setSearchVal(''); setSuggestions([]); document.getElementById('navbar-search-input')?.focus(); }} 
                                                className="text-white/50 hover:text-white flex items-center p-1 transition-colors"
                                                title="Clear search"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">close</span>
                                            </button>
                                        )}
                                        <div className="w-px h-4 bg-white/20 mx-1"></div>
                                        <button 
                                            onClick={() => {
                                                setShowSuggestions(false);
                                                setIsSearchExpanded(false);
                                                navigateTo(`#/search${searchVal ? `?q=${encodeURIComponent(searchVal)}` : ''}`);
                                            }}
                                            className="text-white/50 hover:text-white flex items-center p-1 transition-colors"
                                            title="Advanced Search & Filters"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">tune</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Autocomplete Dropdown */}
                            {showSuggestions && searchVal.length >= 2 && (
                                <div className="absolute top-full mt-4 right-0 md:right-auto md:left-0 w-[85vw] max-w-[350px] max-h-[450px] overflow-y-auto glass-surface rounded-xl shadow-2xl z-50 animate-fade-in border border-white/10 custom-scrollbar">
                                    {isSearching ? (
                                        <div className="flex justify-center items-center py-8">
                                            <div className="w-8 h-8 border-[3px] border-white/20 border-t-primary-container rounded-full animate-spin"></div>
                                        </div>
                                    ) : suggestions.length > 0 ? (
                                        <div className="flex flex-col">
                                            {suggestions.map(item => (
                                                <div 
                                                    key={item.id}
                                                    className="flex items-center gap-3 p-3 hover:bg-white/10 cursor-pointer transition-colors border-b border-white/5 last:border-0 group" 
                                                    onClick={() => { 
                                                        setShowSuggestions(false); 
                                                        setIsSearchExpanded(false);
                                                        setSearchVal('');
                                                        navigateTo(`#/${item.type}/${item.id}`); 
                                                    }}
                                                >
                                                    <img 
                                                        src={item.poster} 
                                                        alt={item.title} 
                                                        className="w-10 h-14 md:w-12 md:h-16 object-cover rounded shadow-md group-hover:scale-105 transition-transform" 
                                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/48x64?text=No+Img' }} 
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm md:text-base font-bold text-white truncate"><HighlightText text={item.title} highlight={searchVal} /></h4>
                                                        <div className="flex items-center gap-2 text-[10px] md:text-[11px] text-white/50 mt-1">
                                                            <span className="uppercase font-semibold text-red-500/80">{item.type}</span>
                                                            {item.year && <span>• {item.year}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <button 
                                                className="p-3 text-center text-xs font-bold text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                                                onClick={() => {
                                                    setShowSuggestions(false);
                                                    navigateTo(`#/search?q=${encodeURIComponent(searchVal)}`);
                                                }}
                                            >
                                                See all results for "{searchVal}"
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center px-4">
                                            <span className="material-symbols-outlined text-3xl text-white/20 mb-2">search_off</span>
                                            <p className="text-white/50 text-sm">No results found for "{searchVal}"</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        {/* Notification Panel */}
                        <div className="relative" ref={notificationsRef}>
                            <button 
                                id="notification-bell-btn" 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="text-on-surface-variant hover:text-white transition-all cursor-pointer flex items-center relative"
                            >
                                <span className="material-symbols-outlined">notifications</span>
                                {notifications.length > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-primary-container text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                                        {notifications.length}
                                    </span>
                                )}
                            </button>
                            {/* Notification List */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-3 w-80 glass-surface rounded-xl shadow-2xl p-4 z-50 animate-fade-in text-left">
                                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/10">
                                        <h4 className="font-bold text-white text-xs">{t.nav.notifications}</h4>
                                        {notifications.length > 0 && (
                                            <button onClick={clearNotifications} className="text-[10px] text-primary-container hover:underline">{t.nav.clearAll}</button>
                                        )}
                                    </div>
                                    <div className="space-y-3 max-h-60 overflow-y-auto hide-scrollbar">
                                        {notifications.length === 0 ? (
                                            <div className="text-on-surface-variant py-4 text-center text-xs">{t.nav.noNotifications}</div>
                                        ) : (
                                            notifications.map(n => (
                                                <div key={n.id} className="flex gap-3 items-start p-1.5 rounded hover:bg-white/5 transition-colors cursor-pointer text-xs">
                                                    <span className="material-symbols-outlined text-primary-container bg-primary-container/10 p-1.5 rounded-lg text-sm">{n.icon}</span>
                                                    <div className="flex-grow">
                                                        <h5 className="font-bold text-white text-[11px]">{n.title}</h5>
                                                        <p className="text-white/70 mt-0.5 text-[10px] leading-tight">{n.message}</p>
                                                        <span className="text-[8px] text-white/40 block mt-1">{n.time}</span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Profile or Sign In Link */}
                        {user ? (
                            <button onClick={() => navigateTo('#/profile')} className="flex items-center">
                                <img 
                                    alt="User profile avatar" 
                                    className="w-8 h-8 md:w-10 md:h-10 rounded-lg border border-white/20 object-cover cursor-pointer hover:border-primary-container transition-all" 
                                    src={profile?.avatar_url || 'https://via.placeholder.com/150'}
                                />
                            </button>
                        ) : (
                            <button 
                                onClick={() => setAuthModalOpen(true)}
                                className="text-xs md:text-sm font-bold bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-all text-white"
                            >
                                {t.nav.signIn}
                            </button>
                        )}
                        
                        {/* Settings Button */}
                        <button className="hidden md:flex items-center text-on-surface-variant hover:text-white transition-all cursor-pointer" onClick={() => navigateTo('#/settings')}>
                            <span className="material-symbols-outlined">settings</span>
                        </button>
                    </div>
                </nav>
            </header>

            {/* Mobile Bottom Navigation Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/40 backdrop-blur-2xl border-t border-white/10 shadow-2xl">
                <div className="flex justify-around items-end h-16 px-2 pb-1 relative">
                    <button 
                        onClick={() => navigateTo('#/')} 
                        className={`flex flex-col items-center justify-center transition-all text-xs w-14 mobile-nav-item ${isLinkActive('home') ? 'text-primary-container' : 'text-on-surface-variant'}`}
                    >
                        <span className="material-symbols-outlined">home</span>
                        <span className="nav-pixel-link text-[10px] mt-0.5">{t.nav.home}</span>
                    </button>
                    <button 
                        onClick={() => navigateTo('#/movies')} 
                        className={`flex flex-col items-center justify-center transition-all text-xs w-14 mobile-nav-item ${isLinkActive('movies') ? 'text-primary-container' : 'text-on-surface-variant'}`}
                    >
                        <span className="material-symbols-outlined">movie</span>
                        <span className="nav-pixel-link text-[10px] mt-0.5">{t.nav.movies}</span>
                    </button>
                    {/* Emphasized raised tab */}
                    <div className="relative -top-5 flex flex-col items-center justify-center w-16">
                        <div className={`absolute w-14 h-14 rounded-full bg-gradient-to-tr shadow-lg flex items-center justify-center border-4 border-[#0D0D0D] cursor-pointer hover:scale-105 active:scale-95 transition-all ${isLinkActive('for-you') ? 'mobile-raised-active from-primary-container to-red-500 shadow-primary-container/40' : 'from-surface-container to-surface border-white/10 shadow-black/40'}`}>
                            <button className="flex items-center justify-center text-white w-full h-full" onClick={() => navigateTo('#/for-you')}>
                                <span className="material-symbols-outlined text-2xl font-bold">star</span>
                            </button>
                        </div>
                        <span className="nav-pixel-link text-[10px] mt-11 text-white tracking-wider">{t.nav.forYou}</span>
                    </div>
                    <button 
                        onClick={() => navigateTo('#/tv')} 
                        className={`flex flex-col items-center justify-center transition-all text-xs w-14 mobile-nav-item ${isLinkActive('tv') ? 'text-primary-container' : 'text-on-surface-variant'}`}
                    >
                        <span className="material-symbols-outlined">tv</span>
                        <span className="nav-pixel-link text-[10px] mt-0.5">{t.nav.tv}</span>
                    </button>
                    <button 
                        onClick={() => navigateTo('#/watchlist')} 
                        className={`flex flex-col items-center justify-center transition-all text-xs w-14 mobile-nav-item ${isLinkActive('watchlist') ? 'text-primary-container' : 'text-on-surface-variant'}`}
                    >
                        <span className="material-symbols-outlined">bookmark</span>
                        <span className="nav-pixel-link text-[10px] mt-0.5">{t.nav.watchlist}</span>
                    </button>
                </div>
            </div>
        </>
    );
};
