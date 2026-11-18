import React from 'react';

export const DmcaPolicy = () => {
    return (
        <div className="max-w-3xl mx-auto px-4 py-24 min-h-screen text-white animate-fade-in">
            <button 
                onClick={() => window.history.back()} 
                className="mb-8 glass-surface w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
                aria-label="Go back"
            >
                <span className="material-symbols-outlined">arrow_back</span>
            </button>
            
            <h1 className="text-3xl font-black mb-3">DMCA & Copyright Policy</h1>
            <p className="text-white/60 mb-8 text-sm">Last updated: November 2026</p>
            
            <div className="glass-surface rounded-2xl p-6 md:p-8 space-y-8 text-white/80 leading-relaxed border border-white/10">
                <section>
                    <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">policy</span>
                        General Disclaimer & Service Architecture
                    </h2>
                    <p>
                        NotFlix (<a href="https://notflix.pro.et" className="text-primary hover:underline">notflix.pro.et</a>) operates strictly as a content discovery index, metadata search engine, and proxy interface. 
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-3 text-white/70">
                        <li><strong>NotFlix does not host, upload, store, or manage any video files, media files, or copyright-protected content on its servers.</strong></li>
                        <li>All title information, cast lists, synopses, and imagery are retrieved dynamically via legitimate open metadata APIs (such as The Movie Database – TMDB).</li>
                        <li>Any media playback mechanisms interact with independent, third-party hosting services over which NotFlix exercises no editorial control or ownership.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">verified_user</span>
                        Compliance with Copyright Laws
                    </h2>
                    <p>
                        It is the strict policy of NotFlix to respect the legitimate intellectual property rights of copyright holders and to adhere to the provisions of the Digital Millennium Copyright Act (17 U.S.C. § 512) and applicable international copyright frameworks.
                    </p>
                    <p className="mt-3">
                        When notified of alleged infringement, NotFlix acts expeditiously to investigate and disable access to the relevant content identifiers on our platform.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">mail</span>
                        Notice and Takedown Procedure
                    </h2>
                    <p>
                        If you are a copyright owner or an authorized agent representing one, and believe that a link or identifier on NotFlix infringes upon your copyright, you may submit a formal notification containing the following details:
                    </p>
                    <ol className="list-decimal pl-5 space-y-2 mt-3 text-white/70">
                        <li>Identification of the copyrighted work claimed to have been infringed (including title, year, and reference IMDb/TMDB link).</li>
                        <li>The specific URL(s) on NotFlix containing the reference (e.g., <code className="text-primary-container bg-white/5 px-1.5 py-0.5 rounded">https://notflix.pro.et/movie/...</code>).</li>
                        <li>Adequate contact information (legal name, address, telephone number, and official email address).</li>
                        <li>A statement that you have a good faith belief that the disputed use is not authorized by the copyright owner, its agent, or the law.</li>
                        <li>A statement made under penalty of perjury that the information in the notification is accurate and that you are authorized to act on behalf of the copyright owner.</li>
                    </ol>
                </section>

                <section className="bg-white/5 p-5 rounded-xl border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-2">Designated Copyright Agent</h3>
                    <p className="text-sm text-white/70 mb-3">Please direct all infringement notices to our designated compliance contact:</p>
                    <div className="text-sm text-white/90 space-y-1">
                        <div><strong>Email:</strong> <a href="mailto:dmca@notflix.pro.et" className="text-primary hover:underline">dmca@notflix.pro.et</a></div>
                        <div><strong>Response Time:</strong> Valid takedown requests are processed within 24–48 hours.</div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default DmcaPolicy;
