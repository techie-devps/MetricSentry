#!/bin/bash

# ProMetrics Monitoring Dashboard Deployment Script
# This script helps deploy the monitoring application to your server

set -e

echo "🚀 ProMetrics Monitoring Dashboard Deployment"
echo "=============================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

# Function to generate secure random string
generate_secret() {
    openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64
}

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating environment configuration..."
    cp .env.example .env
    
    # Generate secure secrets
    JWT_SECRET=$(generate_secret)
    POSTGRES_PASSWORD=$(generate_secret | tr -d '/')
    
    # Update .env with generated secrets
    sed -i "s/your-very-secure-jwt-secret-key-change-this-in-production/$JWT_SECRET/" .env
    sed -i "s/your-secure-password/$POSTGRES_PASSWORD/" .env
    
    echo "✅ Environment file created with secure secrets"
    echo "⚠️  Please review and update .env file with your specific configuration"
fi

# Create necessary directories
echo "📁 Creating required directories..."
mkdir -p nginx/ssl
mkdir -p logs
mkdir -p prometheus

# Check if SSL certificates exist
if [ ! -f nginx/ssl/cert.pem ] || [ ! -f nginx/ssl/key.pem ]; then
    echo "🔒 SSL certificates not found. Generating self-signed certificates..."
    echo "   For production, replace with proper SSL certificates from Let's Encrypt or your provider"
    
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/key.pem \
        -out nginx/ssl/cert.pem \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
    
    echo "✅ Self-signed SSL certificates generated"
fi

# Function to deploy with Docker Compose
deploy_docker_compose() {
    echo "🐳 Starting deployment with Docker Compose..."
    
    # Build and start services
    docker-compose up -d --build
    
    echo "⏳ Waiting for services to start..."
    sleep 10
    
    # Check if services are running
    if docker-compose ps | grep -q "Up"; then
        echo "✅ Services deployed successfully!"
        echo ""
        echo "🌐 Access your monitoring dashboard:"
        echo "   HTTP:  http://localhost"
        echo "   HTTPS: https://localhost"
        echo ""
        echo "📊 Additional services:"
        echo "   Prometheus: http://localhost:9090"
        echo "   Node Exporter: http://localhost:9100/metrics"
        echo ""
        echo "🔍 Check service status:"
        echo "   docker-compose ps"
        echo "   docker-compose logs -f monitoring-app"
    else
        echo "❌ Some services failed to start. Check logs:"
        echo "   docker-compose logs"
        exit 1
    fi
}

# Function to stop services
stop_services() {
    echo "🛑 Stopping services..."
    docker-compose down
    echo "✅ Services stopped"
}

# Function to update deployment
update_deployment() {
    echo "🔄 Updating deployment..."
    docker-compose down
    docker-compose pull
    docker-compose up -d --build
    echo "✅ Deployment updated"
}

# Function to view logs
view_logs() {
    echo "📋 Viewing application logs..."
    docker-compose logs -f monitoring-app
}

# Function to backup data
backup_data() {
    echo "💾 Creating data backup..."
    BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Backup database
    docker-compose exec postgres pg_dump -U postgres monitoring > "$BACKUP_DIR/database.sql"
    
    # Backup prometheus data
    docker-compose exec prometheus tar -czf - /prometheus > "$BACKUP_DIR/prometheus-data.tar.gz"
    
    echo "✅ Backup created in $BACKUP_DIR"
}

# Main menu
case "${1:-deploy}" in
    deploy)
        deploy_docker_compose
        ;;
    stop)
        stop_services
        ;;
    update)
        update_deployment
        ;;
    logs)
        view_logs
        ;;
    backup)
        backup_data
        ;;
    status)
        docker-compose ps
        ;;
    help)
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  deploy  - Deploy the monitoring application (default)"
        echo "  stop    - Stop all services"
        echo "  update  - Update and restart services"
        echo "  logs    - View application logs"
        echo "  backup  - Create data backup"
        echo "  status  - Show service status"
        echo "  help    - Show this help message"
        ;;
    *)
        echo "❌ Unknown command: $1"
        echo "Run '$0 help' for usage information"
        exit 1
        ;;
esac