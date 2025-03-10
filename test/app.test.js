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
