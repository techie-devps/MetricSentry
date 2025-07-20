import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  description: string;
  value: string | number;
  trend?: string;
  progress?: number;
  icon: LucideIcon;
  iconColor: string;
  valueColor: string;
}

export function MetricCard({
  title,
  description,
  value,
  trend,
  progress,
  icon: Icon,
  iconColor,
  valueColor,
}: MetricCardProps) {
  return (
    <Card className="metric-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${iconColor} rounded-lg flex items-center justify-center`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">{title}</h3>
              <p className="text-gray-400 text-sm">{description}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${valueColor}`}>
              {typeof value === 'number' && title.toLowerCase().includes('usage') 
                ? `${value.toFixed(1)}%` 
                : value}
            </div>
            {trend && (
              <div className={`text-sm ${valueColor}`}>{trend}</div>
            )}
          </div>
        </div>
        {progress !== undefined && (
          <Progress 
            value={progress} 
            className="w-full"
          />
        )}
      </CardContent>
    </Card>
  );
}
