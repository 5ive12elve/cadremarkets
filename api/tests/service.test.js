import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import serviceRouter from '../routes/service.route.js';
import User from '../models/user.model.js';
import Service from '../models/service.model.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Create test app
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/services', serviceRouter);

describe('Service Request Endpoints', () => {
  let testUser;
  let testUserToken;
  let testAdmin;
  let testAdminToken;
  let testService;

  beforeEach(async () => {
    // Create test user
    const userData = global.testUtils.createTestUser();
    const hashedPassword = bcryptjs.hashSync(userData.password, 10);
    testUser = await User.create({
      ...userData,
      password: hashedPassword
    });

    // Create test admin
    const adminData = global.testUtils.createTestAdmin();
    const hashedAdminPassword = bcryptjs.hashSync(adminData.password, 10);
    testAdmin = await User.create({
      ...adminData,
      password: hashedAdminPassword
    });

    // Create test service request
    const serviceData = {
      requestId: 'SRV0001',
      requesterName: 'John Doe',
      phoneNumber: '+1234567890',
      email: 'john@example.com',
      serviceType: 'visual',
      subType: 'Logo Design',
      budget: '$1000-$2000',
      designStage: 'concept',
      projectScope: 'small',
      details: 'Need a logo for my business',
      status: 'pending'
    };
    testService = await Service.create(serviceData);

    // Generate tokens
    testUserToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET || 'test-jwt-secret-for-testing-only');
    testAdminToken = jwt.sign({ id: testAdmin._id, isAdmin: true }, process.env.JWT_SECRET || 'test-jwt-secret-for-testing-only');
  });

  describe('GET /api/services', () => {
    test('should get all service requests with authentication', async () => {
      const response = await request(app)
        .get('/api/services')
        .set('Cookie', [`access_token=${testUserToken}`])
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Check that service request has correct structure
      const service = response.body[0];
      expect(service.requestId).toBeDefined();
      expect(service.requesterName).toBeDefined();
      expect(service.serviceType).toBeDefined();
    });

    test('should filter services by serviceType', async () => {
      // Create another service with different serviceType
      await Service.create({
        requestId: 'SRV0002',
        requesterName: 'Jane Doe',
        phoneNumber: '+1987654321',
        email: 'jane@example.com',
        serviceType: 'ad',
        subType: 'Social Media Ad',
        budget: '$500-$1000',
        designStage: 'concept',
        projectScope: 'medium',
        details: 'Need ads for social media campaign'
      });

      const response = await request(app)
        .get('/api/services?serviceType=visual')
        .set('Cookie', [`access_token=${testUserToken}`])
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(service => {
        expect(service.serviceType).toBe('visual');
      });
    });

    test('should filter services by status', async () => {
      const response = await request(app)
        .get('/api/services?status=pending')
        .set('Cookie', [`access_token=${testUserToken}`])
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(service => {
        expect(service.status).toBe('pending');
      });
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get('/api/services')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Unauthorized');
    });
  });

  describe('GET /api/services/:id', () => {
    test('should get service request by ID', async () => {
      const response = await request(app)
        .get(`/api/services/${testService._id}`)
        .set('Cookie', [`access_token=${testUserToken}`])
        .expect(200);

      expect(response.body._id).toBe(testService._id.toString());
      expect(response.body.requestId).toBe(testService.requestId);
      expect(response.body.requesterName).toBe(testService.requesterName);
      expect(response.body.serviceType).toBe(testService.serviceType);
    });

    test('should return error for non-existent service', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/services/${fakeId}`)
        .set('Cookie', [`access_token=${testUserToken}`])
        .expect(404);

      expect(response.body.message).toContain('not found');
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get(`/api/services/${testService._id}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Unauthorized');
    });
  });

  describe('POST /api/services', () => {
    test('should create service request with valid data', async () => {
      const serviceData = {
        requesterName: 'Jane Smith',
        phoneNumber: '+1555123456',
        email: 'jane.smith@example.com',
        serviceType: 'ad',
        subType: 'Banner Design',
        budget: '$2000-$3000',
        designStage: 'refinement',
        projectScope: 'large',
        details: 'Need professional banner designs for marketing campaign'
      };

      const response = await request(app)
        .post('/api/services')
        .send(serviceData)
        .expect(201);

      expect(response.body.requestId).toBeDefined();
      expect(response.body.requesterName).toBe(serviceData.requesterName);
      expect(response.body.serviceType).toBe(serviceData.serviceType);
      expect(response.body.status).toBe('pending'); // Default status

      // Verify service was created in database
      const createdService = await Service.findById(response.body._id);
      expect(createdService).toBeTruthy();
      expect(createdService.requesterName).toBe(serviceData.requesterName);
    });

    test('should return validation error for missing required fields', async () => {
      const serviceData = {
        requesterName: 'Test User'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/services')
        .send(serviceData)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toBeDefined();
    });

    test('should validate email format', async () => {
      const serviceData = {
        requesterName: 'Test User',
        phoneNumber: '+1234567890',
        email: 'invalid-email', // Invalid email
        serviceType: 'visual',
        subType: 'Logo',
        budget: '$1000',
        designStage: 'concept',
        projectScope: 'small'
      };

      const response = await request(app)
        .post('/api/services')
        .send(serviceData)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
    });

    test('should validate serviceType enum', async () => {
      const serviceData = {
        requesterName: 'Test User',
        phoneNumber: '+1234567890',
        email: 'test@example.com',
        serviceType: 'invalid-type', // Invalid serviceType
        subType: 'Test',
        budget: '$1000',
        designStage: 'concept',
        projectScope: 'small'
      };

      const response = await request(app)
        .post('/api/services')
        .send(serviceData)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('PUT /api/services/:id/status', () => {
    test('should update service status with authentication', async () => {
      const response = await request(app)
        .put(`/api/services/${testService._id}/status`)
        .set('Cookie', [`access_token=${testUserToken}`])
        .send({ 
          status: 'approved',
          notes: 'Approved for processing'
        })
        .expect(200);

      expect(response.body.status).toBe('approved');
      expect(response.body.notes).toBe('Approved for processing');
    });

    test('should validate status enum', async () => {
      const response = await request(app)
        .put(`/api/services/${testService._id}/status`)
        .set('Cookie', [`access_token=${testUserToken}`])
        .send({ status: 'invalid-status' })
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
    });

    test('should return error for non-existent service', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`/api/services/${fakeId}/status`)
        .set('Cookie', [`access_token=${testUserToken}`])
        .send({ status: 'approved' })
        .expect(404);

      expect(response.body.message).toContain('not found');
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .put(`/api/services/${testService._id}/status`)
        .send({ status: 'approved' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Unauthorized');
    });
  });

  describe('DELETE /api/services/:id', () => {
    test('should delete service with authentication', async () => {
      const response = await request(app)
        .delete(`/api/services/${testService._id}`)
        .set('Cookie', [`access_token=${testUserToken}`])
        .expect(200);

      expect(response.body.message).toBe('Service deleted successfully');

      // Verify service was deleted from database
      const deletedService = await Service.findById(testService._id);
      expect(deletedService).toBeNull();
    });

    test('should return error for non-existent service', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/services/${fakeId}`)
        .set('Cookie', [`access_token=${testUserToken}`])
        .expect(404);

      expect(response.body.message).toContain('not found');
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .delete(`/api/services/${testService._id}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Unauthorized');
    });
  });

  describe('Edge Cases and Validation', () => {
    test('should handle very long details text', async () => {
      const serviceData = {
        requesterName: 'Test User',
        phoneNumber: '+1234567890',
        email: 'test@example.com',
        serviceType: 'visual',
        subType: 'Logo',
        budget: '$1000',
        designStage: 'concept',
        projectScope: 'small',
        details: 'A'.repeat(1500) // Too long
      };

      const response = await request(app)
        .post('/api/services')
        .send(serviceData)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
    });

    test('should sanitize input data', async () => {
      const serviceData = {
        requesterName: '<script>alert("xss")</script>Test User',
        phoneNumber: '+1234567890',
        email: 'test@example.com',
        serviceType: 'visual',
        subType: 'Logo<script>',
        budget: '$1000',
        designStage: 'concept',
        projectScope: 'small',
        details: 'Clean details'
      };

      const response = await request(app)
        .post('/api/services')
        .send(serviceData)
        .expect(201);

      // Should not contain script tags after sanitization
      expect(response.body.requesterName).not.toContain('<script>');
      expect(response.body.subType).not.toContain('<script>');
    });

    test('should validate phone number format', async () => {
      const serviceData = {
        requesterName: 'Test User',
        phoneNumber: 'invalid-phone', // Invalid phone
        email: 'test@example.com',
        serviceType: 'visual',
        subType: 'Logo',
        budget: '$1000',
        designStage: 'concept',
        projectScope: 'small'
      };

      const response = await request(app)
        .post('/api/services')
        .send(serviceData)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
    });
  });
}); 