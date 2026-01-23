import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getStorage, STORAGE_KEYS } from '../utils/storage';
import { Trophy, ArrowRight, Activity, Calendar } from 'lucide-react';

const Home = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('Friend');
    const [streak, setStreak] = useState(0);
    const [points, setPoints] = useState(0);
    const [dailyStatement, setDailyStatement] = useState('Start your day!');
    const [topDistractions, setTopDistractions] = useState([]);
    const [lastReflection, setLastReflection] = useState(null);

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
            const todaysDistractions = distLogs.filter(l => new Date(l.date).setHours(0, 0, 0, 0) === today);
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

            const completedTasks = tasks.filter(t => t.completed && t.completedAt && new Date(t.completedAt).setHours(0, 0, 0, 0) === today);
            const completedSched = scheduled.filter(t => t.completed && t.completedAt && new Date(t.completedAt).setHours(0, 0, 0, 0) === today);
            const allCompleted = [...completedTasks, ...completedSched];

            const completedTime = allCompleted.reduce((acc, curr) => acc + (parseInt(curr.timeTaken) || 0), 0);

            // 3. Partial Work Logs
            const workLogs = getStorage(STORAGE_KEYS.WORK_LOGS, []);
            const todaysWorkLogs = workLogs.filter(l => new Date(l.date).setHours(0, 0, 0, 0) === today);
            const partialTime = todaysWorkLogs.reduce((acc, curr) => acc + parseInt(curr.duration || 0), 0);

            const totalWorkTime = completedTime + partialTime;
            const tasksDoneCount = allCompleted.length;
            const pointsScored = (tasksDoneCount * 10) + (todaysWorkLogs.length * 2); // Approximation if needed, but we rely on stored points for global. Live snapshot for Today.

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

            setLastReflection({
                date: new Date().toISOString(),
                workScore,
                procrastinationScore,
                tasksDoneCount,
                pointsScored,
                distractionTime: distTime,
                distractionCount: distCount,
                isLive: true
            });
        };

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

                    <ul style={{ paddingLeft: '1.5rem', color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: '1rem' }}>
                        <li><strong>{streak}</strong> Total Days Active</li>
                        <li><strong>{points}</strong> Focus Points</li>
                    </ul>

                    {topDistractions.length > 0 && (
                        <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>Top Distractions Today:</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                                {topDistractions.map((d, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fef2f2', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #fecaca' }}>
                                        <span style={{ color: '#ef4444', fontWeight: '500' }}>{d.name}</span>
                                        <span style={{ fontWeight: 'bold', color: '#b91c1c' }}>{d.duration}m</span>
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
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                    <span style={{ color: '#15803d', fontWeight: 'bold' }}>Work {lastReflection.workScore}%</span>
                                    <span style={{ color: '#b91c1c', fontWeight: 'bold' }}>Procrastinate {lastReflection.procrastinationScore}%</span>
                                </div>
                                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                                    <div style={{ width: `${lastReflection.workScore}%`, background: '#22c55e' }}></div>
                                    <div style={{ width: `${lastReflection.procrastinationScore}%`, background: '#ef4444' }}></div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{lastReflection.tasksDoneCount || 0}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Tasks Done</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-warning)' }}>{lastReflection.pointsScored || 0}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Points Scored</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Distractions</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{lastReflection.distractionTime || 0}m</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Count</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{lastReflection.distractionCount || 0}</div>
                                </div>
                            </div>

                            {lastReflection.tomorrowGoal && (
                                <div style={{ padding: '1rem', background: 'var(--color-bg-accent)', borderRadius: 'var(--radius-md)' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
                                        <Calendar size={14} />
                                        {new Date(lastReflection.date).toDateString() === new Date().toDateString() ? 'Goal for Tomorrow' : 'Target set for Today'}
                                    </div>
                                    <div style={{ fontWeight: 500 }}>{lastReflection.tomorrowGoal}</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Home;
