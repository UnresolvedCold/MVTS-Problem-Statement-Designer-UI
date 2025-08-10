# MVTS Problem Statement Designer

A comprehensive tool for designing and solving Multi-Vehicle Task Scheduling (MVTS) problem statements with real-time visualization and optimization capabilities.

## 🏗️ Architecture

This project consists of two main components:

- **Backend Server**: Java-based WebSocket server with REST API endpoints
- **Frontend UI**: React-based web application with interactive grid editor

## 🚀 Features

### Problem Statement Design
- Interactive grid-based warehouse layout editor
- Entity management (Bots, MSUs, PPSs, Tasks, Assignments)
- Template system for quick problem setup
- Real-time problem statement validation
- JSON export/import capabilities

### Multi-Client Support
- Multiple clients can connect simultaneously
- Sequential processing queue (one request at a time)
- Real-time queue status updates for all clients
- Automatic client disconnect detection and task termination

### Solution Visualization
- Real-time solution display with animated bot movements
- Task assignments and scheduling visualization
- Performance metrics and optimization results
- Interactive solution viewer with step-by-step playback

### WebSocket Communication
- Real-time bidirectional communication
- Live log streaming during processing
- Queue position tracking
- Automatic reconnection handling

## 📋 Prerequisites

### Backend Requirements
- **Java 17** or higher
- **Maven 3.6+** for dependency management
- **GreyOrange MultiFleet Planner** library (internal dependency)

### Frontend Requirements
- **Node.js 16+**
- **npm 8+** or **yarn 1.22+**

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd MVTSProblemStatementDesigner
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd server
mvn clean install
```

#### Build the Project
```bash
mvn compile
```

#### Create Executable JAR
```bash
mvn package
```

### 3. Frontend Setup

#### Install Dependencies
```bash
cd ui/mvts-problem-statement-generator
npm install
```

#### Build for Production
```bash
npm run build
```

## 🚀 Deployment

### Development Environment

#### Start Backend Server
```bash
cd server
mvn exec:java -Dexec.mainClass="com.greyorange.mvts.designer.ProblemStatementStudio"
```

The server will start on `http://localhost:8080`

#### Start Frontend Development Server
```bash
cd ui/mvts-problem-statement-generator
npm start
```

The UI will be available at `http://localhost:3000`

### Production Deployment

#### Option 1: JAR Deployment

1. **Build the JAR**:
```bash
cd server
mvn clean package
```

2. **Run the JAR**:
```bash
java -jar target/MVTSProblemStatementDesigner-1.0-SNAPSHOT.jar
```

3. **Serve Static Files**:
   - Build the frontend: `cd ui/mvts-problem-statement-generator && npm run build`
   - Serve the `build` folder using a web server (nginx, Apache, etc.)
   - Configure proxy to forward API calls to the Java backend

#### Option 2: Docker Deployment

1. **Create Dockerfile for Backend**:
```dockerfile
FROM openjdk:17-jdk-slim
COPY target/MVTSProblemStatementDesigner-1.0-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

2. **Create Dockerfile for Frontend**:
```dockerfile
FROM node:16-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

3. **Docker Compose**:
```yaml
version: '3.8'
services:
  backend:
    build: ./server
    ports:
      - "8080:8080"
  
  frontend:
    build: ./ui/mvts-problem-statement-generator
    ports:
      - "80:80"
    depends_on:
      - backend
```

#### Option 3: Cloud Deployment (AWS/GCP/Azure)

1. **Container Registry**:
   - Build and push Docker images to your cloud provider's container registry

2. **Container Service**:
   - Deploy using services like ECS, Cloud Run, or Azure Container Instances

3. **Load Balancer**:
   - Configure load balancer to distribute traffic and handle SSL termination

## ⚙️ Configuration

### Backend Configuration

Configuration is managed through `ApplicationProperties` class:

- **Server Port**: Default `8080`
- **WebSocket Endpoint**: `/websocket`
- **REST API Endpoint**: `/api`

### Frontend Configuration

Update API endpoints in `src/hooks/useServerAPI.js`:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const WS_BASE_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8080';
```

### Environment Variables

Create `.env` files for different environments:

```bash
# .env.production
REACT_APP_API_URL=https://your-api-domain.com
REACT_APP_WS_URL=wss://your-api-domain.com
```

## 📡 API Endpoints

### WebSocket Events
- `PING` / `PONG`: Connection health check
- `SOLVE_PROBLEM_STATEMENT`: Submit problem for solving
- `QUEUE_STATUS`: Real-time queue updates
- `PROBLEM_STATEMENT_SOLVED`: Solution results

### REST API
- `GET /api/health`: Health check
- `POST /api/solve`: Submit problem statement
- `GET /api/status`: Get system status

## 🔧 Development

### Backend Development
```bash
cd server
mvn compile exec:java -Dexec.mainClass="com.greyorange.mvts.designer.ProblemStatementStudio"
```

### Frontend Development
```bash
cd ui/mvts-problem-statement-generator
npm start
```

### Running Tests
```bash
# Backend tests
cd server
mvn test

# Frontend tests
cd ui/mvts-problem-statement-generator
npm test
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**:
   - Change server port in configuration
   - Kill existing processes: `lsof -ti:8080 | xargs kill -9`

2. **WebSocket Connection Failed**:
   - Check firewall settings
   - Verify WebSocket endpoint configuration
   - Ensure backend server is running

3. **Build Failures**:
   - Verify Java version: `java -version`
   - Check Maven configuration: `mvn -version`
   - Clear npm cache: `npm cache clean --force`

4. **Memory Issues**:
   - Increase JVM heap size: `java -Xmx4g -jar app.jar`
   - Monitor system resources during processing

### Logs and Debugging

- **Backend Logs**: Check console output or configure logback for file logging
- **Frontend Logs**: Open browser developer tools console
- **WebSocket Traffic**: Use browser Network tab to monitor WebSocket messages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is proprietary software owned by GreyOrange. Unauthorized distribution is prohibited.

## 📞 Support

For technical support and questions:
- Internal Documentation: [Internal Wiki/Confluence Link]
- Team Contact: [Team Email/Slack Channel]
- Issue Tracking: [JIRA/Internal Issue Tracker]

---

**Last Updated**: August 2025
**Version**: 1.0-SNAPSHOT
