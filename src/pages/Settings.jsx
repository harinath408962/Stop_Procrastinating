import { useState } from 'react';
import Layout from '../components/Layout';
import { useTheme } from '../context/ThemeContext';
import { downloadCsv, generateEventCsv } from '../utils/exportUtils';
import { getStorage, clearAllStorage, STORAGE_KEYS } from '../utils/storage';
import { auth } from '../utils/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, Download, Trash2, LogOut, User, Info, ArrowLeft } from 'lucide-react';
import SyncStatus from '../components/SyncStatus';

const Settings = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const user = auth.currentUser;
    const [clickCount, setClickCount] = useState(0);

    const handleExport = () => {
        const events = getStorage(STORAGE_KEYS.EVENT_LOG, []);
        if (!events || events.length === 0) {
            alert("No data to export yet.");
            return;
        }
        const csv = generateEventCsv(events);
        downloadCsv(csv, `stop_procrastinating_backup_${new Date().toISOString().split('T')[0]}.csv`);
    };

    const handleClearData = () => {
        if (window.confirm("ARE YOU SURE? This will delete ALL your logs, streaks, and local data. This action cannot be undone.")) {
            clearAllStorage();
            window.location.reload();
        }
    };

    const handleSignOut = () => {
        signOut(auth).then(() => {
            navigate('/');
            window.location.reload();
        });
    };

    return (
        <Layout>
            <div className="container">
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                    <button
                        onClick={() => navigate(-1)}
                        className="btn-secondary"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginRight: '1rem'
                        }}
                    >
                        <ArrowLeft size={18} /> Back
                    </button>
                    <h2 style={{ margin: 0 }}>Settings</h2>
                    <div style={{ marginLeft: 'auto' }}>
                        <SyncStatus />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Appearance */}
                    <div className="card">
                        <h3 style={{ marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />} Appearance
                        </h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>App Theme</span>
                            <button
                                onClick={toggleTheme}
                                className="btn-secondary"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                            </button>
                        </div>
                    </div>

                    {/* Data Management */}
                    <div className="card">
                        <h3 style={{ marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Download size={20} /> Data Management
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <button
                                onClick={handleExport}
                                className="btn-secondary"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%' }}
                            >
                                <Download size={18} /> Export Data (CSV)
                            </button>

                            <div style={{ borderTop: '1px solid var(--border-color)', margin: '0.5rem 0' }}></div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <strong style={{ color: 'var(--color-danger)' }}>Danger Zone</strong>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                                        Irreversible data loss.
                                    </p>
                                </div>
                                <button
                                    onClick={handleClearData}
                                    style={{
                                        background: '#fee2e2',
                                        color: '#b91c1c',
                                        border: '1px solid #fca5a5',
                                        padding: '0.5rem 1rem',
                                        borderRadius: 'var(--radius-md)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.9rem',
                                        fontWeight: '500'
                                    }}
                                >
                                    <Trash2 size={16} /> Clear All Data
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Account */}
                    <div className="card">
                        <h3 style={{ marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <User size={20} /> Account
                        </h3>
                        {user ? (
                            <div style={{ textAlign: 'center' }}>
                                {user.photoURL && (
                                    <img
                                        src={user.photoURL}
                                        alt="Profile"
                                        style={{ width: '64px', height: '64px', borderRadius: '50%', marginBottom: '0.5rem' }}
                                    />
                                )}
                                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{user.displayName || 'User'}</div>
                                <div style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>{user.email}</div>

                                <button
                                    onClick={handleSignOut}
                                    className="btn-secondary"
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                >
                                    <LogOut size={18} /> Sign Out
                                </button>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center' }}>
                                <p>You are using a local guest account.</p>
                                <button
                                    onClick={() => navigate('/signin')}
                                    className="btn-primary"
                                    style={{ width: '100%' }}
                                >
                                    Sign In with Google
                                </button>
                            </div>
                        )}
                    </div>

                    {/* About */}
                    <div
                        style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '1rem', cursor: 'default' }}
                        onClick={() => setClickCount(c => c + 1)}
                    >
                        <p>Stop Procrastinating v1.0.1</p>
                        <p>Build healthy habits, one day at a time.</p>
                        {clickCount > 5 && <p>🦄 You found a unicorn!</p>}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Settings;
