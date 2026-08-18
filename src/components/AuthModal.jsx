import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../hooks/useLanguage';
import { SupabaseDB } from '../services/db';

export const AuthModal = () => {
    const { authModalOpen, setAuthModalOpen, addNotification } = useApp();
    const { t } = useLanguage();
    const [isLogin, setIsLogin] = useState(true);
    const [useOtpLogin, setUseOtpLogin] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [showVerificationScreen, setShowVerificationScreen] = useState(false);

    useEffect(() => {
        let interval = null;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [resendTimer]);

    if (!authModalOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setLoading(true);

        try {
            if (useOtpLogin) {
                // Passwordless OTP login/signup
                await SupabaseDB.signInWithOtp(email);
                setShowVerificationScreen(true);
                setResendTimer(60);
                addNotification("OTP Sent", `A verification code was sent to ${email}`, "mail");
            } else if (isLogin) {
                // Password login
                await SupabaseDB.signIn(email, password);
                addNotification("Welcome Back", "You have successfully signed in.", "verified_user");
                setAuthModalOpen(false);
            } else {
                // Sign up with password
                const data = await SupabaseDB.signUp(email, password);
                
                if (data && data.user && data.user.identities && data.user.identities.length === 0) {
                    setError("This email is already registered. Please sign in instead.");
                    return;
                }
                
                if (data && data.session === null) {
                    setShowVerificationScreen(true);
                    setResendTimer(60);
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

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otpCode || otpCode.trim().length === 0) {
            setError("Please enter the 6-digit verification code.");
            return;
        }

        setError(null);
        setOtpLoading(true);

        try {
            await SupabaseDB.verifyOtp(email, otpCode);
            addNotification("Verified Successfully", "Welcome to Notflix!", "verified_user");
            setShowVerificationScreen(false);
            setAuthModalOpen(false);
            setOtpCode('');
        } catch (err) {
            setError(err.message || "Invalid or expired verification code. Please check and try again.");
        } finally {
            setOtpLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (resendTimer > 0 || resendLoading) return;
        setError(null);
        setResendLoading(true);

        try {
            await SupabaseDB.resendOtp(email);
            setResendTimer(60);
            setSuccessMessage(t.auth?.codeResent || "Verification code resent successfully!");
            addNotification("Code Resent", `New verification code sent to ${email}`, "mark_email_read");
        } catch (err) {
            setError(err.message || "Failed to resend code. Please try again later.");
        } finally {
            setResendLoading(false);
        }
    };

    const resetModalState = () => {
        setAuthModalOpen(false);
        setShowVerificationScreen(false);
        setError(null);
        setSuccessMessage(null);
        setOtpCode('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="glass-panel w-full max-w-md p-8 rounded-2xl relative shadow-2xl border border-white/20 animate-fade-in-up">
                
                {/* Close Button */}
                <button 
                    onClick={resetModalState}
                    className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                {showVerificationScreen ? (
                    <div className="py-2 animate-fade-in">
                        <div className="w-16 h-16 mx-auto bg-primary-container/20 border border-primary-container/40 rounded-full flex items-center justify-center mb-5">
                            <span className="material-symbols-outlined text-4xl text-primary-container">mark_email_unread</span>
                        </div>
                        <h2 className="text-2xl font-black text-white text-center mb-2">{t.auth.verifyEmail}</h2>
                        <p className="text-white/70 text-sm text-center leading-relaxed mb-6">
                            {t.auth.verifyBody1} <span className="font-bold text-white">{email}</span>. 
                            <br />
                            <span className="text-xs text-white/50">{t.auth.verifyBody2}</span>
                        </p>

                        {error && (
                            <div className="mb-5 p-3.5 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2.5 text-red-200 text-xs animate-fade-in">
                                <span className="material-symbols-outlined shrink-0 text-sm">error</span>
                                <p>{error}</p>
                            </div>
                        )}

                        {successMessage && (
                            <div className="mb-5 p-3.5 bg-emerald-500/20 border border-emerald-500/50 rounded-lg flex items-center gap-2.5 text-emerald-200 text-xs animate-fade-in">
                                <span className="material-symbols-outlined shrink-0 text-sm">check_circle</span>
                                <p>{successMessage}</p>
                            </div>
                        )}

                        {/* Prominent Spam / Inbox Notice Banner */}
                        <div className="mb-5 p-3 bg-red-950/40 border border-primary-container/60 rounded-xl flex items-start gap-2.5 text-xs text-white/90 shadow-inner">
                            <span className="material-symbols-outlined text-primary-container shrink-0 text-base mt-0.5">info</span>
                            <div>
                                <span className="font-bold text-primary-container uppercase tracking-wide text-[11px] block mb-0.5">Notice:</span>
                                <p className="leading-snug text-white/80">
                                    {t.auth.spamNotice || "Can't find the code? Please check your Spam / Junk folder as well!"}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-white/80 uppercase tracking-wider">
                                    {t.auth.otpLabel || "6-Digit Code"}
                                </label>
                                <input 
                                    type="text" 
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength="10"
                                    autoFocus
                                    required
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.replace(/\s+/g, ''))}
                                    className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-center tracking-[0.3em] font-mono text-xl font-bold text-white focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
                                    placeholder="123456"
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={otpLoading || !otpCode.trim()}
                                className="w-full btn-primary py-3 rounded-xl font-black tracking-wide shadow-lg shadow-primary-container/30 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex justify-center items-center gap-2"
                            >
                                {otpLoading && <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>}
                                {otpLoading ? (t.auth.verifying || "Verifying...") : (t.auth.verifyButton || "Verify & Sign In")}
                            </button>
                        </form>

                        <div className="mt-5 flex items-center justify-between text-xs text-white/60">
                            <button
                                type="button"
                                onClick={handleResendCode}
                                disabled={resendTimer > 0 || resendLoading}
                                className="hover:text-primary-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                            >
                                {resendTimer > 0 
                                    ? `${t.auth.resendCooldown || "Resend in"} ${resendTimer}s`
                                    : (resendLoading ? "Sending..." : (t.auth.resendCode || "Resend Code"))
                                }
                            </button>

                            <button 
                                type="button"
                                onClick={() => {
                                    setShowVerificationScreen(false);
                                    setError(null);
                                }}
                                className="text-white/50 hover:text-white transition-colors"
                            >
                                {t.auth.returnToSignIn || "Back"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-6">
                            <h2 className="text-3xl font-black text-white mb-2">
                                {useOtpLogin 
                                    ? "OTP Sign In" 
                                    : (isLogin ? t.auth.signIn : t.auth.joinNotflix)
                                }
                            </h2>
                            <p className="text-white/60 text-sm">
                                {useOtpLogin 
                                    ? "We'll send a 6-digit code to your email."
                                    : (isLogin ? t.auth.signInSubtitle : t.auth.signUpSubtitle)
                                }
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-200 text-sm animate-fade-in">
                                <span className="material-symbols-outlined shrink-0">error</span>
                                <p>{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
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

                            {!useOtpLogin && (
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
                            )}

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full btn-primary py-3.5 rounded-xl font-black tracking-wide shadow-lg shadow-primary-container/30 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex justify-center items-center gap-2"
                            >
                                {loading && <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>}
                                {useOtpLogin 
                                    ? "Send Verification Code" 
                                    : (isLogin ? t.auth.signIn : t.auth.createAccount)
                                }
                            </button>
                        </form>

                        {/* Passwordless OTP Toggle */}
                        <div className="mt-4 text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setUseOtpLogin(!useOtpLogin);
                                    setError(null);
                                }}
                                className="text-xs text-white/50 hover:text-white transition-colors underline"
                            >
                                {useOtpLogin ? "Use password instead" : "Sign in with One-Time Code (OTP)"}
                            </button>
                        </div>

                        <div className="mt-6 text-center border-t border-white/10 pt-4">
                            <p className="text-white/50 text-sm">
                                {isLogin ? t.auth.dontHaveAccount : t.auth.alreadyHaveAccount}
                                <button 
                                    onClick={() => { 
                                        setIsLogin(!isLogin); 
                                        setUseOtpLogin(false);
                                        setError(null); 
                                    }}
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
