import request from 'supertest';
import { expect } from 'chai';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../index.js';
import User from '../models/user.model.js';

let mongoServer;
let testUser;
let authToken;

describe('Profile Update Tests', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear database before each test
    await User.deleteMany({});
    
    // Create a test user
    testUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword123'
    });
    await testUser.save();
    
    // Get auth token (simulate login)
    authToken = 'test-token-' + testUser._id;
  });

  describe('GET /api/user/me', () => {
    it('should get current user profile when authenticated', async () => {
      const response = await request(app)
        .get('/api/user/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).to.have.property('_id');
      expect(response.body.username).to.equal('testuser');
      expect(response.body.email).to.equal('test@example.com');
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .get('/api/user/me')
        .expect(401);
    });
  });

  describe('POST /api/user/update/:id', () => {
    it('should update username successfully', async () => {
      const response = await request(app)
        .post(`/api/user/update/${testUser._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ username: 'newusername' })
        .expect(200);

      expect(response.body.username).to.equal('newusername');
      expect(response.body.email).to.equal('test@example.com');
    });

    it('should update email successfully', async () => {
      const response = await request(app)
        .post(`/api/user/update/${testUser._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: 'newemail@example.com' })
        .expect(200);

      expect(response.body.email).to.equal('newemail@example.com');
      expect(response.body.username).to.equal('testuser');
    });

    it('should update multiple fields successfully', async () => {
      const response = await request(app)
        .post(`/api/user/update/${testUser._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ 
          username: 'multiupdate',
          email: 'multi@example.com'
        })
        .expect(200);

      expect(response.body.username).to.equal('multiupdate');
      expect(response.body.email).to.equal('multi@example.com');
    });

    it('should reject empty username', async () => {
      const response = await request(app)
        .post(`/api/user/update/${testUser._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ username: '' })
        .expect(400);

      expect(response.body.message).to.include('Username cannot be empty');
    });

    it('should reject username with only spaces', async () => {
      const response = await request(app)
        .post(`/api/user/update/${testUser._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ username: '   ' })
        .expect(400);

      expect(response.body.message).to.include('Username cannot be empty');
    });

    it('should reject username shorter than 3 characters', async () => {
      const response = await request(app)
        .post(`/api/user/update/${testUser._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ username: 'ab' })
        .expect(400);

      expect(response.body.message).to.include('Username must be at least 3 characters long');
    });

    it('should reject username longer than 30 characters', async () => {
      const longUsername = 'a'.repeat(31);
      const response = await request(app)
        .post(`/api/user/update/${testUser._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ username: longUsername })
        .expect(400);

      expect(response.body.message).to.include('Username cannot exceed 30 characters');
    });

    it('should reject empty email', async () => {
      const response = await request(app)
        .post(`/api/user/update/${testUser._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: '' })
        .expect(400);

      expect(response.body.message).to.include('Email cannot be empty');
    });

    it('should reject email with only spaces', async () => {
      const response = await request(app)
        .post(`/api/user/update/${testUser._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: '   ' })
        .expect(400);

      expect(response.body.message).to.include('Email cannot be empty');
    });

    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post(`/api/user/update/${testUser._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body.message).to.include('Please enter a valid email address');
    });

    it('should reject email without domain', async () => {
      const response = await request(app)
        .post(`/api/user/update/${testUser._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: 'test@' })
        .expect(400);

      expect(response.body.message).to.include('Please enter a valid email address');
    });

    it('should reject duplicate username', async () => {
      // Create another user with different username
      const anotherUser = new User({
        username: 'anotheruser',
        email: 'another@example.com',
        password: 'hashedpassword123'
      });
      await anotherUser.save();

      const response = await request(app)
        .post(`/api/user/update/${testUser._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ username: 'anotheruser' })
        .expect(400);

      expect(response.body.message).to.include('Username is already taken');
    });

    it('should reject duplicate email', async () => {
      // Create another user with different email
      const anotherUser = new User({
        username: 'anotheruser',
        email: 'another@example.com',
        password: 'hashedpassword123'
      });
      await anotherUser.save();

      const response = await request(app)
        .post(`/api/user/update/${testUser._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: 'another@example.com' })
        .expect(400);

      expect(response.body.message).to.include('Email is already taken');
    });

    it('should allow user to keep their own username', async () => {
      const response = await request(app)
        .post(`/api/user/update/${testUser._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ username: 'testuser' })
        .expect(200);

      expect(response.body.username).to.equal('testuser');
    });

    it('should allow user to keep their own email', async () => {
      const response = await request(app)
        .post(`/api/user/update/${testUser._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: 'test@example.com' })
        .expect(200);

      expect(response.body.email).to.equal('test@example.com');
    });

    it('should trim whitespace from username', async () => {
      const response = await request(app)
        .post(`/api/user/update/${testUser._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ username: '  trimmeduser  ' })
        .expect(200);

      expect(response.body.username).to.equal('trimmeduser');
    });

    it('should trim whitespace from email', async () => {
      const response = await request(app)
        .post(`/api/user/update/${testUser._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: '  trimmed@example.com  ' })
        .expect(200);

      expect(response.body.email).to.equal('trimmed@example.com');
    });

    it('should convert email to lowercase', async () => {
      const response = await request(app)
        .post(`/api/user/update/${testUser._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: 'UPPERCASE@EXAMPLE.COM' })
        .expect(200);

      expect(response.body.email).to.equal('uppercase@example.com');
    });

    it('should reject update to another user\'s profile', async () => {
      const anotherUser = new User({
        username: 'anotheruser',
        email: 'another@example.com',
        password: 'hashedpassword123'
      });
      await anotherUser.save();

      await request(app)
        .post(`/api/user/update/${anotherUser._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ username: 'hacked' })
        .expect(401);
    });

    it('should handle avatar update', async () => {
      const avatarUrl = 'https://example.com/avatar.jpg';
      const response = await request(app)
        .post(`/api/user/update/${testUser._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ avatar: avatarUrl })
        .expect(200);

      expect(response.body.avatar).to.equal(avatarUrl);
    });

    it('should handle password update', async () => {
      const newPassword = 'newpassword123';
      const response = await request(app)
        .post(`/api/user/update/${testUser._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ password: newPassword })
        .expect(200);

      // Password should be hashed and not returned
      expect(response.body).to.not.have.property('password');
      
      // Verify password was actually updated in database
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.password).to.not.equal(newPassword);
      expect(updatedUser.password).to.not.equal('hashedpassword123');
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .post(`/api/user/update/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ username: 'newusername' })
        .expect(404);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .post(`/api/user/update/${testUser._id}`)
        .send({ username: 'newusername' })
        .expect(401);
    });
  });

  describe('Model Validation Tests', () => {
    it('should reject user creation with empty username', async () => {
      const user = new User({
        username: '',
        email: 'test2@example.com',
        password: 'password123'
      });

      try {
        await user.save();
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error.errors.username).to.exist;
      }
    });

    it('should reject user creation with empty email', async () => {
      const user = new User({
        username: 'testuser2',
        email: '',
        password: 'password123'
      });

      try {
        await user.save();
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error.errors.email).to.exist;
      }
    });

    it('should reject user creation with invalid email format', async () => {
      const user = new User({
        username: 'testuser2',
        email: 'invalid-email',
        password: 'password123'
      });

      try {
        await user.save();
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error.errors.email).to.exist;
      }
    });

    it('should reject user creation with username shorter than 3 characters', async () => {
      const user = new User({
        username: 'ab',
        email: 'test2@example.com',
        password: 'password123'
      });

      try {
        await user.save();
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error.errors.username).to.exist;
      }
    });

    it('should reject user creation with username longer than 30 characters', async () => {
      const user = new User({
        username: 'a'.repeat(31),
        email: 'test2@example.com',
        password: 'password123'
      });

      try {
        await user.save();
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error.errors.username).to.exist;
      }
    });
  });
}); 