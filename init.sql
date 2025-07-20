-- Database initialization script for monitoring application

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS monitoring;

-- Switch to monitoring database
\c monitoring;

-- Create tables
CREATE TABLE IF NOT EXISTS metrics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    value REAL NOT NULL,
    unit VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    labels TEXT[]
);

CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    endpoint VARCHAR(500) NOT NULL,
    status VARCHAR(50) NOT NULL,
    response_time INTEGER,
    last_scraped TIMESTAMP,
    icon VARCHAR(50) NOT NULL DEFAULT 'server'
);

CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    service_name VARCHAR(255)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_metrics_name_timestamp ON metrics(name, timestamp);
CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts(timestamp);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);

-- Insert sample data
INSERT INTO services (name, endpoint, status, response_time, last_scraped, icon) VALUES
('Web Server', 'http://web-server:9090/metrics', 'healthy', 142, NOW(), 'server'),
('Database', 'http://database:9187/metrics', 'healthy', 89, NOW(), 'database'),
('API Gateway', 'http://api-gateway:8080/metrics', 'down', NULL, NOW() - INTERVAL '30 seconds', 'cloud')
ON CONFLICT DO NOTHING;

INSERT INTO alerts (title, description, severity, timestamp, service_name) VALUES
('API Gateway Down', 'Service has been unreachable for 30 seconds', 'critical', NOW() - INTERVAL '2 minutes', 'API Gateway'),
('High Memory Usage', 'Memory usage exceeded 80% threshold', 'warning', NOW() - INTERVAL '5 minutes', 'Web Server'),
('Slow Response Time', 'Average response time > 500ms', 'warning', NOW() - INTERVAL '12 minutes', 'Database')
ON CONFLICT DO NOTHING;