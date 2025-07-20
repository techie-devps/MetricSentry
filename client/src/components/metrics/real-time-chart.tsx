import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ChartData {
  time: string;
  value: number;
}

interface RealTimeChartProps {
  title: string;
  data: ChartData[];
  color: string;
  unit?: string;
  maxDataPoints?: number;
}

const timeRanges = [
  { label: '1H', value: 60 },
  { label: '6H', value: 360 },
  { label: '24H', value: 1440 },
];

export function RealTimeChart({ 
  title, 
  data, 
  color, 
  unit = '',
  maxDataPoints = 20 
}: RealTimeChartProps) {
  const [selectedRange, setSelectedRange] = useState('1H');
  const [displayData, setDisplayData] = useState<ChartData[]>([]);

  useEffect(() => {
    // Keep only the latest data points
    const latestData = data.slice(-maxDataPoints);
    setDisplayData(latestData);
  }, [data, maxDataPoints]);

  const formatTooltipValue = (value: number) => {
    if (unit === '%') return `${value.toFixed(1)}%`;
    if (unit === 'MB/s') return `${value.toFixed(1)} MB/s`;
    return `${value.toFixed(1)}${unit}`;
  };

  return (
    <Card className="metric-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white">{title}</CardTitle>
          <div className="flex space-x-2">
            {timeRanges.map((range) => (
              <Button
                key={range.label}
                variant={selectedRange === range.label ? "default" : "secondary"}
                size="sm"
                onClick={() => setSelectedRange(range.label)}
                className={`text-xs px-2 py-1 ${
                  selectedRange === range.label
                    ? "bg-primary text-white"
                    : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                }`}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={displayData}>
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                axisLine={{ stroke: '#374151' }}
                tickLine={{ stroke: '#374151' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                axisLine={{ stroke: '#374151' }}
                tickLine={{ stroke: '#374151' }}
                domain={unit === '%' ? [0, 100] : ['auto', 'auto']}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--dark-surface-2))',
                  border: '1px solid rgb(75, 85, 99)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                formatter={(value: number) => [formatTooltipValue(value), title]}
                labelStyle={{ color: '#9ca3af' }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: color, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
