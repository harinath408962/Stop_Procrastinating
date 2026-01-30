import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { auth, googleProvider, db } from '../utils/firebase';
import { signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getStorage, STORAGE_KEYS, setStorage, clearAllStorage, loadFromCloud } from '../utils/storage';
import { LogIn, Loader } from 'lucide-react';

const SignIn = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // SYNC LOGIC
            const userRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userRef);

            if (docSnap.exists()) {
                // User exists: Pull data from cloud and merge/overwrite local
                // FIRST: Clear local storage to avoid bleeding previous user's data
                clearAllStorage();

                await loadFromCloud(user);
            } else {
                // New user (in cloud): Push local data to cloud
                const localData = {
                    email: user.email,
                    displayName: user.displayName,
                    createdAt: new Date().toISOString(),
                    tasks: JSON.stringify(getStorage(STORAGE_KEYS.TASKS, [])),
                    scheduled: JSON.stringify(getStorage(STORAGE_KEYS.SCHEDULED_TASKS, [])),
                    reflections: JSON.stringify(getStorage(STORAGE_KEYS.REFLECTIONS, [])),
                    stats: JSON.stringify(getStorage(STORAGE_KEYS.USER_STATS, {})),
                    mood: getStorage(STORAGE_KEYS.USER_MOOD, null)
                };

                await setDoc(userRef, localData);
                console.log("Local data backed up to cloud!");
            }

            navigate('/');
        } catch (err) {
            console.error("Login Result Error:", err);
            setError(`Failed to sign in: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
                <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
                    <h2 style={{ marginBottom: '1rem' }}>Backup Your Progress</h2>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
                        Sign in to save your tasks, streaks, and reflections to the cloud. Access them from any device.
                    </p>

                    {error && (
                        <div style={{ color: 'var(--color-danger)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="btn-primary"
                        style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem'
                        }}
                    >
                        {loading ? <Loader className="spin" size={20} /> : <LogIn size={20} />}
                        {loading ? 'Signing In...' : 'Sign in with Google'}
                    </button>
                </div>
            </div>
        </Layout>
    );
};

export default SignIn;
