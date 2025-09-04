import React, { useMemo } from 'react';

interface LineChartComponentProps {
  data: any[];
  xKey: string;
  yKey: string;
  color?: string;
  yAxisLabel?: string;
  formatTooltip?: (value: any, xValue: any) => string;
}

export const LineChartComponent: React.FC<LineChartComponentProps> = ({
  data,
  xKey,
  yKey,
  color = '#acdfeb',
  yAxisLabel = 'Value',
  formatTooltip
}) => {
  const { chartData, dimensions } = useMemo(() => {
    if (!data.length) return { chartData: [], dimensions: { width: 0, height: 0 } };

    const values = data.map(d => d[yKey]).filter(v => v !== null && v !== undefined);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue;
    const padding = valueRange * 0.1; // 10% padding

    const chartWidth = 800;
    const chartHeight = 300;
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    
    const innerWidth = chartWidth - margin.left - margin.right;
    const innerHeight = chartHeight - margin.top - margin.bottom;

    const processedData = data.map((d, index) => {
      const x = (index / (data.length - 1)) * innerWidth;
      const y = innerHeight - ((d[yKey] - (minValue - padding)) / (valueRange + 2 * padding)) * innerHeight;
      
      return {
        ...d,
        x: x + margin.left,
        y: y + margin.top,
        originalX: d[xKey],
        originalY: d[yKey]
      };
    });

    return {
      chartData: processedData,
      dimensions: {
        width: chartWidth,
        height: chartHeight,
        margin,
        innerWidth,
        innerHeight,
        minValue: minValue - padding,
        maxValue: maxValue + padding,
        valueRange: valueRange + 2 * padding
      }
    };
  }, [data, xKey, yKey]);

  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>No data available for chart</p>
      </div>
    );
  }

  // Generate path for line
  const linePath = chartData.reduce((path, point, index) => {
    const command = index === 0 ? 'M' : 'L';
    return `${path} ${command} ${point.x} ${point.y}`;
  }, '');

  // Generate Y-axis ticks
  const yTicks = [];
  const tickCount = 5;
  for (let i = 0; i <= tickCount; i++) {
    const value = dimensions.minValue + (dimensions.valueRange * i / tickCount);
    const y = dimensions.height - dimensions.margin.bottom - (i / tickCount) * dimensions.innerHeight;
    yTicks.push({ value: value.toFixed(2), y });
  }

  // Generate X-axis ticks (show every nth point to avoid crowding)
  const xTicks = [];
  const maxXTicks = 8;
  const step = Math.max(1, Math.floor(chartData.length / maxXTicks));
  for (let i = 0; i < chartData.length; i += step) {
    const point = chartData[i];
    xTicks.push({
      value: new Date(point.originalX).toLocaleDateString(),
      x: point.x
    });
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg
        width={dimensions.width}
        height={dimensions.height}
        className="overflow-visible"
      >
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
          </pattern>
        </defs>
        
        <rect
          x={dimensions.margin.left}
          y={dimensions.margin.top}
          width={dimensions.innerWidth}
          height={dimensions.innerHeight}
          fill="url(#grid)"
        />

        {/* Y-axis */}
        <line
          x1={dimensions.margin.left}
          y1={dimensions.margin.top}
          x2={dimensions.margin.left}
          y2={dimensions.height - dimensions.margin.bottom}
          stroke="#6b7280"
          strokeWidth="2"
        />

        {/* X-axis */}
        <line
          x1={dimensions.margin.left}
          y1={dimensions.height - dimensions.margin.bottom}
          x2={dimensions.width - dimensions.margin.right}
          y2={dimensions.height - dimensions.margin.bottom}
          stroke="#6b7280"
          strokeWidth="2"
        />

        {/* Y-axis ticks and labels */}
        {yTicks.map((tick, index) => (
          <g key={index}>
            <line
              x1={dimensions.margin.left - 5}
              y1={tick.y}
              x2={dimensions.margin.left}
              y2={tick.y}
              stroke="#6b7280"
              strokeWidth="1"
            />
            <text
              x={dimensions.margin.left - 10}
              y={tick.y + 4}
              textAnchor="end"
              fontSize="12"
              fill="#6b7280"
            >
              ${tick.value}
            </text>
          </g>
        ))}

        {/* X-axis ticks and labels */}
        {xTicks.map((tick, index) => (
          <g key={index}>
            <line
              x1={tick.x}
              y1={dimensions.height - dimensions.margin.bottom}
              x2={tick.x}
              y2={dimensions.height - dimensions.margin.bottom + 5}
              stroke="#6b7280"
              strokeWidth="1"
            />
            <text
              x={tick.x}
              y={dimensions.height - dimensions.margin.bottom + 18}
              textAnchor="middle"
              fontSize="10"
              fill="#6b7280"
              transform={`rotate(-45, ${tick.x}, ${dimensions.height - dimensions.margin.bottom + 18})`}
            >
              {tick.value}
            </text>
          </g>
        ))}

        {/* Axis labels */}
        <text
          x={dimensions.margin.left - 40}
          y={dimensions.height / 2}
          textAnchor="middle"
          fontSize="12"
          fill="#6b7280"
          transform={`rotate(-90, ${dimensions.margin.left - 40}, ${dimensions.height / 2})`}
        >
          {yAxisLabel}
        </text>

        <text
          x={dimensions.width / 2}
          y={dimensions.height - 5}
          textAnchor="middle"
          fontSize="12"
          fill="#6b7280"
        >
          Date
        </text>

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {chartData.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            fill={color}
            stroke="white"
            strokeWidth="2"
            className="hover:r-6 transition-all cursor-pointer"
          >
            <title>
              {formatTooltip 
                ? formatTooltip(point.originalY, point.originalX)
                : `${point.originalX}: ${point.originalY}`
              }
            </title>
          </circle>
        ))}
      </svg>
    </div>
  );
};