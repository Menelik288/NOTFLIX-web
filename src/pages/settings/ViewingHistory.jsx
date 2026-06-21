import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SupabaseDB } from '../../services/db';

export const ViewingHistory = () => {
    const { user, navigateTo, addNotification } = useApp();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchHistory();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const data = await SupabaseDB.getContinueWatching(user.id);
            // Sort by lastWatched descending
            const sorted = data.sort((a, b) => new Date(b.lastWatched) - new Date(a.lastWatched));
            setHistory(sorted);
        } catch (error) {
            console.error("Failed to fetch history", error);
        } finally {
            setLoading(false);
        }
    };

    const handleClearHistory = async () => {
        if (!user) return;
        try {
            await SupabaseDB.wipeContinueWatching(user.id);
            setHistory([]);
            addNotification('History Cleared', 'Your viewing history has been successfully removed.', 'delete');
        } catch (error) {
            console.error("Failed to clear history", error);
            addNotification('Error', 'Failed to clear history. Please try again.', 'error');
        }
    };

    const handleRemoveItem = async (mediaId) => {
        if (!user) return;
        try {
            await SupabaseDB.removeContinueWatchingItem(user.id, mediaId);
            setHistory(prev => prev.filter(item => item.id !== mediaId));
        } catch (error) {
            console.error("Failed to remove item", error);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-24 min-h-screen text-white animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => window.history.back()} 
                        className="glass-surface w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-2xl md:text-3xl font-black">Viewing History</h1>
                </div>

                {history.length > 0 && (
                    <button 
                        onClick={handleClearHistory}
                        className="text-xs md:text-sm font-bold bg-white/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm md:text-base">delete</span>
                        Clear History
                    </button>
                )}
            </div>
            
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : history.length === 0 ? (
                <div className="glass-surface rounded-2xl p-12 text-center flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-6xl text-white/20 mb-4">history</span>
                    <h2 className="text-xl font-bold text-white mb-2">No History Found</h2>
                    <p className="text-white/50 text-sm max-w-md mx-auto">
                        {user ? "You haven't watched anything yet. Start watching to see your history here." : "Please sign in to view your watch history."}
                    </p>
                    <button 
                        onClick={() => navigateTo('#/')}
                        className="mt-6 btn-primary px-6 py-2 rounded-xl font-bold text-sm"
                    >
                        Explore Content
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {history.map((item) => (
                        <div key={item.id} className="group relative glass-surface rounded-xl overflow-hidden aspect-[2/3] border border-white/10">
                            <img 
                                src={item.backdrop || item.poster || 'https://via.placeholder.com/300x450?text=No+Image'} 
                                alt={item.title} 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                                onClick={() => navigateTo(`#/${item.type}/${item.id}`)}
                            />
                            
                            <div className="absolute top-0 left-0 w-full p-2 bg-gradient-to-b from-black/80 to-transparent flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleRemoveItem(item.id); }}
                                    className="glass-surface rounded-full p-1.5 flex items-center justify-center hover:bg-white/20 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-sm md:text-base text-white">close</span>
                                </button>
                            </div>

                            <div 
                                className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent cursor-pointer"
                                onClick={() => navigateTo(`#/${item.type}/${item.id}`)}
                            >
                                <h3 className="font-bold text-xs md:text-sm text-white line-clamp-1 mb-1">
                                    {item.title}
                                </h3>
                                <div className="flex justify-between items-center text-[10px] text-white/50">
                                    <span>{item.season ? `S${item.season} E${item.episode}` : 'Movie'}</span>
                                    {item.lastWatched && (
                                        <span>{new Date(item.lastWatched).toLocaleDateString()}</span>
                                    )}
                                </div>
                            </div>

                            {/* Progress bar overlay */}
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
                                <div 
                                    className="h-full bg-primary"
                                    style={{ width: `${item.percent ?? 0}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ViewingHistory;
