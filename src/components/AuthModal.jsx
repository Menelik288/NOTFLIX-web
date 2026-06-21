import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../hooks/useLanguage';
import { SupabaseDB } from '../services/db';

export const AuthModal = () => {
    const { authModalOpen, setAuthModalOpen, addNotification } = useApp();
    const { t } = useLanguage();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showVerificationScreen, setShowVerificationScreen] = useState(false);

    if (!authModalOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isLogin) {
                await SupabaseDB.signIn(email, password);
                addNotification("Welcome Back", "You have successfully signed in.", "verified_user");
                setAuthModalOpen(false);
            } else {
                const data = await SupabaseDB.signUp(email, password);
                
                if (data && data.user && data.user.identities && data.user.identities.length === 0) {
                    setError("This email is already registered. Please sign in instead.");
                    return;
                }
                
                if (data && data.session === null) {
                    setShowVerificationScreen(true);
                } else {
                    addNotification("Account Created", "Your account has been created successfully.", "person_add");
                    setAuthModalOpen(false);
                }
            }
        } catch (err) {
            setError(err.message || "An error occurred during authentication.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="glass-panel w-full max-w-md p-8 rounded-2xl relative shadow-2xl border border-white/20 animate-fade-in-up">
                
                {/* Close Button */}
                <button 
                    onClick={() => {
                        setAuthModalOpen(false);
                        setShowVerificationScreen(false);
                    }}
                    className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                {showVerificationScreen ? (
                    <div className="text-center py-6 animate-fade-in">
                        <div className="w-20 h-20 mx-auto bg-primary-container/20 rounded-full flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-5xl text-primary-container">mark_email_unread</span>
                        </div>
                        <h2 className="text-3xl font-black text-white mb-4">{t.auth.verifyEmail}</h2>
                        <p className="text-white/70 text-sm leading-relaxed mb-8">
                            {t.auth.verifyBody1} <span className="font-bold text-white">{email}</span>. 
                            {t.auth.verifyBody2}
                            <br /><br />
                            {t.auth.verifyBody3}
                        </p>
                        <button 
                            onClick={() => {
                                setShowVerificationScreen(false);
                                setIsLogin(true);
                            }}
                            className="w-full btn-primary py-3.5 rounded-xl font-black tracking-wide shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all"
                        >
                            {t.auth.returnToSignIn}
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-black text-white mb-2">
                                {isLogin ? t.auth.signIn : t.auth.joinNotflix}
                            </h2>
                            <p className="text-white/60 text-sm">
                                {isLogin ? t.auth.signInSubtitle : t.auth.signUpSubtitle}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-200 text-sm animate-fade-in">
                                <span className="material-symbols-outlined shrink-0">error</span>
                                <p>{error}</p>
                            </div>
                        )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-white/80 uppercase tracking-wider">{t.auth.email}</label>
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
                            placeholder={t.auth.emailPlaceholder}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-white/80 uppercase tracking-wider">{t.auth.password}</label>
                        <input 
                            type="password" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
                            placeholder={t.auth.passwordPlaceholder}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full btn-primary py-3.5 rounded-xl font-black tracking-wide shadow-lg shadow-primary-container/30 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex justify-center items-center gap-2"
                    >
                        {loading && <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>}
                        {isLogin ? t.auth.signIn : t.auth.createAccount}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-white/50 text-sm">
                        {isLogin ? t.auth.dontHaveAccount : t.auth.alreadyHaveAccount}
                        <button 
                            onClick={() => { setIsLogin(!isLogin); setError(null); }}
                            className="ml-2 text-primary-container font-bold hover:underline"
                        >
                            {isLogin ? t.auth.signUp : t.auth.signIn}
                        </button>
                    </p>
                </div>
                </>
            )}
            </div>
        </div>
    );
};
