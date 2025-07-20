import { metrics, services, alerts, type Metric, type Service, type Alert, type InsertMetric, type InsertService, type InsertAlert } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  async getRecentMetrics(name: string, limit: number = 50): Promise<Metric[]> {
    const result = await db
      .select()
      .from(metrics)
      .where(eq(metrics.name, name))
      .orderBy(desc(metrics.timestamp))
      .limit(limit);
    return result;
  }

  async insertMetric(insertMetric: InsertMetric): Promise<Metric> {
    const [metric] = await db
      .insert(metrics)
      .values(insertMetric)
      .returning();
    return metric;
  }

  async getAllServices(): Promise<Service[]> {
    const result = await db.select().from(services);
    return result;
  }

  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db
      .select()
      .from(services)
      .where(eq(services.id, id));
    return service || undefined;
  }

  async createService(insertService: InsertService): Promise<Service> {
    const [service] = await db
      .insert(services)
      .values(insertService)
      .returning();
    return service;
  }

  async updateService(id: number, updates: Partial<Service>): Promise<Service | undefined> {
    const [service] = await db
      .update(services)
      .set(updates)
      .where(eq(services.id, id))
      .returning();
    return service || undefined;
  }

  async getRecentAlerts(limit: number = 10): Promise<Alert[]> {
    const result = await db
      .select()
      .from(alerts)
      .orderBy(desc(alerts.timestamp))
      .limit(limit);
    return result;
  }

  async getUnresolvedAlerts(): Promise<Alert[]> {
    const result = await db
      .select()
      .from(alerts)
      .where(eq(alerts.resolved, false))
      .orderBy(desc(alerts.timestamp));
    return result;
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const [alert] = await db
      .insert(alerts)
      .values(insertAlert)
      .returning();
    return alert;
  }

  async resolveAlert(id: number): Promise<Alert | undefined> {
    const [alert] = await db
      .update(alerts)
      .set({ resolved: true })
      .where(eq(alerts.id, id))
      .returning();
    return alert || undefined;
  }
}

export const storage = new DatabaseStorage();
