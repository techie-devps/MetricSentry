import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Cpu, 
  HardDrive, 
  MemoryStick, 
  Network,
  Search,
  RefreshCw
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sidebar } from "@/components/sidebar";
import { MetricCard } from "@/components/metrics/metric-card";
import { RealTimeChart } from "@/components/metrics/real-time-chart";
import { ServiceStatusTable } from "@/components/service-status-table";
import { AlertsPanel } from "@/components/alerts-panel";
import { useWebSocket } from "@/hooks/use-websocket";
import type { Service, Alert } from "@shared/schema";

interface MetricData {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  timestamp: number;
}

interface ChartData {
  time: string;
  value: number;
}

export default function Dashboard() {
  const { isConnected, lastMessage } = useWebSocket();
  const [currentMetrics, setCurrentMetrics] = useState<MetricData>({
    cpu: 73.2,
    memory: 84.7,
    disk: 45.3,
    network: 156.2,
    timestamp: Date.now(),
  });
  
  const [cpuData, setCpuData] = useState<ChartData[]>([]);
  const [memoryData, setMemoryData] = useState<ChartData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState('1h');

  // Fetch services
  const { data: services = [], refetch: refetchServices } = useQuery<Service[]>({
    queryKey: ['/api/services'],
  });

  // Fetch alerts
  const { data: alerts = [], refetch: refetchAlerts } = useQuery<Alert[]>({
    queryKey: ['/api/alerts'],
  });

  // Handle WebSocket messages
  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case 'metrics_update':
        setCurrentMetrics(lastMessage.data);
        
        // Add to chart data
        const timeLabel = new Date(lastMessage.data.timestamp).toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
        });

        setCpuData(prev => {
          const newData = [...prev, { time: timeLabel, value: lastMessage.data.cpu }];
          return newData.slice(-20); // Keep last 20 points
        });

        setMemoryData(prev => {
          const newData = [...prev, { time: timeLabel, value: lastMessage.data.memory }];
          return newData.slice(-20); // Keep last 20 points
        });
        break;
        
      case 'service_update':
        refetchServices();
        break;
        
      case 'new_alert':
        refetchAlerts();
        break;
    }
  }, [lastMessage, refetchServices, refetchAlerts]);

  // Initialize chart data
  useEffect(() => {
    const initializeData = () => {
      const now = new Date();
      const initialData: ChartData[] = [];
      
      for (let i = 19; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60000); // 1 minute intervals
        const timeLabel = time.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
        });
        
        initialData.push({
          time: timeLabel,
          value: Math.floor(Math.random() * 30) + 60, // Random initial values
        });
      }
      
      setCpuData(initialData);
      setMemoryData(initialData.map(point => ({ 
        ...point, 
        value: Math.floor(Math.random() * 20) + 75 
      })));
    };
    
    initializeData();
  }, []);

  const handleRefresh = () => {
    refetchServices();
    refetchAlerts();
  };

  const getMetricTrend = (current: number, previous = current - 2) => {
    const change = ((current - previous) / previous * 100);
    const symbol = change >= 0 ? '↗' : '↘';
    return `${symbol} ${Math.abs(change).toFixed(1)}%`;
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="sidebar-bg border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white">System Monitoring Dashboard</h1>
              <p className="text-gray-400 text-sm mt-1">
                Real-time metrics and alerts for your infrastructure
                {isConnected && (
                  <span className="ml-2 text-green-400">● Live</span>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search metrics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-800 border-gray-600 pl-10 pr-4 w-64 text-white placeholder-gray-400"
                />
              </div>
              
              {/* Time Range Selector */}
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last 1 hour</SelectItem>
                  <SelectItem value="6h">Last 6 hours</SelectItem>
                  <SelectItem value="24h">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                </SelectContent>
              </Select>

              {/* Refresh Button */}
              <Button onClick={handleRefresh} className="bg-primary hover:bg-primary/90">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6 bg-black">
          {/* Status Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="CPU Usage"
              description="Average across all nodes"
              value={currentMetrics.cpu}
              trend={getMetricTrend(currentMetrics.cpu)}
              progress={currentMetrics.cpu}
              icon={Cpu}
              iconColor="bg-primary"
              valueColor="success-text"
            />
            
            <MetricCard
              title="Memory Usage"
              description="RAM utilization"
              value={currentMetrics.memory}
              trend={getMetricTrend(currentMetrics.memory)}
              progress={currentMetrics.memory}
              icon={MemoryStick}
              iconColor="bg-orange-500"
              valueColor="warning-text"
            />
            
            <MetricCard
              title="Disk Usage"
              description="Storage utilization"
              value={currentMetrics.disk}
              trend={getMetricTrend(currentMetrics.disk)}
              progress={currentMetrics.disk}
              icon={HardDrive}
              iconColor="bg-green-500"
              valueColor="success-text"
            />
            
            <MetricCard
              title="Network I/O"
              description="Bytes per second"
              value={`${currentMetrics.network} MB/s`}
              trend={getMetricTrend(currentMetrics.network)}
              progress={(currentMetrics.network / 300) * 100} // Assuming max 300 MB/s
              icon={Network}
              iconColor="bg-primary"
              valueColor="text-primary"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <RealTimeChart
              title="CPU Usage Over Time"
              data={cpuData}
              color="hsl(var(--success-green))"
              unit="%"
            />
            
            <RealTimeChart
              title="Memory Usage Over Time"
              data={memoryData}
              color="hsl(var(--warning-orange))"
              unit="%"
            />
          </div>

          {/* Services and Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ServiceStatusTable services={services} />
            <AlertsPanel alerts={alerts} />
          </div>
        </main>
      </div>
    </div>
  );
}
