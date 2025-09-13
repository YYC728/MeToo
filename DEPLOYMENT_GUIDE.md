# 🚀 Deployment Guide - University Meal Exchange & #MeToo Story Sharing App

## 📋 Prerequisites

- Docker and Docker Compose installed
- Git installed
- MongoDB Atlas account (for production) or local MongoDB
- Cloud provider account (AWS, Google Cloud, Azure, etc.)

## 🐳 Local Development with Docker

### 1. Clone and Setup
```bash
git clone <your-repo-url>
cd MeToo
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://admin:password123@localhost:27017/metoo-app?authSource=admin
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001
```

### 3. Start Services
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 4. Access the Application
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **MongoDB**: localhost:27017

## ☁️ Production Deployment

### Option 1: Docker Compose on VPS

#### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 2. Deploy Application
```bash
# Clone repository
git clone <your-repo-url>
cd MeToo

# Create production environment file
cp .env.example .env.production
# Edit .env.production with production values

# Start services
docker-compose -f docker-compose.prod.yml up -d
```

### Option 2: AWS Deployment

#### 1. AWS ECS with Fargate

Create `aws-task-definition.json`:
```json
{
  "family": "metoo-app",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::YOUR_ACCOUNT:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/metoo-backend:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "MONGO_URI",
          "value": "mongodb+srv://username:password@cluster.mongodb.net/metoo-app"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/metoo-app",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### 2. Deploy to ECS
```bash
# Build and push Docker images
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com

docker build -t metoo-backend .
docker tag metoo-backend:latest YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/metoo-backend:latest
docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/metoo-backend:latest

# Create ECS service
aws ecs create-service --cluster metoo-cluster --service-name metoo-service --task-definition metoo-app --desired-count 1
```

### Option 3: Google Cloud Platform

#### 1. Google Cloud Run
```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/metoo-backend

# Deploy to Cloud Run
gcloud run deploy metoo-backend --image gcr.io/PROJECT_ID/metoo-backend --platform managed --region us-central1 --allow-unauthenticated
```

### Option 4: Heroku Deployment

#### 1. Backend Deployment
```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create Heroku app
heroku create metoo-backend

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/metoo-app
heroku config:set JWT_SECRET=your-super-secret-jwt-key

# Deploy
git push heroku main
```

#### 2. Frontend Deployment (Netlify)
```bash
# Build frontend
cd frontend
npm run build

# Deploy to Netlify
# Upload build folder to Netlify or connect GitHub repository
```

## 🔧 Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=3000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/metoo-app
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
BASE_URL=https://your-api-domain.com
FRONTEND_URL=https://your-frontend-domain.com
```

### Frontend (.env)
```env
REACT_APP_API_URL=https://your-api-domain.com/api
REACT_APP_SOCKET_URL=https://your-api-domain.com
```

## 🗄️ Database Setup

### MongoDB Atlas (Recommended for Production)
1. Create MongoDB Atlas account
2. Create a new cluster
3. Create database user
4. Whitelist your server IP
5. Get connection string
6. Update MONGO_URI in environment variables

### Local MongoDB
```bash
# Install MongoDB
# Ubuntu/Debian
sudo apt install mongodb

# macOS
brew install mongodb

# Start MongoDB
sudo systemctl start mongodb
```

## 🔒 Security Considerations

### 1. Environment Variables
- Never commit `.env` files
- Use strong, unique JWT secrets
- Rotate secrets regularly

### 2. Database Security
- Use MongoDB Atlas with IP whitelisting
- Enable authentication
- Use SSL/TLS connections

### 3. API Security
- Enable CORS for specific domains only
- Implement rate limiting
- Use HTTPS in production
- Validate all inputs

### 4. File Upload Security
- Validate file types and sizes
- Scan uploaded files for malware
- Store files outside web root
- Use CDN for file delivery

## 📊 Monitoring and Logging

### 1. Application Monitoring
```bash
# Install PM2 for process management
npm install -g pm2

# Start application with PM2
pm2 start dist/server.js --name "metoo-backend"

# Monitor
pm2 monit
pm2 logs
```

### 2. Log Management
- Use structured logging (Winston, Pino)
- Send logs to external service (Loggly, Papertrail)
- Set up log rotation

### 3. Health Checks
- Implement health check endpoints
- Set up uptime monitoring
- Configure alerts for failures

## 🚀 CI/CD Pipeline

### GitHub Actions Example
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build and push Docker image
        run: |
          docker build -t metoo-backend .
          docker tag metoo-backend:latest ${{ secrets.ECR_REGISTRY }}/metoo-backend:latest
          docker push ${{ secrets.ECR_REGISTRY }}/metoo-backend:latest
      
      - name: Deploy to ECS
        run: |
          aws ecs update-service --cluster metoo-cluster --service metoo-service --force-new-deployment
```

## 📈 Scaling Considerations

### 1. Horizontal Scaling
- Use load balancers
- Implement session management
- Use Redis for session storage

### 2. Database Scaling
- Use MongoDB replica sets
- Implement read replicas
- Consider sharding for large datasets

### 3. File Storage
- Use cloud storage (AWS S3, Google Cloud Storage)
- Implement CDN for file delivery
- Set up automatic backups

## 🔍 Troubleshooting

### Common Issues
1. **Database Connection**: Check MONGO_URI and network access
2. **CORS Errors**: Verify FRONTEND_URL configuration
3. **File Upload Issues**: Check file size limits and permissions
4. **Socket.IO Connection**: Verify authentication and CORS settings

### Debug Commands
```bash
# Check container logs
docker-compose logs backend
docker-compose logs frontend

# Check container status
docker-compose ps

# Access container shell
docker-compose exec backend sh
```

## 📞 Support

For deployment issues:
1. Check logs first
2. Verify environment variables
3. Test database connectivity
4. Check network configuration
5. Review security settings

---

**🎉 Your University Meal Exchange & #MeToo Story Sharing App is now ready for production deployment!**
