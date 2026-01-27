import { useState, useEffect } from 'react';

const TimeSelector = ({ value, onChange }) => {
    // Determine if the current value matches one of the presets
    // We treat "15", "30", etc. as matching.

    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
            {['15', '30', '45', '60'].map(m => (
                <button
                    key={m}
                    type="button"
                    onClick={() => onChange(m)}
                    style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '2rem',
                        border: '1px solid var(--color-primary)',
                        background: value === m ? 'var(--color-primary)' : 'transparent',
                        color: value === m ? 'white' : 'var(--color-primary)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    {m}m
                </button>
            ))}
            <input
                type="number"
                placeholder="Custom"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    width: '100px',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #cbd5e1',
                    outlineColor: 'var(--color-primary)'
                }}
            />
        </div>
    );
};

export default TimeSelector;
