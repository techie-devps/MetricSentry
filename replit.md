# ProMetrics - Real-time Monitoring Dashboard

## Overview

ProMetrics is a full-stack monitoring dashboard application built with React, TypeScript, Express, and PostgreSQL. It provides real-time monitoring capabilities for services, metrics tracking, and alerting functionality. The application features a modern dark-themed UI built with shadcn/ui components and includes WebSocket support for real-time updates.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Monorepo Structure
The application follows a monorepo pattern with clear separation of concerns:
- `client/` - React frontend application
- `server/` - Express.js backend API
- `shared/` - Shared TypeScript schemas and types
- Database configuration and migrations at the root level

### Technology Stack
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, shadcn/ui
- **Backend**: Node.js, Express.js, WebSockets (ws)
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: TanStack Query (React Query)
- **Real-time**: WebSocket connections for live updates
- **Styling**: TailwindCSS with custom CSS variables for theming

## Key Components

### Frontend Architecture
- **Single Page Application** using Wouter for client-side routing
- **Component Library**: shadcn/ui components with custom theming
- **State Management**: TanStack Query for server state, local state for UI
- **Real-time Updates**: Custom WebSocket hook for live data streaming
- **Responsive Design**: Mobile-first approach with TailwindCSS

### Backend Architecture
- **RESTful API** with Express.js
- **WebSocket Server** for real-time communication
- **Storage Abstraction**: Interface-based storage with both memory and database implementations
- **Middleware**: Request logging, error handling, and CORS support

### Database Schema
The application uses three main entities:
- **Services**: Monitored endpoints with health status and response times
- **Metrics**: Time-series data for system metrics (CPU, memory, disk, network)
- **Alerts**: System alerts with severity levels and resolution status

### Authentication & Authorization
Currently uses session-based authentication (infrastructure present but not fully implemented).

## Data Flow

1. **Service Monitoring**: Backend scrapes configured service endpoints
2. **Metrics Collection**: System metrics are collected and stored with timestamps
3. **Alert Generation**: Automated alert creation based on service health and metric thresholds
4. **Real-time Updates**: WebSocket broadcasts notify clients of new data
5. **Client Updates**: Frontend receives WebSocket messages and updates UI reactively

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **ws**: WebSocket implementation
- **@radix-ui/***: Accessible UI primitives

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the stack
- **ESBuild**: Production bundling for the server
- **Drizzle Kit**: Database migrations and schema management

## Deployment Strategy

### Development Environment
- **Vite Dev Server**: Hot module replacement for frontend
- **tsx**: TypeScript execution for backend development
- **Replit Integration**: Custom plugins for Replit development environment

### Production Build
- **Frontend**: Static asset generation via Vite
- **Backend**: ESBuild bundling to single JavaScript file
- **Database**: Drizzle migrations with PostgreSQL
- **Environment**: Node.js runtime with environment variable configuration

### Key Configuration Files
- `vite.config.ts`: Frontend build configuration with path aliases
- `drizzle.config.ts`: Database configuration and migration settings
- `tsconfig.json`: TypeScript configuration with path mapping
- `tailwind.config.ts`: UI theming and responsive design configuration

The application is designed to be easily deployable to cloud platforms with PostgreSQL support, using environment variables for configuration and supporting both development and production environments.

## Production Deployment (January 20, 2025)

### Complete Production Setup Added
- **Docker Configuration**: Multi-stage Dockerfile with security hardening
- **Docker Compose**: Full stack with Prometheus, PostgreSQL, Node Exporter, Blackbox Exporter, and Nginx
- **Kubernetes Manifests**: Production-ready deployments with ingress, secrets, and health checks
- **CI/CD Pipeline**: GitHub Actions workflow with testing, building, security scanning, and deployment
- **Prometheus Integration**: Complete monitoring stack with alert rules and service discovery
- **Security Features**: HTTPS/TLS, rate limiting, security headers, JWT authentication infrastructure
- **Nginx Reverse Proxy**: SSL termination, WebSocket support, static file serving, and security headers

### Deployment Options
1. **Docker Compose**: `docker-compose up -d` for single-server deployment
2. **Kubernetes**: `kubectl apply -f k8s/` for container orchestration 
3. **Manual**: Traditional server deployment with PM2 or systemd

### Security Implementation
- JWT-based authentication (infrastructure ready)
- Rate limiting (API: 100 req/15min, Login: 5 req/min)
- HTTPS with TLS 1.2+ enforcement
- Security headers (XSS, CSRF, HSTS protection)
- CORS configuration
- IP whitelisting support

### Monitoring Stack
- **Prometheus**: Metrics collection and alerting
- **Node Exporter**: System metrics (CPU, Memory, Disk, Network)
- **Blackbox Exporter**: HTTP/HTTPS endpoint monitoring
- **Custom Metrics**: Application-specific monitoring
- **Alert Rules**: CPU, Memory, Disk, Service health alerts

### Notification Channels
- Email (SMTP configuration)
- Slack (webhook integration)
- Telegram (bot integration)