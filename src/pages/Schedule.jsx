import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getStorage, setStorage, STORAGE_KEYS } from '../utils/storage';
import { Calendar as CalIcon, Plus, AlertCircle, ArrowLeft, Zap, List } from 'lucide-react';

const Schedule = () => {
    const navigate = useNavigate();
    const [scheduledTasks, setScheduledTasks] = useState([]);
    const [dailyTasks, setDailyTasks] = useState([]);

    // UI Toggles
    const [showScheduleForm, setShowScheduleForm] = useState(false);
    const [showDailyTaskForm, setShowDailyTaskForm] = useState(false);

    // Schedule Form Data
    const [scheduleFormData, setScheduleFormData] = useState({
        name: '',
        workToComplete: '',
        startDate: '',
        dueDate: ''
    });

    // Daily Task Form Data
    const [dailyFormData, setDailyFormData] = useState({
        title: '',
        smallStep: '',
        time: '15 mins',
        moods: []
    });

    const availableMoods = [
        { id: 'focused', label: 'Focused' },
        { id: 'low-energy', label: 'Low Energy' },
        { id: 'bored', label: 'Bored' }
    ];

    useEffect(() => {
        setScheduledTasks(getStorage(STORAGE_KEYS.SCHEDULED_TASKS, []));
        setDailyTasks(getStorage(STORAGE_KEYS.TASKS, []));
    }, []);

    // Handlers for Schedule Future Task
    const handleScheduleSubmit = (e) => {
        e.preventDefault();
        const newTasks = [...scheduledTasks, { id: Date.now(), ...scheduleFormData }];
        setStorage(STORAGE_KEYS.SCHEDULED_TASKS, newTasks);
        setScheduledTasks(newTasks);
        setShowScheduleForm(false);
        setScheduleFormData({ name: '', workToComplete: '', startDate: '', dueDate: '' });
    };

    // Handlers for Daily Task
    const handleDailyTaskSubmit = (e) => {
        e.preventDefault();
        const newTask = {
            id: Date.now().toString(),
            ...dailyFormData,
            completed: false,
            createdAt: new Date().toISOString()
        };
        const newTasks = [newTask, ...dailyTasks];
        setStorage(STORAGE_KEYS.TASKS, newTasks);
        setDailyTasks(newTasks);
        setShowDailyTaskForm(false);
        setDailyFormData({ title: '', smallStep: '', time: '15 mins', moods: [] });
    };

    const toggleMood = (moodId) => {
        setDailyFormData(prev => {
            const moods = prev.moods.includes(moodId)
                ? prev.moods.filter(m => m !== moodId)
                : [...prev.moods, moodId];
            return { ...prev, moods };
        });
    };

    return (
        <Layout>
            <div className="container">
                {/* Header */}
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
                    <h2 style={{ margin: 0 }}>Planning Hub</h2>
                </div>

                {/* Main Options */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '3rem' }}>

                    {/* Option 1: Add Daily Task */}
                    <div className="card" style={{
                        textAlign: 'center',
                        cursor: 'pointer',
                        border: showDailyTaskForm ? '2px solid var(--color-primary)' : '1px solid transparent',
                        transition: 'all 0.2s',
                        padding: '2rem 1rem'
                    }}
                        onClick={() => { setShowDailyTaskForm(!showDailyTaskForm); setShowScheduleForm(false); }}>
                        <div style={{
                            background: 'var(--color-bg-accent)',
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem',
                            color: 'var(--color-primary)'
                        }}>
                            <Zap size={24} />
                        </div>
                        <h3 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem' }}>Add Task</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                            For immediate work today. Small steps.
                        </p>
                    </div>

                    {/* Option 2: Schedule Future */}
                    <div className="card" style={{
                        textAlign: 'center',
                        cursor: 'pointer',
                        border: showScheduleForm ? '2px solid var(--color-primary)' : '1px solid transparent',
                        padding: '2rem 1rem'
                    }}
                        onClick={() => { setShowScheduleForm(!showScheduleForm); setShowDailyTaskForm(false); }}>
                        <div style={{
                            background: '#f0f9ff',
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem',
                            color: '#0284c7'
                        }}>
                            <CalIcon size={24} />
                        </div>
                        <h3 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem' }}>Schedule Future Task</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                            Plan ahead to reduce uncertainty.
                        </p>
                    </div>
                </div>

                {/* Forms Section */}

                {/* Daily Task Form */}
                {showDailyTaskForm && (
                    <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Add a New Task</h3>
                        <form onSubmit={handleDailyTaskSubmit} className="card" style={{ marginBottom: '3rem', borderLeft: '4px solid var(--color-primary)' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label>Task Name</label>
                                <input
                                    required
                                    value={dailyFormData.title}
                                    onChange={e => setDailyFormData({ ...dailyFormData, title: e.target.value })}
                                    placeholder="e.g. Study Math"
                                    autoFocus
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label>Small First Step (Crucial!)</label>
                                <input
                                    required
                                    value={dailyFormData.smallStep}
                                    onChange={e => setDailyFormData({ ...dailyFormData, smallStep: e.target.value })}
                                    placeholder="e.g. Open the textbook to page 50"
                                />
                                <small style={{ color: 'var(--color-text-secondary)' }}>Just write what you will do in the first 2 minutes.</small>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label>Expected Time (Minutes)</label>
                                <input
                                    type="number"
                                    required
                                    value={dailyFormData.time}
                                    onChange={e => setDailyFormData({ ...dailyFormData, time: e.target.value })}
                                    placeholder="e.g. 30"
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label>Best for Mood (Optional)</label>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {availableMoods.map(mood => (
                                        <button
                                            key={mood.id}
                                            type="button"
                                            onClick={() => toggleMood(mood.id)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: 'var(--radius-full)',
                                                border: '1px solid var(--color-primary)',
                                                background: dailyFormData.moods.includes(mood.id) ? 'var(--color-primary)' : 'transparent',
                                                color: dailyFormData.moods.includes(mood.id) ? 'white' : 'var(--color-primary)',
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            {mood.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="button" onClick={() => setShowDailyTaskForm(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save Task</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Schedule Future Form */}
                {showScheduleForm && (
                    <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                        <h3 style={{ marginBottom: '1rem' }}>New Future Plan</h3>
                        <form onSubmit={handleScheduleSubmit} className="card" style={{ marginBottom: '3rem', borderLeft: '4px solid #0284c7' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label>Task Name</label>
                                <input required value={scheduleFormData.name} onChange={e => setScheduleFormData({ ...scheduleFormData, name: e.target.value })} autoFocus />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label>Work to Complete</label>
                                <input
                                    value={scheduleFormData.workToComplete}
                                    onChange={e => setScheduleFormData({ ...scheduleFormData, workToComplete: e.target.value })}
                                    placeholder="e.g. Read Chapters 1-3"
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label>Start Date</label>
                                    <input type="date" required value={scheduleFormData.startDate} onChange={e => setScheduleFormData({ ...scheduleFormData, startDate: e.target.value })} />
                                </div>
                                <div>
                                    <label>Due Date</label>
                                    <input type="date" required value={scheduleFormData.dueDate} onChange={e => setScheduleFormData({ ...scheduleFormData, dueDate: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="button" onClick={() => setShowScheduleForm(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save Plan</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* List of Plans */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <List size={20} className="text-secondary" />
                        <h3 style={{ margin: 0, color: 'var(--color-text-secondary)' }}>Your Plans</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                        {/* Daily Tasks First */}
                        {dailyTasks.length > 0 && dailyTasks.some(t => !t.completed) && (
                            <h4 style={{ margin: '1rem 0 0.5rem', color: 'var(--color-primary)', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.25rem' }}>Daily Commitments</h4>
                        )}
                        {dailyTasks.filter(t => !t.completed).map(task => (
                            <div key={task.id} className="card" style={{ borderLeft: '4px solid var(--color-warning)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                            <h3 style={{ margin: 0 }}>{task.title}</h3>
                                            <span style={{ fontSize: '0.75rem', background: '#fef3c7', color: '#d97706', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>Now</span>
                                        </div>
                                        <p style={{ margin: '0 0 0.5rem', color: 'var(--color-text-primary)' }}>{task.smallStep}</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                        Duration: {task.time}m
                                    </div>
                                    <button
                                        className="btn-primary"
                                        style={{ background: 'var(--color-success)', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                                        onClick={() => navigate(`/complete/${task.id}`)}
                                    >
                                        Task Done
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Scheduled Tasks Second */}
                        {scheduledTasks.length > 0 && (
                            <h4 style={{ margin: '1.5rem 0 0.5rem', color: '#0284c7', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.25rem' }}>Future Schedule</h4>
                        )}
                        {scheduledTasks.map(task => {
                            const today = new Date().setHours(0, 0, 0, 0);
                            const s = new Date(task.startDate).setHours(0, 0, 0, 0);
                            const e = new Date(task.dueDate).setHours(0, 0, 0, 0);
                            const isActive = today >= s && today <= e;
                            if (task.completed) return null; // Logic check: hide completed? Assuming yes to keep list clean.

                            return (
                                <div key={task.id} className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <div>
                                            <h3 style={{ margin: '0 0 0.25rem' }}>{task.name}</h3>
                                            <p style={{ margin: '0 0 0.5rem', color: 'var(--color-text-primary)' }}>{task.workToComplete}</p>
                                        </div>
                                        {isActive && (
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.25rem',
                                                color: 'var(--color-primary)',
                                                fontSize: '0.8rem',
                                                fontWeight: 'bold',
                                                background: 'var(--color-bg-accent)',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: 'var(--radius-md)'
                                            }}>
                                                <AlertCircle size={14} />
                                                Active Today
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                            <span>Start: {task.startDate}</span>
                                            <span>Due: {task.dueDate}</span>
                                        </div>
                                        <button
                                            className="btn-primary"
                                            style={{ background: 'var(--color-success)', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                                            onClick={() => navigate(`/complete/${task.id}`)}
                                        >
                                            Task Done
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                        {dailyTasks.length === 0 && scheduledTasks.length === 0 && (
                            <p style={{ textAlign: 'center', padding: '2rem', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                                No plans yet. Clear mind, clear path.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Schedule;
