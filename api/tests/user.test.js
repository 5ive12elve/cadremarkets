import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import userRouter from '../routes/user.route.js';
import User from '../models/user.model.js';
import Listing from '../models/listing.model.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Create test app
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/user', userRouter);

describe('User Endpoints', () => {
  let testUser;
  let testUserToken;
  let testAdmin;
  let testAdminToken;
  let otherUser;
  let otherUserToken;

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

    // Create other user
    const otherUserData = {
      username: 'otheruser',
      email: 'other@example.com',
      password: 'OtherPassword123!'
    };
    const hashedOtherPassword = bcryptjs.hashSync(otherUserData.password, 10);
    otherUser = await User.create({
      ...otherUserData,
      password: hashedOtherPassword
    });

    // Generate tokens
    testUserToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET || 'test-jwt-secret-for-testing-only');
    testAdminToken = jwt.sign({ id: testAdmin._id, isAdmin: true }, process.env.JWT_SECRET || 'test-jwt-secret-for-testing-only');
    otherUserToken = jwt.sign({ id: otherUser._id }, process.env.JWT_SECRET || 'test-jwt-secret-for-testing-only');
  });

  describe('GET /api/user/test', () => {
    test('should return test message', async () => {
      const response = await request(app)
        .get('/api/user/test')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.text).toContain('test');
    });
  });

  describe('POST /api/user/update/:id', () => {
    test('should update user profile when authenticated as same user', async () => {
      const updateData = {
        username: 'updateduser',
        email: 'updated@example.com'
      };

      const response = await request(app)
        .post(`/api/user/update/${testUser._id}`)
        .set('Cookie', [`access_token=${testUserToken}`])
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.username).toBe(updateData.username);
      expect(response.body.user.email).toBe(updateData.email);
      expect(response.body.user.password).toBeUndefined(); // Password should not be returned

      // Verify update in database
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.username).toBe(updateData.username);
      expect(updatedUser.email).toBe(updateData.email);
    });

    test('should return error when trying to update another user', async () => {
      const updateData = {
        username: 'maliciousupdate',
        email: 'malicious@example.com'
      };

      const response = await request(app)
        .post(`/api/user/update/${otherUser._id}`)
        .set('Cookie', [`access_token=${testUserToken}`])
        .send(updateData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('update your own profile');
    });

    test('should allow admin to update any user', async () => {
      const updateData = {
        username: 'adminupdated',
        email: 'adminupdated@example.com'
      };

      const response = await request(app)
        .post(`/api/user/update/${testUser._id}`)
        .set('Cookie', [`access_token=${testAdminToken}`])
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.username).toBe(updateData.username);
    });

    test('should return error without authentication', async () => {
      const updateData = {
        username: 'updateduser'
      };

      const response = await request(app)
        .post(`/api/user/update/${testUser._id}`)
        .send(updateData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Unauthorized');
    });

    test('should return error for duplicate username', async () => {
      const updateData = {
        username: otherUser.username // Already taken username
      };

      const response = await request(app)
        .post(`/api/user/update/${testUser._id}`)
        .set('Cookie', [`access_token=${testUserToken}`])
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    test('should return error for duplicate email', async () => {
      const updateData = {
        email: otherUser.email // Already taken email
      };

      const response = await request(app)
        .post(`/api/user/update/${testUser._id}`)
        .set('Cookie', [`access_token=${testUserToken}`])
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    test('should return error for invalid email format', async () => {
      const updateData = {
        email: 'invalid-email'
      };

      const response = await request(app)
        .post(`/api/user/update/${testUser._id}`)
        .set('Cookie', [`access_token=${testUserToken}`])
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should update password if provided', async () => {
      const updateData = {
        password: 'NewPassword123!'
      };

      const response = await request(app)
        .post(`/api/user/update/${testUser._id}`)
        .set('Cookie', [`access_token=${testUserToken}`])
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify password was updated and hashed
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.password).not.toBe(updateData.password);
      expect(bcryptjs.compareSync(updateData.password, updatedUser.password)).toBe(true);
    });
  });

  describe('DELETE /api/user/delete/:id', () => {
    test('should delete user when authenticated as same user', async () => {
      const response = await request(app)
        .delete(`/api/user/delete/${testUser._id}`)
        .set('Cookie', [`access_token=${testUserToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User has been deleted');

      // Verify deletion from database
      const deletedUser = await User.findById(testUser._id);
      expect(deletedUser).toBeNull();
    });

    test('should return error when trying to delete another user', async () => {
      const response = await request(app)
        .delete(`/api/user/delete/${otherUser._id}`)
        .set('Cookie', [`access_token=${testUserToken}`])
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('delete your own profile');
    });

    test('should allow admin to delete any user', async () => {
      const response = await request(app)
        .delete(`/api/user/delete/${testUser._id}`)
        .set('Cookie', [`access_token=${testAdminToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify deletion from database
      const deletedUser = await User.findById(testUser._id);
      expect(deletedUser).toBeNull();
    });

    test('should return error without authentication', async () => {
      const response = await request(app)
        .delete(`/api/user/delete/${testUser._id}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should return error for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/user/delete/${fakeId}`)
        .set('Cookie', [`access_token=${testAdminToken}`])
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('GET /api/user/:id', () => {
    test('should get user profile when authenticated', async () => {
      const response = await request(app)
        .get(`/api/user/${testUser._id}`)
        .set('Cookie', [`access_token=${testUserToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user._id).toBe(testUser._id.toString());
      expect(response.body.user.username).toBe(testUser.username);
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.password).toBeUndefined(); // Password should not be returned
    });

    test('should return error without authentication', async () => {
      const response = await request(app)
        .get(`/api/user/${testUser._id}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should return error for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/user/${fakeId}`)
        .set('Cookie', [`access_token=${testUserToken}`])
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('GET /api/user/listings/:id', () => {
    beforeEach(async () => {
      // Create some test listings for the user
      const listingData1 = global.testUtils.createTestListing();
      const listingData2 = {
        ...global.testUtils.createTestListing(),
        name: 'Second Art Piece',
        price: 1500
      };

      await Listing.create({
        ...listingData1,
        userRef: testUser._id
      });

      await Listing.create({
        ...listingData2,
        userRef: testUser._id
      });

      // Create listing for other user (should not be returned)
      await Listing.create({
        ...global.testUtils.createTestListing(),
        name: 'Other User Listing',
        userRef: otherUser._id
      });
    });

    test('should get user listings when authenticated', async () => {
      const response = await request(app)
        .get(`/api/user/listings/${testUser._id}`)
        .set('Cookie', [`access_token=${testUserToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.listings).toBeDefined();
      expect(Array.isArray(response.body.listings)).toBe(true);
      expect(response.body.listings.length).toBe(2);

      // All listings should belong to the test user
      response.body.listings.forEach(listing => {
        expect(listing.userRef).toBe(testUser._id.toString());
      });
    });

    test('should return error without authentication', async () => {
      const response = await request(app)
        .get(`/api/user/listings/${testUser._id}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should return empty array for user with no listings', async () => {
      // Create new user with no listings
      const newUserData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'NewPassword123!'
      };
      const hashedPassword = bcryptjs.hashSync(newUserData.password, 10);
      const newUser = await User.create({
        ...newUserData,
        password: hashedPassword
      });

      const response = await request(app)
        .get(`/api/user/listings/${newUser._id}`)
        .set('Cookie', [`access_token=${testUserToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.listings).toEqual([]);
    });
  });

  describe('PUT /api/user/password/:id', () => {
    test('should update password with valid current password', async () => {
      const passwordData = {
        currentPassword: 'TestPassword123!',
        newPassword: 'NewPassword123!'
      };

      const response = await request(app)
        .put(`/api/user/password/${testUser._id}`)
        .set('Cookie', [`access_token=${testUserToken}`])
        .send(passwordData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Password updated successfully');

      // Verify new password works
      const updatedUser = await User.findById(testUser._id);
      expect(bcryptjs.compareSync(passwordData.newPassword, updatedUser.password)).toBe(true);
    });

    test('should return error for incorrect current password', async () => {
      const passwordData = {
        currentPassword: 'WrongPassword123!',
        newPassword: 'NewPassword123!'
      };

      const response = await request(app)
        .put(`/api/user/password/${testUser._id}`)
        .set('Cookie', [`access_token=${testUserToken}`])
        .send(passwordData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('incorrect');
    });

    test('should return error when trying to update another user password', async () => {
      const passwordData = {
        currentPassword: 'TestPassword123!',
        newPassword: 'NewPassword123!'
      };

      const response = await request(app)
        .put(`/api/user/password/${otherUser._id}`)
        .set('Cookie', [`access_token=${testUserToken}`])
        .send(passwordData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should return error for missing fields', async () => {
      const passwordData = {
        currentPassword: 'TestPassword123!'
        // Missing newPassword
      };

      const response = await request(app)
        .put(`/api/user/password/${testUser._id}`)
        .set('Cookie', [`access_token=${testUserToken}`])
        .send(passwordData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should return error for weak new password', async () => {
      const passwordData = {
        currentPassword: 'TestPassword123!',
        newPassword: '123' // Too weak
      };

      const response = await request(app)
        .put(`/api/user/password/${testUser._id}`)
        .set('Cookie', [`access_token=${testUserToken}`])
        .send(passwordData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/user/me', () => {
    test('should get current user profile when authenticated', async () => {
      const response = await request(app)
        .get('/api/user/me')
        .set('Cookie', [`access_token=${testUserToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user._id).toBe(testUser._id.toString());
      expect(response.body.user.username).toBe(testUser.username);
      expect(response.body.user.password).toBeUndefined();
    });

    test('should return error without authentication', async () => {
      const response = await request(app)
        .get('/api/user/me')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Edge Cases and Security', () => {
    test('should sanitize user input in updates', async () => {
      const updateData = {
        username: '<script>alert("xss")</script>',
        email: 'test@example.com'
      };

      const response = await request(app)
        .post(`/api/user/update/${testUser._id}`)
        .set('Cookie', [`access_token=${testUserToken}`])
        .send(updateData);

      if (response.status === 200) {
        expect(response.body.user.username).not.toContain('<script>');
      }
    });

    test('should handle malformed user data', async () => {
      const malformedData = {
        username: null,
        email: 123,
        password: []
      };

      const response = await request(app)
        .post(`/api/user/update/${testUser._id}`)
        .set('Cookie', [`access_token=${testUserToken}`])
        .send(malformedData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should handle concurrent user updates', async () => {
      const updateData1 = { username: 'updated1' };
      const updateData2 = { username: 'updated2' };

      const requests = [
        request(app)
          .post(`/api/user/update/${testUser._id}`)
          .set('Cookie', [`access_token=${testUserToken}`])
          .send(updateData1),
        request(app)
          .post(`/api/user/update/${testUser._id}`)
          .set('Cookie', [`access_token=${testUserToken}`])
          .send(updateData2)
      ];

      const responses = await Promise.all(requests);
      
      // At least one should succeed
      const successCount = responses.filter(r => r.status === 200).length;
      expect(successCount).toBeGreaterThanOrEqual(1);
    });

    test('should handle very long input strings', async () => {
      const longString = 'a'.repeat(1000);
      const updateData = {
        username: longString,
        email: `${longString}@example.com`
      };

      const response = await request(app)
        .post(`/api/user/update/${testUser._id}`)
        .set('Cookie', [`access_token=${testUserToken}`])
        .send(updateData);

      expect([400, 413]).toContain(response.status);
    });
  });
}); 