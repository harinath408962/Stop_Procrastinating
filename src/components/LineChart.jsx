import React from 'react';

const LineChart = ({ data, dataKeys, colors, height = 200, width = '100%' }) => {
    if (!data || data.length === 0) {
        return <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '8px' }}>No Data Available</div>;
    }

    // Fixed dimensions for SVG coordinate system
    const viewBoxWidth = 500;
    const viewBoxHeight = 200;
    const padding = 20;

    // Calculate scales
    const maxValue = Math.max(...data.map(d => Math.max(...dataKeys.map(k => Number(d[k] || 0)))));
    const yMax = maxValue > 0 ? maxValue * 1.1 : 10; // Add 10% headroom

    const getX = (index) => padding + (index / (data.length - 1 || 1)) * (viewBoxWidth - 2 * padding);
    const getY = (value) => viewBoxHeight - padding - (value / yMax) * (viewBoxHeight - 2 * padding);

    return (
        <div style={{ width, overflow: 'hidden' }}>
            <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} style={{ width: '100%', height: 'auto', background: '#fff', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                {/* Grid Lines (Horizontal) */}
                {[0, 0.25, 0.5, 0.75, 1].map(t => (
                    <line
                        key={t}
                        x1={padding}
                        y1={padding + t * (viewBoxHeight - 2 * padding)}
                        x2={viewBoxWidth - padding}
                        y2={padding + t * (viewBoxHeight - 2 * padding)}
                        stroke="#e2e8f0"
                        strokeWidth="1"
                    />
                ))}

                {/* Render Lines */}
                {dataKeys.map((key, i) => {
                    const points = data.map((d, index) => `${getX(index)},${getY(Number(d[key] || 0))}`).join(' ');
                    return (
                        <g key={key}>
                            <polyline
                                fill="none"
                                stroke={colors[i]}
                                strokeWidth="3"
                                points={points}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            {/* Data Points */}
                            {data.map((d, index) => (
                                <circle
                                    key={index}
                                    cx={getX(index)}
                                    cy={getY(Number(d[key] || 0))}
                                    r="3"
                                    fill="#fff"
                                    stroke={colors[i]}
                                    strokeWidth="2"
                                />
                            ))}
                        </g>
                    );
                })}

                {/* X-Axis Labels (Date) */}
                {data.map((d, index) => (
                    <text
                        key={index}
                        x={getX(index)}
                        y={viewBoxHeight - 5}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#64748b"
                    >
                        {new Date(d.date).getDate()}/{new Date(d.date).getMonth() + 1}
                    </text>
                ))}
            </svg>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '0.5rem' }}>
                {dataKeys.map((key, i) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: '#64748b' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: colors[i] }}></div>
                        {key === 'workScore' ? 'Work' : key === 'procrastinationScore' ? 'Procrastination' : key === 'pointsScored' ? 'Points' : key === 'distractionTime' ? 'Time Lost (m)' : key}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LineChart;
