import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Alert } from "@shared/schema";

interface AlertsPanelProps {
  alerts: Alert[];
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'error-text';
    case 'warning':
      return 'warning-text';
    case 'info':
      return 'text-blue-400';
    default:
      return 'text-gray-400';
  }
};

const getSeverityBg = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'error-bg';
    case 'warning':
      return 'warning-bg';
    case 'info':
      return 'bg-blue-500 bg-opacity-10 border-blue-500 border-opacity-20';
    default:
      return 'bg-gray-500 bg-opacity-10 border-gray-500 border-opacity-20';
  }
};

const formatTimeAgo = (timestamp: Date | string) => {
  const now = new Date();
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minutes ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
};

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  return (
    <Card className="metric-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white">Recent Alerts</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert) => {
            const severityColor = getSeverityColor(alert.severity);
            const severityBg = getSeverityBg(alert.severity);

            return (
              <div
                key={alert.id}
                className={`flex items-start space-x-3 p-3 rounded-lg border ${severityBg}`}
              >
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-current ${severityColor}`}></div>
                <div className="flex-1">
                  <div className="font-medium text-sm text-white">{alert.title}</div>
                  <div className="text-xs text-gray-400 mt-1">{alert.description}</div>
                  {alert.serviceName && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      {alert.serviceName}
                    </Badge>
                  )}
                  <div className="text-xs text-gray-500 mt-2">
                    {formatTimeAgo(alert.timestamp)}
                  </div>
                </div>
              </div>
            );
          })}
          {alerts.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No recent alerts
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
