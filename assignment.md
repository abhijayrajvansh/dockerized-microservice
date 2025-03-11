### **Assignment: CI/CD Pipeline for a Dockerized Microservice**  

#### **Objective:**  
The candidate needs to set up a CI/CD pipeline that dockerizes a simple Node.js application and deploys it to a Kubernetes cluster.  

#### **Assignment Details:**  

#### **1. Create a Simple Microservice**  
- Develop a Node.js Express app with a `/health` endpoint that returns `"OK"`.  
- Write a **Dockerfile** to containerize the application.  
- Create **Kubernetes manifests** (`deployment.yaml`, `service.yaml`) to deploy the service.  

#### **2. Set Up the CI/CD Pipeline**  
Use **GitHub Actions** or any other CI/CD tool to implement a pipeline that:  
- Lints the code and runs tests (using Jest, Mocha, etc.).  
- Builds a **Docker image** and pushes it to **Docker Hub** or **GitHub Container Registry**.  
- Deploys the service to a **Kubernetes cluster** (K3s, Minikube, or an eksctl-based cluster).  

#### **3. Submission in a GitHub Repository**  
- The candidate must include a **README.md** explaining the steps to run and test the project.  
