import request from 'supertest';
import mongoose from 'mongoose';
import app from './testApp.js';
import User from '../models/user.model.js';
import Listing from '../models/listing.model.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('Listing Endpoints', () => {
  let testUser;
  let testUserToken;
  let testAdmin;
  let testAdminToken;

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

    // Generate tokens
    testUserToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET || 'test-jwt-secret-for-testing-only');
    testAdminToken = jwt.sign({ id: testAdmin._id, isAdmin: true }, process.env.JWT_SECRET || 'test-jwt-secret-for-testing-only');
  });

  describe('POST /api/listing/create', () => {
    test('should create listing with valid data and authentication', async () => {
      const listingData = global.testUtils.createTestListing();

      const response = await request(app)
        .post('/api/listing/create')
        .set('Cookie', [`access_token=${testUserToken}`])
        .send(listingData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.listing).toBeDefined();
      expect(response.body.listing.name).toBe(listingData.name);
      expect(response.body.listing.userRef).toBe(testUser._id.toString());

      // Verify listing was created in database
      const createdListing = await Listing.findById(response.body.listing._id);
      expect(createdListing).toBeTruthy();
      expect(createdListing.name).toBe(listingData.name);
    });

    test('should return error without authentication', async () => {
      const listingData = global.testUtils.createTestListing();

      const response = await request(app)
        .post('/api/listing/create')
        .send(listingData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Unauthorized');
    });

    test('should return validation error for missing required fields', async () => {
      const invalidData = {
        name: 'Test Listing'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/listing/create')
        .set('Cookie', [`access_token=${testUserToken}`])
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });

    test('should return error for invalid listing type', async () => {
      const listingData = {
        ...global.testUtils.createTestListing(),
        type: 'Invalid Type'
      };

      const response = await request(app)
        .post('/api/listing/create')
        .set('Cookie', [`access_token=${testUserToken}`])
        .send(listingData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should return error for price below minimum', async () => {
      const listingData = {
        ...global.testUtils.createTestListing(),
        price: 50 // Below minimum of 100
      };

      const response = await request(app)
        .post('/api/listing/create')
        .set('Cookie', [`access_token=${testUserToken}`])
        .send(listingData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should return error for invalid dimensions', async () => {
      const listingData = {
        ...global.testUtils.createTestListing(),
        width: 0 // Invalid dimension
      };

      const response = await request(app)
        .post('/api/listing/create')
        .set('Cookie', [`access_token=${testUserToken}`])
        .send(listingData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should return error for too many images', async () => {
      const listingData = {
        ...global.testUtils.createTestListing(),
        imageUrls: Array(10).fill('https://example.com/image.jpg') // Too many images
      };

      const response = await request(app)
        .post('/api/listing/create')
        .set('Cookie', [`access_token=${testUserToken}`])
        .send(listingData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should create listing with 3D dimensions', async () => {
      const listingData = {
        ...global.testUtils.createTestListing(),
        dimensions: '3D',
        depth: 50
      };

      const response = await request(app)
        .post('/api/listing/create')
        .set('Cookie', [`access_token=${testUserToken}`])
        .send(listingData)
        .expect(201);

      expect(response.body.listing.dimensions).toBe('3D');
      expect(response.body.listing.depth).toBe(50);
    });

    test('should create clothing listing with valid sizes', async () => {
      const clothingData = {
        name: 'Test T-Shirt',
        description: 'A comfortable test t-shirt',
        address: '123 Test Street',
        phoneNumber: '1234567890',
        city: 'Test City',
        district: 'Test District',
        type: 'Clothing & Wearables',
        availableSizes: ['S', 'M', 'L', 'XL'],
        price: 2000,
        contactPreference: 'Email',
        imageUrls: ['https://example.com/tshirt.jpg']
      };

      const response = await request(app)
        .post('/api/listing/create')
        .set('Cookie', [`access_token=${testUserToken}`])
        .send(clothingData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.listing.type).toBe('Clothing & Wearables');
      expect(response.body.listing.availableSizes).toEqual(['S', 'M', 'L', 'XL']);
      expect(response.body.listing.dimensions).toBeUndefined();
      expect(response.body.listing.width).toBeUndefined();
      expect(response.body.listing.height).toBeUndefined();
    });

    test('should return error for clothing without sizes', async () => {
      const clothingData = {
        name: 'Test T-Shirt',
        description: 'A comfortable test t-shirt',
        address: '123 Test Street',
        phoneNumber: '1234567890',
        city: 'Test City',
        district: 'Test District',
        type: 'Clothing & Wearables',
        price: 2000,
        contactPreference: 'Email',
        imageUrls: ['https://example.com/tshirt.jpg']
        // Missing availableSizes
      };

      const response = await request(app)
        .post('/api/listing/create')
        .set('Cookie', [`access_token=${testUserToken}`])
        .send(clothingData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Available sizes are required for clothing items');
    });

    test('should return error for clothing with invalid sizes', async () => {
      const clothingData = {
        name: 'Test T-Shirt',
        description: 'A comfortable test t-shirt',
        address: '123 Test Street',
        phoneNumber: '1234567890',
        city: 'Test City',
        district: 'Test District',
        type: 'Clothing & Wearables',
        availableSizes: ['S', 'M', 'INVALID_SIZE'],
        price: 2000,
        contactPreference: 'Email',
        imageUrls: ['https://example.com/tshirt.jpg']
      };

      const response = await request(app)
        .post('/api/listing/create')
        .set('Cookie', [`access_token=${testUserToken}`])
        .send(clothingData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid sizes: INVALID_SIZE');
    });

    test('should return error for clothing with too many sizes', async () => {
      const clothingData = {
        name: 'Test T-Shirt',
        description: 'A comfortable test t-shirt',
        address: '123 Test Street',
        phoneNumber: '1234567890',
        city: 'Test City',
        district: 'Test District',
        type: 'Clothing & Wearables',
        availableSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '32', '34', '36', '38'], // 11 sizes, max is 10
        price: 2000,
        contactPreference: 'Email',
        imageUrls: ['https://example.com/tshirt.jpg']
      };

      const response = await request(app)
        .post('/api/listing/create')
        .set('Cookie', [`access_token=${testUserToken}`])
        .send(clothingData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Maximum 10 sizes allowed');
    });

    test('should return error for non-clothing without dimensions', async () => {
      const listingData = {
        name: 'Test Art Piece',
        description: 'A beautiful test art piece',
        address: '123 Test Street',
        phoneNumber: '1234567890',
        city: 'Test City',
        district: 'Test District',
        type: 'Paintings & Drawings',
        price: 2000,
        contactPreference: 'Email',
        imageUrls: ['https://example.com/art.jpg']
        // Missing dimensions, width, height
      };

      const response = await request(app)
        .post('/api/listing/create')
        .set('Cookie', [`access_token=${testUserToken}`])
        .send(listingData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Dimensions, width, and height are required for non-clothing items');
    });
  });

  describe('GET /api/listing/get/:id', () => {
    let testListing;

    beforeEach(async () => {
      const listingData = global.testUtils.createTestListing();
      testListing = await Listing.create({
        ...listingData,
        userRef: testUser._id
      });
    });

    test('should get listing by ID', async () => {
      const response = await request(app)
        .get(`/api/listing/get/${testListing._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.listing).toBeDefined();
      expect(response.body.listing._id).toBe(testListing._id.toString());
      expect(response.body.listing.name).toBe(testListing.name);
    });

    test('should return error for non-existent listing', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/listing/get/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    test('should return error for invalid listing ID format', async () => {
      const response = await request(app)
        .get('/api/listing/get/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/listing/get', () => {
    beforeEach(async () => {
      // Create multiple test listings with different properties
      const listings = [
        { ...global.testUtils.createTestListing(), name: 'Painting 1', type: 'Paintings & Drawings', price: 1500, city: 'New York' },
        { ...global.testUtils.createTestListing(), name: 'Sculpture 1', type: 'Sculptures & 3D Art', price: 2500, city: 'Los Angeles' },
        { ...global.testUtils.createTestListing(), name: 'Antique 1', type: 'Antiques & Collectibles', price: 3500, city: 'Chicago' },
        { ...global.testUtils.createTestListing(), name: 'Painting 2', type: 'Paintings & Drawings', price: 1200, city: 'New York' },
      ];

      for (const listing of listings) {
        await Listing.create({
          ...listing,
          userRef: testUser._id
        });
      }
    });

    test('should get all listings with default pagination', async () => {
      const response = await request(app)
        .get('/api/listing/get')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.listings).toBeDefined();
      expect(Array.isArray(response.body.listings)).toBe(true);
      expect(response.body.listings.length).toBeLessThanOrEqual(9); // Default limit
    });

    test('should filter listings by type', async () => {
      const response = await request(app)
        .get('/api/listing/get?type=Paintings & Drawings')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.listings.forEach(listing => {
        expect(listing.type).toBe('Paintings & Drawings');
      });
    });

    test('should filter listings by city', async () => {
      const response = await request(app)
        .get('/api/listing/get?city=New York')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.listings.forEach(listing => {
        expect(listing.city).toBe('New York');
      });
    });

    test('should filter listings by price range', async () => {
      const response = await request(app)
        .get('/api/listing/get?minPrice=1000&maxPrice=2000')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.listings.forEach(listing => {
        expect(listing.price).toBeGreaterThanOrEqual(1000);
        expect(listing.price).toBeLessThanOrEqual(2000);
      });
    });

    test('should search listings by name', async () => {
      const response = await request(app)
        .get('/api/listing/get?searchTerm=Painting')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.listings.forEach(listing => {
        expect(listing.name.toLowerCase()).toContain('painting');
      });
    });

    test('should sort listings by price ascending', async () => {
      const response = await request(app)
        .get('/api/listing/get?sort=price_asc')
        .expect(200);

      expect(response.body.success).toBe(true);
      const prices = response.body.listings.map(listing => listing.price);
      const sortedPrices = [...prices].sort((a, b) => a - b);
      expect(prices).toEqual(sortedPrices);
    });

    test('should sort listings by price descending', async () => {
      const response = await request(app)
        .get('/api/listing/get?sort=price_desc')
        .expect(200);

      expect(response.body.success).toBe(true);
      const prices = response.body.listings.map(listing => listing.price);
      const sortedPrices = [...prices].sort((a, b) => b - a);
      expect(prices).toEqual(sortedPrices);
    });

    test('should paginate listings correctly', async () => {
      const response1 = await request(app)
        .get('/api/listing/get?limit=2&startIndex=0')
        .expect(200);

      const response2 = await request(app)
        .get('/api/listing/get?limit=2&startIndex=2')
        .expect(200);

      expect(response1.body.listings.length).toBeLessThanOrEqual(2);
      expect(response2.body.listings.length).toBeLessThanOrEqual(2);
      
      // Should have different listings
      const ids1 = response1.body.listings.map(l => l._id);
      const ids2 = response2.body.listings.map(l => l._id);
      expect(ids1).not.toEqual(ids2);
    });
  });

  describe('POST /api/listing/update/:id', () => {
    let testListing;

    beforeEach(async () => {
      const listingData = global.testUtils.createTestListing();
      testListing = await Listing.create({
        ...listingData,
        userRef: testUser._id
      });
    });

    test('should update listing when owner is authenticated', async () => {
      const updateData = {
        name: 'Updated Art Piece',
        description: 'Updated description',
        price: 2500
      };

      const response = await request(app)
        .post(`/api/listing/update/${testListing._id}`)
        .set('Cookie', [`access_token=${testUserToken}`])
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.listing.name).toBe(updateData.name);
      expect(response.body.listing.description).toBe(updateData.description);
      expect(response.body.listing.price).toBe(updateData.price);

      // Verify update in database
      const updatedListing = await Listing.findById(testListing._id);
      expect(updatedListing.name).toBe(updateData.name);
    });

    test('should return error when non-owner tries to update', async () => {
      const otherUserData = {
        username: 'otheruser',
        email: 'other@example.com',
        password: 'OtherPassword123!'
      };
      const hashedPassword = bcryptjs.hashSync(otherUserData.password, 10);
      const otherUser = await User.create({
        ...otherUserData,
        password: hashedPassword
      });
      const otherUserToken = jwt.sign({ id: otherUser._id }, process.env.JWT_SECRET || 'test-jwt-secret-for-testing-only');

      const updateData = {
        name: 'Updated Art Piece'
      };

      const response = await request(app)
        .post(`/api/listing/update/${testListing._id}`)
        .set('Cookie', [`access_token=${otherUserToken}`])
        .send(updateData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('update your own listings');
    });

    test('should return error without authentication', async () => {
      const updateData = {
        name: 'Updated Art Piece'
      };

      const response = await request(app)
        .post(`/api/listing/update/${testListing._id}`)
        .send(updateData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should return error for non-existent listing', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const updateData = {
        name: 'Updated Art Piece'
      };

      const response = await request(app)
        .post(`/api/listing/update/${fakeId}`)
        .set('Cookie', [`access_token=${testUserToken}`])
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    test('should return error for price below minimum when updating', async () => {
      const updateData = {
        price: 50 // Below minimum of 100
      };

      const response = await request(app)
        .post(`/api/listing/update/${testListing._id}`)
        .set('Cookie', [`access_token=${testUserToken}`])
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Price must be at least 100 EGP');
    });
  });

  describe('DELETE /api/listing/delete/:id', () => {
    let testListing;

    beforeEach(async () => {
      const listingData = global.testUtils.createTestListing();
      testListing = await Listing.create({
        ...listingData,
        userRef: testUser._id
      });
    });

    test('should delete listing when owner is authenticated', async () => {
      const response = await request(app)
        .delete(`/api/listing/delete/${testListing._id}`)
        .set('Cookie', [`access_token=${testUserToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Listing has been deleted!');

      // Verify deletion from database
      const deletedListing = await Listing.findById(testListing._id);
      expect(deletedListing).toBeNull();
    });

    test('should return error when non-owner tries to delete', async () => {
      const otherUserData = {
        username: 'otheruser',
        email: 'other@example.com',
        password: 'OtherPassword123!'
      };
      const hashedPassword = bcryptjs.hashSync(otherUserData.password, 10);
      const otherUser = await User.create({
        ...otherUserData,
        password: hashedPassword
      });
      const otherUserToken = jwt.sign({ id: otherUser._id }, process.env.JWT_SECRET || 'test-jwt-secret-for-testing-only');

      const response = await request(app)
        .delete(`/api/listing/delete/${testListing._id}`)
        .set('Cookie', [`access_token=${otherUserToken}`])
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('delete your own listings');
    });

    test('should allow admin to delete any listing', async () => {
      const response = await request(app)
        .delete(`/api/listing/delete/${testListing._id}`)
        .set('Cookie', [`access_token=${testAdminToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // Verify deletion from database
      const deletedListing = await Listing.findById(testListing._id);
      expect(deletedListing).toBeNull();
    });

    test('should return error without authentication', async () => {
      const response = await request(app)
        .delete(`/api/listing/delete/${testListing._id}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/listing/for-sale', () => {
    beforeEach(async () => {
      // Create listings with different statuses
      await Listing.create({
        ...global.testUtils.createTestListing(),
        name: 'Available Listing',
        userRef: testUser._id,
        status: 'for sale'
      });

      await Listing.create({
        ...global.testUtils.createTestListing(),
        name: 'Sold Listing',
        userRef: testUser._id,
        status: 'sold'
      });
    });

    test('should get only for-sale listings', async () => {
      const response = await request(app)
        .get('/api/listing/for-sale')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.listings).toBeDefined();
      response.body.listings.forEach(listing => {
        expect(listing.status).toBe('for sale');
      });
    });
  });

  describe('PUT /api/listing/:id/status', () => {
    let testListing;

    beforeEach(async () => {
      const listingData = global.testUtils.createTestListing();
      testListing = await Listing.create({
        ...listingData,
        userRef: testUser._id
      });
    });

    test('should update listing status when admin is authenticated', async () => {
      const response = await request(app)
        .put(`/api/listing/${testListing._id}/status`)
        .set('Cookie', [`access_token=${testAdminToken}`])
        .send({ status: 'sold' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.listing.status).toBe('sold');
    });

    test('should return error when non-admin tries to update status', async () => {
      const response = await request(app)
        .put(`/api/listing/${testListing._id}/status`)
        .set('Cookie', [`access_token=${testUserToken}`])
        .send({ status: 'sold' })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Admin access required');
    });
  });

  describe('Edge Cases and Security', () => {
    test('should handle malformed listing data', async () => {
      const malformedData = {
        name: null,
        price: 'not-a-number',
        type: 123
      };

      const response = await request(app)
        .post('/api/listing/create')
        .set('Cookie', [`access_token=${testUserToken}`])
        .send(malformedData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should sanitize HTML in listing description', async () => {
      const listingData = {
        ...global.testUtils.createTestListing(),
        description: '<script>alert("xss")</script>Legitimate description'
      };

      const response = await request(app)
        .post('/api/listing/create')
        .set('Cookie', [`access_token=${testUserToken}`])
        .send(listingData);

      if (response.status === 201) {
        expect(response.body.listing.description).not.toContain('<script>');
      }
    });

    test('should handle concurrent listing creation', async () => {
      const listingData = global.testUtils.createTestListing();
      
      const requests = Array(3).fill().map(() => 
        request(app)
          .post('/api/listing/create')
          .set('Cookie', [`access_token=${testUserToken}`])
          .send(listingData)
      );

      const responses = await Promise.all(requests);
      
      // All should succeed as they're separate listings
      responses.forEach(response => {
        expect(response.status).toBe(201);
      });
    });

    test('should handle very large search queries', async () => {
      const longSearchTerm = 'a'.repeat(1000);
      
      const response = await request(app)
        .get(`/api/listing/get?searchTerm=${longSearchTerm}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/listing/clothing/sizes', () => {
    test('should get available clothing sizes', async () => {
      const response = await request(app)
        .get('/api/listing/clothing/sizes')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.sizes).toBeDefined();
      expect(Array.isArray(response.body.sizes)).toBe(true);
      expect(response.body.sizes).toContain('S');
      expect(response.body.sizes).toContain('M');
      expect(response.body.sizes).toContain('L');
      expect(response.body.sizes).toContain('XL');
      expect(response.body.sizes).toContain('One Size');
      expect(response.body.message).toBe('Available clothing sizes retrieved successfully');
    });
  });
}); 