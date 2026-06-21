import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const Settings = () => {
    const { 
        settings, 
        updateSettings, 
        clearHistory, 
        history, 
        continueWatching,
        addNotification 
    } = useApp();

    const [lightTheme, setLightTheme] = useState(settings.lightMode);
    const [notifEnabled, setNotifEnabled] = useState(settings.notificationsEnabled);
    
    // Supabase config input fields
    const [supabaseUrl, setSupabaseUrl] = useState(settings.supabaseUrl || '');
    const [supabaseKey, setSupabaseKey] = useState(settings.supabaseAnonKey || '');

    const handleThemeToggle = () => {
        const nextTheme = !lightTheme;
        setLightTheme(nextTheme);
        updateSettings({ lightMode: nextTheme });
        addNotification("Theme Changed", `App theme switched to ${nextTheme ? 'Light' : 'Dark'} Mode`, "palette");
    };

    const handleNotifToggle = () => {
        const nextNotif = !notifEnabled;
        setNotifEnabled(nextNotif);
        updateSettings({ notificationsEnabled: nextNotif });
        addNotification("Notifications Modified", `Alert notifications ${nextNotif ? 'enabled' : 'disabled'}`, "notifications");
    };

    const handleSupabaseSave = (e) => {
        e.preventDefault();
        updateSettings({
            supabaseUrl: supabaseUrl.trim(),
            supabaseAnonKey: supabaseKey.trim()
        });
        alert("Supabase integration credentials updated successfully!");
        addNotification("Database Configured", "Actual Supabase backend keys saved in local config.", "database");
    };

    const handleClearHistory = () => {
        const confirmClear = window.confirm("Are you sure you want to wipe all watchlist progress, history logs, and continues watching sessions?");
        if (confirmClear) {
            clearHistory();
            alert("History cleared successfully.");
        }
    };

    const totalLogs = history.length + continueWatching.length;

    return (
        <div className="px-4 md:px-edge-margin py-28 max-w-2xl mx-auto space-y-8 text-left min-h-[80vh]">
            <div>
                <h1 className="text-3xl md:text-headline-lg font-extrabold text-white">Settings</h1>
                <p className="text-white/50 text-xs md:text-sm mt-1">Configure preferences, clean storage, and hook server integrations.</p>
            </div>

            {/* Stacked Glass Cards Layout */}
            <div className="space-y-6">
                
                {/* 1. Theme Configuration (Light Mode Toggle) */}
                <div className="glass-surface p-6 rounded-2xl border border-white/10 space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <h3 className="font-bold text-sm md:text-base text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">contrast</span>
                                Light Mode Theme
                            </h3>
                            <p className="text-white/50 text-[10px] md:text-xs">
                                Toggle between cinematic obsidian dark mode and light theme layouts.
                            </p>
                        </div>
                        {/* Custom switch toggle */}
                        <button 
                            onClick={handleThemeToggle}
                            className={`w-14 h-7 rounded-full flex items-center p-1 cursor-pointer transition-all duration-300 ${
                                lightTheme ? 'bg-primary-container justify-end' : 'bg-white/10 justify-start'
                            }`}
                        >
                            <div className="w-5 h-5 rounded-full bg-white shadow-md"></div>
                        </button>
                    </div>
                </div>

                {/* 2. Notifications Toggle */}
                <div className="glass-surface p-6 rounded-2xl border border-white/10 space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <h3 className="font-bold text-sm md:text-base text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">notifications_active</span>
                                Push Notifications
                            </h3>
                            <p className="text-white/50 text-[10px] md:text-xs">
                                Receive releases, movie alerts, and continue watching alarms.
                            </p>
                        </div>
                        <button 
                            onClick={handleNotifToggle}
                            className={`w-14 h-7 rounded-full flex items-center p-1 cursor-pointer transition-all duration-300 ${
                                notifEnabled ? 'bg-primary-container justify-end' : 'bg-white/10 justify-start'
                            }`}
                        >
                            <div className="w-5 h-5 rounded-full bg-white shadow-md"></div>
                        </button>
                    </div>
                </div>

                {/* 3. Watch History Clears */}
                <div className="glass-surface p-6 rounded-2xl border border-white/10 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-1">
                            <h3 className="font-bold text-sm md:text-base text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">history</span>
                                Playback Session Logs
                            </h3>
                            <p className="text-white/50 text-[10px] md:text-xs">
                                Clear watchlist history queues, progress bars, and video play times.
                            </p>
                            <span className="text-[10px] text-white/30 font-semibold block mt-1">
                                Currently storing {totalLogs} logged events.
                            </span>
                        </div>
                        <button 
                            onClick={handleClearHistory}
                            disabled={totalLogs === 0}
                            className={`px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
                                totalLogs === 0 
                                    ? 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed' 
                                    : 'bg-red-950/40 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white cursor-pointer active:scale-95'
                            }`}
                        >
                            Wipe History Log
                        </button>
                    </div>
                </div>

                {/* 4. Supabase Integration Panel */}
                <div className="glass-surface p-6 rounded-2xl border border-white/10 space-y-4">
                    <div className="space-y-1">
                        <h3 className="font-bold text-sm md:text-base text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">database</span>
                            Supabase Cloud Database Connection
                        </h3>
                        <p className="text-white/50 text-[10px] md:text-xs leading-relaxed">
                            Currently running in **Mock/Offline mode** using LocalStorage database simulator. 
                            To switch to your own live database, input your Supabase credentials below.
                        </p>
                    </div>

                    <form onSubmit={handleSupabaseSave} className="space-y-4 pt-2">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Supabase Endpoint URL</label>
                            <input 
                                type="url" 
                                value={supabaseUrl}
                                onChange={(e) => setSupabaseUrl(e.target.value)}
                                placeholder="https://your-project.supabase.co"
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:ring-2 focus:ring-primary-container focus:border-transparent outline-none transition-all placeholder-white/20"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Anon Public Key</label>
                            <input 
                                type="password" 
                                value={supabaseKey}
                                onChange={(e) => setSupabaseKey(e.target.value)}
                                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:ring-2 focus:ring-primary-container focus:border-transparent outline-none transition-all placeholder-white/20"
                            />
                        </div>
                        <button 
                            type="submit"
                            className="px-5 py-2.5 rounded-lg btn-primary font-bold text-xs cursor-pointer shadow-lg active:scale-95"
                        >
                            Save DB Credentials
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
export default Settings;
