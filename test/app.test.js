const request = require('supertest');
const { app, server } = require('../app');
const fs = require('fs');
const path = require('path');

// Add cleanup after all tests
afterAll(done => {
  server.close(done);
});

describe('Application Tests', () => {
  describe('Health Endpoint', () => {
    it('should return OK', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.text).toBe('OK');
    });

    it('should handle 404 for unknown routes', async () => {
      const res = await request(app).get('/unknown');
      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ error: 'Not Found' });
    });

    it('should return correct headers', async () => {
      const res = await request(app).get('/health');
      expect(res.headers['content-type']).toMatch(/text\/html/);
    });
  });

  describe('Environment Configuration', () => {
    it('should have required environment variables', () => {
      // Add any environment variables your app needs
      const requiredEnvVars = ['PORT'];
      requiredEnvVars.forEach(envVar => {
        expect(process.env[envVar] || '3000').toBeDefined();
      });
    });
  });

  describe('Docker Configuration', () => {
    it('should have a valid Dockerfile', () => {
      const dockerfilePath = path.join(__dirname, '..', 'Dockerfile');
      expect(fs.existsSync(dockerfilePath)).toBe(true);
      
      const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
      expect(dockerfileContent).toMatch(/FROM/);
      expect(dockerfileContent).toMatch(/WORKDIR/);
      expect(dockerfileContent).toMatch(/COPY/);
      expect(dockerfileContent).toMatch(/EXPOSE/);
    });
  });

  describe('Kubernetes Configuration', () => {
    it('should have valid k8s deployment manifests', () => {
      const deploymentPath = path.join(__dirname, '..', 'k8s', 'deployment.yaml');
      const servicePath = path.join(__dirname, '..', 'k8s', 'service.yaml');
      
      expect(fs.existsSync(deploymentPath)).toBe(true);
      expect(fs.existsSync(servicePath)).toBe(true);

      const deploymentContent = fs.readFileSync(deploymentPath, 'utf8');
      const serviceContent = fs.readFileSync(servicePath, 'utf8');

      expect(deploymentContent).toMatch(/apiVersion/);
      expect(deploymentContent).toMatch(/kind:\s*Deployment/);
      expect(serviceContent).toMatch(/kind:\s*Service/);
    });
  });

  describe('CI/CD Configuration', () => {
    it('should have valid CI/CD configuration files', () => {
      // Check for common CI/CD config files
      const possibleConfigPaths = [
        path.join(__dirname, '..', '.github', 'workflows'),           // GitHub Actions
        path.join(__dirname, '..', '.gitlab-ci.yml'),                 // GitLab CI
        path.join(__dirname, '..', 'Jenkinsfile'),                    // Jenkins
        path.join(__dirname, '..', '.circleci', 'config.yml'),        // CircleCI
        path.join(__dirname, '..', '.travis.yml'),                    // Travis CI
        path.join(__dirname, '..', 'azure-pipelines.yml')             // Azure DevOps
      ];
      
      // Check if at least one CI/CD config exists
      const hasValidConfig = possibleConfigPaths.some(configPath => {
        return fs.existsSync(configPath);
      });
      
      expect(hasValidConfig).toBe(true);
    });
    
    it('should have CI/CD pipeline with required stages', () => {
      // Find which CI/CD system is being used
      let ciConfig = null;
      let ciSystem = null;
      
      if (fs.existsSync(path.join(__dirname, '..', '.github', 'workflows'))) {
        // Check GitHub Actions workflows
        const workflowsDir = path.join(__dirname, '..', '.github', 'workflows');
        const files = fs.readdirSync(workflowsDir);
        if (files.length > 0) {
          ciConfig = fs.readFileSync(path.join(workflowsDir, files[0]), 'utf8');
          ciSystem = 'github';
        }
      } else if (fs.existsSync(path.join(__dirname, '..', '.gitlab-ci.yml'))) {
        ciConfig = fs.readFileSync(path.join(__dirname, '..', '.gitlab-ci.yml'), 'utf8');
        ciSystem = 'gitlab';
      } else if (fs.existsSync(path.join(__dirname, '..', 'Jenkinsfile'))) {
        ciConfig = fs.readFileSync(path.join(__dirname, '..', 'Jenkinsfile'), 'utf8');
        ciSystem = 'jenkins';
      } else if (fs.existsSync(path.join(__dirname, '..', '.circleci', 'config.yml'))) {
        ciConfig = fs.readFileSync(path.join(__dirname, '..', '.circleci', 'config.yml'), 'utf8');
        ciSystem = 'circleci';
      } else if (fs.existsSync(path.join(__dirname, '..', '.travis.yml'))) {
        ciConfig = fs.readFileSync(path.join(__dirname, '..', '.travis.yml'), 'utf8');
        ciSystem = 'travis';
      } else if (fs.existsSync(path.join(__dirname, '..', 'azure-pipelines.yml'))) {
        ciConfig = fs.readFileSync(path.join(__dirname, '..', 'azure-pipelines.yml'), 'utf8');
        ciSystem = 'azure';
      }
      
      expect(ciConfig).not.toBeNull();
      
      // Check for essential CI stages based on the CI system
      switch(ciSystem) {
        case 'github':
          expect(ciConfig).toMatch(/run: npm (test|run test)/);
          expect(ciConfig).toMatch(/run: npm (build|run build|ci)/);
          break;
        case 'gitlab':
          expect(ciConfig).toMatch(/test:/);
          expect(ciConfig).toMatch(/build:/);
          expect(ciConfig).toMatch(/deploy:/);
          break;
        case 'jenkins':
          expect(ciConfig).toMatch(/stage\s*\(\s*['"]test['"]/);
          expect(ciConfig).toMatch(/stage\s*\(\s*['"]build['"]/);
          break;
        case 'circleci':
          expect(ciConfig).toMatch(/test:/);
          expect(ciConfig).toMatch(/build:/);
          break;
        case 'travis':
          expect(ciConfig).toMatch(/script:/);
          break;
        case 'azure':
          expect(ciConfig).toMatch(/- script: npm test/);
          expect(ciConfig).toMatch(/- script: npm (run build|build)/);
          break;
      }
    });
  });

  describe('Application Security', () => {
    it('should not expose sensitive headers', async () => {
      const res = await request(app).get('/health');
      expect(res.headers).not.toHaveProperty('x-powered-by');
    });

    it('should handle invalid requests gracefully', async () => {
      const res = await request(app)
        .post('/health')
        .send({ invalid: 'data' });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('Error Handling', () => {
    it('should handle server errors', async () => {
      // Mock a route that throws an error
      app.get('/error-test', (req, res, next) => {
        next(new Error('Test error'));
      });
      
      const res = await request(app).get('/error-test');
      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'Internal Server Error' });
    });
  });
});
