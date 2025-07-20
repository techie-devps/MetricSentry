import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { wsMessageSchema, type WSMessage } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store connected clients
  const clients = new Set<WebSocket>();
  
  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('New WebSocket connection established');
    
    ws.on('close', () => {
      clients.delete(ws);
      console.log('WebSocket connection closed');
    });
  });

  // Broadcast function
  function broadcast(message: WSMessage) {
    const messageStr = JSON.stringify(message);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  // API Routes
  app.get('/api/services', async (req, res) => {
    try {
      const services = await storage.getAllServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch services' });
    }
  });

  app.get('/api/alerts', async (req, res) => {
    try {
      const alerts = await storage.getRecentAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch alerts' });
    }
  });

  app.get('/api/metrics/:name', async (req, res) => {
    try {
      const { name } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const metrics = await storage.getRecentMetrics(name, limit);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch metrics' });
    }
  });

  // Simulate real-time metric updates
  setInterval(async () => {
    // Generate mock Prometheus-style metrics
    const metricsData = {
      cpu: Math.floor(Math.random() * 30) + 60, // 60-90%
      memory: Math.floor(Math.random() * 20) + 75, // 75-95%
      disk: Math.floor(Math.random() * 40) + 30, // 30-70%
      network: Math.floor(Math.random() * 200) + 100, // 100-300 MB/s
      timestamp: Date.now(),
    };

    // Store metrics in storage
    await storage.insertMetric({
      name: 'cpu_usage',
      value: metricsData.cpu,
      unit: 'percent',
      timestamp: new Date(),
      labels: ['instance=web-server-1'],
    });

    await storage.insertMetric({
      name: 'memory_usage',
      value: metricsData.memory,
      unit: 'percent',
      timestamp: new Date(),
      labels: ['instance=web-server-1'],
    });

    await storage.insertMetric({
      name: 'disk_usage',
      value: metricsData.disk,
      unit: 'percent',
      timestamp: new Date(),
      labels: ['instance=web-server-1'],
    });

    await storage.insertMetric({
      name: 'network_io',
      value: metricsData.network,
      unit: 'mbps',
      timestamp: new Date(),
      labels: ['instance=web-server-1'],
    });

    // Broadcast to clients
    broadcast({
      type: 'metrics_update',
      data: metricsData,
    });
  }, 3000);

  // Simulate service status updates
  setInterval(async () => {
    const services = await storage.getAllServices();
    
    // Randomly update service statuses
    for (const service of services) {
      if (Math.random() < 0.1) { // 10% chance to update each service
        const statuses = ['healthy', 'down', 'warning'];
        const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
        const responseTime = newStatus === 'down' ? null : Math.floor(Math.random() * 500) + 50;
        
        await storage.updateService(service.id, {
          status: newStatus,
          responseTime,
          lastScraped: new Date(),
        });
      }
    }

    const updatedServices = await storage.getAllServices();
    broadcast({
      type: 'service_update',
      data: updatedServices.map(service => ({
        ...service,
        lastScraped: service.lastScraped?.toISOString() || null,
      })),
    });
  }, 10000);

  // Simulate random alerts
  setInterval(async () => {
    if (Math.random() < 0.05) { // 5% chance to generate an alert
      const alertTitles = [
        'High CPU Usage',
        'Memory Leak Detected',
        'Disk Space Low',
        'Service Timeout',
        'Connection Pool Exhausted',
      ];
      
      const alertDescriptions = [
        'CPU usage has exceeded 90% for more than 5 minutes',
        'Memory usage is continuously increasing',
        'Available disk space is below 10%',
        'Service response time exceeded 5 seconds',
        'Database connection pool is at maximum capacity',
      ];

      const severities = ['warning', 'critical', 'info'];
      const services = await storage.getAllServices();
      
      const title = alertTitles[Math.floor(Math.random() * alertTitles.length)];
      const description = alertDescriptions[Math.floor(Math.random() * alertDescriptions.length)];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      const serviceName = services[Math.floor(Math.random() * services.length)]?.name || null;

      const alert = await storage.createAlert({
        title,
        description,
        severity,
        timestamp: new Date(),
        serviceName,
      });

      broadcast({
        type: 'new_alert',
        data: {
          ...alert,
          timestamp: alert.timestamp.toISOString(),
        },
      });
    }
  }, 15000);

  return httpServer;
}
