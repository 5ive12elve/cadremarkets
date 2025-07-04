import swaggerJsdoc from 'swagger-jsdoc';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Cadre Markets API Documentation',
      version: '1.0.0',
      description: 'API documentation for Cadre Markets platform - A marketplace for art and collectibles',
      contact: {
        name: 'API Support',
        url: 'https://cadremarkets.com',
        email: 'support@cadremarkets.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.cadremarkets.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              example: 'john_doe'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com'
            },
            password: {
              type: 'string',
              format: 'password',
              example: '********'
            }
          }
        },
        Order: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: 'CM1001'
            },
            orderItems: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    example: 'Vintage Art Piece'
                  },
                  description: {
                    type: 'string',
                    example: 'Beautiful vintage art piece'
                  },
                  price: {
                    type: 'number',
                    example: 1500
                  },
                  sellerInfo: {
                    type: 'object',
                    properties: {
                      username: { type: 'string', example: 'artSeller' },
                      email: { type: 'string', example: 'seller@example.com' },
                      phoneNumber: { type: 'string', example: '+1234567890' },
                      city: { type: 'string', example: 'New York' },
                      district: { type: 'string', example: 'Manhattan' },
                      address: { type: 'string', example: '123 Art St' },
                      contactPreference: { type: 'string', example: 'email' }
                    }
                  },
                  profit: {
                    type: 'number',
                    example: 1350
                  },
                  _id: {
                    type: 'string',
                    example: '507f1f77bcf86cd799439011'
                  }
                }
              }
            },
            status: {
              type: 'string',
              enum: ['placed', 'ready for shipment', 'out for delivery', 'delivered', 'cancelled'],
              example: 'placed'
            },
            customerInfo: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'John Doe' },
                phoneNumber: { type: 'string', example: '+1234567890' },
                address: { type: 'string', example: '456 Customer St' },
                city: { type: 'string', example: 'New York' },
                district: { type: 'string', example: 'Brooklyn' },
                paymentMethod: {
                  type: 'string',
                  enum: ['cash', 'visa'],
                  example: 'cash'
                }
              }
            },
            shipmentFees: {
              type: 'number',
              example: 85
            },
            cadreFees: {
              type: 'number',
              example: 75
            },
            totalPrice: {
              type: 'number',
              example: 1660
            },
            cadreProfit: {
              type: 'number',
              example: 157.5
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-03-15T10:30:00Z'
            }
          }
        },
        BackOfficeUser: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              example: 'admin_user'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'admin@cadremarkets.com'
            },
            password: {
              type: 'string',
              format: 'password',
              example: '********'
            },
            role: {
              type: 'string',
              enum: ['admin', 'moderator', 'support'],
              example: 'admin'
            },
            permissions: {
              type: 'array',
              items: {
                type: 'string',
                enum: [
                  'manage_users',
                  'manage_listings',
                  'manage_orders',
                  'manage_services',
                  'manage_support'
                ]
              },
              example: ['manage_users', 'manage_listings']
            },
            lastLogin: {
              type: 'string',
              format: 'date-time',
              example: '2024-03-15T10:30:00Z'
            }
          }
        },
        Listing: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              example: 'Vintage Art Piece'
            },
            description: {
              type: 'string',
              example: 'Beautiful vintage art piece from the 1950s'
            },
            price: {
              type: 'number',
              example: 1500
            },
            type: {
              type: 'string',
              enum: ['Paintings & Drawings', 'Sculptures & 3D Art', 'Antiques & Collectibles', 'Clothing & Wearables', 'Home Décor', 'Accessories', 'Prints & Posters']
            }
          }
        },
        Project: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            title: {
              type: 'string',
              example: 'Art Gallery Website'
            },
            description: {
              type: 'string',
              example: 'Modern responsive website for an art gallery'
            },
            category: {
              type: 'string',
              example: 'Web Development'
            },
            imageUrls: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg']
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['React', 'Node.js', 'MongoDB']
            },
            budget: {
              type: 'number',
              example: 5000
            },
            timeline: {
              type: 'string',
              example: '3 months'
            },
            clientName: {
              type: 'string',
              example: 'Art Gallery Inc.'
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'draft', 'completed'],
              example: 'active'
            },
            featured: {
              type: 'boolean',
              example: false
            },
            createdBy: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-03-15T10:30:00Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-03-15T10:30:00Z'
            }
          }
        },
        SupportRequest: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            name: {
              type: 'string',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com'
            },
            phoneNumber: {
              type: 'string',
              example: '+1234567890'
            },
            subject: {
              type: 'string',
              example: 'Unable to access my account'
            },
            message: {
              type: 'string',
              example: 'I am having trouble accessing my account after password reset'
            },
            category: {
              type: 'string',
              enum: ['technical', 'billing', 'general', 'account', 'bug_report', 'feature_request'],
              example: 'account'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              example: 'medium'
            },
            status: {
              type: 'string',
              enum: ['open', 'in_progress', 'resolved', 'closed'],
              example: 'open'
            },
            assignedTo: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            adminNotes: {
              type: 'string',
              example: 'User confirmed identity via email'
            },
            resolution: {
              type: 'string',
              example: 'Account access restored after password reset'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-03-15T10:30:00Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-03-15T10:30:00Z'
            }
          }
        },
        Ticket: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            ticketNumber: {
              type: 'string',
              example: 'TK-2024-001'
            },
            subject: {
              type: 'string',
              example: 'Order delivery issue'
            },
            description: {
              type: 'string',
              example: 'My order was supposed to arrive yesterday but I have not received it yet'
            },
            category: {
              type: 'string',
              enum: ['technical', 'billing', 'account', 'order', 'refund', 'other'],
              example: 'order'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              example: 'medium'
            },
            status: {
              type: 'string',
              enum: ['open', 'in_progress', 'resolved', 'closed'],
              example: 'open'
            },
            submittedBy: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            assignedTo: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            attachments: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['https://example.com/receipt.pdf']
            },
            orderReference: {
              type: 'string',
              example: 'CM1001'
            },
            resolution: {
              type: 'string',
              example: 'Order was delayed due to weather. New delivery scheduled for tomorrow.'
            },
            adminNotes: {
              type: 'string',
              example: 'Contacted shipping company for update'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-03-15T10:30:00Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-03-15T10:30:00Z'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            code: {
              type: 'integer',
              example: 400
            },
            message: {
              type: 'string',
              example: 'Invalid input'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication endpoints'
      },
      {
        name: 'Back Office',
        description: 'Back office management endpoints'
      },
      {
        name: 'User',
        description: 'User management endpoints'
      },
      {
        name: 'Listings',
        description: 'Marketplace listing endpoints'
      },
      {
        name: 'Orders',
        description: 'Order management endpoints'
      },
      {
        name: 'Services',
        description: 'Service-related endpoints'
      },
      {
        name: 'Projects',
        description: 'Project portfolio endpoints'
      },
      {
        name: 'Support Requests',
        description: 'Customer support request endpoints'
      },
      {
        name: 'Customer Service Tickets',
        description: 'Customer service ticket management endpoints'
      }
    ]
  },
  apis: [
    join(__dirname, 'routes', '*.js'),
    join(__dirname, 'routes', 'auth.route.js'),
    join(__dirname, 'routes', 'user.route.js'),
    join(__dirname, 'routes', 'listing.route.js'),
    join(__dirname, 'routes', 'service.route.js'),
    join(__dirname, 'routes', 'order.route.js'),
    join(__dirname, 'routes', 'backOffice.route.js'),
    join(__dirname, 'routes', 'project.route.js'),
    join(__dirname, 'routes', 'supportRequest.route.js'),
    join(__dirname, 'routes', 'ticket.route.js')
  ]
};

export const specs = swaggerJsdoc(options); 