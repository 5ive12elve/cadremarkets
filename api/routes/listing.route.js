import express from 'express';
import { createListing, deleteListing, updateListing, getListing, getListings, updateListingStatus, getForSaleListings, updateListingQuantities, getAllListingsForBackOffice, getClothingSizes, getListingStatistics} from '../controllers/listing.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
import { verifyBackOfficeToken } from '../utils/verifyBackOfficeUser.js';
import { errorHandler } from '../utils/error.js';
import Listing from '../models/listing.model.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
});

const router = express.Router();

// Image upload endpoint for listings
router.post('/upload/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Create uploads directory if it doesn't exist
    const fs = await import('fs/promises');
    const uploadsDir = path.join(process.cwd(), 'server/public/uploads/listings');
    await fs.mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const filename = `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const filepath = path.join(uploadsDir, filename);

    // Write file to disk
    await fs.writeFile(filepath, req.file.buffer);

    // Return the URL path that will be accessible from the frontend
    const url = `/uploads/listings/${filename}`;
    
    res.json({ 
      success: true, 
      url: url,
      message: 'Image uploaded successfully' 
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload image', 
      details: error.message 
    });
  }
});

// Profile picture upload endpoint
router.post('/upload/profile', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Create uploads directory if it doesn't exist
    const fs = await import('fs/promises');
    const uploadsDir = path.join(process.cwd(), 'server/public/uploads/profiles');
    await fs.mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const filename = `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const filepath = path.join(uploadsDir, filename);

    // Write file to disk
    await fs.writeFile(filepath, req.file.buffer);

    // Return the URL path that will be accessible from the frontend
    const url = `/uploads/profiles/${filename}`;
    
    res.json({ 
      success: true, 
      url: url,
      message: 'Profile picture uploaded successfully' 
    });
  } catch (error) {
    console.error('Profile picture upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload profile picture', 
      details: error.message 
    });
  }
});

/**
 * @swagger
 * /api/listing/create:
 *   post:
 *     summary: Create a new listing
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - address
 *               - phoneNumber
 *               - city
 *               - type
 *               - dimensions
 *               - width
 *               - height
 *               - price
 *               - contactPreference
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 4
 *                 maxLength: 62
 *               description:
 *                 type: string
 *               address:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *                 pattern: '^\d{10,15}$'
 *               city:
 *                 type: string
 *               district:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [Paintings & Drawings, Sculptures & 3D Art, Antiques & Collectibles, Clothing & Wearables, Home Décor, Accessories, Prints & Posters]
 *               dimensions:
 *                 type: string
 *                 enum: [2D, 3D]
 *                 description: Required for non-clothing items
 *               width:
 *                 type: number
 *                 minimum: 1
 *                 description: Required for non-clothing items
 *               height:
 *                 type: number
 *                 minimum: 1
 *                 description: Required for non-clothing items
 *               depth:
 *                 type: number
 *                 minimum: 1
 *                 description: Required for 3D non-clothing items
 *               availableSizes:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [XS, S, M, L, XL, XXL, XXXL, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, One Size]
 *                 description: Required for clothing items only
 *                 minItems: 1
 *                 maxItems: 10
 *               price:
 *                 type: number
 *                 minimum: 1000
 *               contactPreference:
 *                 type: string
 *                 enum: [Phone Number, Email]
 *               imageUrls:
 *                 type: array
 *                 items:
 *                   type: string
 *                 maxItems: 6
 *     responses:
 *       201:
 *         description: Listing created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.post('/create', verifyToken, createListing);

/**
 * @swagger
 * /api/listing/delete/{id}:
 *   delete:
 *     summary: Delete a listing
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The listing ID
 *     responses:
 *       200:
 *         description: Listing deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Listing not found
 */
// Note: This route supports both regular user access and back office admin access
router.delete('/delete/:id', (req, res, next) => {
  // Check if this is a back office request
  const backofficeToken = req.cookies.backoffice_token;
  const accessToken = req.cookies.access_token;
  
  if (backofficeToken) {
    // Use back office authentication for admin access
    verifyBackOfficeToken(req, res, next);
  } else if (accessToken) {
    // Use regular user authentication
    verifyToken(req, res, next);
  } else {
    return next(errorHandler(401, 'Unauthorized'));
  }
}, deleteListing);

/**
 * @swagger
 * /api/listing/update/{id}:
 *   post:
 *     summary: Update a listing
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The listing ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               imageUrls:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Listing updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Listing not found
 */
router.post('/update/:id', verifyToken, updateListing);

/**
 * @swagger
 * /api/listing/get/{id}:
 *   get:
 *     summary: Get a specific listing
 *     tags: [Listings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The listing ID
 *     responses:
 *       200:
 *         description: Returns the listing
 *       404:
 *         description: Listing not found
 */
