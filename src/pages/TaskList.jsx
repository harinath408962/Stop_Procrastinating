import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getStorage, STORAGE_KEYS } from '../utils/storage';
import { Plus, CheckCircle, Clock, AlertCircle, ArrowLeft } from 'lucide-react';

const TaskList = () => {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [mood, setMood] = useState(null);
    const [activePlans, setActivePlans] = useState([]);

    useEffect(() => {
        const currentMood = getStorage(STORAGE_KEYS.USER_MOOD);
        setMood(currentMood);
        const allTasks = getStorage(STORAGE_KEYS.TASKS, []);

        // Filter tasks: show tasks that match the mood OR are general (no mood specific)
        // And only show incomplete tasks
        const relevantTasks = allTasks.filter(t =>
            !t.completed &&
            (t.moods?.includes(currentMood) || !t.moods || t.moods.length === 0)
        );
        setTasks(relevantTasks);
        // Check for active scheduled plans
        const scheduled = getStorage(STORAGE_KEYS.SCHEDULED_TASKS, []);
        const today = new Date().setHours(0, 0, 0, 0);
        const activeItems = scheduled.filter(t => {
            const s = new Date(t.startDate).setHours(0, 0, 0, 0);
            const e = new Date(t.dueDate).setHours(0, 0, 0, 0);
            return !t.completed && today >= s && today <= e;
        });
        setActivePlans(activeItems);

    }, []);

    return (
        <Layout>
            <div className="container">
                <button
                    onClick={() => navigate('/schedule')}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 0',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        marginBottom: '1rem'
                    }}
                >
                    <ArrowLeft size={20} /> Back
                </button>
                {activePlans.length > 0 && (
                    <div style={{
                        background: 'var(--color-bg-accent)',
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1.5rem',
                        border: '1px solid var(--color-primary)'
                    }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'start', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                            <AlertCircle size={20} style={{ marginTop: '0.1rem' }} />
                            <strong style={{ display: 'block' }}>Daily Commitments ({activePlans.length})</strong>
                        </div>
                        {activePlans.map(plan => (
                            <div key={plan.id} style={{ marginLeft: '1.75rem', marginBottom: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                                <span style={{ color: 'var(--color-text-primary)' }}>
                                    Planned to work on <strong>{plan.workToComplete}</strong> for the <strong>{plan.name}</strong>.
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2>Suggested for You</h2>
                    <button
                        className="btn-primary"
                        style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        onClick={() => navigate('/add-task')}
                    >
                        <Plus size={18} /> Add Task
                    </button>
                </div>

                {tasks.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '2rem' }}>
                        <p>No tasks fit your current mood ({mood}).</p>
                        <p>Why not add a small one?</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {tasks.map(task => (
                            <div key={task.id} className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.25rem' }}>{task.title}</h3>
                                        <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                            <strong>Start with:</strong> {task.smallStep}
                                        </p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                            <Clock size={16} /> {task.time}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                                    <button
                                        className="btn-primary"
                                        style={{ background: 'var(--color-success)', fontSize: '0.9rem' }}
                                        onClick={() => navigate(`/complete/${task.id}`)}
                                    >
                                        Task Done (Add Proof)
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default TaskList;
