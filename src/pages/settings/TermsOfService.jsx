import React from 'react';
import { useApp } from '../../context/AppContext';

export const TermsOfService = () => {
    return (
        <div className="max-w-3xl mx-auto px-4 py-24 min-h-screen text-white animate-fade-in">
            <button 
                onClick={() => window.history.back()} 
                className="mb-8 glass-surface w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
            >
                <span className="material-symbols-outlined">arrow_back</span>
            </button>
            
            <h1 className="text-3xl font-black mb-8">Terms of Service</h1>
            
            <div className="glass-surface rounded-2xl p-6 md:p-8 space-y-8 text-white/80 leading-relaxed">
                <section>
                    <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">verified</span>
                        Acceptance of Terms
                    </h2>
                    <p>By accessing or using NotFlix, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the platform.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">person</span>
                        Use of Platform
                    </h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>NotFlix is provided strictly for <strong>personal, non-commercial use</strong>.</li>
                        <li>Any automated scraping, abuse of APIs, or reverse engineering of the platform is strictly prohibited.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">movie</span>
                        Content Disclaimer
                    </h2>
                    <p>NotFlix acts as a discovery tool and proxy interface. <strong>NotFlix does not host, upload, or own any movies, TV shows, or media files.</strong> All content, metadata, and streaming links are aggregated dynamically via third-party APIs (such as TMDB and embed providers).</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">account_balance</span>
                        User Responsibility
                    </h2>
                    <p>Users are solely responsible for their activity on the platform, including comments, ratings, and interactions. We do not endorse any user-generated content.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">block</span>
                        Account Termination
                    </h2>
                    <p>We reserve the right to suspend or permanently terminate any account that violates these Terms of Service, engages in abusive behavior, or manipulates the platform in unauthorized ways.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">gavel</span>
                        Limitation of Liability
                    </h2>
                    <p>NotFlix is not responsible for the accuracy, reliability, or legality of third-party content. Use of third-party links or media is at your own risk. The service is provided "as is" without any warranties of any kind.</p>
                </section>
            </div>
        </div>
    );
};

export default TermsOfService;
