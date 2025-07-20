import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Server, 
  Database, 
  Cloud, 
  ExternalLink,
  Plus
} from "lucide-react";
import type { Service } from "@shared/schema";

interface ServiceStatusTableProps {
  services: Service[];
}

const iconMap = {
  server: Server,
  database: Database,
  cloud: Cloud,
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'healthy':
      return 'success-text';
    case 'warning':
      return 'warning-text';
    case 'down':
      return 'error-text';
    default:
      return 'text-gray-400';
  }
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'healthy':
      return 'default';
    case 'warning':
      return 'secondary';
    case 'down':
      return 'destructive';
    default:
      return 'outline';
  }
};

export function ServiceStatusTable({ services }: ServiceStatusTableProps) {
  return (
    <Card className="metric-card col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white">Service Status</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
            <Plus className="h-4 w-4 mr-1" />
            Add Target
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 text-sm font-medium text-gray-400">Service</th>
                <th className="text-left py-3 text-sm font-medium text-gray-400">Status</th>
                <th className="text-left py-3 text-sm font-medium text-gray-400">Response Time</th>
                <th className="text-left py-3 text-sm font-medium text-gray-400">Last Scraped</th>
                <th className="text-left py-3 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => {
                const IconComponent = iconMap[service.icon as keyof typeof iconMap] || Server;
                const statusColor = getStatusColor(service.status);
                const badgeVariant = getStatusBadgeVariant(service.status);

                return (
                  <tr key={service.id} className="border-b border-gray-700">
                    <td className="py-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                          <IconComponent className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-white">{service.name}</div>
                          <div className="text-sm text-gray-400">{service.endpoint}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <Badge 
                        variant={badgeVariant}
                        className={`${statusColor} border-current`}
                      >
                        <span className="w-2 h-2 rounded-full bg-current mr-1"></span>
                        {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-3 text-sm text-white">
                      {service.responseTime ? `${service.responseTime}ms` : 'Timeout'}
                    </td>
                    <td className="py-3 text-sm text-gray-400">
                      {service.lastScraped 
                        ? new Date(service.lastScraped).toLocaleString()
                        : 'Never'
                      }
                    </td>
                    <td className="py-3">
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
