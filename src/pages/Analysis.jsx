import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getStorage, STORAGE_KEYS } from '../utils/storage';
import LineChart from '../components/LineChart';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Analysis = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState([]);

    useEffect(() => {
        const history = getStorage(STORAGE_KEYS.REFLECTIONS, []);
        // Sort by date ascending
        const sorted = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));
        // Take last 7 days? Or all? Let's show all for now, maybe limit if too many.
        setStats(sorted);
    }, []);

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
                    <h2 style={{ flex: 1, textAlign: 'center', margin: 0, paddingRight: '3rem' }}>Progress Analysis</h2>
                </div>

                <div style={{ display: 'grid', gap: '2rem' }}>

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

                    {/* Graph 2: Points Earned */}
                    <div className="card">
                        <h3 style={{ marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Focus Points Earned</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                            Your daily rewards for completing tasks and building habits.
                        </p>
                        <LineChart
                            data={stats}
                            dataKeys={['pointsScored']}
                            colors={['#a855f7']}
                        />
                    </div>

                    {/* Graph 3: Time Distracted */}
                    <div className="card">
                        <h3 style={{ marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Time Distracted (Minutes)</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                            Lower is better. Track your digital diet effectiveness.
                        </p>
                        <LineChart
                            data={stats}
                            dataKeys={['distractionTime']}
                            colors={['#f97316']}
                        />
                    </div>

                </div>
            </div>
        </Layout>
    );
};

export default Analysis;
