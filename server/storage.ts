import { metrics, services, alerts, type Metric, type Service, type Alert, type InsertMetric, type InsertService, type InsertAlert } from "@shared/schema";

export interface IStorage {
  // Metrics
  getRecentMetrics(name: string, limit?: number): Promise<Metric[]>;
  insertMetric(metric: InsertMetric): Promise<Metric>;
  
  // Services
  getAllServices(): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, updates: Partial<Service>): Promise<Service | undefined>;
  
  // Alerts
  getRecentAlerts(limit?: number): Promise<Alert[]>;
  getUnresolvedAlerts(): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  resolveAlert(id: number): Promise<Alert | undefined>;
}

export class MemStorage implements IStorage {
  private metrics: Map<number, Metric>;
  private services: Map<number, Service>;
  private alerts: Map<number, Alert>;
  private currentMetricId: number;
  private currentServiceId: number;
  private currentAlertId: number;

  constructor() {
    this.metrics = new Map();
    this.services = new Map();
    this.alerts = new Map();
    this.currentMetricId = 1;
    this.currentServiceId = 1;
    this.currentAlertId = 1;
    
    // Initialize with some default services
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    const defaultServices: InsertService[] = [
      {
        name: "Web Server",
        endpoint: "http://web-server:9090/metrics",
        status: "healthy",
        responseTime: 142,
        lastScraped: new Date(),
        icon: "server",
      },
      {
        name: "Database",
        endpoint: "http://database:9187/metrics",
        status: "healthy",
        responseTime: 89,
        lastScraped: new Date(),
        icon: "database",
      },
      {
        name: "API Gateway",
        endpoint: "http://api-gateway:8080/metrics",
        status: "down",
        responseTime: null,
        lastScraped: new Date(Date.now() - 30000),
        icon: "cloud",
      },
    ];

    defaultServices.forEach(service => this.createService(service));

    const defaultAlerts: InsertAlert[] = [
      {
        title: "API Gateway Down",
        description: "Service has been unreachable for 30 seconds",
        severity: "critical",
        timestamp: new Date(Date.now() - 120000),
        serviceName: "API Gateway",
      },
      {
        title: "High Memory Usage",
        description: "Memory usage exceeded 80% threshold",
        severity: "warning",
        timestamp: new Date(Date.now() - 300000),
        serviceName: "Web Server",
      },
      {
        title: "Slow Response Time",
        description: "Average response time > 500ms",
        severity: "warning",
        timestamp: new Date(Date.now() - 720000),
        serviceName: "Database",
      },
    ];

    defaultAlerts.forEach(alert => this.createAlert(alert));
  }

  // Metrics
  async getRecentMetrics(name: string, limit: number = 50): Promise<Metric[]> {
    const filteredMetrics = Array.from(this.metrics.values())
      .filter(metric => metric.name === name)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
    
    return filteredMetrics;
  }

  async insertMetric(insertMetric: InsertMetric): Promise<Metric> {
    const id = this.currentMetricId++;
    const metric: Metric = { 
      ...insertMetric, 
      id,
      labels: insertMetric.labels || null
    };
    this.metrics.set(id, metric);
    return metric;
  }

  // Services
  async getAllServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }

  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async createService(insertService: InsertService): Promise<Service> {
    const id = this.currentServiceId++;
    const service: Service = { 
      ...insertService, 
      id,
      responseTime: insertService.responseTime ?? null,
      lastScraped: insertService.lastScraped ?? null,
      icon: insertService.icon || "server"
    };
    this.services.set(id, service);
    return service;
  }

  async updateService(id: number, updates: Partial<Service>): Promise<Service | undefined> {
    const service = this.services.get(id);
    if (!service) return undefined;
    
    const updatedService = { ...service, ...updates };
    this.services.set(id, updatedService);
    return updatedService;
  }

  // Alerts
  async getRecentAlerts(limit: number = 10): Promise<Alert[]> {
    return Array.from(this.alerts.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getUnresolvedAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values())
      .filter(alert => !alert.resolved)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = this.currentAlertId++;
    const alert: Alert = { 
      ...insertAlert, 
      id,
      resolved: insertAlert.resolved ?? false,
      serviceName: insertAlert.serviceName ?? null
    };
    this.alerts.set(id, alert);
    return alert;
  }

  async resolveAlert(id: number): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (!alert) return undefined;
    
    const resolvedAlert = { ...alert, resolved: true };
    this.alerts.set(id, resolvedAlert);
    return resolvedAlert;
  }
}

export const storage = new MemStorage();
