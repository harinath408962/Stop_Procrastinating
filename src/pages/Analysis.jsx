import { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import { getStorage, STORAGE_KEYS } from '../utils/storage';
import { generateEventCsv, downloadCsv } from '../utils/exportUtils';
import { generateSmartInsight } from '../utils/ml/recommender';
import { Download, ArrowLeft, Zap, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const Analysis = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState([]);
    const [insights, setInsights] = useState([]);

    useEffect(() => {
        // Fetch all raw data
        const tasks = getStorage(STORAGE_KEYS.TASKS, []);
        const scheduled = getStorage(STORAGE_KEYS.SCHEDULED_TASKS, []);
        const workLogs = getStorage(STORAGE_KEYS.WORK_LOGS, []);
        const distLogs = getStorage(STORAGE_KEYS.DISTRACTION_LOGS, []);
        const history = getStorage(STORAGE_KEYS.REFLECTIONS, []);

        const dailyData = {};

        // Helper to init day
        const getDay = (dateStr) => {
            if (!dailyData[dateStr]) {
                dailyData[dateStr] = {
                    date: new Date(dateStr).toISOString(),
                    taskTime: 0,
                    distractionTime: 0,
                    pointsScored: 0,
                    workScore: 0,
                    procrastinationScore: 0,
                    tasksDoneCount: 0
                };
            }
            return dailyData[dateStr];
        };

        // 1. Process Tasks (Regular + Scheduled)
        [...tasks, ...scheduled].forEach(t => {
            if (t.completed && t.completedAt) {
                const dateStr = new Date(t.completedAt).toDateString();
                const day = getDay(dateStr);

                day.taskTime += (parseInt(t.timeTaken) || 0);
                day.tasksDoneCount += 1;

                // Points Logic
                if (t.pointsEarned !== undefined) {
                    day.pointsScored += t.pointsEarned;
                } else {
                    day.pointsScored += 10 + (parseInt(t.timeTaken) || 0);
                }
            }
        });

        // 2. Process Work Logs
        workLogs.forEach(log => {
            if (log.date) {
                const dateStr = new Date(log.date).toDateString();
                const day = getDay(dateStr);

                const duration = parseInt(log.duration) || 0;
                day.taskTime += duration;
                day.pointsScored += duration; // 1 pt/min

                // User logic: Work Logs count as "Tasks Done"
                day.tasksDoneCount += 1;
            }
        });

        // 3. Process Distractions
        distLogs.forEach(log => {
            if (log.date) {
                const dateStr = new Date(log.date).toDateString();
                const day = getDay(dateStr);
                day.distractionTime += (parseInt(log.duration) || 0);
            }
        });

        // 4. Calculate Scores AND Merge Metadata from Reflections (if needed for debugging, but mostly we trust raw data now)
        // We still need to ensure we show days that might ONLY have a reflection but no logs (unlikely, but safe)
        history.forEach(entry => {
            const dateStr = new Date(entry.date).toDateString();
            if (!dailyData[dateStr]) {
                // If it exists in reflection but somehow no raw data, keep it?
                // Or just ignore it if we trust raw data 100%. 
                // Let's keep it but trust raw data if we have it.
                dailyData[dateStr] = { ...entry, date: new Date(dateStr).toISOString() };
            }
        });

        // Finalize Scores for calculated days
        Object.keys(dailyData).forEach(key => {
            const day = dailyData[key];
            const totalActive = day.taskTime + day.distractionTime;
            if (totalActive > 0) {
                day.procrastinationScore = Math.round((day.distractionTime / totalActive) * 100);
                day.workScore = 100 - day.procrastinationScore;
            } else {
                // Retain original scores if we didn't recalc them (e.g. from reflection only)
                // or set to 0
            }
        });

        // Convert to array and sort
        const sorted = Object.values(dailyData).sort((a, b) => new Date(a.date) - new Date(b.date));
        setStats(sorted);

        // 5. ML Insights
        const generatedInsights = generateSmartInsight();
        setInsights(generatedInsights);
    }, []);

    const downloadCSV = () => {
        const events = getStorage(STORAGE_KEYS.EVENT_LOG, []);
        if (!events || events.length === 0) {
            alert("No detailed event data found yet. Start using the app to generate logs!");
            return;
        }

        const csvContent = generateEventCsv(events);
        downloadCsv(csvContent, `stop_procrastinating_events_${new Date().toISOString().split('T')[0]}.csv`);
    };

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
                    <h2 style={{ flex: 1, textAlign: 'center', margin: 0 }}>Progress Analysis</h2>
                    <button
                        onClick={downloadCSV}
                        style={{
                            background: 'transparent',
                            border: '1px solid var(--color-primary)',
                            color: 'var(--color-primary)',
                            padding: '0.5rem',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        title="Export Detailed Event Logs (CSV)"
                    >
                        <Download size={20} />
                    </button>
                </div>

                <div style={{ display: 'grid', gap: '2rem' }}>

                    {/* ML Dashboard */}
                    {insights.length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                            {insights.map((insight, idx) => (
                                <div key={idx} className="card" style={{
                                    background: insight.type === 'warning' ? '#fef2f2' : insight.type === 'success' ? '#f0fdf4' : '#f0f9ff',
                                    border: insight.type === 'warning' ? '1px solid #fecaca' : insight.type === 'success' ? '1px solid #bbf7d0' : '1px solid #bae6fd'
                                }}>
                                    <h3 style={{
                                        marginBottom: '0.5rem',
                                        fontSize: '1rem',
                                        color: insight.type === 'warning' ? '#b91c1c' : insight.type === 'success' ? '#15803d' : '#0369a1',
                                        display: 'flex', alignItems: 'center', gap: '0.5rem'
                                    }}>
                                        {insight.type === 'warning' ? <AlertTriangle size={18} /> : insight.type === 'success' ? <TrendingUp size={18} /> : <Zap size={18} />}
                                        {insight.title}
                                    </h3>
                                    <p style={{
                                        color: insight.type === 'warning' ? '#991b1b' : insight.type === 'success' ? '#166534' : '#0284c7',
                                        fontSize: '0.95rem', margin: 0
                                    }}>
                                        {insight.text.replace(/\*\*/g, '')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Chart 1: Work vs Procrastination (Line) */}
                    <div className="card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Focus Consistency</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                            Work Score vs Procrastination Score over time.
                        </p>
                        <div style={{ flex: 1, minHeight: 0 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="date" tickFormatter={d => new Date(d).getDate() + '/' + (new Date(d).getMonth() + 1)} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                                    <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                                    <Tooltip
                                        labelFormatter={l => new Date(l).toDateString()}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="workScore" name="Work Score" stroke="#22c55e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="procrastinationScore" name="Procrastination" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Chart 2: Time Breakdown (Stacked Bar) */}
                    <div className="card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Daily Time Breakdown (Mins)</h3>
                        <div style={{ flex: 1, minHeight: 0 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="date" tickFormatter={d => new Date(d).getDate() + '/' + (new Date(d).getMonth() + 1)} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                                    <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                                    <Tooltip
                                        labelFormatter={l => new Date(l).toDateString()}
                                        cursor={{ fill: '#f1f5f9' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="taskTime" name="Productive Time" stackId="a" fill="#22c55e" radius={[0, 0, 4, 4]} />
                                    <Bar dataKey="distractionTime" name="Distracted Time" stackId="a" fill="#f97316" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Chart 3: Points Trend (Area) */}
                    <div className="card" style={{ height: '350px', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Growth (Points Earned)</h3>
                        <div style={{ flex: 1, minHeight: 0 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                                    <defs>
                                        <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="date" tickFormatter={d => new Date(d).getDate() + '/' + (new Date(d).getMonth() + 1)} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                                    <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                                    <Tooltip
                                        labelFormatter={l => new Date(l).toDateString()}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="pointsScored" name="Points" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorPoints)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            </div>
        </Layout>
    );
};

export default Analysis;
