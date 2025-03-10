# Health Service CI/CD Demo

This project demonstrates a complete CI/CD pipeline for a simple Node.js microservice.

## Local Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Start service
npm start
```

## Docker Build

```bash
docker build -t health-service .
docker run -p 3000:3000 health-service
```

## Kubernetes Deployment

```bash
# Apply manifests
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# Verify deployment
kubectl get pods
kubectl get services
```

## CI/CD Pipeline

The GitHub Actions pipeline automatically:
1. Runs linting and tests
2. Builds Docker image
3. Pushes to GitHub Container Registry
4. Deploys to Kubernetes cluster

Requirements:
- GitHub repository secrets for container registry access
- Kubernetes cluster configuration
