import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../hooks/useLanguage';
import { SupabaseDB } from '../services/db';

/* ─────────────────────────────────────────────
   NotFlix Settings – Premium Glassmorphism UI
   ───────────────────────────────────────────── */

export const Settings = () => {
    const {
        settings,
        updateSettings,
        continueWatching,
        user,
        profile,
        addNotification,
        navigateTo,
    } = useApp();
    const { t, language, changeLanguage } = useLanguage();

    // ── Local toggle state ──
    const [lightTheme, setLightTheme] = useState(settings.lightMode || false);
    const [notifs, setNotifs] = useState({
        recommendations: settings.notifRecommendations ?? true,
        newEpisodes: settings.notifNewEpisodes ?? true,
        continueReminders: settings.notifContinueReminders ?? true,
        watchlistUpdates: settings.notifWatchlistUpdates ?? true,
        accountAlerts: settings.notifAccountAlerts ?? true,
    });

    // ── Delete account modal ──
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // ── Language picker state ──
    const [showLangPicker, setShowLangPicker] = useState(false);

    const languages = [
        { code: 'en', label: 'English', native: 'English' },
        { code: 'am', label: 'Amharic', native: 'አማርኛ' },
    ];

    // ── Handlers ──
    const handleThemeToggle = () => {
        const next = !lightTheme;
        setLightTheme(next);
        updateSettings({ lightMode: next });
        addNotification(
            t.settings.themeChanged,
            `${t.settings.switchedTo} ${next ? t.settings.light : t.settings.dark} ${t.settings.mode}`,
            'contrast'
        );
    };

    const handleNotifToggle = (key) => {
        const next = !notifs[key];
        setNotifs(prev => ({ ...prev, [key]: next }));
        const settingsKey = `notif${key.charAt(0).toUpperCase() + key.slice(1)}`;
        updateSettings({ [settingsKey]: next });
    };

    const handleLogout = async () => {
        try {
            await SupabaseDB.signOut();
            addNotification('Signed Out', 'You have been signed out successfully.', 'logout');
            navigateTo('#/');
        } catch (e) {
            console.error('Logout error:', e);
        }
    };

    const handleDeleteAccount = () => {
        setShowDeleteModal(true);
    };

    const confirmDeleteAccount = async () => {
        if (!user) return;
        setShowDeleteModal(false);
        addNotification('Deleting Account...', 'Your data is being permanently removed.', 'delete');
        try {
            await SupabaseDB.wipeUserData(user.id);
            // navigateTo('#/') is handled in SupabaseDB.signOut
        } catch (e) {
            console.error('Delete error:', e);
            addNotification('Error', 'Failed to delete account.', 'error');
        }
    };

    /* ─── Reusable Sub-components ─── */

    const ToggleSwitch = ({ on, onToggle }) => (
        <button
            onClick={onToggle}
            aria-checked={on}
            role="switch"
            className="settings-toggle"
            style={{
                width: 52,
                height: 28,
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '0 3px',
                justifyContent: on ? 'flex-end' : 'flex-start',
                background: on
                    ? 'linear-gradient(135deg, #E50914, #ff3d47)'
                    : 'rgba(255,255,255,0.12)',
                transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: on
                    ? '0 0 14px rgba(229,9,20,0.35), inset 0 1px 1px rgba(255,255,255,0.15)'
                    : 'inset 0 1px 3px rgba(0,0,0,0.3)',
                flexShrink: 0,
            }}
        >
            <div
                style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: '#fff',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                    transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: on ? 'scale(1.05)' : 'scale(1)',
                }}
            />
        </button>
    );

    const SettingsRow = ({ icon, label, subtitle, onClick, trailing }) => (
        <button
            onClick={onClick}
            className="settings-row"
            style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '16px 0',
                background: 'transparent',
                border: 'none',
                cursor: onClick ? 'pointer' : 'default',
                textAlign: 'left',
                color: 'inherit',
                transition: 'opacity 0.2s',
            }}
        >
            <span
                className="material-symbols-outlined"
                style={{
                    fontSize: 22,
                    color: '#E50914',
                    background: 'rgba(229,9,20,0.1)',
                    borderRadius: 10,
                    padding: 8,
                    lineHeight: 1,
                    flexShrink: 0,
                }}
            >
                {icon}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-color)' }}>
                    {label}
                </div>
                {subtitle && (
                    <div style={{ fontSize: 11, opacity: 0.45, marginTop: 2, lineHeight: 1.4 }}>
                        {subtitle}
                    </div>
                )}
            </div>
            {trailing || (onClick && (
                <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 20, opacity: 0.3, flexShrink: 0 }}
                >
                    chevron_right
                </span>
            ))}
        </button>
    );

    const Divider = () => (
        <div style={{ height: 1, background: 'var(--glass-border)', margin: '0' }} />
    );

    const SectionTitle = ({ children }) => (
        <div
            style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                opacity: 0.4,
                marginBottom: 6,
                paddingLeft: 4,
            }}
        >
            {children}
        </div>
    );

    const GlassCard = ({ children, style }) => (
        <div
            className="glass-surface"
            style={{
                borderRadius: 16,
                padding: '4px 20px',
                ...style,
            }}
        >
            {children}
        </div>
    );

    /* ─── Notification toggles config ─── */
    const notifRows = [
        { key: 'recommendations', icon: 'auto_awesome', label: t.settings.recommendations, subtitle: t.settings.recommendationsSubtitle },
        { key: 'newEpisodes', icon: 'new_releases', label: t.settings.newEpisodes, subtitle: t.settings.newEpisodesSubtitle },
        { key: 'continueReminders', icon: 'play_circle', label: t.settings.continueReminders, subtitle: t.settings.continueRemindersSubtitle },
        { key: 'watchlistUpdates', icon: 'bookmark', label: t.settings.watchlistUpdates, subtitle: t.settings.watchlistUpdatesSubtitle },
        { key: 'accountAlerts', icon: 'security', label: t.settings.accountAlerts, subtitle: t.settings.accountAlertsSubtitle },
    ];

    const currentLang = languages.find(l => l.code === language) || languages[0];

    return (
        <>
            <div
                style={{
                    maxWidth: 560,
                    margin: '0 auto',
                    padding: '88px 16px 120px',
                    minHeight: '100vh',
                }}
            >
                {/* ─── Header ─── */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        marginBottom: 32,
                    }}
                >
                    <button
                        onClick={() => window.history.back()}
                        className="glass-surface"
                        style={{
                            borderRadius: 12,
                            width: 40,
                            height: 40,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'var(--text-color)',
                            flexShrink: 0,
                        }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_back</span>
                    </button>
                    <div>
                        <h1
                            style={{
                                fontSize: 26,
                                fontWeight: 800,
                                margin: 0,
                                color: 'var(--text-color)',
                                letterSpacing: '-0.02em',
                            }}
                        >
                            {t.settings.title}
                        </h1>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

                    {/* ─── Account Section ─── */}
                    <div>
                        <SectionTitle>{t.settings.account}</SectionTitle>
                        <GlassCard>
                            <SettingsRow
                                icon="person"
                                label={t.settings.profile}
                                subtitle={t.settings.profileSubtitle}
                                onClick={() => navigateTo('#/profile')}
                            />
                            {user && (
                                <>
                                    <Divider />
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 12,
                                            padding: '14px 0',
                                        }}
                                    >
                                        <img
                                            src={profile?.avatar_url}
                                            alt="avatar"
                                            style={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: 10,
                                                objectFit: 'cover',
                                                border: '1.5px solid var(--glass-border)',
                                            }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-color)' }}>
                                                {profile?.username || 'Guest'}
                                            </div>
                                            <div style={{ fontSize: 11, opacity: 0.4 }}>
                                                {user?.email || ''}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </GlassCard>
                    </div>

                    {/* ─── Preferences Section ─── */}
                    <div>
                        <SectionTitle>{t.settings.preferences}</SectionTitle>
                        <GlassCard>
                            <SettingsRow
                                icon="contrast"
                                label={t.settings.lightMode}
                                subtitle={t.settings.lightModeSubtitle}
                                trailing={<ToggleSwitch on={lightTheme} onToggle={handleThemeToggle} />}
                            />
                            <Divider />
                            {/* ─── Language Picker ─── */}
                            <SettingsRow
                                icon="translate"
                                label={t.settings.language}
                                subtitle={currentLang.native}
                                onClick={() => setShowLangPicker(!showLangPicker)}
                                trailing={
                                    <span className="material-symbols-outlined" style={{ fontSize: 20, opacity: 0.3, flexShrink: 0, transition: 'transform 0.3s', transform: showLangPicker ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                        expand_more
                                    </span>
                                }
                            />
                            {showLangPicker && (
                                <div style={{ paddingBottom: 12, paddingLeft: 48 }} className="animate-fade-in">
                                    {languages.map(lang => (
                                        <button
                                            key={lang.code}
                                            onClick={() => {
                                                changeLanguage(lang.code);
                                                setShowLangPicker(false);
                                                addNotification('Language', `Switched to ${lang.label}`, 'translate');
                                            }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 10,
                                                width: '100%',
                                                padding: '10px 14px',
                                                borderRadius: 10,
                                                border: 'none',
                                                cursor: 'pointer',
                                                background: language === lang.code ? 'rgba(229,9,20,0.12)' : 'transparent',
                                                color: 'var(--text-color)',
                                                fontSize: 13,
                                                fontWeight: language === lang.code ? 700 : 500,
                                                transition: 'all 0.2s',
                                                textAlign: 'left',
                                            }}
                                        >
                                            <span style={{
                                                width: 18,
                                                height: 18,
                                                borderRadius: '50%',
                                                border: language === lang.code ? '2px solid #E50914' : '2px solid var(--glass-border)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                            }}>
                                                {language === lang.code && (
                                                    <span style={{
                                                        width: 8,
                                                        height: 8,
                                                        borderRadius: '50%',
                                                        background: '#E50914',
                                                    }} />
                                                )}
                                            </span>
                                            <span>{lang.native}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                            <Divider />
                            <SettingsRow
                                icon="subtitles"
                                label={t.settings.subtitles}
                                subtitle={t.settings.subtitlesSubtitle}
                            />
                        </GlassCard>
                    </div>

                    {/* ─── Notifications Section ─── */}
                    <div>
                        <SectionTitle>{t.settings.notifications}</SectionTitle>
                        <GlassCard>
                            {notifRows.map((row, idx) => (
                                <React.Fragment key={row.key}>
                                    {idx > 0 && <Divider />}
                                    <SettingsRow
                                        icon={row.icon}
                                        label={row.label}
                                        subtitle={row.subtitle}
                                        trailing={
                                            <ToggleSwitch
                                                on={notifs[row.key]}
                                                onToggle={() => handleNotifToggle(row.key)}
                                            />
                                        }
                                    />
                                </React.Fragment>
                            ))}
                        </GlassCard>
                    </div>

                    {/* ─── History Section ─── */}
                    <div>
                        <SectionTitle>{t.settings.history}</SectionTitle>
                        <GlassCard>
                            <SettingsRow
                                icon="history"
                                label={t.settings.viewingHistory}
                                subtitle={`${t.settings.viewingHistorySubtitle} · ${continueWatching?.length || 0} ${t.settings.itemsTracked}`}
                                onClick={() => navigateTo('#/settings/history')}
                            />
                        </GlassCard>
                    </div>

                    {/* ─── App Section ─── */}
                    <div>
                        <SectionTitle>{t.settings.app}</SectionTitle>
                        <GlassCard>
                            <SettingsRow
                                icon="info"
                                label={t.settings.about}
                                subtitle={t.settings.aboutSubtitle}
                                onClick={() => navigateTo('#/settings/about')}
                            />
                            <Divider />
                            <SettingsRow
                                icon="shield"
                                label={t.settings.privacy}
                                onClick={() => navigateTo('#/settings/privacy')}
                            />
                            <Divider />
                            <SettingsRow
                                icon="description"
                                label={t.settings.terms}
                                onClick={() => navigateTo('#/settings/terms')}
                            />
                        </GlassCard>
                    </div>

                    {/* ─── Actions Section ─── */}
                    {user && (
                        <div>
                            <SectionTitle>{t.settings.actions}</SectionTitle>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {/* Logout */}
                                <button
                                    onClick={handleLogout}
                                    className="glass-surface"
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 10,
                                        padding: '16px 20px',
                                        borderRadius: 16,
                                        cursor: 'pointer',
                                        fontSize: 14,
                                        fontWeight: 700,
                                        color: 'var(--text-color)',
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>logout</span>
                                    {t.settings.signOut}
                                </button>

                                {/* Delete Account */}
                                <button
                                    onClick={handleDeleteAccount}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 10,
                                        padding: '16px 20px',
                                        borderRadius: 16,
                                        border: '1px solid rgba(239,68,68,0.2)',
                                        cursor: 'pointer',
                                        fontSize: 14,
                                        fontWeight: 700,
                                        color: '#ef4444',
                                        background: 'rgba(239,68,68,0.06)',
                                        backdropFilter: 'blur(10px)',
                                        transition: 'all 0.3s ease',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = 'rgba(239,68,68,0.12)';
                                        e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = 'rgba(239,68,68,0.06)';
                                        e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)';
                                    }}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>delete_forever</span>
                                    {t.settings.deleteAccount}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ─── Footer ─── */}
                    <div
                        style={{
                            textAlign: 'center',
                            padding: '20px 0 8px',
                            opacity: 0.25,
                            fontSize: 11,
                            fontWeight: 500,
                        }}
                    >
                        {t.settings.footer}
                    </div>
                </div>
            </div>

            {/* ─── Delete Confirmation Modal ─── */}
            {showDeleteModal && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 20,
                        background: 'rgba(0,0,0,0.7)',
                        backdropFilter: 'blur(8px)',
                    }}
                    className="animate-fade-in"
                    onClick={() => setShowDeleteModal(false)}
                >
                    <div
                        className="glass-surface"
                        style={{
                            maxWidth: 380,
                            width: '100%',
                            borderRadius: 20,
                            padding: '32px 28px',
                            textAlign: 'center',
                            border: '1px solid rgba(239,68,68,0.2)',
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <span
                            className="material-symbols-outlined"
                            style={{
                                fontSize: 48,
                                color: '#ef4444',
                                marginBottom: 16,
                                display: 'block',
                            }}
                        >
                            warning
                        </span>
                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--text-color)' }}>
                            {t.settings.deleteTitle}
                        </h3>
                        <p style={{ fontSize: 13, opacity: 0.5, lineHeight: 1.6, marginBottom: 28 }}>
                            {t.settings.deleteBody}
                        </p>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="glass-surface"
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    borderRadius: 12,
                                    color: 'var(--text-color)',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                {t.settings.cancel}
                            </button>
                            <button
                                onClick={confirmDeleteAccount}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    borderRadius: 12,
                                    border: '1px solid rgba(239,68,68,0.3)',
                                    background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                                    color: '#fff',
                                    fontSize: 13,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 4px 16px rgba(239,68,68,0.3)',
                                }}
                            >
                                {t.settings.deleteForever}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Scoped Styles ─── */}
            <style>{`
                .settings-row:hover {
                    opacity: 0.8;
                }
                .settings-row:active {
                    opacity: 0.6;
                    transform: scale(0.99);
                }
                .settings-toggle:active {
                    transform: scale(0.92);
                }
                @media (max-width: 640px) {
                    .settings-row {
                        gap: 10px !important;
                    }
                }
            `}</style>
        </>
    );
};

export default Settings;
