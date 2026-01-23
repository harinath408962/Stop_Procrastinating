import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getStorage, setStorage, STORAGE_KEYS } from '../utils/storage';
import { ShieldAlert, Settings, Plus, X, ArrowLeft } from 'lucide-react';

const DistractionLimiter = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState('initial'); // initial, config, logging, success, calm
    const [distractions, setDistractions] = useState([]);

    // Config State
    const [newDistraction, setNewDistraction] = useState('');
    const [newReason, setNewReason] = useState('');
    const [reasonsList, setReasonsList] = useState([]);

    // Logging State
    const [selectedDistraction, setSelectedDistraction] = useState(null);
    const [selectedReasons, setSelectedReasons] = useState([]);
    const [timeSpent, setTimeSpent] = useState('');

    useEffect(() => {
        // Load defined distractions
        const saved = getStorage('sp_distraction_types', []);
        setDistractions(saved);
    }, []);

    const saveDistractionType = () => {
        if (!newDistraction) return;
        const updated = [...distractions, {
            id: Date.now(),
            name: newDistraction,
            reasons: reasonsList.length > 0 ? reasonsList : ['General']
        }];
        setStorage('sp_distraction_types', updated);
        setDistractions(updated);
        setNewDistraction('');
        setReasonsList([]);
        setNewReason('');
        setMode('initial');
    };

    const addReason = () => {
        if (newReason) {
            setReasonsList([...reasonsList, newReason]);
            setNewReason('');
        }
    };

    const handleLogSubmit = (e) => {
        e.preventDefault();
        const logs = getStorage(STORAGE_KEYS.DISTRACTION_LOGS, []);
        const newLog = {
            id: Date.now(),
            app: selectedDistraction.name,
            reasons: selectedReasons,
            duration: timeSpent,
            date: new Date().toISOString()
        };
        setStorage(STORAGE_KEYS.DISTRACTION_LOGS, [newLog, ...logs]);
        setMode('success');
    };

    const toggleReasonSelect = (reason) => {
        if (selectedReasons.includes(reason)) {
            setSelectedReasons(selectedReasons.filter(r => r !== reason));
        } else {
            setSelectedReasons([...selectedReasons, reason]);
        }
    };

    const resetLoggingState = () => {
        setSelectedDistraction(null);
        setSelectedReasons([]);
        setTimeSpent('');
    };

    // Render Views

    if (mode === 'calm') {
        return (
            <Layout>
                <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🌿</div>
                    <h2>Great Job!</h2>
                    <p>Focusing on your improvement is the best gift you can give yourself.</p>
                    <button className="btn-primary" onClick={() => setMode('initial')} style={{ marginTop: '2rem' }}>Back</button>
                </div>
            </Layout>
        );
    }

    if (mode === 'success') {
        return (
            <Layout>
                <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
                    <h2>Logged.</h2>
                    <p>Awareness is the first step. Use this data tomorrow.</p>
                    <button className="btn-primary" onClick={() => { setMode('initial'); resetLoggingState(); }} style={{ marginTop: '2rem' }}>Done</button>
                </div>
            </Layout>
        );
    }

    if (mode === 'config') {
        return (
            <Layout>
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2>Add Distraction</h2>
                        <button onClick={() => setMode('initial')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
                    </div>

                    <div className="card">
                        <div style={{ marginBottom: '1rem' }}>
                            <label>Distraction Name</label>
                            <input
                                value={newDistraction}
                                onChange={e => setNewDistraction(e.target.value)}
                                placeholder="e.g. YouTube Shorts"
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label>Possible Reasons</label>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <input
                                    value={newReason}
                                    onChange={e => setNewReason(e.target.value)}
                                    placeholder="e.g. Boredom"
                                />
                                <button type="button" onClick={addReason} className="btn-primary" style={{ padding: '0.5rem' }}><Plus size={16} /></button>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {reasonsList.map((r, i) => (
                                    <span key={i} style={{ background: '#f1f5f9', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}>{r}</span>
                                ))}
                            </div>
                        </div>

                        <button className="btn-primary" onClick={saveDistractionType} style={{ width: '100%' }}>Save</button>
                    </div>
                </div>
            </Layout>
        )
    }

    if (mode === 'logging') {
        return (
            <Layout>
                <div className="container">
                    <button
                        onClick={() => { setMode('initial'); resetLoggingState(); }}
                        style={{
                            background: 'var(--color-bg-secondary)',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: 'var(--color-primary)',
                            padding: '0.5rem 1rem',
                            borderRadius: '2rem',
                            fontWeight: '500',
                            marginBottom: '1rem'
                        }}
                    >
                        <ArrowLeft size={18} /> Back
                    </button>
                    <h2>Log Distraction</h2>

                    {!selectedDistraction ? (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <p>Which app did you use?</p>
                            {distractions.map(d => (
                                <button
                                    key={d.id}
                                    className="card"
                                    onClick={() => setSelectedDistraction(d)}
                                    style={{ textAlign: 'left', cursor: 'pointer', borderColor: 'var(--color-primary)' }}
                                >
                                    <strong>{d.name}</strong>
                                </button>
                            ))}
                            {distractions.length === 0 && <p>No distractions configured. Go back and add some!</p>}
                        </div>
                    ) : (
                        <form onSubmit={handleLogSubmit} className="card">
                            <h3 style={{ marginTop: 0 }}>{selectedDistraction.name}</h3>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label>Why did you check it? (Select all that apply)</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    {selectedDistraction.reasons.map((r, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => toggleReasonSelect(r)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: '2rem',
                                                border: '1px solid var(--color-primary)',
                                                background: selectedReasons.includes(r) ? 'var(--color-primary)' : 'white',
                                                color: selectedReasons.includes(r) ? 'white' : 'var(--color-primary)',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label>Time Spent (Minutes)</label>
                                <input
                                    type="number"
                                    required
                                    value={timeSpent}
                                    onChange={e => setTimeSpent(e.target.value)}
                                />
                            </div>

                            <button type="submit" className="btn-primary" style={{ width: '100%' }}>Save Log</button>
                        </form>
                    )}
                </div>
            </Layout>
        );
    }

    // Initial View
    return (
        <Layout>
            <div className="container" style={{ textAlign: 'center', paddingTop: '2rem' }}>
                <div style={{ position: 'absolute', left: '1rem', top: '5rem' }}>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            background: 'var(--color-bg-secondary)',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: 'var(--color-primary)',
                            padding: '0.5rem 1rem',
                            borderRadius: '2rem',
                            fontWeight: '500'
                        }}
                    >
                        <ArrowLeft size={18} /> Back
                    </button>
                </div>

                <ShieldAlert size={64} style={{ color: 'var(--color-text-accent)', marginBottom: '1rem' }} />
                <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Distracted?</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button
                        className="btn-primary"
                        style={{ padding: '1.5rem', fontSize: '1.25rem', background: '#ef4444' }} // Red for Yes (Honesty)
                        onClick={() => { resetLoggingState(); setMode('logging'); }}
                    >
                        Yes, I gave in.
                    </button>

                    <button
                        className="btn-primary"
                        style={{ padding: '1.5rem', fontSize: '1.25rem', background: '#10b981' }} // Green for No
                        onClick={() => setMode('calm')}
                    >
                        No, I'm focused.
                    </button>
                </div>

                <div style={{ marginTop: '2rem' }}>
                    <button
                        onClick={() => setMode('config')}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: 'transparent',
                            border: '1px dashed var(--color-text-secondary)',
                            color: 'var(--color-text-secondary)',
                            cursor: 'pointer',
                            padding: '0.75rem 1.5rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.9rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Plus size={16} /> Add Distraction
                    </button>
                </div>
            </div>
        </Layout>
    );
};

export default DistractionLimiter;
