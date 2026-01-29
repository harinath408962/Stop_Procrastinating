import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getStorage, STORAGE_KEYS } from '../utils/storage';
import { generateEventCsv, downloadCsv } from '../utils/exportUtils';
import { generateSmartInsight } from '../utils/ml/recommender';
import BarChart from '../components/BarChart';
import LineChart from '../components/LineChart';
import { Download, ArrowLeft, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Analysis = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState([]);
    const [smartTip, setSmartTip] = useState(null);

    useEffect(() => {
        const history = getStorage(STORAGE_KEYS.REFLECTIONS, []);
        const dailyData = {};

        // 1. Process History
        history.forEach(entry => {
            const dateStr = new Date(entry.date).toDateString();
            if (!dailyData[dateStr] || new Date(entry.date) > new Date(dailyData[dateStr].date)) {
                dailyData[dateStr] = entry;
            }
        });

        // 2. Calculate Live Stats for Today
        const calculateLiveToday = () => {
            const todayDateStr = new Date().toDateString();

            // Fetch Logs
            const tasks = getStorage(STORAGE_KEYS.TASKS, []);
            const scheduled = getStorage(STORAGE_KEYS.SCHEDULED_TASKS, []);
            const workLogs = getStorage(STORAGE_KEYS.WORK_LOGS, []);
            const distLogs = getStorage(STORAGE_KEYS.DISTRACTION_LOGS, []);

            // Filter for Today
            const todaysTasks = [...tasks, ...scheduled].filter(t =>
                t.completed && t.completedAt && new Date(t.completedAt).toDateString() === todayDateStr
            );
            const todaysWorkLogs = workLogs.filter(l => new Date(l.date).toDateString() === todayDateStr);
            const todaysDistractions = distLogs.filter(l => new Date(l.date).toDateString() === todayDateStr);

            // Calculate Metrics
            const taskTime = todaysTasks.reduce((acc, t) => acc + (parseInt(t.timeTaken) || 0), 0);
            const partialTime = todaysWorkLogs.reduce((acc, l) => acc + (parseInt(l.duration) || 0), 0);
            const totalWorkTime = taskTime + partialTime;

            const distTime = todaysDistractions.reduce((acc, d) => acc + (parseInt(d.duration) || 0), 0);

            // Points
            const taskPoints = todaysTasks.reduce((acc, t) => {
                if (t.pointsEarned !== undefined) return acc + t.pointsEarned;
                return acc + 10 + (parseInt(t.timeTaken) || 0);
            }, 0);
            const workLogPoints = todaysWorkLogs.reduce((acc, l) => acc + (parseInt(l.duration) || 0), 0);
            const totalPoints = taskPoints + workLogPoints;

            // Scores
            let workScore = 0;
            let procrastinationScore = 0;
            const totalActive = totalWorkTime + distTime;
            if (totalActive > 0) {
                procrastinationScore = Math.round((distTime / totalActive) * 100);
                workScore = 100 - procrastinationScore;
            }

            return {
                date: new Date().toISOString(),
                workScore,
                procrastinationScore,
                taskTime: totalWorkTime,
                distractionTime: distTime,
                pointsScored: totalPoints,
                isLive: true
            };
        };

        const liveToday = calculateLiveToday();

        // 3. Merge Live Today
        // Always show today if we have active data OR if we just want the chart to be current
        if (liveToday.taskTime > 0 || liveToday.distractionTime > 0 || liveToday.pointsScored > 0) {
            const todayStr = new Date().toDateString();
            dailyData[todayStr] = liveToday;
        }

        // Convert to array and sort
        const sorted = Object.values(dailyData).sort((a, b) => new Date(a.date) - new Date(b.date));
        setStats(sorted);
        // 5. ML Insights
        const tip = generateSmartInsight();
        setSmartTip(tip);
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

                    {/* ML Insight Card */}
                    {smartTip && (
                        <div className="card" style={{ background: smartTip.type === 'warning' ? '#fef2f2' : '#f0f9ff', border: smartTip.type === 'warning' ? '1px solid #fecaca' : '1px solid #bae6fd' }}>
                            <h3 style={{ marginBottom: '0.5rem', color: smartTip.type === 'warning' ? '#b91c1c' : '#0369a1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Zap size={20} /> Smart Insight
                            </h3>
                            <p style={{ color: smartTip.type === 'warning' ? '#991b1b' : '#0284c7', fontSize: '1.1rem' }}>
                                {smartTip.text.replace(/\*\*/g, '')}
                            </p>
                            {smartTip.type === 'neutral' && (
                                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: 'var(--color-text-secondary)' }}>
                                    (The more you use the app, the smarter these tips become!)
                                </p>
                            )}
                        </div>
                    )}

                    {/* Graph 1: Work vs Procrastination */}
                    <div className="card">
                        <h3 style={{ marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Work vs Procrastination (%)</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                            Aim to keep the <span style={{ color: '#22c55e', fontWeight: 'bold' }}>Green</span> line above the <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Red</span> line.
                        </p>
                        <LineChart
                            data={stats}
                            dataKeys={['workScore', 'procrastinationScore']}
                            colors={['#22c55e', '#ef4444']}
                        />
                    </div>

                    {/* Graph 2: Work Time vs Distracted Time (Grouped Bar) */}
                    <div className="card">
                        <h3 style={{ marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Time: Work vs Distracted (Minutes)</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                            Daily comparison of productive time vs lost time.
                        </p>
                        <BarChart
                            data={stats}
                            dataKeys={['taskTime', 'distractionTime']}
                            colors={['#22c55e', '#f97316']}
                        />
                    </div>

                    {/* Graph 3: Points Earned (Bar) */}
                    <div className="card">
                        <h3 style={{ marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Focus Points Earned</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                            Your daily rewards for completing tasks and building habits.
                        </p>
                        <BarChart
                            data={stats}
                            dataKeys={['pointsScored']}
                            colors={['#a855f7']}
                        />
                    </div>

                </div>
            </div>
        </Layout>
    );
};

export default Analysis;
