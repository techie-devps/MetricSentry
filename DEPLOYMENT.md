# Server Deployment Guide

This guide will help you deploy the ProMetrics monitoring dashboard on your own server.

## Quick Deployment (Recommended)

### Prerequisites
- Docker and Docker Compose installed
- Linux/macOS server with at least 2GB RAM
- Ports 80, 443, 5000, 9090 available

### 1. Clone Repository
```bash
git clone <your-repository>
cd monitoring-dashboard
```

### 2. Deploy with One Command
```bash
./deploy.sh
```

This script will:
- Generate secure environment configuration
- Create SSL certificates (self-signed for testing)
- Start all services with Docker Compose
- Set up Prometheus monitoring stack

### 3. Access Your Dashboard
- **Dashboard**: https://your-server-ip
- **Prometheus**: http://your-server-ip:9090

## Manual Docker Deployment

### 1. Environment Setup
```bash
# Copy and edit environment file
cp .env.example .env
nano .env
```

### 2. Generate SSL Certificates
```bash
# Create SSL directory
mkdir -p nginx/ssl

# Generate self-signed certificates (for testing)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem \
  -subj "/C=US/ST=State/L=City/O=Your-Org/CN=your-domain.com"
```

### 3. Start Services
```bash
docker-compose up -d
```

### 4. Verify Deployment
```bash
docker-compose ps
curl -k https://localhost/api/services
```

## Production SSL Setup

### Let's Encrypt (Recommended)
```bash
# Install certbot
sudo apt install certbot

# Get SSL certificate
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/key.pem

# Restart nginx
docker-compose restart nginx
```

## Configuration

### Environment Variables
Key variables in `.env`:

```bash
# Database
DATABASE_URL=postgresql://postgres:secure-password@postgres:5432/monitoring

# Security
JWT_SECRET=your-very-secure-secret-key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Email notifications
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@example.com
SMTP_PASS=your-app-password

# Slack notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### Adding Your Services
Edit `prometheus/prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'your-web-app'
    static_configs:
      - targets: ['your-app-server:port']
  
  - job_name: 'your-database'
    static_configs:
      - targets: ['your-db-server:9187']
```

## Service Management

### Deployment Script Commands
```bash
./deploy.sh deploy    # Deploy application
./deploy.sh stop      # Stop all services  
./deploy.sh update    # Update deployment
./deploy.sh logs      # View logs
./deploy.sh backup    # Create backup
./deploy.sh status    # Check status
```

### Manual Docker Commands
```bash
# View logs
docker-compose logs -f monitoring-app

# Scale application
docker-compose up -d --scale monitoring-app=3

# Update images
docker-compose pull && docker-compose up -d

# Backup database
docker-compose exec postgres pg_dump -U postgres monitoring > backup.sql
```

## Monitoring Your Services

### 1. Add Application Metrics
In your applications, expose metrics endpoint:

```javascript
// Node.js example
const promClient = require('prom-client');
const register = promClient.register;

// Create metrics
const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route']
});

// Expose metrics endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(register.metrics());
});
```

### 2. Configure Prometheus Targets
Add your services to `prometheus/prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'my-api'
    static_configs:
      - targets: ['api-server:3000']
    scrape_interval: 30s
```

### 3. Set Up Alerts
Edit `prometheus/alert_rules.yml`:

```yaml
- alert: MyServiceDown
  expr: up{job="my-api"} == 0
  for: 2m
  labels:
    severity: critical
  annotations:
    summary: "My API service is down"
```

## Security Hardening

### 1. Firewall Configuration
```bash
# Allow only necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 2. Update nginx.conf
Add IP whitelisting:
```nginx
# Allow specific IPs only
allow 192.168.1.0/24;
allow 10.0.0.0/8;
deny all;
```

### 3. Environment Security
```bash
# Secure .env file
chmod 600 .env

# Use Docker secrets in production
docker swarm init
docker secret create jwt_secret jwt_secret.txt
```

## Troubleshooting

### Common Issues

#### 1. Services Not Starting
```bash
# Check logs
docker-compose logs

# Check disk space
df -h

# Check memory
free -h
```

#### 2. SSL Certificate Issues
```bash
# Verify certificate
openssl x509 -in nginx/ssl/cert.pem -text -noout

# Check nginx config
docker-compose exec nginx nginx -t
```

#### 3. Database Connection Errors
```bash
# Check database logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres psql -U postgres -d monitoring -c "SELECT 1;"
```

#### 4. Prometheus Not Scraping
```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Verify service endpoints
curl http://your-service:port/metrics
```

### Performance Tuning

#### 1. Prometheus Retention
Edit `docker-compose.yml`:
```yaml
prometheus:
  command:
    - '--storage.tsdb.retention.time=30d'  # Keep 30 days
    - '--storage.tsdb.retention.size=10GB' # Max 10GB
```

#### 2. Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX CONCURRENTLY idx_metrics_timestamp ON metrics(timestamp);
CREATE INDEX CONCURRENTLY idx_alerts_severity ON alerts(severity);
```

## Backup and Recovery

### Automated Backups
Create cron job:
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/monitoring-dashboard/deploy.sh backup
```

### Manual Backup
```bash
# Create backup
./deploy.sh backup

# Restore database
docker-compose exec -T postgres psql -U postgres monitoring < backup/database.sql
```

## Updates and Maintenance

### Update Application
```bash
# Pull latest changes
git pull origin main

# Update deployment
./deploy.sh update
```

### Monitor System Health
```bash
# Check system resources
docker stats

# Monitor disk usage
docker system df

# Clean up unused images
docker system prune -f
```

## Support

If you encounter issues:
1. Check the logs: `./deploy.sh logs`
2. Verify configuration: `docker-compose config`
3. Review the troubleshooting section above
4. Check the main README.md for detailed documentation