import React from 'react';

const BarChart = ({ data, dataKeys, colors, height = 200, width = '100%' }) => {
    if (!data || data.length === 0) {
        return <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '8px' }}>No Data Available</div>;
    }

    // Dimensions
    const viewBoxWidth = 500;
    const viewBoxHeight = 200;
    const padding = 30;
    const chartWidth = viewBoxWidth - 2 * padding;
    const chartHeight = viewBoxHeight - 2 * padding;

    // Scale
    const allValues = data.flatMap(d => dataKeys.map(k => Number(d[k] || 0)));
    const maxValue = Math.max(...allValues, 0);
    const yMax = maxValue > 0 ? maxValue * 1.1 : 10; // 10% headroom

    const barGroupWidth = chartWidth / data.length;
    const barPadding = barGroupWidth * 0.2; // 20% padding between groups
    const barWidth = (barGroupWidth - barPadding) / dataKeys.length;

    const getY = (val) => chartHeight - (val / yMax) * chartHeight;

    return (
        <div style={{ width, overflow: 'hidden' }}>
            <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} style={{ width: '100%', height: 'auto', background: '#fff', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                {/* Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map(t => (
                    <line
                        key={t}
                        x1={padding}
                        y1={padding + t * chartHeight}
                        x2={viewBoxWidth - padding}
                        y2={padding + t * chartHeight}
                        stroke="#e2e8f0"
                        strokeWidth="1"
                    />
                ))}

                {/* Bars */}
                {data.map((d, dateIndex) => {
                    const groupX = padding + dateIndex * barGroupWidth + barPadding / 2;

                    return (
                        <g key={dateIndex}>
                            {dataKeys.map((key, keyIndex) => {
                                const val = Number(d[key] || 0);
                                const barHeight = (val / yMax) * chartHeight;
                                const x = groupX + keyIndex * barWidth;
                                const y = padding + chartHeight - barHeight;

                                return (
                                    <rect
                                        key={key}
                                        x={x}
                                        y={y}
                                        width={barWidth * 0.9} // Slight gap between bars in group
                                        height={barHeight}
                                        fill={colors[keyIndex]}
                                        rx="2"
                                    />
                                );
                            })}
                            {/* X Axis Label */}
                            <text
                                x={groupX + (barGroupWidth - barPadding) / 2}
                                y={viewBoxHeight - 10}
                                textAnchor="middle"
                                fontSize="10"
                                fill="#64748b"
                            >
                                {new Date(d.date).getDate()}/{new Date(d.date).getMonth() + 1}
                            </text>
                        </g>
                    );
                })}

                {/* Y Axis Labels */}
                {[0, 0.5, 1].map(t => (
                    <text
                        key={t}
                        x={padding - 5}
                        y={padding + (1 - t) * chartHeight + 3}
                        textAnchor="end"
                        fontSize="9"
                        fill="#94a3b8"
                    >
                        {Math.round(t * yMax)}
                    </text>
                ))}
            </svg>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '0.5rem' }}>
                {dataKeys.map((key, i) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: '#64748b' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: colors[i] }}></div>
                        {key === 'taskTime' ? 'Work Time' : key === 'distractionTime' ? 'Distracted' : key === 'pointsScored' ? 'Points' : key}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BarChart;
