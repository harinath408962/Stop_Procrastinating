import { Sun, Sunset, Moon, CloudSun } from 'lucide-react';

const TimeOfDaySelector = ({ value, onChange, compact = false }) => {
    const options = [
        { id: 'morning', label: 'Morning', icon: <Sun size={20} />, color: '#f59e0b' },
        { id: 'afternoon', label: 'Afternoon', icon: <CloudSun size={20} />, color: '#ea580c' },
        { id: 'evening', label: 'Evening', icon: <Sunset size={20} />, color: '#7c3aed' },
        { id: 'night', label: 'Night', icon: <Moon size={20} />, color: '#1e293b' }
    ];

    // If no value is active, we might want to default to current time logic for visual cue, 
    // or just leave it empty. Let's enforce selection for accuracy, or default to current.
    // Parent should handle default state.

    return (
        <div style={{ marginBottom: compact ? 0 : '1.5rem' }}>
            {!compact && (
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--color-text-secondary)' }}>
                    When did this happen?
                </label>
            )}
            <div style={{
                display: 'grid',
                gridTemplateColumns: compact ? 'repeat(4, auto)' : 'repeat(4, 1fr)',
                gap: compact ? '0.25rem' : '0.5rem'
            }}>
                {options.map((opt) => (
                    <button
                        key={opt.id}
                        type="button"
                        onClick={() => onChange(opt.id)}
                        title={compact ? opt.label : ''}
                        style={{
                            display: 'flex',
                            flexDirection: compact ? 'row' : 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.25rem',
                            padding: compact ? '0.4rem' : '0.75rem 0.25rem',
                            borderRadius: 'var(--radius-md)',
                            border: `1px solid ${value === opt.id ? opt.color : 'transparent'}`,
                            background: value === opt.id ? `${opt.color}15` : 'var(--color-bg-secondary)',
                            color: value === opt.id ? opt.color : 'var(--color-text-secondary)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                    >
                        {opt.icon}
                        {!compact && <span style={{ fontSize: '0.75rem', fontWeight: value === opt.id ? '600' : '400' }}>{opt.label}</span>}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default TimeOfDaySelector;
