# ProMetrics - Real-time Monitoring Dashboard

A comprehensive monitoring dashboard web application that integrates with Prometheus to collect and display real-time metrics from different applications and servers.

## Features

### 💻 Core Features
- **Real-time Dashboard** with system metrics (CPU, Memory, Disk, Network)
- **WebSocket Integration** for live data updates
- **Service Monitoring** with health status and response times
- **Alert System** with severity levels and notifications
- **Interactive Charts** using Recharts for data visualization
- **Dark Theme** optimized for monitoring environments

### 🔐 Security Features
- JWT-based authentication (infrastructure ready)
- Rate limiting and CORS protection
- HTTPS with TLS support
- XSS, CSRF, and SQL injection prevention
- Role-based access control ready

### 📊 Monitoring Capabilities
- System metrics collection via Node Exporter
- Custom application metrics
- Service health monitoring
- Alert rules and notifications
- Prometheus integration
- Blackbox monitoring for the monitoring tool itself

## Tech Stack

- **Frontend**: React 18, TypeScript, TailwindCSS, shadcn/ui, Recharts
- **Backend**: Node.js, Express.js, WebSockets
- **Database**: PostgreSQL with Drizzle ORM
- **Monitoring**: Prometheus, Node Exporter, Blackbox Exporter
- **Deployment**: Docker, Docker Compose, Kubernetes

## Quick Start

### Development

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd monitoring-dashboard
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5000`

### Production Deployment with Docker

1. **Copy environment file**:
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

2. **Start with Docker Compose**:
   ```bash
   docker-compose up -d
   ```

   This will start:
   - Monitoring application on port 5000
   - PostgreSQL database on port 5432
   - Prometheus on port 9090
   - Node Exporter on port 9100
   - Blackbox Exporter on port 9115
   - Nginx reverse proxy on ports 80/443

### Kubernetes Deployment

1. **Build and push Docker image**:
   ```bash
   docker build -t your-registry/monitoring-app:latest .
   docker push your-registry/monitoring-app:latest
   ```

2. **Update image in deployment**:
   ```bash
   # Edit k8s/deployment.yaml to use your image
   kubectl apply -f k8s/deployment.yaml
   ```

## Configuration

### Environment Variables

Key environment variables to configure:

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/monitoring

# Security
JWT_SECRET=your-secure-secret-key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Application
NODE_ENV=production
PORT=5000

# Notifications (optional)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@example.com
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
TELEGRAM_BOT_TOKEN=your-bot-token
```

### Prometheus Configuration

Add your services to `prometheus/prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'your-service'
    static_configs:
      - targets: ['your-service:port']
```

### SSL Certificates

For production, place your SSL certificates:
- `nginx/ssl/cert.pem` - SSL certificate
- `nginx/ssl/key.pem` - SSL private key

Or use Let's Encrypt with the provided nginx configuration.

## Monitoring Setup

### Adding New Services

1. **Add to Prometheus configuration**:
   ```yaml
   # In prometheus/prometheus.yml
   - job_name: 'new-service'
     static_configs:
       - targets: ['service-host:port']
   ```

2. **Add service in the dashboard**:
   The application will automatically detect and display services configured in Prometheus.

### Custom Metrics

Expose metrics in Prometheus format from your applications:

```javascript
// Example: Express.js with prom-client
const promClient = require('prom-client');
const register = promClient.register;

const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

app.get('/metrics', (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(register.metrics());
});
```

### Alert Rules

Customize alert rules in `prometheus/alert_rules.yml`:

```yaml
- alert: CustomAlert
  expr: your_metric > threshold
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "Custom alert triggered"
    description: "Your custom condition has been met"
```

## API Endpoints

### Core Endpoints
- `GET /api/services` - Get all monitored services
- `GET /api/alerts` - Get recent alerts
- `GET /api/metrics/:name` - Get specific metric data
- `WebSocket /ws` - Real-time updates

### Authentication (Ready for Implementation)
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

## Development

### Project Structure
```
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared TypeScript schemas
├── prometheus/      # Prometheus configuration
├── nginx/           # Nginx configuration
├── k8s/             # Kubernetes manifests
└── docker-compose.yml
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run linting
- `npm run test` - Run tests

### Database Migrations
```bash
npm run db:generate  # Generate migration
npm run db:migrate   # Run migrations
npm run db:studio    # Open database studio
```

## Notifications

### Email Notifications
Configure SMTP settings in `.env`:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-app-password
```

### Slack Notifications
Create a Slack webhook and add to `.env`:
```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

### Telegram Notifications
Create a Telegram bot and add credentials:
```bash
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=your-chat-id
```

## Security

### Rate Limiting
- API endpoints: 100 requests per 15 minutes
- Login endpoints: 5 requests per minute
- Customizable via environment variables

### IP Whitelisting
Configure in nginx or application level:
```nginx
# In nginx.conf
allow 192.168.1.0/24;
deny all;
```

### HTTPS/TLS
- Automatic HTTP to HTTPS redirect
- TLS 1.2+ enforced
- Security headers included
- HSTS enabled

## Troubleshooting

### Common Issues

1. **WebSocket connection failed**:
   - Check if port 5000 is accessible
   - Verify WebSocket upgrade headers in nginx

2. **Database connection error**:
   - Verify DATABASE_URL is correct
   - Check if PostgreSQL is running
   - Ensure database exists

3. **Prometheus not scraping**:
   - Check target configuration
   - Verify service endpoints are accessible
   - Review Prometheus logs

4. **SSL certificate issues**:
   - Verify certificate files exist
   - Check certificate validity
   - Ensure proper file permissions

### Logs

Check application logs:
```bash
# Docker Compose
docker-compose logs -f monitoring-app

# Kubernetes
kubectl logs -f deployment/monitoring-app
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the configuration documentation