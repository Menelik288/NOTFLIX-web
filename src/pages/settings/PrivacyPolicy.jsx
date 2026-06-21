import React from 'react';
import { useApp } from '../../context/AppContext';

export const PrivacyPolicy = () => {
    return (
        <div className="max-w-3xl mx-auto px-4 py-24 min-h-screen text-white animate-fade-in">
            <button 
                onClick={() => window.history.back()} 
                className="mb-8 glass-surface w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
            >
                <span className="material-symbols-outlined">arrow_back</span>
            </button>
            
            <h1 className="text-3xl font-black mb-8">Privacy Policy</h1>
            
            <div className="glass-surface rounded-2xl p-6 md:p-8 space-y-8 text-white/80 leading-relaxed">
                <section>
                    <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">data_usage</span>
                        Data Collection
                    </h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Email:</strong> Collected strictly for authentication purposes (if applicable).</li>
                        <li><strong>Watch History:</strong> We store your watch history and progress to sync "Continue Watching" across devices.</li>
                        <li><strong>Activity:</strong> Ratings, comments, and watchlist additions are tracked to build your profile.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">psychology</span>
                        Data Usage
                    </h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Providing tailored movie and TV show recommendations.</li>
                        <li>Improving the overall user experience and platform quality.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">storage</span>
                        Data Storage & Third-Party Services
                    </h2>
                    <p className="mb-2">Your data is stored securely using <strong>Supabase</strong>, our cloud database and authentication provider.</p>
                    <p>We rely on <strong>TMDB API</strong> to fetch movie and TV show metadata. TMDB acts strictly as a data provider and does not access your personal NotFlix data.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">gavel</span>
                        User Rights
                    </h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Users maintain complete control over their personal data.</li>
                        <li>Users can permanently delete their accounts and wipe all associated data from the settings panel.</li>
                        <li>Users can request complete data removal at any time.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">security</span>
                        Security
                    </h2>
                    <p>We prioritize your security. Passwords are never stored in plaintext. Secure authentication and session management are handled entirely by Supabase.</p>
                </section>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
