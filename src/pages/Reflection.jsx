import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getStorage, setStorage, STORAGE_KEYS } from '../utils/storage';
import { PieChart, Clock, Target, Calendar, CheckCircle, Trophy, ArrowLeft, AlertTriangle } from 'lucide-react';

const Reflection = () => {
    const navigate = useNavigate();
    const [procrastinationScore, setProcrastinationScore] = useState(0);
    const [workScore, setWorkScore] = useState(0);
    const [tomorrowGoal, setTomorrowGoal] = useState('');
    const [todayDistractions, setTodayDistractions] = useState([]);
    const [todayTasks, setTodayTasks] = useState([]);
    const [todayWorkLogs, setTodayWorkLogs] = useState([]);
    const [submitted, setSubmitted] = useState(false);

    // Metrics
    const [totalTaskTime, setTotalTaskTime] = useState(0);
    const [totalDistractionTime, setTotalDistractionTime] = useState(0);
    const [tasksDoneCount, setTasksDoneCount] = useState(0);
    const [pointsScored, setPointsScored] = useState(0);

    useEffect(() => {
        const today = new Date().setHours(0, 0, 0, 0);

        // 1. Fetch Today's Distractions
        const logs = getStorage(STORAGE_KEYS.DISTRACTION_LOGS, []);
        const todaysLogs = logs.filter(log => {
            const logDate = new Date(log.date).setHours(0, 0, 0, 0);
            return logDate === today;
        });
        setTodayDistractions(todaysLogs);

        const distTime = todaysLogs.reduce((acc, curr) => acc + parseInt(curr.duration || 0), 0);
        setTotalDistractionTime(distTime);

        // 2. Fetch Tasks Done Today
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

        const allCompleted = [...completedTasks, ...completedScheduled];
        setTodayTasks(allCompleted);

        // 2.5 Fetch Partial Work Logs
        const workLogs = getStorage(STORAGE_KEYS.WORK_LOGS, []);
        const todaysWorkLogs = workLogs.filter(log => {
            const logDate = new Date(log.date).setHours(0, 0, 0, 0);
            return logDate === today;
        });
        setTodayWorkLogs(todaysWorkLogs);

        const completedTime = allCompleted.reduce((acc, curr) => acc + (parseInt(curr.timeTaken) || 0), 0);
        const partialTime = todaysWorkLogs.reduce((acc, curr) => acc + parseInt(curr.duration || 0), 0);

        const totalWorkTime = completedTime + partialTime;
        setTotalTaskTime(totalWorkTime);

        const totalDone = allCompleted.length;
        setTasksDoneCount(totalDone);
        setPointsScored((totalDone * 10) + (todaysWorkLogs.length * 2)); // Bonus for logged sessions

        // 3. Calculate Scores
        const totalActiveTime = totalWorkTime + distTime;
        if (totalActiveTime > 0) {
            const procScore = Math.round((distTime / totalActiveTime) * 100);
            setProcrastinationScore(procScore);
            setWorkScore(100 - procScore);
        } else {
            // No data logged
            setWorkScore(0);
            setProcrastinationScore(0);
        }

    }, []);

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
            distractionTime: totalDistractionTime,
            tasksDoneCount,
            taskTime: totalTaskTime,
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

                <form onSubmit={handleSubmit} className="card">

                    {/* 1. Overall Work Score */}
                    <div style={{
                        marginBottom: '1.5rem',
                        padding: '1.5rem',
                        background: '#f0fdf4',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid #bbf7d0',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '0.9rem', color: '#166534', marginBottom: '0.25rem' }}>Overall Focus Score</div>
                        <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#15803d' }}>{workScore}%</div>
                    </div>

                    {/* 2. Procrastination Score */}
                    <div style={{
                        marginBottom: '2rem',
                        padding: '1rem',
                        background: '#fef2f2',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid #fecaca',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span style={{ color: '#991b1b', fontWeight: '500' }}>Procrastination Level</span>
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>{procrastinationScore}%</span>
                    </div>

                    {/* 3. Time Spent Stats */}
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Time Breakdown</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                        <div className="card" style={{ padding: '1rem', textAlign: 'center', background: 'var(--color-bg-secondary)' }}>
                            <CheckCircle size={24} style={{ color: 'var(--color-success)', marginBottom: '0.5rem' }} />
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalTaskTime}m</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Work Time</div>
                        </div>
                        <div className="card" style={{ padding: '1rem', textAlign: 'center', background: 'var(--color-bg-secondary)' }}>
                            <AlertTriangle size={24} style={{ color: 'var(--color-warning)', marginBottom: '0.5rem' }} />
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalDistractionTime}m</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Distracted</div>
                        </div>
                    </div>

                    {/* 4. Today's Data List */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Today's Activity Log</h3>

                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Today's Activity Log</h3>

                        {(todayTasks.length === 0 && todayDistractions.length === 0 && todayWorkLogs.length === 0) ? (
                            <p style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>No activity recorded yet.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {/* Tasks */}
                                {todayTasks.map((t, i) => (
                                    <div key={`task-${i}`} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '0.75rem',
                                        background: 'rgba(34, 197, 94, 0.1)',
                                        borderRadius: 'var(--radius-sm)',
                                        borderLeft: '4px solid var(--color-success)'
                                    }}>
                                        <span>{t.title || t.name} <strong style={{ color: 'var(--color-success)' }}>(Done)</strong></span>
                                        <strong>{t.timeTaken || 0}m</strong>
                                    </div>
                                ))}
                                {/* Partial Logs */}
                                {todayWorkLogs.map((log, i) => (
                                    <div key={`log-${i}`} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '0.75rem',
                                        background: 'rgba(59, 130, 246, 0.1)',
                                        borderRadius: 'var(--radius-sm)',
                                        borderLeft: '4px solid #3b82f6'
                                    }}>
                                        <span>{log.taskTitle} <small>(Work Log)</small></span>
                                        <strong>{log.duration}m</strong>
                                    </div>
                                ))}
                                {/* Distractions */}
                                {todayDistractions.map((log, i) => (
                                    <div key={`dist-${i}`} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '0.75rem',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        borderRadius: 'var(--radius-sm)',
                                        borderLeft: '4px solid var(--color-danger)'
                                    }}>
                                        <span>{log.app} <small>({log.reasons.join(', ')})</small></span>
                                        <strong>{log.duration}m</strong>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 5. Goal for Tomorrow */}
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <Target size={18} /> Goal for Tomorrow
                        </label>
                        <input
                            required
                            value={tomorrowGoal}
                            onChange={e => setTomorrowGoal(e.target.value)}
                            placeholder="e.g. Finish the Math Chapter without phone"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1' }}
                        />
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem' }}>Save & Close Day</button>
                </form>
            </div>
        </Layout>
    );
};

export default Reflection;
