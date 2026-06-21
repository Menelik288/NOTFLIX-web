import { supabase, supabaseAnon } from './supabaseClient';
import defaultAvatar from '../assets/netflix-profile-pictures-1000-x-1000-qo9h82134t9nv0j0.jpg';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';
export const SupabaseDB = {
    // ════════ AUTHENTICATION ════════

    signUp: async (email, password) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });
        if (error) throw error;
        return data;
    },

    signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        return data;
    },

    signOut: async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (error) {
            console.error("SignOut network error, forcing local clear:", error);
        } finally {
            // Force clear local storage to guarantee sign out regardless of network blocks
            localStorage.removeItem('supabase-auth-token');
            window.location.href = '#/';
            window.location.reload();
        }
    },

    getSession: async () => {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        return session;
    },

    onAuthStateChange: (callback) => {
        return supabase.auth.onAuthStateChange((event, session) => {
            callback(session);
        });
    },

    // ════════ PROFILES ════════

    getProfile: async (userId, email = '') => {
        if (!userId) return null;
        const { data, error } = await supabaseAnon
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
            
        if (error && error.code !== 'PGRST116') {
            console.error("Error fetching profile:", error);
            return null;
        }
        
        let defaultUsername = 'User';
        if (email) {
            const prefix = email.split('@')[0];
            const parts = prefix.split(/[.\-_]/);
            if (parts.length > 1 && parts[0] && parts[1]) {
                defaultUsername = (parts[0][0] + parts[1][0]).toUpperCase();
            } else if (prefix.length >= 2) {
                defaultUsername = prefix.substring(0, 2).toUpperCase();
            } else {
                defaultUsername = prefix.toUpperCase();
            }
        }
        
        const profile = data || { id: userId, username: defaultUsername, avatar_url: defaultAvatar };
        if (!profile.avatar_url) {
            profile.avatar_url = defaultAvatar;
        }
        if (!profile.username || profile.username === 'Anonymous') {
            profile.username = defaultUsername;
        }
        return profile;
    },

    updateProfile: async (userId, username, avatar_url) => {
        if (!userId) return null;
        const { data, error } = await supabaseAnon.rpc('update_user_profile', {
            p_user_id: userId,
            p_username: username,
            p_avatar_url: avatar_url
        });
            
        if (error) throw error;
        // The RPC returns an array because of SETOF, we return the first element
        return data && data.length > 0 ? data[0] : null;
    },

    // ════════ WATCHLIST ════════

    getWatchlist: async (userId) => {
        if (!userId) return [];
        const { data, error } = await supabaseAnon.rpc('get_my_watchlist', { u_id: userId });
        if (error) {
            console.error("Error fetching watchlist:", error);
            return [];
        }
        // Return full items to render in Watchlist page
        // Return full items to render in Watchlist page, including rating
        return data.map(item => ({
            id: item.media_id.toString(),
            type: item.media_type,
            poster: item.poster_path,
            title: item.title,
            rating: item.rating
        }));
    },

    toggleWatchlist: async (userId, mediaId, mediaType, posterPath, title) => {
        if (!userId) return false;
        console.log('toggleWatchlist RPC args:', { u_id: userId, m_id: parseInt(mediaId), m_type: mediaType, p_path: posterPath || '', t_title: title || 'Unknown Title' });
  const { data, error } = await supabaseAnon.rpc('toggle_watchlist_item', {
    u_id: userId,
    m_id: parseInt(mediaId),
    m_type: mediaType,
    p_path: posterPath || '',
    t_title: title || 'Unknown Title'
  });
  if (error) {
    console.error("Error toggling watchlist:", error);
    throw error;
  }
  // The RPC may return the string 'added'/'removed' or a boolean true/false.
  return data === 'added' || data === true;

    },

    isInWatchlist: async (userId, mediaId, mediaType) => {
        if (!userId) return false;
        const { data, error } = await supabaseAnon.rpc('is_in_watchlist', {
            u_id: userId,
            m_id: parseInt(mediaId),
            m_type: mediaType
        });
        if (error) return false;
        return data;
    },

    // ════════ CONTINUE WATCHING CLEANUP ════════
    wipeContinueWatching: async (userId) => {
        if (!userId) return [];
        const { error } = await supabaseAnon.from('continue_watching').delete().eq('user_id', userId);
        if (error) {
            console.error("Error wiping continue watching:", error);
        }
    },

    wipeUserData: async (userId) => {
        if (!userId) return;
        try {
            await Promise.all([
                supabaseAnon.from('continue_watching').delete().eq('user_id', userId),
                supabaseAnon.from('watchlist').delete().eq('user_id', userId),
                supabaseAnon.from('media_comments').delete().eq('user_id', userId),
                supabaseAnon.from('profiles').delete().eq('id', userId)
            ]);
            await SupabaseDB.signOut();
        } catch (e) {
            console.error("Error wiping user data:", e);
            await SupabaseDB.signOut();
        }
    },

    getContinueWatching: async (userId) => {
        if (!userId) return [];
        const { data, error } = await supabaseAnon.rpc('get_my_continue_watching', { u_id: userId });
        if (error) {
            console.error("Error fetching continue watching:", error);
            return [];
        }
        return data.map(item => ({
            id: item.media_id.toString(),
            type: item.media_type,
            // Use backdrop_path if available, otherwise fallback to poster_path
            backdrop: (item.backdrop_path || item.poster_path) ? `${IMAGE_BASE_URL}${item.backdrop_path || item.poster_path}` : null,
            title: item.title || item.t_title || item.name || 'Untitled Title',
            percent: typeof item.progress === 'number'
                ? (item.progress > 1 ? item.progress : Math.round(item.progress * 100))
                : 0,
            
            season: item.season_number,
            episode: item.episode_number,
            lastWatched: item.last_watched
        }));
    },

    saveProgress: async (userId, mediaId, mediaType, title, posterPath, progress, season = null, episode = null) => {
        if (!userId) return;
        const { error } = await supabaseAnon.rpc('save_watch_progress', {
            u_id: userId,
            m_id: parseInt(mediaId),
            m_type: mediaType,
            t_title: title,
            p_path: posterPath || '',
            p_progress: progress,
            s_num: season,
            e_num: episode
        });
        if (error) {
            console.error("Error saving progress:", error);
        }
    },

    // Remove an item from Continue Watching
    removeContinueWatchingItem: async (userId, mediaId) => {
        if (!userId) return;
        const { error } = await supabaseAnon.rpc('remove_watch_progress', {
            p_user_id: userId,
            p_media_id: parseInt(mediaId)
        });
        if (error) {
            console.error('Error removing from Continue Watching:', error);
        }
    },

    getMediaReviews: async (mediaId) => {
        // Query via RPC using supabaseAnon to avoid auth headers which might be triggering local antivirus
        const { data, error } = await supabaseAnon.rpc('fetch_media_comments', {
            p_media_id: parseInt(mediaId)
        });
            
        if (error) {
            console.error("Error fetching feedback:", error);
            return [];
        }
        return (data || []).map((review) => ({
            id: review.id,
            user_id: review.user_id,
            rating: review.rating,
            comment: review.comment ?? review.content,
            timestamp: review.timestamp ?? review.created_at,
            username: review.username,
            avatar: review.avatar ?? review.avatar_url
        }));
    },

    submitReview: async (userId, mediaId, rating, content) => {
        if (!userId) return { success: false, error: 'No user' };
        
        // Insert via RPC using supabaseAnon to avoid auth headers triggering local antivirus
        const { error: insertError } = await supabaseAnon.rpc('add_media_comment', {
            p_user_id: userId,
            p_media_id: parseInt(mediaId),
            p_rating: rating,
            p_comment: content
        });
        
        if (insertError) {
            console.error("Insert media_comments failed:", insertError);
            return { success: false, error: insertError };
        }
        
        return { success: true };
    },

    // ════════ SETTINGS ════════
    // Keep settings in local storage as they are device-specific preferences
    getSettings: () => {
        try {
            const saved = localStorage.getItem('notflix_settings');
            const parsed = saved ? JSON.parse(saved) : null;
            return parsed && typeof parsed === 'object' ? parsed : {
                autoPlayVideo: true,
                highQuality: true,
                lightMode: false,
                notifications: true
            };
        } catch (error) {
            console.error('Error reading settings cache:', error);
            localStorage.removeItem('notflix_settings');
            return {
                autoPlayVideo: true,
                highQuality: true,
                lightMode: false,
                notifications: true
            };
        }
    },

    saveSettings: (settings) => {
        localStorage.setItem('notflix_settings', JSON.stringify(settings));
        return settings;
    }
};
