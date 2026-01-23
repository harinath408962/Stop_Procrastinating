import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getStorage, setStorage, STORAGE_KEYS, addPoints, updateStreak } from '../utils/storage';
import { CheckCircle, Upload, Camera } from 'lucide-react';

const TaskComplete = () => {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState(null);
    // Removed reflection state
    const [learning, setLearning] = useState('');
    const [timeTaken, setTimeTaken] = useState('');
    const [proofImage, setProofImage] = useState(null);
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);
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

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProofImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (task.isSchedule) {
            // Update Scheduled Task
            const scheduled = getStorage(STORAGE_KEYS.SCHEDULED_TASKS, []);
            const updated = scheduled.map(t => {
                if (String(t.id) === taskId) {
                    return {
                        ...t,
                        completed: true,
                        completedAt: new Date().toISOString(),
                        timeTaken: parseInt(timeTaken) || 0,
                        proofImage
                    };
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
                        // reflection removed
                        learning,
                        completedAt: new Date().toISOString(),
                        timeTaken: parseInt(timeTaken) || 0,
                        proofImage
                    };
                }
                return t;
            });
            setStorage(STORAGE_KEYS.TASKS, updatedTasks);
        }

        // Gamification
        const points = 10 + (task.isSchedule ? 5 : 0); // Bonus for scheduled items
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
                            <label>Time Taken (minutes)</label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={timeTaken}
                                onChange={e => setTimeTaken(e.target.value)}
                                placeholder="e.g. 30"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', marginTop: '0.5rem' }}
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
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Upload Proof (Optional)</label>

                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                            />
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                ref={cameraInputRef}
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                            />

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{
                                        border: '2px dashed #cbd5e1',
                                        borderRadius: 'var(--radius-md)',
                                        padding: '1.5rem',
                                        textAlign: 'center',
                                        color: 'var(--color-text-secondary)',
                                        cursor: 'pointer',
                                        background: proofImage ? '#f0fdf4' : 'transparent'
                                    }}>
                                    <Upload size={24} style={{ marginBottom: '0.5rem' }} />
                                    <div>Upload Image</div>
                                </div>

                                <div
                                    onClick={() => cameraInputRef.current?.click()}
                                    style={{
                                        border: '2px dashed #cbd5e1',
                                        borderRadius: 'var(--radius-md)',
                                        padding: '1.5rem',
                                        textAlign: 'center',
                                        color: 'var(--color-text-secondary)',
                                        cursor: 'pointer',
                                        background: proofImage ? '#f0fdf4' : 'transparent'
                                    }}>
                                    <Camera size={24} style={{ marginBottom: '0.5rem' }} />
                                    <div>Take Photo</div>
                                </div>
                            </div>
                            {proofImage && <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--color-success)', textAlign: 'center' }}>Proof Attached!</div>}
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
