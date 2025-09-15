# Deployment Guide

## Prerequisites

- Docker and Docker Compose
- Go 1.19+ (for local development)
- Node.js 16+ (for local development)
- PostgreSQL 13+ (for local development)

## Quick Start with Docker

1. Clone the repository
2. Copy environment file:
   ```bash
   cp backend/.env.example backend/.env
   ```
3. Start all services:
   ```bash
   docker-compose up -d
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- PostgreSQL: localhost:5432

## Manual Setup

### Backend Setup

1. Install dependencies:
   ```bash
   cd backend
   go mod download
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. Start PostgreSQL and create database:
   ```sql
   CREATE DATABASE jobsearch;
   ```

4. Run the application:
   ```bash
   go run cmd/main.go
   ```

### Frontend Setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

## Production Deployment

### Environment Variables

Set the following environment variables in production:

```bash
DB_HOST=your-db-host
DB_PORT=5432
DB_USER=your-db-user
DB_PASSWORD=your-secure-password
DB_NAME=jobsearch
JWT_SECRET=your-very-secure-jwt-secret
PORT=8080
```

### Security Considerations

1. Use strong JWT secrets
2. Enable HTTPS
3. Set up proper CORS policies
4. Use environment-specific database credentials
5. Enable database SSL connections
6. Set up proper logging and monitoring

### Scaling

- Use a load balancer for multiple backend instances
- Set up database connection pooling
- Use Redis for session storage if needed
- Consider using a CDN for static assets




