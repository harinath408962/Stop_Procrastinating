import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getStorage, setStorage, STORAGE_KEYS } from '../utils/storage';
import { PieChart, Clock, Target, Calendar, CheckCircle, Trophy, ArrowLeft } from 'lucide-react';

const Reflection = () => {
    const navigate = useNavigate();
    const [procrastinationScore, setProcrastinationScore] = useState(30);
    const [tomorrowGoal, setTomorrowGoal] = useState('');
    const [todayDistractions, setTodayDistractions] = useState([]);
    const [tasksDoneCount, setTasksDoneCount] = useState(0);
    const [pointsScored, setPointsScored] = useState(0);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        // Fetch today's distraction logs
        const logs = getStorage(STORAGE_KEYS.DISTRACTION_LOGS, []);
        const today = new Date().setHours(0, 0, 0, 0);
        const todaysLogs = logs.filter(log => {
            const logDate = new Date(log.date).setHours(0, 0, 0, 0);
            return logDate === today;
        });
        setTodayDistractions(todaysLogs);

        // Calculate Tasks Done Today
        const tasks = getStorage(STORAGE_KEYS.TASKS, []);
        const scheduled = getStorage(STORAGE_KEYS.SCHEDULED_TASKS, []);

        const completedTasks = tasks.filter(t => {
            if (!t.completed || !t.completedAt) return false;
            return new Date(t.completedAt).setHours(0, 0, 0, 0) === today;
        });

        const completedScheduled = scheduled.filter(t => {
            if (!t.completed || !t.completedAt) return false;
            return new Date(t.completedAt).setHours(0, 0, 0, 0) === today;
        });

        const totalDone = completedTasks.length + completedScheduled.length;
        setTasksDoneCount(totalDone);
        setPointsScored(totalDone * 10); // Assuming 10 points per task
    }, []);

    const workScore = 100 - procrastinationScore;

    const handleSubmit = (e) => {
        e.preventDefault();
        const history = getStorage(STORAGE_KEYS.REFLECTIONS, []);
        const newEntry = {
            id: Date.now(),
            date: new Date().toISOString(),
            procrastinationScore,
            workScore,
            tomorrowGoal,
            distractionCount: todayDistractions.length,
            distractionTime: todayDistractions.reduce((acc, curr) => acc + parseInt(curr.duration || 0), 0),
            tasksDoneCount,
            pointsScored
        };

        setStorage(STORAGE_KEYS.REFLECTIONS, [newEntry, ...history]);
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <Layout>
                <div className="container" style={{ textAlign: 'center', paddingTop: '3rem' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🌙</div>
                    <h2>Reflection Saved</h2>
                    <p>Rest well. Tomorrow is a fresh start.</p>
                    <button className="btn-primary" onClick={() => navigate('/')} style={{ marginTop: '2rem' }}>Back Home</button>
                    <div style={{
                        marginTop: '2rem',
                        padding: '1.5rem',
                        background: 'var(--color-bg-accent)',
                        borderRadius: 'var(--radius-lg)',
                        textAlign: 'left'
                    }}>
                        <h3 style={{ fontSize: '1.1rem', marginTop: 0 }}>Target for Tomorrow:</h3>
                        <p style={{ fontSize: '1.2rem', color: 'var(--color-primary)', fontWeight: 600 }}>{tomorrowGoal}</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container">
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
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
                            fontWeight: '500',
                            marginRight: '1rem'
                        }}
                    >
                        <ArrowLeft size={18} /> Back
                    </button>
                    <h2 style={{ margin: 0 }}>End of Day Reflection</h2>
                </div>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>Be honest. Data helps you improve.</p>

                <form onSubmit={handleSubmit} className="card">

                    {/* Metrics Section */}
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Procrastination Level</span>
                            <span style={{ fontWeight: 'bold', color: 'var(--color-warning)' }}>{procrastinationScore}%</span>
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={procrastinationScore}
                            onChange={e => setProcrastinationScore(parseInt(e.target.value))}
                            style={{ width: '100%', accentColor: 'var(--color-warning)' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                            <span>Focused</span>
                            <span>Distracted</span>
                        </div>
                    </div>

                    <div style={{
                        marginBottom: '2rem',
                        padding: '1.5rem',
                        background: '#f0fdf4',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid #bbf7d0',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '0.9rem', color: '#166534', marginBottom: '0.25rem' }}>Overall Work Score</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#15803d' }}>{workScore}%</div>
                    </div>

                    {/* Achievements Section */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                        <div className="card" style={{ padding: '1rem', textAlign: 'center', background: 'var(--color-bg-secondary)' }}>
                            <CheckCircle size={24} style={{ color: 'var(--color-success)', marginBottom: '0.5rem' }} />
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{tasksDoneCount}</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Tasks Done</div>
                        </div>
                        <div className="card" style={{ padding: '1rem', textAlign: 'center', background: 'var(--color-bg-secondary)' }}>
                            <Trophy size={24} style={{ color: 'var(--color-warning)', marginBottom: '0.5rem' }} />
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{pointsScored}</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Points Scored</div>
                        </div>
                    </div>

                    {/* Distraction Summary */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={16} /> Today's Distractions
                        </h3>
                        {todayDistractions.length === 0 ? (
                            <p style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>No distractions logged today.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {todayDistractions.map(log => (
                                    <div key={log.id} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '0.75rem',
                                        background: 'var(--color-bg-secondary)',
                                        borderRadius: 'var(--radius-sm)'
                                    }}>
                                        <span>{log.app} <small style={{ color: 'var(--color-text-secondary)' }}>({log.reasons.join(', ')})</small></span>
                                        <strong>{log.duration}m</strong>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Tomorrow's Goal */}
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Target size={18} /> Goal for Tomorrow
                        </label>
                        <input
                            required
                            value={tomorrowGoal}
                            onChange={e => setTomorrowGoal(e.target.value)}
                            placeholder="e.g. Finish the Math Chapter without phone"
                        />
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>Save & Close Day</button>
                </form>
            </div>
        </Layout>
    );
};

export default Reflection;
