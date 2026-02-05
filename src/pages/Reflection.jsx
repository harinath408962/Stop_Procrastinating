import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getStorage, setStorage, STORAGE_KEYS } from '../utils/storage';
import { logEvent } from '../utils/analytics';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Clock, Target, Calendar, CheckCircle, Trophy, ArrowLeft, AlertTriangle, Activity } from 'lucide-react';

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

        const totalDone = allCompleted.length + todaysWorkLogs.length;
        setTasksDoneCount(totalDone);

        // Fix: Match Home.jsx points logic
        const taskPoints = allCompleted.reduce((acc, t) => {
            if (t.pointsEarned !== undefined) return acc + t.pointsEarned;
            return acc + 10 + (parseInt(t.timeTaken) || 0);
        }, 0);

        const workLogPoints = todaysWorkLogs.reduce((acc, l) => acc + (parseInt(l.duration) || 0), 0);
        setPointsScored(taskPoints + workLogPoints);

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

        logEvent('diary_entry', {
            procrastination_score: procrastinationScore,
            work_score: workScore,
            tomorrow_goal: tomorrowGoal,
            total_distraction_time: totalDistractionTime,
            total_work_time: totalTaskTime
        });

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
                    <h2 style={{ margin: 0 }}>Today's Reflection</h2>
                </div>

                <form onSubmit={handleSubmit}>

                    {/* 1. Overall Work Score (Donut Chart) */}
                    <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap' }}>
                        <div style={{ width: '180px', height: '180px', position: 'relative' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Work', value: workScore, color: '#10b981' },
                                            { name: 'Procrastination', value: procrastinationScore, color: '#ef4444' }
                                        ]}
                                        dataKey="value"
                                        innerRadius={60}
                                        outerRadius={80}
                                        startAngle={90}
                                        endAngle={-270}
                                        paddingAngle={5}
                                    >
                                        <Cell key="work" fill="#10b981" />
                                        <Cell key="proc" fill="#ef4444" />
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: workScore >= 50 ? '#10b981' : '#ef4444' }}>
                                    {workScore}%
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>Focus</div>
                            </div>
                        </div>

                        <div style={{ textAlign: 'left', padding: '1rem' }}>
                            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem' }}>Day Summary</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></div>
                                    <span>Productive: <strong>{totalTaskTime}m</strong></span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></div>
                                    <span>Distracted: <strong>{totalDistractionTime}m</strong></span>
                                </div>
                                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                    Tasks Done: <strong>{tasksDoneCount}</strong> | Points: <strong>{pointsScored}</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Today's Activity Log (Timeline Style) */}
                    <div className="card" style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Activity size={18} /> Activity Log
                        </h3>

                        {(todayTasks.length === 0 && todayDistractions.length === 0 && todayWorkLogs.length === 0) ? (
                            <p style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic', textAlign: 'center', padding: '1rem' }}>No activity recorded yet.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {/* Tasks */}
                                {todayTasks.map((t, i) => (
                                    <div key={`task-${i}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-bg-secondary)' }}>
                                        <div style={{ padding: '0.5rem', borderRadius: '50%', background: '#dcfce7', color: '#15803d' }}>
                                            <CheckCircle size={16} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 500 }}>{t.title || t.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Completed Task</div>
                                        </div>
                                        <div style={{ fontWeight: 'bold', color: '#15803d' }}>{t.timeTaken || 0}m</div>
                                    </div>
                                ))}
                                {/* Partial Logs */}
                                {todayWorkLogs.map((log, i) => (
                                    <div key={`log-${i}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-bg-secondary)' }}>
                                        <div style={{ padding: '0.5rem', borderRadius: '50%', background: '#dbeafe', color: '#1d4ed8' }}>
                                            <Clock size={16} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 500 }}>{log.taskTitle}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Work Session</div>
                                        </div>
                                        <div style={{ fontWeight: 'bold', color: '#1d4ed8' }}>{log.duration}m</div>
                                    </div>
                                ))}
                                {/* Distractions */}
                                {todayDistractions.map((log, i) => (
                                    <div key={`dist-${i}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-bg-secondary)' }}>
                                        <div style={{ padding: '0.5rem', borderRadius: '50%', background: '#fee2e2', color: '#b91c1c' }}>
                                            <AlertTriangle size={16} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 500 }}>{log.app}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{log.reasons.join(', ')}</div>
                                        </div>
                                        <div style={{ fontWeight: 'bold', color: '#b91c1c' }}>{log.duration}m</div>
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
