import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getStorage, setStorage, STORAGE_KEYS } from '../utils/storage';

import { ArrowLeft } from 'lucide-react';

const AddTask = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
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

                    <div style={{ marginBottom: '1rem' }}>
                        <label>Expected Time (Minutes)</label>
                        <input
                            type="number"
                            required
                            value={formData.time}
                            onChange={e => setFormData({ ...formData, time: e.target.value })}
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

                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                        Save Task
                    </button>
                </form>
            </div>
        </Layout>
    );
};

export default AddTask;
