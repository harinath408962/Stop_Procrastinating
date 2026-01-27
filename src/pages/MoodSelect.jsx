import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { setStorage, STORAGE_KEYS } from '../utils/storage';
import { logEvent } from '../utils/analytics';
import { Zap, BatteryLow, Coffee } from 'lucide-react';
import TimeOfDaySelector from '../components/TimeOfDaySelector';
import { useState, useEffect } from 'react';

const MoodSelect = () => {
    const navigate = useNavigate();
    const [timeOfDay, setTimeOfDay] = useState('morning');

    useEffect(() => {
        const h = new Date().getHours();
        if (h >= 5 && h < 12) setTimeOfDay('morning');
        else if (h >= 12 && h < 17) setTimeOfDay('afternoon');
        else if (h >= 17 && h < 21) setTimeOfDay('evening');
        else setTimeOfDay('night');
    }, []);

    const moods = [
        { id: 'focused', label: 'Focused', icon: <Zap size={32} />, color: 'var(--color-success)', desc: "I'm ready to tackle something big." },
        { id: 'low-energy', label: 'Low Energy', icon: <BatteryLow size={32} />, color: 'var(--color-warning)', desc: "I need something small and easy." },
        { id: 'bored', label: 'Bored', icon: <Coffee size={32} />, color: 'var(--color-text-accent)', desc: "I need to get interested." },
    ];

    const handleSelect = (moodId) => {
        setStorage(STORAGE_KEYS.USER_MOOD, moodId);
        logEvent('mood_update', { mood: moodId, overrideTimeOfDay: timeOfDay });
        navigate('/tasks');
    };

    return (
        <Layout>
            <div className="container">
                <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>How are you feeling right now?</h2>

                <TimeOfDaySelector value={timeOfDay} onChange={setTimeOfDay} />

                <div style={{ display: 'grid', gap: '1rem' }}>
                    {moods.map((mood) => (
                        <button
                            key={mood.id}
                            onClick={() => handleSelect(mood.id)}
                            className="card"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                textAlign: 'left',
                                width: '100%',
                                border: '1px solid transparent',
                                cursor: 'pointer',
                                transition: 'transform 0.2s, border-color 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.02)';
                                e.currentTarget.style.borderColor = mood.color;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.borderColor = 'transparent';
                            }}
                        >
                            <div style={{ color: mood.color }}>{mood.icon}</div>
                            <div>
                                <strong style={{ display: 'block', fontSize: '1.1rem' }}>{mood.label}</strong>
                                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>{mood.desc}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export default MoodSelect;
