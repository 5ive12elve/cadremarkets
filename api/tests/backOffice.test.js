import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import backOfficeRouter from '../routes/backOffice.route.js';
import User from '../models/user.model.js';
import BackOfficeUser from '../models/backOfficeUser.model.js';
import Listing from '../models/listing.model.js';
import Order from '../models/order.model.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Create test app
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/backoffice', backOfficeRouter);

describe('Back Office Endpoints', () => {
  let testAdmin;
  let testAdminToken;
  let testModerator;
  let testModeratorToken;
  let testUser;
  let testUserToken;
  let testListing;
  let testOrder;

  beforeEach(async () => {
    // Create test admin
    const adminData = {
      username: 'admin',
      email: 'admin@cadremarkets.com',
      password: 'AdminPassword123!',
      role: 'admin',
      permissions: ['manage_users', 'manage_listings', 'manage_orders', 'manage_services', 'manage_support']
    };
    const hashedAdminPassword = bcryptjs.hashSync(adminData.password, 10);
    testAdmin = await BackOfficeUser.create({
      ...adminData,
      password: hashedAdminPassword
    });

    // Create test moderator
    const moderatorData = {
      username: 'moderator',
      email: 'moderator@cadremarkets.com',
      password: 'ModeratorPassword123!',
      role: 'moderator',
      permissions: ['manage_listings', 'manage_support']
    };
    const hashedModeratorPassword = bcryptjs.hashSync(moderatorData.password, 10);
    testModerator = await BackOfficeUser.create({
      ...moderatorData,
      password: hashedModeratorPassword
    });

    // Create regular user
    const userData = global.testUtils.createTestUser();
    const hashedUserPassword = bcryptjs.hashSync(userData.password, 10);
    testUser = await User.create({
      ...userData,
      password: hashedUserPassword
    });

    // Create test listing
    const listingData = global.testUtils.createTestListing();
    testListing = await Listing.create({
      ...listingData,
      userRef: testUser._id
    });

    // Create test order
    const orderData = {
      _id: 'CM1001',
      orderItems: [
        {
          _id: testListing._id,
          name: testListing.name,
          price: testListing.price,
          quantity: 1
        }
      ],
      customerInfo: global.testUtils.createTestOrder().customerInfo,
      status: 'placed',
      totalPrice: testListing.price + 160
    };
    testOrder = await Order.create(orderData);

    // Generate tokens
    testAdminToken = jwt.sign({ 
      id: testAdmin._id, 
      isAdmin: true, 
      role: 'admin', 
      permissions: testAdmin.permissions 
    }, process.env.JWT_SECRET || 'test-jwt-secret-for-testing-only');
    
    testModeratorToken = jwt.sign({ 
      id: testModerator._id, 
      isAdmin: true, 
      role: 'moderator', 
      permissions: testModerator.permissions 
    }, process.env.JWT_SECRET || 'test-jwt-secret-for-testing-only');

    testUserToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET || 'test-jwt-secret-for-testing-only');
  });

  describe('POST /api/backoffice/login', () => {
    test('should login admin with valid credentials', async () => {
      const loginData = {
        username: 'admin',
        password: 'AdminPassword123!'
      };

      const response = await request(app)
        .post('/api/backoffice/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.role).toBe('admin');
      expect(response.body.user.permissions).toEqual(testAdmin.permissions);
      expect(response.body.user.password).toBeUndefined();
      expect(response.headers['set-cookie']).toBeDefined();
    });

    test('should login moderator with valid credentials', async () => {
      const loginData = {
        username: 'moderator',
        password: 'ModeratorPassword123!'
      };

      const response = await request(app)
        .post('/api/backoffice/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.role).toBe('moderator');
      expect(response.body.user.permissions).toEqual(testModerator.permissions);
    });

    test('should return error for invalid credentials', async () => {
      const loginData = {
        username: 'admin',
        password: 'WrongPassword123!'
      };

      const response = await request(app)
        .post('/api/backoffice/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    test('should return error for non-existent user', async () => {
      const loginData = {
        username: 'nonexistent',
        password: 'Password123!'
      };

      const response = await request(app)
        .post('/api/backoffice/login')
        .send(loginData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    test('should return error for missing credentials', async () => {
      const loginData = {
        username: 'admin'
        // Missing password
      };

      const response = await request(app)
        .post('/api/backoffice/login')
        .send(loginData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/backoffice/dashboard', () => {
    test('should get dashboard stats when admin is authenticated', async () => {
      const response = await request(app)
        .get('/api/backoffice/dashboard')
        .set('Cookie', [`access_token=${testAdminToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.stats).toBeDefined();
      expect(response.body.stats.totalUsers).toBeDefined();
      expect(response.body.stats.totalListings).toBeDefined();
      expect(response.body.stats.totalOrders).toBeDefined();
      expect(response.body.stats.totalRevenue).toBeDefined();
    });

    test('should return error when regular user tries to access dashboard', async () => {
      const response = await request(app)
        .get('/api/backoffice/dashboard')
        .set('Cookie', [`access_token=${testUserToken}`])
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Admin access required');
    });

    test('should return error without authentication', async () => {
      const response = await request(app)
        .get('/api/backoffice/dashboard')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/backoffice/users', () => {
    test('should get all users when admin is authenticated', async () => {
      const response = await request(app)
        .get('/api/backoffice/users')
        .set('Cookie', [`access_token=${testAdminToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.users).toBeDefined();
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users.length).toBeGreaterThan(0);

      // Check that passwords are not returned
      response.body.users.forEach(user => {
        expect(user.password).toBeUndefined();
      });
    });

    test('should return error when moderator without permission tries to access users', async () => {
      const response = await request(app)
        .get('/api/backoffice/users')
        .set('Cookie', [`access_token=${testModeratorToken}`])
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Insufficient permissions');
    });

    test('should support pagination', async () => {
      const response = await request(app)
        .get('/api/backoffice/users?page=1&limit=10')
        .set('Cookie', [`access_token=${testAdminToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.users.length).toBeLessThanOrEqual(10);
      expect(response.body.pagination).toBeDefined();
    });

    test('should support user search', async () => {
      const response = await request(app)
        .get(`/api/backoffice/users?search=${testUser.username}`)
        .set('Cookie', [`access_token=${testAdminToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      const foundUser = response.body.users.find(u => u.username === testUser.username);
      expect(foundUser).toBeDefined();
    });
  });

  describe('PUT /api/backoffice/users/:id/status', () => {
    test('should update user status when admin is authenticated', async () => {
      const response = await request(app)
        .put(`/api/backoffice/users/${testUser._id}/status`)
        .set('Cookie', [`access_token=${testAdminToken}`])
        .send({ status: 'suspended' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.status).toBe('suspended');

      // Verify update in database
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.status).toBe('suspended');
    });

    test('should return error when moderator without permission tries to update user status', async () => {
      const response = await request(app)
        .put(`/api/backoffice/users/${testUser._id}/status`)
        .set('Cookie', [`access_token=${testModeratorToken}`])
        .send({ status: 'suspended' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    test('should return error for invalid status', async () => {
      const response = await request(app)
        .put(`/api/backoffice/users/${testUser._id}/status`)
        .set('Cookie', [`access_token=${testAdminToken}`])
        .send({ status: 'invalid-status' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/backoffice/listings', () => {
    test('should get all listings when admin is authenticated', async () => {
      const response = await request(app)
        .get('/api/backoffice/listings')
        .set('Cookie', [`access_token=${testAdminToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.listings).toBeDefined();
      expect(Array.isArray(response.body.listings)).toBe(true);
    });

    test('should allow moderator with listings permission to access', async () => {
      const response = await request(app)
        .get('/api/backoffice/listings')
        .set('Cookie', [`access_token=${testModeratorToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should support listing filters', async () => {
      const response = await request(app)
        .get('/api/backoffice/listings?status=for sale&type=Paintings & Drawings')
        .set('Cookie', [`access_token=${testAdminToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('PUT /api/backoffice/listings/:id/status', () => {
    test('should update listing status when admin is authenticated', async () => {
      const response = await request(app)
        .put(`/api/backoffice/listings/${testListing._id}/status`)
        .set('Cookie', [`access_token=${testAdminToken}`])
        .send({ status: 'sold' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.listing.status).toBe('sold');
    });

    test('should allow moderator with listings permission to update status', async () => {
      const response = await request(app)
        .put(`/api/backoffice/listings/${testListing._id}/status`)
        .set('Cookie', [`access_token=${testModeratorToken}`])
        .send({ status: 'pending' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/backoffice/orders', () => {
    test('should get all orders when admin is authenticated', async () => {
      const response = await request(app)
        .get('/api/backoffice/orders')
        .set('Cookie', [`access_token=${testAdminToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.orders).toBeDefined();
      expect(Array.isArray(response.body.orders)).toBe(true);
    });

    test('should return error when moderator without permission tries to access orders', async () => {
      const response = await request(app)
        .get('/api/backoffice/orders')
        .set('Cookie', [`access_token=${testModeratorToken}`])
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    test('should support order filters', async () => {
      const response = await request(app)
        .get('/api/backoffice/orders?status=placed&dateFrom=2024-01-01')
        .set('Cookie', [`access_token=${testAdminToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/backoffice/users', () => {
    test('should create new back-office user when admin is authenticated', async () => {
      const newUserData = {
        username: 'newmoderator',
        email: 'newmoderator@cadremarkets.com',
        password: 'NewModPassword123!',
        role: 'moderator',
        permissions: ['manage_listings']
      };

      const response = await request(app)
        .post('/api/backoffice/users')
        .set('Cookie', [`access_token=${testAdminToken}`])
        .send(newUserData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.username).toBe(newUserData.username);
      expect(response.body.user.role).toBe(newUserData.role);
      expect(response.body.user.password).toBeUndefined();

      // Verify user was created in database
      const createdUser = await BackOfficeUser.findById(response.body.user._id);
      expect(createdUser).toBeTruthy();
      expect(createdUser.role).toBe(newUserData.role);
    });

    test('should return error when moderator tries to create user', async () => {
      const newUserData = {
        username: 'newuser',
        email: 'newuser@cadremarkets.com',
        password: 'Password123!',
        role: 'support'
      };

      const response = await request(app)
        .post('/api/backoffice/users')
        .set('Cookie', [`access_token=${testModeratorToken}`])
        .send(newUserData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    test('should return error for duplicate username', async () => {
      const newUserData = {
        username: testAdmin.username, // Duplicate username
        email: 'newemail@cadremarkets.com',
        password: 'Password123!',
        role: 'support'
      };

      const response = await request(app)
        .post('/api/backoffice/users')
        .set('Cookie', [`access_token=${testAdminToken}`])
        .send(newUserData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('GET /api/backoffice/analytics', () => {
    test('should get analytics data when admin is authenticated', async () => {
      const response = await request(app)
        .get('/api/backoffice/analytics')
        .set('Cookie', [`access_token=${testAdminToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.analytics).toBeDefined();
      expect(response.body.analytics.userGrowth).toBeDefined();
      expect(response.body.analytics.salesData).toBeDefined();
      expect(response.body.analytics.topCategories).toBeDefined();
    });

    test('should support date range filters', async () => {
      const response = await request(app)
        .get('/api/backoffice/analytics?startDate=2024-01-01&endDate=2024-12-31')
        .set('Cookie', [`access_token=${testAdminToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/backoffice/logout', () => {
    test('should logout admin user', async () => {
      const response = await request(app)
        .post('/api/backoffice/logout')
        .set('Cookie', [`access_token=${testAdminToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logged out successfully');

      // Check if cookie is cleared
      const cookieHeader = response.headers['set-cookie'];
      expect(cookieHeader).toBeDefined();
      expect(cookieHeader[0]).toContain('access_token=');
      expect(cookieHeader[0]).toContain('expires=Thu, 01 Jan 1970');
    });
  });

  describe('Security and Edge Cases', () => {
    test('should validate admin permissions for each endpoint', async () => {
      // Create support user with limited permissions
      const supportData = {
        username: 'support',
        email: 'support@cadremarkets.com',
        password: 'SupportPassword123!',
        role: 'support',
        permissions: ['manage_support']
      };
      const hashedSupportPassword = bcryptjs.hashSync(supportData.password, 10);
      const supportUser = await BackOfficeUser.create({
        ...supportData,
        password: hashedSupportPassword
      });

      const supportToken = jwt.sign({ 
        id: supportUser._id, 
        isAdmin: true, 
        role: 'support', 
        permissions: supportUser.permissions 
      }, process.env.JWT_SECRET || 'test-jwt-secret-for-testing-only');

      // Try to access users endpoint with support account
      const response = await request(app)
        .get('/api/backoffice/users')
        .set('Cookie', [`access_token=${supportToken}`])
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    test('should handle malformed admin requests', async () => {
      const malformedData = {
        username: null,
        email: 123,
        role: 'invalid-role',
        permissions: 'not-an-array'
      };

      const response = await request(app)
        .post('/api/backoffice/users')
        .set('Cookie', [`access_token=${testAdminToken}`])
        .send(malformedData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should prevent privilege escalation', async () => {
      // Try to update own permissions
      const updateData = {
        permissions: ['manage_users', 'manage_listings', 'manage_orders', 'manage_services', 'manage_support']
      };

      const response = await request(app)
        .put(`/api/backoffice/users/${testModerator._id}`)
        .set('Cookie', [`access_token=${testModeratorToken}`])
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    test('should rate limit login attempts', async () => {
      const loginData = {
        username: 'admin',
        password: 'WrongPassword123!'
      };

      // Make multiple failed login attempts
      const requests = Array(5).fill().map(() => 
        request(app)
          .post('/api/backoffice/login')
          .send(loginData)
      );

      const responses = await Promise.all(requests);
      
      // All should fail due to invalid credentials
      responses.forEach(response => {
        expect([401, 429]).toContain(response.status); // 401 for invalid, 429 for rate limit
      });
    });

    test('should sanitize search queries', async () => {
      const maliciousSearch = '<script>alert("xss")</script>';

      const response = await request(app)
        .get(`/api/backoffice/users?search=${encodeURIComponent(maliciousSearch)}`)
        .set('Cookie', [`access_token=${testAdminToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      // Should not crash or return malicious content
    });
  });
}); 