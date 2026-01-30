import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getStorage, setStorage, STORAGE_KEYS, addPoints, updateStreak } from '../utils/storage';
import { logEvent } from '../utils/analytics';
import { ShieldAlert, Settings, Plus, X, ArrowLeft, Camera, Upload, CheckCircle, Trash2, Pencil } from 'lucide-react';
import { useRef } from 'react';
import TimeOfDaySelector from '../components/TimeOfDaySelector';
import TimeSelector from '../components/TimeSelector';

const DistractionLimiter = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState('initial'); // initial, config, logging, success, calm
    const [distractions, setDistractions] = useState([]);

    // Config State
    const [newDistraction, setNewDistraction] = useState('');
    const [newReason, setNewReason] = useState('');
    const [reasonsList, setReasonsList] = useState([]);
    const [editingId, setEditingId] = useState(null);

    // Logging State (Distraction)
    const [selectedDistraction, setSelectedDistraction] = useState(null);
    const [selectedReasons, setSelectedReasons] = useState([]);
    const [timeSpent, setTimeSpent] = useState('');



    const [timeOfDay, setTimeOfDay] = useState('morning');

    useEffect(() => {
        const h = new Date().getHours();
        if (h >= 5 && h < 12) setTimeOfDay('morning');
        else if (h >= 12 && h < 17) setTimeOfDay('afternoon');
        else if (h >= 17 && h < 21) setTimeOfDay('evening');
        else setTimeOfDay('night');
    }, []);

    useEffect(() => {
        // Load defined distractions
        const saved = getStorage('sp_distraction_types', []);
        setDistractions(saved);
    }, []);

    const saveDistractionType = () => {
        if (!newDistraction) return;

        let updated;
        if (editingId) {
            updated = distractions.map(d => d.id === editingId ? { ...d, name: newDistraction, reasons: reasonsList.length > 0 ? reasonsList : ['General'] } : d);
        } else {
            updated = [...distractions, {
                id: Date.now(),
                name: newDistraction,
                reasons: reasonsList.length > 0 ? reasonsList : ['General']
            }];
        }

        setStorage('sp_distraction_types', updated);
        setDistractions(updated);
        setNewDistraction('');
        setReasonsList([]);
        setNewReason('');
        setEditingId(null);
        setMode('initial');
    };

    const handleEditDistraction = (d) => {
        setNewDistraction(d.name);
        setReasonsList(d.reasons);
        setEditingId(d.id);
    };

    const handleDeleteDistraction = (id) => {
        if (window.confirm('Delete this distraction type?')) {
            const updated = distractions.filter(d => d.id !== id);
            setDistractions(updated);
            setStorage('sp_distraction_types', updated);

            // If we were editing this one, reset form
            if (editingId === id) {
                setEditingId(null);
                setNewDistraction('');
                setReasonsList([]);
            }
        }
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

        logEvent('distraction_log', {
            app: selectedDistraction.name,
            reasons: selectedReasons,
            duration: parseInt(timeSpent) || 0,
            overrideTimeOfDay: timeOfDay
        });

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
                        <h2>{editingId ? 'Edit Distraction' : 'Add Distraction'}</h2>
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

                        <button className="btn-primary" onClick={saveDistractionType} style={{ width: '100%' }}>
                            {editingId ? 'Update Distraction' : 'Save Distraction'}
                        </button>
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                        <h3>Manage Distractions</h3>
                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                            {distractions.map(d => (
                                <div key={d.id} style={{
                                    padding: '1rem',
                                    background: 'var(--color-bg-secondary)',
                                    borderRadius: 'var(--radius-md)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ fontWeight: '500' }}>{d.name}</span>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => handleEditDistraction(d)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)' }}
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteDistraction(d.id)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {distractions.length === 0 && <p style={{ color: 'var(--color-text-secondary)' }}>No distractions added yet.</p>}
                        </div>
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
                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>What's pulling your attention?</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                                {distractions.map(d => (
                                    <button
                                        key={d.id}
                                        onClick={() => setSelectedDistraction(d)}
                                        style={{
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            border: '1px solid var(--color-bg-secondary)',
                                            background: 'white',
                                            padding: '1.25rem',
                                            borderRadius: 'var(--radius-lg)',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                            transition: 'transform 0.1s, border-color 0.1s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-bg-secondary)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                    >
                                        <div style={{ fontWeight: '600', fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>{d.name}</div>
                                        <ArrowLeft size={16} style={{ transform: 'rotate(180deg)', color: 'var(--color-text-secondary)' }} />
                                    </button>
                                ))}
                                <button
                                    onClick={() => setMode('config')}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        cursor: 'pointer',
                                        border: '2px dashed var(--color-bg-secondary)',
                                        background: 'transparent',
                                        padding: '1rem',
                                        borderRadius: 'var(--radius-lg)',
                                        color: 'var(--color-text-secondary)',
                                        fontWeight: '500'
                                    }}
                                >
                                    <Plus size={20} />
                                    <span>Add New</span>
                                </button>
                            </div>
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
                                <TimeSelector value={timeSpent} onChange={setTimeSpent} />
                            </div>

                            <TimeOfDaySelector value={timeOfDay} onChange={setTimeOfDay} />

                            <button
                                type="submit"
                                className="btn-primary"
                                style={{ width: '100%', opacity: !timeSpent ? 0.5 : 1, cursor: !timeSpent ? 'not-allowed' : 'pointer' }}
                                disabled={!timeSpent}
                            >
                                Save Log
                            </button>
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

                <div style={{ display: 'grid', gap: '1rem', width: '100%', maxWidth: '320px', margin: '0 auto' }}>
                    <button
                        className="btn-primary"
                        style={{
                            padding: '1.25rem',
                            fontSize: '1.1rem',
                            background: '#fee2e2',
                            color: '#b91c1c',
                            border: '1px solid #fecaca',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            borderRadius: 'var(--radius-lg)'
                        }}
                        onClick={() => { resetLoggingState(); setMode('logging'); }}
                    >
                        <ShieldAlert size={24} /> Yes, I gave in
                    </button>

                    <button
                        className="btn-primary"
                        style={{
                            padding: '1.25rem',
                            fontSize: '1.1rem',
                            background: '#dcfce7',
                            color: '#15803d',
                            border: '1px solid #bbf7d0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            borderRadius: 'var(--radius-lg)'
                        }}
                        onClick={() => setMode('calm')}
                    >
                        <CheckCircle size={24} /> No, I'm focused
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
