import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupabaseDB } from '../services/db';
import { NotFlixData } from '../data/catalog';
import defaultAvatar from '../assets/netflix-profile-pictures-1000-x-1000-qo9h82134t9nv0j0.jpg';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    // Auth & User
    const [user, setUser] = useState(null);
    const [authModalOpen, setAuthModalOpen] = useState(false);

    // Data state
    const [profile, setProfile] = useState({ username: 'Guest', avatar_url: 'https://via.placeholder.com/150' });
    const [watchlist, setWatchlist] = useState([]);
    const [continueWatching, setContinueWatching] = useState([]);
    
    // UI state
    const [settings, setSettings] = useState(SupabaseDB.getSettings());
    const [notifications, setNotifications] = useState([]);
    
    // Playback state
    const [currentMedia, setCurrentMedia] = useState(null);
    const [currentSource, setCurrentSource] = useState('vidsrc'); 
    
    // Routing state
    const [currentRoute, setCurrentRoute] = useState(window.location.hash || '#/');

    // ─── INIT AUTH ───
    useEffect(() => {
        // Get initial session
        SupabaseDB.getSession().then((session) => {
            setUser(session?.user || null);
        }).catch(err => console.error("Session error:", err));

        // Listen for auth changes
        const { data: { subscription } } = SupabaseDB.onAuthStateChange((session) => {
            setUser(session?.user || null);
        });

        return () => subscription?.unsubscribe();
    }, []);

    // ─── LOAD USER DATA ───
    useEffect(() => {
        if (user) {
            SupabaseDB.getProfile(user.id, user.email).then(p => {
                if (p) setProfile(p);
            });
            SupabaseDB.getWatchlist(user.id).then(w => setWatchlist(w));
            SupabaseDB.wipeContinueWatching(user.id).then(() => {
                SupabaseDB.getContinueWatching(user.id).then(cw => setContinueWatching(cw));
            });
        } else {
            setProfile({ username: 'Guest', avatar_url: defaultAvatar });
            setWatchlist([]);
            setContinueWatching([]);
        }
    }, [user]);

    // ─── APP SHELL FX ───
    useEffect(() => {
        const handleHashChange = () => {
            setCurrentRoute(window.location.hash || '#/');
            document.getElementById('notifications-panel')?.classList.add('hidden');
            window.scrollTo(0, 0);
        };
        window.addEventListener('hashchange', handleHashChange);
        
        if (settings.lightMode) {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }

        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [settings.lightMode]);

    // ─── HELPERS ───
    const navigateTo = (hash) => {
        window.location.hash = hash;
    };

    const addNotification = (title, message, icon = "notifications") => {
        const newNotif = { id: Date.now(), icon, title, message, time: "Just now" };
        setNotifications(prev => [newNotif, ...prev]);

        const bell = document.getElementById('notification-bell-btn');
        if (bell) {
            bell.classList.add('text-primary-container', 'scale-110');
            setTimeout(() => bell.classList.remove('text-primary-container', 'scale-110'), 1000);
        }
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    // ─── ACTIONS ───
    const updateProfile = async (username, avatar_url) => {
        if (!user) return;
        try {
            const updated = await SupabaseDB.updateProfile(user.id, username, avatar_url);
            if (updated) {
                setProfile(updated);
            }
        } catch (err) {
            console.error("Failed to update profile", err);
            throw err;
        }
    };

    const toggleWatchlist = async (mediaId, mediaType = 'movie', posterPath = '', title = '', rating = null) => {
        if (!user) {
            setAuthModalOpen(true);
            return false;
        }
        try {
            console.log('toggleWatchlist RPC args:', {userId: user.id, mediaId, mediaType, posterPath, title});
            const isAdded = await SupabaseDB.toggleWatchlist(user.id, mediaId, mediaType, posterPath, title);
            // Optimistic UI update
            if (isAdded) {
                setWatchlist(prev => [{ id: mediaId.toString(), type: mediaType, poster: posterPath, title: title, rating: rating }, ...prev]);
                addNotification('Added to List', `"${title}" saved to your Watchlist.`, 'bookmark');
            } else {
                setWatchlist(prev => prev.filter(item => item.id !== mediaId.toString()));
                addNotification('Removed from List', `"${title}" removed from your Watchlist.`, 'bookmark');
            }
            // Refresh from DB to ensure rating and any missing fields are correct
            const refreshed = await SupabaseDB.getWatchlist(user.id);
            setWatchlist(refreshed);
            return isAdded;
        } catch (error) {
            console.error('toggleWatchlist failed:', error);
            addNotification('Error', 'Could not update watchlist.', 'error');
            return false;
        }
    };

    const saveProgress = async (mediaId, percent, remaining, season = null, episode = null, type = 'movie', title = '', poster = '') => {
        if (!user) return;
        try {
            console.log('Saving progress:', { userId: user.id, mediaId, mediaType: type, title, poster, percent, season, episode });
            await SupabaseDB.saveProgress(user.id, mediaId, type, title, poster, percent, season, episode);
            // Refresh continue watching after save
            const cw = await SupabaseDB.getContinueWatching(user.id);
            console.log('Refreshed continueWatching, count:', cw.length);
            setContinueWatching(cw);
        } catch (err) {
            console.error("Failed to save progress", err);
        }
    };

    // Remove a single item from Continue Watching list
    const removeFromContinueWatching = async (mediaId) => {
        if (!user) return;
        try {
            // Attempt to delete from DB (if supported)
            await SupabaseDB.removeContinueWatchingItem(user.id, mediaId);
        } catch (e) {
            console.error('Error removing from Continue Watching:', e);
        }
        // Update UI state
        setContinueWatching(prev => prev.filter(item => item.id !== mediaId.toString()));
    };
    
    const playMedia = (media) => {
        setCurrentMedia(media);
        if (user) {
            saveProgress(
                media.id,
                0,
                null,
                null,
                null,
                media.type || 'movie',
                media.title,
                media.poster || media.backdrop
            );
        }
    };

    const closePlayer = () => {
        setCurrentMedia(null);
    };

    const updateSettings = (newSettings) => {
        const updated = SupabaseDB.saveSettings(newSettings);
        setSettings(updated);
        return updated;
    };

    return (
        <AppContext.Provider value={{
            user,
            profile,
            watchlist,
            continueWatching,
            settings,
            notifications,
            currentMedia,
            currentSource,
            currentRoute,
            authModalOpen,
            setAuthModalOpen,
            navigateTo,
            updateProfile,
            toggleWatchlist,
            saveProgress,
            addNotification,
            updateSettings,
            playMedia,
            closePlayer,
            removeFromContinueWatching,
            setCurrentSource,
            clearNotifications
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
export default AppContext;
