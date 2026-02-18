import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getStorage, setStorage, STORAGE_KEYS } from '../utils/storage';
import { logEvent } from '../utils/analytics';

import { ArrowLeft, AlertCircle } from 'lucide-react';

const AddTask = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        smallStep: '',
        moods: [],
        reminderTime: '',
        frequency: 'once',
        repeatDays: []
    });

    const availableMoods = [
        { id: 'focused', label: 'Focused' },
        { id: 'low-energy', label: 'Low Energy' },
        { id: 'bored', label: 'Bored' }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        const tasks = getStorage(STORAGE_KEYS.TASKS, []);
        const newTask = {
            id: Date.now().toString(),
            ...formData,
            completed: false,
            createdAt: new Date().toISOString()
        };

        setStorage(STORAGE_KEYS.TASKS, [newTask, ...tasks]);
        logEvent('task_create', {
            task_id: newTask.id,
            title: newTask.title
        });
        navigate('/tasks');
    };

    const toggleMood = (moodId) => {
        setFormData(prev => {
            const moods = prev.moods.includes(moodId)
                ? prev.moods.filter(m => m !== moodId)
                : [...prev.moods, moodId];
            return { ...prev, moods };
        });
    };

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
                <h2>Add a New Task</h2>
                <form onSubmit={handleSubmit} className="card">
                    <div style={{ marginBottom: '1rem' }}>
                        <label>Task Name</label>
                        <input
                            required
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Study Math"
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label>Small First Step (Crucial!)</label>
                        <input
                            required
                            value={formData.smallStep}
                            onChange={e => setFormData({ ...formData, smallStep: e.target.value })}
                            placeholder="e.g. Open the textbook to page 50"
                        />
                        <small style={{ color: 'var(--color-text-secondary)' }}>Just write what you will do in the first 2 minutes.</small>
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
                                        background: formData.moods.includes(mood.id) ? 'var(--color-primary)' : 'transparent',
                                        color: formData.moods.includes(mood.id) ? 'white' : 'var(--color-primary)',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    {mood.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Reminder Section */}
                    <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                            <AlertCircle size={16} /> Reminder & frequency
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ fontSize: '0.85rem' }}>Time</label>
                                <input
                                    type="time"
                                    value={formData.reminderTime}
                                    onChange={e => setFormData({ ...formData, reminderTime: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem' }}>Frequency</label>
                                <select
                                    value={formData.frequency}
                                    onChange={e => setFormData({ ...formData, frequency: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                >
                                    <option value="once">Once (Today)</option>
                                    <option value="daily">Daily</option>
                                    <option value="custom">Custom Days</option>
                                </select>
                            </div>
                        </div>

                        {formData.frequency === 'custom' && (
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() => {
                                            const days = formData.repeatDays.includes(day)
                                                ? formData.repeatDays.filter(d => d !== day)
                                                : [...formData.repeatDays, day];
                                            setFormData({ ...formData, repeatDays: days });
                                        }}
                                        style={{
                                            padding: '0.25rem 0.5rem',
                                            fontSize: '0.75rem',
                                            borderRadius: '4px',
                                            border: '1px solid var(--color-primary)',
                                            background: formData.repeatDays.includes(day) ? 'var(--color-primary)' : 'white',
                                            color: formData.repeatDays.includes(day) ? 'white' : 'var(--color-primary)',
                                        }}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                        Save Task
                    </button>
                </form>
            </div>
        </Layout>
    );
};

export default AddTask;
