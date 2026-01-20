import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getStorage, setStorage, STORAGE_KEYS, addPoints, updateStreak } from '../utils/storage';
import { CheckCircle, Upload } from 'lucide-react';

const TaskComplete = () => {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState(null);
    const [reflection, setReflection] = useState('');
    const [learning, setLearning] = useState('');
    const [completed, setCompleted] = useState(false);
    const [earnedPoints, setEarnedPoints] = useState(0);

    useEffect(() => {
        const tasks = getStorage(STORAGE_KEYS.TASKS, []);
        let found = tasks.find(t => t.id === taskId);

        if (!found) {
            // Check scheduled tasks
            const scheduled = getStorage(STORAGE_KEYS.SCHEDULED_TASKS, []);
            const sFound = scheduled.find(t => String(t.id) === taskId);
            if (sFound) {
                found = {
                    ...sFound,
                    title: sFound.name,
                    smallStep: sFound.workToComplete || 'Scheduled Work',
                    isSchedule: true
                };
            }
        }

        if (found) setTask(found);
    }, [taskId]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (task.isSchedule) {
            // Update Scheduled Task
            const scheduled = getStorage(STORAGE_KEYS.SCHEDULED_TASKS, []);
            const updated = scheduled.map(t => {
                if (String(t.id) === taskId) {
                    return { ...t, completed: true, completedAt: new Date().toISOString() };
                }
                return t;
            });
            setStorage(STORAGE_KEYS.SCHEDULED_TASKS, updated);
        } else {
            // Update Standard Task
            const tasks = getStorage(STORAGE_KEYS.TASKS, []);
            const updatedTasks = tasks.map(t => {
                if (t.id === taskId) {
                    return {
                        ...t,
                        completed: true,
                        reflection,
                        learning,
                        completedAt: new Date().toISOString()
                    };
                }
                return t;
            });
            setStorage(STORAGE_KEYS.TASKS, updatedTasks);
        }

        // Gamification
        const points = 10; // Base points
        addPoints(points);
        updateStreak();

        setEarnedPoints(points);
        setCompleted(true);
    };

    if (!task) return <Layout><div>Loading...</div></Layout>;

    if (completed) {
        return (
            <Layout>
                <div className="container" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                    <CheckCircle size={64} color="var(--color-success)" style={{ margin: '0 auto 1rem' }} />
                    <h2>Well Done!</h2>
                    <p>You started despite resistance. That matters.</p>

                    <div style={{ margin: '2rem 0', padding: '1.5rem', background: 'var(--color-bg-accent)', borderRadius: 'var(--radius-lg)' }}>
                        <h3 style={{ margin: 0, color: 'var(--color-primary)' }}>+{earnedPoints} Focus Points</h3>
                        <p style={{ margin: '0.5rem 0 0' }}>Streak Updated!</p>
                    </div>

                    <button className="btn-primary" onClick={() => navigate('/')}>
                        Back Home
                    </button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container">
                <h2>Complete "{task.title}"</h2>
                <div className="card">
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label>What did you actually do?</label>
                            <textarea
                                required
                                value={reflection}
                                onChange={e => setReflection(e.target.value)}
                                placeholder="I read 5 pages..."
                                rows={3}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label>What did you learn? (Optional)</label>
                            <textarea
                                value={learning}
                                onChange={e => setLearning(e.target.value)}
                                placeholder="I learned that starting wasn't so bad..."
                                rows={2}
                            />
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label>Upload Proof (Optional)</label>
                            <div style={{
                                border: '2px dashed #cbd5e1',
                                borderRadius: 'var(--radius-md)',
                                padding: '1.5rem',
                                textAlign: 'center',
                                color: 'var(--color-text-secondary)',
                                cursor: 'pointer'
                            }}>
                                <Upload size={24} style={{ marginBottom: '0.5rem' }} />
                                <div>Click to upload image</div>
                            </div>
                        </div>

                        <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                            Mark as Completed
                        </button>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default TaskComplete;
