import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SupabaseDB } from '../services/db';

export const Profile = () => {
    const { profile, user, updateProfile, addNotification, navigateTo } = useApp();

    const [displayName, setDisplayName] = useState(profile?.username || '');
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);
    const [pickerPermission, setPickerPermission] = useState(false);

    // List of premium Netflix-style avatar placeholders to pick from
    const avatarList = [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAQZCeWd8mgmFYtTSWy9Vvcs5mDCZcs9UhEwGbhL00I938vTHKo_UNJHAGMzq14PJjgML-S1Pb__84DLeW4KLd3L6xRe3Xq8KNL42sP4OWB0fPOLIi5uFDEAoWYArx7JEZ-F6eVrFJyC6_v92bhvPA994mR4v7O1VRszIrNRUledwxGcN5Gf5tLaDI-DIfciDSkZboyWIDx6ZadRGeaYg-XuAdYIPobcRyOwNpgaoA-GtEsZZu53Qy3zKkyXu4CndU-NPIgAfBlDCR1", // Default red
        "https://i.pravatar.cc/150?img=32", // Woman doc
        "https://i.pravatar.cc/150?img=60", // Hacker guy
        "https://i.pravatar.cc/150?img=47", // Jessica vance
        "https://i.pravatar.cc/150?img=62", // George clooney
        "https://i.pravatar.cc/150?img=42", // Sandra bullock
        "https://i.pravatar.cc/150?img=54", // Ryan gosling
        "https://i.pravatar.cc/150?img=69"  // Cillian murphy
    ];

    const handleAvatarClick = () => {
        if (!pickerPermission) {
            // Mock permissions prompt (from Stitch specification)
            const permit = window.confirm("NotFlix requests access to your photos and media library to select a custom profile avatar. Allow?");
            if (permit) {
                setPickerPermission(true);
                setShowAvatarPicker(true);
            } else {
                addNotification("Permission Denied", "NotFlix cannot open custom image gallery without permission.", "warning");
                // Allow them to choose from default library anyway
                setShowAvatarPicker(true);
            }
        } else {
            setShowAvatarPicker(true);
        }
    };

    const handleSelectAvatar = async (url) => {
        try {
            await updateProfile(displayName, url);
            setShowAvatarPicker(false);
        } catch(e) {
            console.error("Avatar error", e);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const name = displayName.trim();
        if (name) {
            try {
                await updateProfile(name, profile.avatar_url);
                addNotification("Success", "Profile saved successfully!", "check_circle");
            } catch(e) {
                console.error("Profile error", e);
            }
        }
    };

    const handleSignOut = async () => {
        try {
            await SupabaseDB.signOut();
            addNotification("Signed Out", "You have successfully signed out.", "logout");
            navigateTo('#/');
        } catch(e) {
            console.error("Logout error", e);
        }
    };

    return (
        <div className="px-4 md:px-edge-margin py-28 max-w-lg mx-auto space-y-8 text-left min-h-[80vh]">
            <div>
                <h1 className="text-3xl md:text-headline-lg font-extrabold text-white">Edit Profile</h1>
                <p className="text-white/50 text-xs md:text-sm mt-1">Manage your public identity and profile credentials.</p>
            </div>

            {/* Profile Card Form */}
            <div className="glass-surface p-6 md:p-8 rounded-2xl border border-white/10 space-y-6">
                
                {/* Avatar Display Section */}
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                        <img 
                            src={profile.avatar_url} 
                            alt="Profile Avatar" 
                            className="w-24 h-24 rounded-2xl border-2 border-white/20 object-cover group-hover:brightness-50 transition-all duration-300 shadow-xl"
                        />
                        {/* Edit overlay icon */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined text-white text-3xl">edit</span>
                        </div>
                    </div>
                    <div>
                        <button 
                            type="button" 
                            onClick={handleAvatarClick}
                            className="text-primary-container text-xs font-bold hover:underline cursor-pointer"
                        >
                            Change Avatar Image
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                    {/* Display name field */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-white/50 uppercase tracking-wider">Display Name</label>
                        <input 
                            type="text" 
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-primary-container focus:border-transparent outline-none transition-all placeholder-white/30"
                            required
                        />
                    </div>

                    {/* Email display (Private) */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-white/50 uppercase tracking-wider">Email (Private)</label>
                        <input 
                            type="text" 
                            value={user?.email || 'Not logged in'}
                            className="w-full bg-black/10 border border-white/5 rounded-xl p-4 text-sm text-white/45 cursor-not-allowed outline-none"
                            disabled
                        />
                        <span className="text-[10px] text-white/30 block mt-1">
                            Your email is private and visible only to you on this settings page.
                        </span>
                    </div>

                    {/* Save Button */}
                    <button 
                        type="submit"
                        className="w-full py-3.5 rounded-xl btn-primary font-bold text-xs uppercase tracking-wider cursor-pointer shadow-lg active:scale-98 mt-2"
                    >
                        Save Profiles Changes
                    </button>
                    
                    {user && (
                        <button 
                            type="button"
                            onClick={handleSignOut}
                            className="w-full py-3.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50 font-bold text-xs uppercase tracking-wider cursor-pointer transition-all mt-4"
                        >
                            Sign Out
                        </button>
                    )}
                </form>
            </div>

            {/* Public Identity Rule Callout */}
            <div className="glass-surface p-6 rounded-2xl border border-white/10 flex gap-4 items-start bg-black/20 text-xs md:text-sm">
                <span className="material-symbols-outlined text-primary text-2xl">shield</span>
                <div className="space-y-1">
                    <h4 className="font-bold text-white">Public Profile Guidelines</h4>
                    <p className="text-white/60 leading-relaxed text-xs">
                        When rating or commenting on movies/series, your **Display Name** and **Profile Avatar** will be shown publicly to other NotFlix users. To protect your security, we never share or expose your email address.
                    </p>
                </div>
            </div>

            {/* Avatar Selection Modal Overlay */}
            {showAvatarPicker && (
                <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="glass-surface max-w-lg w-full rounded-2xl border border-white/10 p-6 space-y-6 text-center shadow-2xl relative">
                        <button 
                            onClick={() => setShowAvatarPicker(false)}
                            className="absolute top-4 right-4 text-white/50 hover:text-white cursor-pointer"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        
                        <div>
                            <h3 className="text-lg font-bold text-white">Choose Your Avatar</h3>
                            <p className="text-xs text-white/50 mt-1">Select from our library of cinematic avatar characters.</p>
                        </div>

                        {/* Avatars Grid */}
                        <div className="grid grid-cols-4 gap-4">
                            {avatarList.map((url, index) => (
                                <div 
                                    key={index}
                                    onClick={() => handleSelectAvatar(url)}
                                    className={`aspect-square rounded-xl overflow-hidden cursor-pointer border-2 hover:scale-105 active:scale-95 transition-all ${
                                        profile.avatar_url === url ? 'border-primary-container shadow-lg shadow-primary-container/20' : 'border-white/10 hover:border-white/30'
                                    }`}
                                >
                                    <img src={url} alt={`Avatar option ${index}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Profile;
