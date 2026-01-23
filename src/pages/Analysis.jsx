import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getStorage, STORAGE_KEYS } from '../utils/storage';
import BarChart from '../components/BarChart';
import LineChart from '../components/LineChart';
import { Download, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Analysis = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState([]);

    useEffect(() => {
        const history = getStorage(STORAGE_KEYS.REFLECTIONS, []);

        // 1. Aggregate Data by Date (Take latest entry per day)
        const dailyData = {};
        history.forEach(entry => {
            const dateStr = new Date(entry.date).toDateString(); // "Fri Jan 23 2026"
            // If entry exists, overwrite it (assuming later entry is more up to date "End of Day")
            // Or should we sum them? User context implies "End of Day Reflection" is a summary.
            // But previous task said "daily only one input", so overwrite is correct logic for "reset everyday".

            // However, wait. If the user reflects multiple times, "Today's Reflection" usually grabs live data.
            // The saved reflection is a snapshot.
            // Taking the latest snapshot for the day is the best approach.
            if (!dailyData[dateStr] || new Date(entry.date) > new Date(dailyData[dateStr].date)) {
                dailyData[dateStr] = entry;
            }
        });

        // Convert to array and sort
        const sorted = Object.values(dailyData).sort((a, b) => new Date(a.date) - new Date(b.date));
        setStats(sorted);
    }, []);

    const downloadCSV = () => {
        if (stats.length === 0) return;

        const headers = ['Date', 'Work Score (%)', 'Procrastination Score (%)', 'Points Earned', 'Work Time (m)', 'Distraction Time (m)', 'Tasks Done'];
        const rows = stats.map(d => [
            new Date(d.date).toLocaleDateString(),
            d.workScore,
            d.procrastinationScore,
            d.pointsScored || 0,
            d.taskTime || 0,
            d.distractionTime || 0,
            d.tasksDoneCount || 0
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "procrastination_data.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                        title="Download Data"
                    >
                        <Download size={20} />
                    </button>
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