router.get('/get/:id', getListing);

/**
 * @swagger
 * /api/listing/get:
 *   get:
 *     summary: Get all listings with filters
 *     tags: [Listings]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 9
 *         description: Number of listings to return
 *       - in: query
 *         name: startIndex
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Starting index for pagination
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by listing type
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *         description: Search term for listing name
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Returns a list of listings
 */
router.get('/get', getListings);

/**
 * @swagger
 * /api/listing/getForSale:
 *   get:
 *     summary: Get listings that are for sale
 *     tags: [Listings]
 *     responses:
 *       200:
 *         description: Returns a list of listings for sale
 */
router.get('/getForSale', getForSaleListings);

/**
 * @swagger
 * /api/listing/{id}/quantity:
 *   put:
 *     summary: Update listing quantities
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The listing ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentQuantity
 *               - soldQuantity
 *             properties:
 *               currentQuantity:
 *                 type: number
 *                 description: The new current quantity
 *               soldQuantity:
 *                 type: number
 *                 description: The new sold quantity
 *     responses:
 *       200:
 *         description: Quantities updated successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Listing not found
 */
router.put('/:id/quantity', updateListingQuantities);

/**
 * @swagger
 * /api/listing/{id}/status:
 *   put:
 *     summary: Update listing status
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The listing ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Active, Pending, Sold, Cancelled]
 *     responses:
 *       200:
 *         description: Listing status updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Listing not found
 */
// Note: This route supports both regular user access and back office admin access
router.put('/:id/status', (req, res, next) => {
  // Check if this is a back office request
  const backofficeToken = req.cookies.backoffice_token;
  const accessToken = req.cookies.access_token;
  
  if (backofficeToken) {
    // Use back office authentication for admin access
    verifyBackOfficeToken(req, res, next);
  } else if (accessToken) {
    // Use regular user authentication
    verifyToken(req, res, next);
  } else {
    return next(errorHandler(401, 'Unauthorized'));
  }
}, updateListingStatus);

/**
 * @swagger
 * /api/listing/{id}/buy:
 *   put:
 *     summary: Mark a listing as sold
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The listing ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - buyerId
 *             properties:
 *               buyerId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Listing marked as sold successfully
 *       400:
 *         description: Listing already sold
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Listing not found
 */
router.put('/:id/buy', verifyToken, async (req, res) => {
  const { buyerId } = req.body;

  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.status === 'Sold') return res.status(400).json({ message: 'Listing already sold' });

    listing.status = 'Sold';
    listing.buyer = buyerId;
    await listing.save();

    res.status(200).json({ message: 'Listing purchased successfully', listing });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

/**
 * @swagger
 * /api/listing/backoffice/all:
 *   get:
 *     summary: Get all listings for back office (no status filtering)
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Number of listings to return
 *       - in: query
 *         name: startIndex
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Starting index for pagination
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by listing status (optional)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by listing type
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *         description: Search term for listing name
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Returns a list of all listings
 *       401:
 *         description: Unauthorized
 */
router.get('/backoffice/all', getAllListingsForBackOffice);

/**
 * @swagger
 * /api/listing/clothing/sizes:
 *   get:
 *     summary: Get available clothing sizes
 *     tags: [Listings]
 *     responses:
 *       200:
 *         description: Returns a list of available clothing sizes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 sizes:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "32", "34", "36", "38", "40", "42", "44", "46", "48", "50", "One Size"]
 *                 message:
 *                   type: string
 */
router.get('/clothing/sizes', getClothingSizes);

/**
 * @swagger
 * /api/listing/backoffice/statistics:
 *   get:
 *     summary: Get listing statistics for back office dashboard
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days for trend calculation
 *     responses:
 *       200:
 *         description: Returns comprehensive listing statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 overview:
 *                   type: object
 *                   properties:
 *                     totalListings:
 *                       type: number
 *                     totalValue:
 *                       type: number
 *                     totalCadreRevenue:
 *                       type: number
 *                     averagePrice:
 *                       type: number
 *                     activeCount:
 *                       type: number
 *                     inactiveCount:
 *                       type: number
 *                     activePercentage:
 *                       type: number
 *                 distributions:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: object
 *                     category:
 *                       type: object
 *                     geographic:
 *                       type: object
 *                     listingType:
 *                       type: object
 *                     priceRanges:
 *                       type: object
 *                 trends:
 *                   type: object
 *                   properties:
 *                     listingGrowth:
 *                       type: object
 *                     valueGrowth:
 *                       type: object
 *       401:
 *         description: Unauthorized
 */
router.get('/backoffice/statistics', getListingStatistics);

export default router;