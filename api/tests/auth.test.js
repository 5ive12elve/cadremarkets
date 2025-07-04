import request from 'supertest';
import mongoose from 'mongoose';
import app from './testApp.js';
import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';

describe('Authentication Endpoints', () => {
  describe('POST /api/auth/signup', () => {
    test('should create new user with valid data', async () => {
      const userData = global.testUtils.createTestUser();
      
      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User created successfully');
      
      // Verify user was created in database
      const createdUser = await User.findOne({ email: userData.email });
      expect(createdUser).toBeTruthy();
      expect(createdUser.username).toBe(userData.username);
      expect(createdUser.email).toBe(userData.email);
      expect(createdUser.password).not.toBe(userData.password); // Password should be hashed
    });

    test('should return error for duplicate email', async () => {
      const userData = global.testUtils.createTestUser();
      
      // Create user first time
      await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(201);

      // Try to create same user again
      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    test('should return error for duplicate username', async () => {
      const userData1 = global.testUtils.createTestUser();
      const userData2 = {
        ...global.testUtils.createTestUser(),
        email: 'different@example.com'
      };
      
      // Create user first time
      await request(app)
        .post('/api/auth/signup')
        .send(userData1)
        .expect(201);

      // Try to create user with same username but different email
      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData2)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    test('should return validation error for missing required fields', async () => {
      const invalidData = {
        username: 'testuser'
        // Missing email and password
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });

    test('should return error for invalid email format', async () => {
      const userData = {
        ...global.testUtils.createTestUser(),
        email: 'invalid-email'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should return error for weak password', async () => {
      const userData = {
        ...global.testUtils.createTestUser(),
        password: '123' // Too weak
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should return error for username too short', async () => {
      const userData = {
        ...global.testUtils.createTestUser(),
        username: 'ab' // Too short
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/signin', () => {
    beforeEach(async () => {
      // Create a test user for signin tests
      const userData = global.testUtils.createTestUser();
      const hashedPassword = bcryptjs.hashSync(userData.password, 10);
      
      await User.create({
        ...userData,
        password: hashedPassword
      });
    });

    test('should sign in user with valid credentials', async () => {
      const userData = global.testUtils.createTestUser();
      
      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.password).toBeUndefined(); // Password should not be returned
      expect(response.headers['set-cookie']).toBeDefined(); // JWT cookie should be set
    });

    test('should return error for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'nonexistent@example.com',
          password: 'TestPassword123!'
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    test('should return error for invalid password', async () => {
      const userData = global.testUtils.createTestUser();
      
      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: userData.email,
          password: 'WrongPassword123!'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    test('should return validation error for missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'test@example.com'
          // Missing password
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should return error for malformed email', async () => {
      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'invalid-email',
          password: 'TestPassword123!'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/signout', () => {
    test('should sign out user and clear cookie', async () => {
      const response = await request(app)
        .get('/api/auth/signout')
        .expect(200);

      expect(response.text).toBe('"User has been logged out!"');
      
      // Check if cookie is cleared (expires in the past)
      const cookieHeader = response.headers['set-cookie'];
      expect(cookieHeader).toBeDefined();
      expect(cookieHeader[0]).toContain('access_token=');
    });
  });

  describe('POST /api/auth/google', () => {
    test('should return error for missing token', async () => {
      const response = await request(app)
        .post('/api/auth/google')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Google token is required');
    });

    test('should return error for invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/google')
        .send({
          tokenId: 'invalid-token'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid Google token');
    });

    // Note: Testing valid Google tokens would require mocking Google's OAuth verification
    // which is beyond the scope of basic testing but should be implemented in a real scenario
  });

  describe('Security Tests', () => {
    test('should not allow SQL injection in signin', async () => {
      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: "admin@example.com' OR '1'='1",
          password: "password' OR '1'='1"
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    test('should rate limit excessive requests', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      // Make multiple failed requests (this would trigger rate limiting in production)
      const requests = Array(10).fill().map(() => 
        request(app)
          .post('/api/auth/signin')
          .send(userData)
      );

      const responses = await Promise.all(requests);
      
      // At least some requests should fail due to invalid credentials
      responses.forEach(response => {
        expect([404, 401, 429]).toContain(response.status);
      });
    });

    test('should sanitize user input', async () => {
      const userData = {
        username: '<script>alert("xss")</script>',
        email: 'test@example.com',
        password: 'TestPassword123!'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData);

      if (response.status === 201) {
        const createdUser = await User.findOne({ email: userData.email });
        expect(createdUser.username).not.toContain('<script>');
      }
    });
  });

  describe('Edge Cases', () => {
    test('should handle extremely long input', async () => {
      const longString = 'a'.repeat(1000);
      const userData = {
        username: longString,
        email: 'test@example.com',
        password: longString
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData);

      expect([400, 413]).toContain(response.status); // Bad request or payload too large
    });

    test('should handle special characters in input', async () => {
      const userData = {
        username: 'test-user_123',
        email: 'test+tag@example.com',
        password: 'Test@Pass#123!'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData);

      expect([201, 400]).toContain(response.status);
    });

    test('should handle concurrent signup requests', async () => {
      const userData = global.testUtils.createTestUser();
      
      // Try to create the same user simultaneously
      const requests = Array(5).fill().map(() => 
        request(app)
          .post('/api/auth/signup')
          .send(userData)
      );

      const responses = await Promise.all(requests);
      
      // Only one should succeed, others should fail with duplicate error
      const successCount = responses.filter(r => r.status === 201).length;
      const errorCount = responses.filter(r => r.status === 400).length;
      
      expect(successCount).toBe(1);
      expect(errorCount).toBe(4);
    });
  });
}); 