import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const metrics = pgTable("metrics", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  value: real("value").notNull(),
  unit: text("unit").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  labels: text("labels").array(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  endpoint: text("endpoint").notNull(),
  status: text("status").notNull(), // "healthy", "down", "warning"
  responseTime: integer("response_time"), // in milliseconds
  lastScraped: timestamp("last_scraped"),
  icon: text("icon").notNull().default("server"),
});

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull(), // "critical", "warning", "info"
  timestamp: timestamp("timestamp").notNull(),
  resolved: boolean("resolved").notNull().default(false),
  serviceName: text("service_name"),
});

export const insertMetricSchema = createInsertSchema(metrics).omit({ id: true });
export const insertServiceSchema = createInsertSchema(services).omit({ id: true });
export const insertAlertSchema = createInsertSchema(alerts).omit({ id: true });

export type InsertMetric = z.infer<typeof insertMetricSchema>;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type InsertAlert = z.infer<typeof insertAlertSchema>;

export type Metric = typeof metrics.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Alert = typeof alerts.$inferSelect;

// WebSocket message types
export const wsMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("metrics_update"),
    data: z.object({
      cpu: z.number(),
      memory: z.number(),
      disk: z.number(),
      network: z.number(),
      timestamp: z.number(),
    }),
  }),
  z.object({
    type: z.literal("service_update"),
    data: z.array(z.object({
      id: z.number(),
      name: z.string(),
      endpoint: z.string(),
      status: z.string(),
      responseTime: z.number().nullable(),
      lastScraped: z.string().nullable(),
      icon: z.string(),
    })),
  }),
  z.object({
    type: z.literal("new_alert"),
    data: z.object({
      id: z.number(),
      title: z.string(),
      description: z.string(),
      severity: z.string(),
      timestamp: z.string(),
      resolved: z.boolean(),
      serviceName: z.string().nullable(),
    }),
  }),
]);

export type WSMessage = z.infer<typeof wsMessageSchema>;
