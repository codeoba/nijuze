import React from 'react';
import { TrendingUp, BarChart3 } from 'lucide-react';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface InteractiveBarChartProps {
  data: ChartData[];
  title: string;
  height?: number;
}

export const InteractiveBarChart: React.FC<InteractiveBarChartProps> = ({ data, title, height = 300 }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <BarChart3 size={20} color="#a5b4fc" />
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{title}</h3>
      </div>

      <div style={{ height, display: 'flex', alignItems: 'flex-end', gap: 8, position: 'relative' }}>
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * 100;
          const color = item.color || '#6366f1';
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={index}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                position: 'relative',
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Tooltip */}
              {isHovered && (
                <div style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  fontSize: 12,
                  color: '#e2e8f0',
                  whiteSpace: 'nowrap',
                  marginBottom: 8,
                  zIndex: 10,
                }}>
                  <p style={{ margin: 0, fontWeight: 600 }}>{item.label}</p>
                  <p style={{ margin: 0, color }}>{item.value.toLocaleString()}</p>
                </div>
              )}

              {/* Value Label */}
              <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
                {item.value.toLocaleString()}
              </span>

              {/* Bar */}
              <div
                style={{
                  width: '100%',
                  height: `${barHeight}%`,
                  background: isHovered
                    ? `linear-gradient(180deg, ${color}, ${color}88)`
                    : `linear-gradient(180deg, ${color}88, ${color}44)`,
                  borderRadius: 8,
                  transition: 'all 0.3s ease',
                  transform: isHovered ? 'scaleY(1.05)' : 'scaleY(1)',
                  transformOrigin: 'bottom',
                  cursor: 'pointer',
                  minHeight: 4,
                }}
              />

              {/* Label */}
              <span style={{
                fontSize: 11,
                color: '#64748b',
                textAlign: 'center',
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Line Chart Component
interface LineChartProps {
  data: { label: string; value: number }[];
  title: string;
  height?: number;
  color?: string;
}

export const InteractiveLineChart: React.FC<LineChartProps> = ({ 
  data,
  title, 
  height = 200,
  color = '#6366f1'
}) => {
  const maxValue = Math.max(...data.map((d: any) => d.value));
  const minValue = Math.min(...data.map((d: any) => d.value));
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const width = 100;
  const padding = 10;
  const chartWidth = width - (padding * 2);
  const chartHeight = height - (padding * 2);

  const points = data.map((d: any, i: number) => {
    const x = padding + (i / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((d.value - minValue) / (maxValue - minValue)) * chartHeight;
    return { x, y, ...d };
  });

  const pathD = points.map((p: any, i: number) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <TrendingUp size={20} color="#a5b4fc" />
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{title}</h3>
      </div>

      <svg width="100%" height={height} style={{ overflow: 'visible' }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <line
            key={i}
            x1={padding}
            y1={padding + chartHeight * ratio}
            x2={width - padding}
            y2={padding + chartHeight * ratio}
            stroke="rgba(51, 65, 85, 0.2)"
            strokeWidth="0.5"
          />
        ))}

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Area fill */}
        <path
          d={`${pathD} L ${width - padding} ${padding + chartHeight} L ${padding} ${padding + chartHeight} Z`}
          fill={color}
          fillOpacity="0.1"
        />

        {/* Points */}
        {points.map((point, i) => (
          <g key={i}>
            <circle
              cx={point.x}
              cy={point.y}
              r={hoveredIndex === i ? 6 : 4}
              fill={color}
              stroke="white"
              strokeWidth="2"
              style={{ cursor: 'pointer', transition: 'r 0.2s ease' }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
            {hoveredIndex === i && (
              <g>
                <rect
                  x={point.x - 40}
                  y={point.y - 40}
                  width="80"
                  height="30"
                  rx="6"
                  fill="rgba(15, 23, 42, 0.95)"
                  stroke="rgba(99, 102, 241, 0.3)"
                />
                <text
                  x={point.x}
                  y={point.y - 25}
                  textAnchor="middle"
                  fill="#e2e8f0"
                  fontSize="10"
                  fontWeight="600"
                >
                  {point.label}
                </text>
                <text
                  x={point.x}
                  y={point.y - 15}
                  textAnchor="middle"
                  fill={color}
                  fontSize="10"
                >
                  {point.value.toLocaleString()}
                </text>
              </g>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
};

// Donut Chart Component
interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  title: string;
  size?: number;
}

export const InteractiveDonutChart: React.FC<DonutChartProps> = ({ data, title, size = 200 }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const radius = size / 2;
  const innerRadius = radius * 0.6;
  const centerX = radius;
  const centerY = radius;

  let currentAngle = -90; // Start from top

  const segments = data.map((item, index) => {
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const x3 = centerX + innerRadius * Math.cos(endRad);
    const y3 = centerY + innerRadius * Math.sin(endRad);
    const x4 = centerX + innerRadius * Math.cos(startRad);
    const y4 = centerY + innerRadius * Math.sin(startRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathD = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
      'Z'
    ].join(' ');

    return { pathD, color: item.color, label: item.label, value: item.value, percentage: (item.value / total) * 100 };
  });

  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, margin: 0 }}>{title}</h3>

      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <svg width={size} height={size}>
          {segments.map((segment, i) => (
            <path
              key={i}
              d={segment.pathD}
              fill={segment.color}
              opacity={hoveredIndex === null || hoveredIndex === i ? 1 : 0.5}
              style={{ cursor: 'pointer', transition: 'opacity 0.2s ease' }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          ))}
          {hoveredIndex !== null && (
            <text
              x={centerX}
              y={centerY}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#e2e8f0"
              fontSize="24"
              fontWeight="700"
            >
              {segments[hoveredIndex].percentage.toFixed(1)}%
            </text>
          )}
        </svg>

        <div style={{ flex: 1 }}>
          {data.map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 8,
                opacity: hoveredIndex === null || hoveredIndex === i ? 1 : 0.5,
                transition: 'opacity 0.2s ease',
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                background: item.color,
              }} />
              <span style={{ fontSize: 13, color: '#cbd5e1', flex: 1 }}>{item.label}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
