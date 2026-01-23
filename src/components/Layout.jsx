import { useRef, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart2, Calendar, Settings, ShieldAlert, TrendingUp, LogIn, User } from 'lucide-react';
import { getStorage, STORAGE_KEYS, clearAllStorage } from '../utils/storage';
import { auth } from '../utils/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const Layout = ({ children }) => {
    const location = useLocation();
    const stats = getStorage(STORAGE_KEYS.USER_STATS, { totalPoints: 0, currentStreak: 0 });
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const handleSignOut = () => {
        clearAllStorage();
        signOut(auth);
    };

    return (
        <div className="layout-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header style={{
                padding: '1rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'white'
            }}>
                <Link to="/" style={{ textDecoration: 'none', color: 'var(--color-primary)', fontWeight: 'bold' }}>
                    Stop Procrastinating
                </Link>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span role="img" aria-label="streak">🔥</span>
                        <span>{stats.currentStreak} Days</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span role="img" aria-label="points">✨</span>
                        <span>{stats.totalPoints} pts</span>
                    </div>
                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.5rem' }}>
                            {user.photoURL ? (
                                <img src={user.photoURL} alt="User" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                            ) : (
                                <User size={20} />
                            )}
                            <button onClick={handleSignOut} style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'underline' }}>
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <Link to="/signin" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none', color: 'var(--color-primary)', marginLeft: '0.5rem' }}>
                            <LogIn size={18} />
                            <span>Sign In</span>
                        </Link>
                    )}
                </div>
            </header>

            <main style={{ flex: 1, paddingBottom: '2rem' }}>
                {children}
            </main>

            <nav style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                width: '100%',
                background: 'white',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-around',
                padding: '0.75rem 0',
                zIndex: 100
            }}>
                <NavLink to="/" icon={<Home size={20} />} label="Home" active={location.pathname === '/' || location.pathname === '/mood'} />
                <NavLink to="/schedule" icon={<Calendar size={20} />} label="Tasks" active={location.pathname === '/schedule'} />
                <NavLink to="/limit" icon={<ShieldAlert size={20} />} label="Limit" active={location.pathname === '/limit'} />
                <NavLink to="/reflect" icon={<BarChart2 size={20} />} label="Reflect" active={location.pathname === '/reflect'} />
                <NavLink to="/analysis" icon={<TrendingUp size={20} />} label="Analysis" active={location.pathname === '/analysis'} />
            </nav>
            {/* Spacer for fixed nav */}
            <div style={{ height: '70px' }}></div>
        </div>
    );
};

const NavLink = ({ to, icon, label, active }) => (
    <Link to={to} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textDecoration: 'none',
        color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
        fontSize: '0.75rem'
    }}>
        {icon}
        <span style={{ marginTop: '0.25rem' }}>{label}</span>
    </Link>
);

export default Layout;
