import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import orderRouter from '../routes/order.route.js';
import User from '../models/user.model.js';
import Listing from '../models/listing.model.js';
import Order from '../models/order.model.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Create test app
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/orders', orderRouter);

describe('Order Endpoints', () => {
  let testUser;
  let testUserToken;
  let testAdmin;
  let testAdminToken;
  let testSeller;
  let testSellerToken;
  let testListing;

  beforeEach(async () => {
    // Create test user (buyer)
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

    // Create test seller
    const sellerData = {
      username: 'testseller',
      email: 'seller@example.com',
      password: 'SellerPassword123!'
    };
    const hashedSellerPassword = bcryptjs.hashSync(sellerData.password, 10);
    testSeller = await User.create({
      ...sellerData,
      password: hashedSellerPassword
    });

    // Create test listing
    const listingData = global.testUtils.createTestListing();
    testListing = await Listing.create({
      ...listingData,
      userRef: testSeller._id,
      quantity: 5,
      status: 'for sale'
    });

    // Generate tokens
    testUserToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET || 'test-jwt-secret-for-testing-only');
    testAdminToken = jwt.sign({ id: testAdmin._id, isAdmin: true }, process.env.JWT_SECRET || 'test-jwt-secret-for-testing-only');
    testSellerToken = jwt.sign({ id: testSeller._id }, process.env.JWT_SECRET || 'test-jwt-secret-for-testing-only');
  });

  describe('POST /api/orders', () => {
    test('should create order with valid data and authentication', async () => {
      const orderData = {
        orderItems: [
          {
            _id: testListing._id.toString(),
            quantity: 2
          }
        ],
        customerInfo: global.testUtils.createTestOrder().customerInfo
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Cookie', [`access_token=${testUserToken}`])
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.order).toBeDefined();
      expect(response.body.order.orderItems).toHaveLength(1);
      expect(response.body.order.orderItems[0].name).toBe(testListing.name);
      expect(response.body.order.totalPrice).toBeGreaterThan(0);

      // Verify order was created in database
      const createdOrder = await Order.findById(response.body.order._id);
      expect(createdOrder).toBeTruthy();
      expect(createdOrder.status).toBe('placed');
    });

    test('should return error without authentication', async () => {
      const orderData = {
        orderItems: [
          {
            _id: testListing._id.toString(),
            quantity: 1
          }
        ],
        customerInfo: global.testUtils.createTestOrder().customerInfo
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Unauthorized');
    });

    test('should return error for missing required fields', async () => {
      const invalidData = {
        orderItems: [
          {
            _id: testListing._id.toString(),
            quantity: 1
          }
        ]
        // Missing customerInfo
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Cookie', [`access_token=${testUserToken}`])
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });

    test('should return error for empty order items', async () => {
      const orderData = {
        orderItems: [],
        customerInfo: global.testUtils.createTestOrder().customerInfo
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Cookie', [`access_token=${testUserToken}`])
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('at least one item');
    });

    test('should return error for non-existent listing', async () => {
      const fakeListingId = new mongoose.Types.ObjectId();
      const orderData = {
        orderItems: [
          {
            _id: fakeListingId.toString(),
            quantity: 1
          }
        ],
        customerInfo: global.testUtils.createTestOrder().customerInfo
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Cookie', [`access_token=${testUserToken}`])
        .send(orderData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    test('should return error for insufficient stock', async () => {
      const orderData = {
        orderItems: [
          {
            _id: testListing._id.toString(),
            quantity: 10 // More than available stock (5)
          }
        ],
        customerInfo: global.testUtils.createTestOrder().customerInfo
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Cookie', [`access_token=${testUserToken}`])
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('insufficient stock');
    });

    test('should return error for sold listing', async () => {
      // Update listing to sold status
      await Listing.findByIdAndUpdate(testListing._id, { status: 'sold' });

      const orderData = {
        orderItems: [
          {
            _id: testListing._id.toString(),
            quantity: 1
          }
        ],
        customerInfo: global.testUtils.createTestOrder().customerInfo
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Cookie', [`access_token=${testUserToken}`])
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not available');
    });

    test('should calculate correct order totals', async () => {
      const orderData = {
        orderItems: [
          {
            _id: testListing._id.toString(),
            quantity: 2
          }
        ],
        customerInfo: global.testUtils.createTestOrder().customerInfo
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Cookie', [`access_token=${testUserToken}`])
        .send(orderData)
        .expect(201);

      const order = response.body.order;
      const expectedSubtotal = testListing.price * 2;
      
      expect(order.orderItems[0].price).toBe(testListing.price);
      expect(order.shipmentFees).toBeGreaterThan(0);
      expect(order.cadreFees).toBeGreaterThan(0);
      expect(order.totalPrice).toBe(expectedSubtotal + order.shipmentFees + order.cadreFees);
    });

    test('should handle multiple items in single order', async () => {
      // Create another listing
      const secondListing = await Listing.create({
        ...global.testUtils.createTestListing(),
        name: 'Second Art Piece',
        price: 1500,
        userRef: testSeller._id,
        quantity: 3
      });

      const orderData = {
        orderItems: [
          {
            _id: testListing._id.toString(),
            quantity: 1
          },
          {
            _id: secondListing._id.toString(),
            quantity: 2
          }
        ],
        customerInfo: global.testUtils.createTestOrder().customerInfo
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Cookie', [`access_token=${testUserToken}`])
        .send(orderData)
        .expect(201);

      expect(response.body.order.orderItems).toHaveLength(2);
      expect(response.body.order.orderItems[0].name).toBe(testListing.name);
      expect(response.body.order.orderItems[1].name).toBe(secondListing.name);
    });
  });

  describe('GET /api/orders', () => {
    let testOrder;

    beforeEach(async () => {
      // Create a test order
      const orderData = {
        _id: 'CM1001',
        orderItems: [
          {
            _id: testListing._id,
            name: testListing.name,
            description: testListing.description,
            price: testListing.price,
            quantity: 1,
            sellerInfo: {
              username: testSeller.username,
              email: testSeller.email,
              phoneNumber: '1234567890',
              city: 'Test City',
              district: 'Test District',
              address: 'Test Address',
              contactPreference: 'email'
            }
          }
        ],
        customerInfo: global.testUtils.createTestOrder().customerInfo,
        status: 'placed',
        shipmentFees: 85,
        cadreFees: 75,
        totalPrice: testListing.price + 85 + 75,
        cadreProfit: 75 * 0.1
      };

      testOrder = await Order.create(orderData);
    });

    test('should get all orders when admin is authenticated', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Cookie', [`access_token=${testAdminToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.orders).toBeDefined();
      expect(Array.isArray(response.body.orders)).toBe(true);
      expect(response.body.orders.length).toBeGreaterThan(0);
    });

    test('should return error when non-admin tries to get all orders', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Cookie', [`access_token=${testUserToken}`])
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Admin access required');
    });

    test('should return error without authentication', async () => {
      const response = await request(app)
        .get('/api/orders')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/orders/:id/status', () => {
    let testOrder;

    beforeEach(async () => {
      const orderData = {
        _id: 'CM1002',
        orderItems: [
          {
            _id: testListing._id,
            name: testListing.name,
            description: testListing.description,
            price: testListing.price,
            quantity: 1,
            sellerInfo: {
              username: testSeller.username,
              email: testSeller.email
            }
          }
        ],
        customerInfo: global.testUtils.createTestOrder().customerInfo,
        status: 'placed',
        shipmentFees: 85,
        cadreFees: 75,
        totalPrice: testListing.price + 85 + 75
      };

      testOrder = await Order.create(orderData);
    });

    test('should update order status when admin is authenticated', async () => {
      const newStatus = 'out for delivery';

      const response = await request(app)
        .put(`/api/orders/${testOrder._id}/status`)
        .set('Cookie', [`access_token=${testAdminToken}`])
        .send({ status: newStatus })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.order.status).toBe(newStatus);

      // Verify update in database
      const updatedOrder = await Order.findById(testOrder._id);
      expect(updatedOrder.status).toBe(newStatus);
    });

    test('should return error when non-admin tries to update status', async () => {
      const response = await request(app)
        .put(`/api/orders/${testOrder._id}/status`)
        .set('Cookie', [`access_token=${testUserToken}`])
        .send({ status: 'delivered' })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Admin access required');
    });

    test('should return error for invalid status', async () => {
      const response = await request(app)
        .put(`/api/orders/${testOrder._id}/status`)
        .set('Cookie', [`access_token=${testAdminToken}`])
        .send({ status: 'invalid-status' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid status');
    });

    test('should return error for non-existent order', async () => {
      const fakeOrderId = 'CM9999';

      const response = await request(app)
        .put(`/api/orders/${fakeOrderId}/status`)
        .set('Cookie', [`access_token=${testAdminToken}`])
        .send({ status: 'delivered' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    test('should validate status transitions', async () => {
      // Try to set status to 'placed' when it's already 'placed'
      const response = await request(app)
        .put(`/api/orders/${testOrder._id}/status`)
        .set('Cookie', [`access_token=${testAdminToken}`])
        .send({ status: 'placed' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/orders/:id', () => {
    let testOrder;

    beforeEach(async () => {
      const orderData = {
        _id: 'CM1003',
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
    });

    test('should delete order when admin is authenticated', async () => {
      const response = await request(app)
        .delete(`/api/orders/${testOrder._id}`)
        .set('Cookie', [`access_token=${testAdminToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Order deleted successfully');

      // Verify deletion from database
      const deletedOrder = await Order.findById(testOrder._id);
      expect(deletedOrder).toBeNull();
    });

    test('should return error when non-admin tries to delete', async () => {
      const response = await request(app)
        .delete(`/api/orders/${testOrder._id}`)
        .set('Cookie', [`access_token=${testUserToken}`])
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Admin access required');
    });

    test('should return error for non-existent order', async () => {
      const fakeOrderId = 'CM9999';

      const response = await request(app)
        .delete(`/api/orders/${fakeOrderId}`)
        .set('Cookie', [`access_token=${testAdminToken}`])
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('PUT /api/orders/:orderId/items/:itemId/status-checks', () => {
    let testOrder;
    let testItemId;

    beforeEach(async () => {
      testItemId = new mongoose.Types.ObjectId();
      const orderData = {
        _id: 'CM1004',
        orderItems: [
          {
            _id: testItemId,
            name: testListing.name,
            price: testListing.price,
            quantity: 1,
            statusChecks: {
              itemReceived: false,
              itemVerified: false,
              readyForShipment: false
            }
          }
        ],
        customerInfo: global.testUtils.createTestOrder().customerInfo,
        status: 'placed',
        totalPrice: testListing.price + 160
      };

      testOrder = await Order.create(orderData);
    });

    test('should update item status checks when admin is authenticated', async () => {
      const statusChecks = {
        itemReceived: true,
        itemVerified: true,
        readyForShipment: false
      };

      const response = await request(app)
        .put(`/api/orders/${testOrder._id}/items/${testItemId}/status-checks`)
        .set('Cookie', [`access_token=${testAdminToken}`])
        .send({ statusChecks })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.order.orderItems[0].statusChecks.itemReceived).toBe(true);
      expect(response.body.order.orderItems[0].statusChecks.itemVerified).toBe(true);
    });

    test('should return error when non-admin tries to update status checks', async () => {
      const response = await request(app)
        .put(`/api/orders/${testOrder._id}/items/${testItemId}/status-checks`)
        .set('Cookie', [`access_token=${testUserToken}`])
        .send({ statusChecks: { itemReceived: true } })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Edge Cases and Security', () => {
    test('should handle concurrent order creation for same item', async () => {
      // Set listing quantity to 1
      await Listing.findByIdAndUpdate(testListing._id, { quantity: 1 });

      const orderData = {
        orderItems: [
          {
            _id: testListing._id.toString(),
            quantity: 1
          }
        ],
        customerInfo: global.testUtils.createTestOrder().customerInfo
      };

      // Try to create two orders simultaneously
      const requests = Array(2).fill().map(() => 
        request(app)
          .post('/api/orders')
          .set('Cookie', [`access_token=${testUserToken}`])
          .send(orderData)
      );

      const responses = await Promise.all(requests);
      
      // Only one should succeed due to stock limitations
      const successCount = responses.filter(r => r.status === 201).length;
      const errorCount = responses.filter(r => r.status === 400).length;
      
      expect(successCount + errorCount).toBe(2);
      expect(successCount).toBeLessThanOrEqual(1);
    });

    test('should validate customer info format', async () => {
      const orderData = {
        orderItems: [
          {
            _id: testListing._id.toString(),
            quantity: 1
          }
        ],
        customerInfo: {
          name: '',
          phoneNumber: 'invalid-phone',
          address: '',
          city: '',
          district: ''
        }
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Cookie', [`access_token=${testUserToken}`])
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should sanitize customer info input', async () => {
      const orderData = {
        orderItems: [
          {
            _id: testListing._id.toString(),
            quantity: 1
          }
        ],
        customerInfo: {
          ...global.testUtils.createTestOrder().customerInfo,
          name: '<script>alert("xss")</script>John Doe',
          address: '<img src=x onerror=alert(1)>123 Main St'
        }
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Cookie', [`access_token=${testUserToken}`])
        .send(orderData);

      if (response.status === 201) {
        expect(response.body.order.customerInfo.name).not.toContain('<script>');
        expect(response.body.order.customerInfo.address).not.toContain('<img');
      }
    });

    test('should handle malformed order data', async () => {
      const malformedData = {
        orderItems: 'not-an-array',
        customerInfo: null
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Cookie', [`access_token=${testUserToken}`])
        .send(malformedData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/orders/:orderId/items/:itemId', () => {
    let testOrder;
    let testListing2;

    beforeEach(async () => {
      // Create a second test listing
      const listingData2 = global.testUtils.createTestListing();
      testListing2 = await Listing.create({
        ...listingData2,
        name: 'Test Item 2',
        userRef: testSeller._id,
        quantity: 3,
        status: 'for sale'
      });

      // Create an order with multiple items
      const orderData = {
        _id: 'CM1005',
        orderItems: [
          {
            _id: testListing._id,
            name: testListing.name,
            price: testListing.price,
            quantity: 2,
            type: testListing.type,
            sellerInfo: {
              username: testSeller.username,
              email: testSeller.email,
              phoneNumber: '123-456-7890',
              city: 'Test City',
              district: 'Test District',
              address: 'Test Address',
              contactPreference: 'phone'
            },
            profit: testListing.price * 2 * 0.9
          },
          {
            _id: testListing2._id,
            name: testListing2.name,
            price: testListing2.price,
            quantity: 1,
            type: testListing2.type,
            sellerInfo: {
              username: testSeller.username,
              email: testSeller.email,
              phoneNumber: '123-456-7890',
              city: 'Test City',
              district: 'Test District',
              address: 'Test Address',
              contactPreference: 'phone'
            },
            profit: testListing2.price * 0.9
          }
        ],
        customerInfo: global.testUtils.createTestOrder().customerInfo,
        status: 'placed',
        totalPrice: (testListing.price * 2) + testListing2.price + 85,
        cadreProfit: ((testListing.price * 2) + testListing2.price) * 0.1,
        shipmentFees: 85
      };

      testOrder = await Order.create(orderData);

      // Update listing quantities to reflect the order
      await Listing.findByIdAndUpdate(testListing._id, {
        $inc: { currentQuantity: -2, soldQuantity: 2 }
      });
      await Listing.findByIdAndUpdate(testListing2._id, {
        $inc: { currentQuantity: -1, soldQuantity: 1 }
      });
    });

    test('should delete order item when admin is authenticated', async () => {
      const initialItemCount = testOrder.orderItems.length;
      const itemToDelete = testOrder.orderItems[0];

      const response = await request(app)
        .delete(`/api/orders/${testOrder._id}/items/${itemToDelete._id}`)
        .set('Cookie', [`access_token=${testAdminToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Order item deleted successfully');
      expect(response.body.orderDeleted).toBe(false);
      expect(response.body.order.orderItems).toHaveLength(initialItemCount - 1);

      // Verify listing quantities were restored
      const updatedListing = await Listing.findById(itemToDelete._id);
      expect(updatedListing.currentQuantity).toBe(testListing.quantity); // Should be restored
      expect(updatedListing.soldQuantity).toBe(0); // Should be restored
    });

    test('should delete entire order when last item is deleted', async () => {
      // First delete one item
      await request(app)
        .delete(`/api/orders/${testOrder._id}/items/${testOrder.orderItems[0]._id}`)
        .set('Cookie', [`access_token=${testAdminToken}`])
        .expect(200);

      // Then delete the remaining item
      const response = await request(app)
        .delete(`/api/orders/${testOrder._id}/items/${testOrder.orderItems[1]._id}`)
        .set('Cookie', [`access_token=${testAdminToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.orderDeleted).toBe(true);
      expect(response.body.message).toContain('Order was also deleted');

      // Verify order was deleted from database
      const deletedOrder = await Order.findById(testOrder._id);
      expect(deletedOrder).toBeNull();
    });

    test('should return error when non-admin tries to delete item', async () => {
      const itemToDelete = testOrder.orderItems[0];

      const response = await request(app)
        .delete(`/api/orders/${testOrder._id}/items/${itemToDelete._id}`)
        .set('Cookie', [`access_token=${testUserToken}`])
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Admin access required');
    });

    test('should return error for non-existent order', async () => {
      const fakeOrderId = 'CM9999';
      const itemId = testOrder.orderItems[0]._id;

      const response = await request(app)
        .delete(`/api/orders/${fakeOrderId}/items/${itemId}`)
        .set('Cookie', [`access_token=${testAdminToken}`])
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Order not found');
    });

    test('should return error for non-existent item', async () => {
      const fakeItemId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/orders/${testOrder._id}/items/${fakeItemId}`)
        .set('Cookie', [`access_token=${testAdminToken}`])
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Order item not found');
    });

    test('should recalculate order totals after item deletion', async () => {
      const itemToDelete = testOrder.orderItems[0];
      const expectedNewSubtotal = testOrder.orderItems
        .filter(item => item._id.toString() !== itemToDelete._id.toString())
        .reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const expectedNewTotal = expectedNewSubtotal + testOrder.shipmentFees;
      const expectedNewProfit = expectedNewSubtotal * 0.1;

      const response = await request(app)
        .delete(`/api/orders/${testOrder._id}/items/${itemToDelete._id}`)
        .set('Cookie', [`access_token=${testAdminToken}`])
        .expect(200);

      expect(response.body.order.totalPrice).toBeCloseTo(expectedNewTotal, 2);
      expect(response.body.order.cadreProfit).toBeCloseTo(expectedNewProfit, 2);
    });
  });

  describe('PUT /api/orders/:orderId/items/:itemId/quantity', () => {
    let testOrder;
    let testListing2;

    beforeEach(async () => {
      // Create a second test listing with more stock
      const listingData2 = global.testUtils.createTestListing();
      testListing2 = await Listing.create({
        ...listingData2,
        name: 'Test Item 2',
        userRef: testSeller._id,
        initialQuantity: 10,
        currentQuantity: 8, // 2 already sold
        soldQuantity: 2,
        status: 'for sale'
      });

      // Create an order with multiple items
      const orderData = {
        _id: 'CM1006',
        orderItems: [
          {
            _id: testListing._id,
            name: testListing.name,
            price: testListing.price,
            quantity: 2,
            type: testListing.type,
            sellerInfo: {
              username: testSeller.username,
              email: testSeller.email,
              phoneNumber: '123-456-7890',
              city: 'Test City',
              district: 'Test District',
              address: 'Test Address',
              contactPreference: 'phone'
            },
            profit: testListing.price * 2 * 0.9
          },
          {
            _id: testListing2._id,
            name: testListing2.name,
            price: testListing2.price,
            quantity: 3,
            type: testListing2.type,
            sellerInfo: {
              username: testSeller.username,
              email: testSeller.email,
              phoneNumber: '123-456-7890',
              city: 'Test City',
              district: 'Test District',
              address: 'Test Address',
              contactPreference: 'phone'
            },
            profit: testListing2.price * 3 * 0.9
          }
        ],
        customerInfo: global.testUtils.createTestOrder().customerInfo,
        status: 'placed',
        totalPrice: (testListing.price * 2) + (testListing2.price * 3) + 85,
        cadreProfit: ((testListing.price * 2) + (testListing2.price * 3)) * 0.1,
        shipmentFees: 85
      };

      testOrder = await Order.create(orderData);

      // Update listing quantities to reflect the order
      await Listing.findByIdAndUpdate(testListing._id, {
        $inc: { currentQuantity: -2, soldQuantity: 2 }
      });
      await Listing.findByIdAndUpdate(testListing2._id, {
        $inc: { currentQuantity: -3, soldQuantity: 3 }
      });
    });

    test('should increase order item quantity when admin is authenticated', async () => {
      const itemToUpdate = testOrder.orderItems[1]; // testListing2 with more stock
      const newQuantity = 5; // Increase from 3 to 5

      const response = await request(app)
        .put(`/api/orders/${testOrder._id}/items/${itemToUpdate._id}/quantity`)
        .set('Cookie', [`access_token=${testAdminToken}`])
        .send({ newQuantity })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Order item quantity updated successfully');
      
      // Check that the order item quantity was updated
      const updatedItem = response.body.order.orderItems.find(item => 
        item._id.toString() === itemToUpdate._id.toString()
      );
      expect(updatedItem.quantity).toBe(newQuantity);

      // Check that listing quantities were updated correctly
      expect(response.body.listingStock.currentQuantity).toBe(3); // 8 - 2 additional = 6, but we started with 5 after initial order
      expect(response.body.listingStock.soldQuantity).toBe(7); // 2 + 3 + 2 additional = 7

      // Verify order totals were recalculated
      expect(response.body.order.totalPrice).toBeGreaterThan(testOrder.totalPrice);
    });

    test('should decrease order item quantity when admin is authenticated', async () => {
      const itemToUpdate = testOrder.orderItems[1]; // testListing2
      const newQuantity = 1; // Decrease from 3 to 1

      const response = await request(app)
        .put(`/api/orders/${testOrder._id}/items/${itemToUpdate._id}/quantity`)
        .set('Cookie', [`access_token=${testAdminToken}`])
        .send({ newQuantity })
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // Check that the order item quantity was updated
      const updatedItem = response.body.order.orderItems.find(item => 
        item._id.toString() === itemToUpdate._id.toString()
      );
      expect(updatedItem.quantity).toBe(newQuantity);

      // Check that listing quantities were updated correctly (2 items returned to stock)
      expect(response.body.listingStock.soldQuantity).toBe(3); // 5 - 2 returned = 3
    });

    test('should return error when insufficient stock for quantity increase', async () => {
      const itemToUpdate = testOrder.orderItems[1]; // testListing2
      const newQuantity = 20; // Try to increase beyond available stock

      const response = await request(app)
        .put(`/api/orders/${testOrder._id}/items/${itemToUpdate._id}/quantity`)
        .set('Cookie', [`access_token=${testAdminToken}`])
        .send({ newQuantity })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Not enough stock available');
    });

    test('should return error when non-admin tries to update quantity', async () => {
      const itemToUpdate = testOrder.orderItems[0];

      const response = await request(app)
        .put(`/api/orders/${testOrder._id}/items/${itemToUpdate._id}/quantity`)
        .set('Cookie', [`access_token=${testUserToken}`])
        .send({ newQuantity: 5 })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Admin access required');
    });

    test('should return error for invalid quantity', async () => {
      const itemToUpdate = testOrder.orderItems[0];

      const response = await request(app)
        .put(`/api/orders/${testOrder._id}/items/${itemToUpdate._id}/quantity`)
        .set('Cookie', [`access_token=${testAdminToken}`])
        .send({ newQuantity: 0 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('New quantity must be at least 1');
    });

    test('should return error for non-existent order', async () => {
      const fakeOrderId = 'CM9999';
      const itemId = testOrder.orderItems[0]._id;

      const response = await request(app)
        .put(`/api/orders/${fakeOrderId}/items/${itemId}/quantity`)
        .set('Cookie', [`access_token=${testAdminToken}`])
        .send({ newQuantity: 5 })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Order not found');
    });

    test('should return error for non-existent item', async () => {
      const fakeItemId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`/api/orders/${testOrder._id}/items/${fakeItemId}/quantity`)
        .set('Cookie', [`access_token=${testAdminToken}`])
        .send({ newQuantity: 5 })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Order item not found');
    });
  });
}); 