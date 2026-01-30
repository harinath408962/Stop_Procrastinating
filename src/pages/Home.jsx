import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getStorage, STORAGE_KEYS } from '../utils/storage';
import { generateSmartInsight } from '../utils/ml/recommender';
import { Trophy, ArrowRight, Activity, Calendar, Zap, Download, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const Home = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('Friend');
    const [streak, setStreak] = useState(0);
    const [points, setPoints] = useState(0);
    const [dailyStatement, setDailyStatement] = useState('Start your day!');
    const [smartTip, setSmartTip] = useState(null); // ML Tip
    const [insights, setInsights] = useState([]);
    const [topDistractions, setTopDistractions] = useState([]);
    const [lastReflection, setLastReflection] = useState(null);
    const [deferredPrompt, setDeferredPrompt] = useState(null);

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    useEffect(() => {
        // Load user data
        setUserName(getStorage(STORAGE_KEYS.USER_NAME, 'Friend'));

        const stats = getStorage(STORAGE_KEYS.USER_STATS, { currentStreak: 0, totalPoints: 0 });
        setStreak(stats.currentStreak);
        setPoints(stats.totalPoints);

        // Calculate Live Snapshot for Today
        const calculateLiveStats = () => {
            const today = new Date().setHours(0, 0, 0, 0);

            // 1. Logs & Distractions
            const distLogs = getStorage(STORAGE_KEYS.DISTRACTION_LOGS, []);
            const todaysDistractions = distLogs.filter(l => new Date(l.date).toDateString() === new Date().toDateString());
            const distTime = todaysDistractions.reduce((acc, curr) => acc + parseInt(curr.duration || 0), 0);
            const distCount = todaysDistractions.length;

            // Top 3 Distractions
            const distMap = {};
            todaysDistractions.forEach(d => {
                distMap[d.app] = (distMap[d.app] || 0) + parseInt(d.duration || 0);
            });
            const sortedDist = Object.entries(distMap)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([name, duration]) => ({ name, duration }));
            setTopDistractions(sortedDist);

            // 2. Tasks Completed (Regular + Scheduled)
            const tasks = getStorage(STORAGE_KEYS.TASKS, []);
            const scheduled = getStorage(STORAGE_KEYS.SCHEDULED_TASKS, []);

            const completedTasks = tasks.filter(t => t.completed && t.completedAt && new Date(t.completedAt).toDateString() === new Date().toDateString());
            const completedSched = scheduled.filter(t => t.completed && t.completedAt && new Date(t.completedAt).toDateString() === new Date().toDateString());
            const allCompleted = [...completedTasks, ...completedSched];

            const completedTime = allCompleted.reduce((acc, curr) => acc + (parseInt(curr.timeTaken) || 0), 0);

            // 3. Partial Work Logs
            const workLogs = getStorage(STORAGE_KEYS.WORK_LOGS, []);
            const todaysWorkLogs = workLogs.filter(l => new Date(l.date).toDateString() === new Date().toDateString());
            const partialTime = todaysWorkLogs.reduce((acc, curr) => acc + parseInt(curr.duration || 0), 0);

            const totalWorkTime = completedTime + partialTime;
            const tasksDoneCount = allCompleted.length;

            // Fix: Sum actual points earned stored on tasks. Fallback to old formula if missing.
            // + Add Points from Work Logs (Duration = Points)
            const taskPoints = allCompleted.reduce((acc, t) => {
                if (t.pointsEarned !== undefined) return acc + t.pointsEarned;
                // Fallback for old tasks or if saving failed: 10 base + timeTaken
                const effectiveTime = parseInt(t.timeTaken) || 0;
                return acc + 10 + effectiveTime;
            }, 0);

            // Work logs give 1pt per minute (as per Schedule.jsx handleLogWork)
            const workLogPoints = todaysWorkLogs.reduce((acc, log) => acc + parseInt(log.duration || 0), 0);

            const pointsScored = taskPoints + workLogPoints;

            // 4. Scores & Statement
            let workScore = 0;
            let procrastinationScore = 0;
            const totalActiveTime = totalWorkTime + distTime;
            let statement = "Ready to start?";

            if (totalActiveTime > 0) {
                const procScore = Math.round((distTime / totalActiveTime) * 100);
                procrastinationScore = procScore;
                workScore = 100 - procScore;

                if (workScore >= 80) statement = "You are on fire! 🔥 Highly Focused.";
                else if (workScore >= 50) statement = "Good flow. Keep working! 💪";
                else if (workScore >= 30) statement = "Distractions are creeping in. ⚠️";
                else statement = "Procrastination is winning. Fight back! 🛡️";
            }
            setDailyStatement(statement);

            // Retrieve Tomorrow's Goal from the LAST VALID reflection
            const history = getStorage(STORAGE_KEYS.REFLECTIONS, []);
            // Sort by date desc
            const sortedHistory = history.sort((a, b) => new Date(b.date) - new Date(a.date));
            const latest = sortedHistory[0];
            const tomorrowGoal = latest ? latest.tomorrowGoal : null;

            setLastReflection({
                date: new Date().toISOString(),
                workScore,
                procrastinationScore,
                tasksDoneCount,
                pointsScored,
                distractionTime: distTime,
                distractionCount: distCount,
                tomorrowGoal: tomorrowGoal,
                workTime: totalWorkTime,
                isLive: true
            });
        };


        // 5. ML Insights
        const tips = generateSmartInsight();
        setInsights(tips);
        if (tips && tips.length > 0) {
            setSmartTip(tips[0]);
        }

        calculateLiveStats();
    }, []);

    return (
        <Layout>
            <div className="container" style={{ textAlign: 'center', paddingTop: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Stop Procrastinating
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
                    Start small. Be kind to yourself.
                </p>

                <div className="card" style={{ textAlign: 'left', marginBottom: '2rem' }}>
                    <h3 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Trophy className="text-secondary" size={20} />
                        Your Progress
                    </h3>

                    <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'var(--color-bg-accent)', borderRadius: 'var(--radius-md)', fontWeight: '500', color: 'var(--color-primary)' }}>
                        {dailyStatement}
                    </div>

                    {smartTip && smartTip.type !== 'neutral' && (
                        <div style={{
                            marginBottom: '1rem',
                            padding: '0.75rem',
                            background: smartTip.type === 'warning' ? '#fef2f2' : smartTip.type === 'success' ? '#f0fdf4' : '#f0f9ff',
                            borderRadius: 'var(--radius-md)',
                            border: smartTip.type === 'warning' ? '1px solid #fecaca' : smartTip.type === 'success' ? '1px solid #bbf7d0' : '1px solid #bae6fd',
                            fontSize: '0.9rem',
                            display: 'flex',
                            gap: '0.5rem',
                            alignItems: 'start'
                        }}>
                            <Zap size={16} style={{ marginTop: '2px', color: smartTip.type === 'warning' ? '#ef4444' : smartTip.type === 'success' ? '#15803d' : '#0284c7' }} />
                            <span style={{ color: smartTip.type === 'warning' ? '#b91c1c' : smartTip.type === 'success' ? '#166534' : '#0369a1' }}>
                                <strong>{smartTip.title}:</strong> {smartTip.text.replace(/\*\*/g, '')}
                            </span>
                        </div>
                    )}

                    <ul style={{ paddingLeft: '1.5rem', color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: '1rem' }}>
                        <li><strong>{streak}</strong> Total Days Active</li>
                        <li><strong>{points}</strong> Focus Points</li>
                    </ul>

                    {topDistractions.length > 0 && (
                        <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--color-text-primary)', marginBottom: '0.75rem' }}>Top Distractions Today:</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {topDistractions.map((d, i) => (
                                    <div key={i} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        background: '#fff1f2',
                                        padding: '0.75rem 1rem',
                                        borderRadius: 'var(--radius-md)',
                                        borderLeft: '4px solid #f43f5e'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <AlertTriangle size={16} color="#f43f5e" />
                                            <span style={{ color: '#be123c', fontWeight: '500' }}>{d.name}</span>
                                        </div>
                                        <span style={{ fontWeight: 'bold', color: '#be123c' }}>{d.duration}m</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '2rem' }}>
                    <button className="btn-primary" onClick={() => navigate('/mood')}>
                        Get Started <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
                    </button>




                </div>

                {/* Dashboard Section */}
                {lastReflection && (
                    <div style={{ marginTop: '3rem', textAlign: 'left' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)' }}>
                            <Activity size={18} />
                            Today's Live Snapshot
                        </h3>
                        <div className="card">
                            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                                {/* Donut Chart */}
                                <div style={{ width: '160px', height: '160px', position: 'relative' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: 'Work', value: lastReflection.workScore, color: '#10b981' },
                                                    { name: 'Procrastination', value: lastReflection.procrastinationScore, color: '#ef4444' }
                                                ]}
                                                dataKey="value"
                                                innerRadius={50}
                                                outerRadius={70}
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
                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: lastReflection.workScore >= 50 ? '#10b981' : '#ef4444' }}>
                                            {lastReflection.workScore}%
                                        </div>
                                        <div style={{ fontSize: '0.6rem', color: 'var(--color-text-secondary)' }}>Focus</div>
                                    </div>
                                </div>

                                {/* Stats List */}
                                <div style={{ flex: 1, minWidth: '150px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                        <div style={{ textAlign: 'center', padding: '0.5rem', background: '#f0fdf4', borderRadius: '8px' }}>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#15803d' }}>{lastReflection.tasksDoneCount || 0}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#166534' }}>Tasks Done</div>
                                        </div>
                                        <div style={{ textAlign: 'center', padding: '0.5rem', background: '#fafaebb', borderRadius: '8px', border: '1px solid #fef08a' }}>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#854d0e' }}>{lastReflection.pointsScored || 0}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#854d0e' }}>Points</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                        <span>Worked:</span>
                                        <strong>{lastReflection.workTime || 0}m</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                                        <span>Distracted:</span>
                                        <strong>{lastReflection.distractionTime || 0}m</strong>
                                    </div>
                                </div>
                            </div>

                            {lastReflection.tomorrowGoal && (
                                <div style={{ padding: '0.75rem', background: 'var(--color-bg-accent)', borderRadius: 'var(--radius-md)', marginTop: '1rem' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
                                        <Calendar size={12} />
                                        {new Date(lastReflection.date).toDateString() === new Date().toDateString() ? 'Goal for Tomorrow' : 'Target'}
                                    </div>
                                    <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{lastReflection.tomorrowGoal}</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {/* Install Button (Floating or inline) */}
                {deferredPrompt && (
                    <div style={{ marginTop: '2rem' }}>
                        <button
                            onClick={handleInstallClick}
                            style={{
                                background: 'var(--color-text-primary)',
                                color: 'white',
                                border: 'none',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '2rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                margin: '0 auto',
                                cursor: 'pointer'
                            }}
                        >
                            <Download size={18} /> Install App
                        </button>
                    </div>
                )}
            </div>
        </Layout >
    );
};

export default Home;