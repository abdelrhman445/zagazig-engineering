const express = require('express');
const router = express.Router();
const {
  getAllLinks,
  getLinkById,
  getCategories,
  createLink,
  updateLink,
  deleteLink,
} = require('../controllers/linkController');
const { protect } = require('../middleware/authMiddleware');

// -------------------------------------------------------
// PUBLIC ROUTES (No authentication required)
// -------------------------------------------------------

// GET /api/links/categories  → List all available categories
// NOTE: This route must be defined BEFORE /:id to avoid "categories" being treated as an ID
router.get('/categories', getCategories);

// GET /api/links             → Get all links (supports ?category=&search=&page=&limit=)
router.get('/', getAllLinks);

// GET /api/links/:id         → Get a single link by its MongoDB ID
router.get('/:id', getLinkById);

// -------------------------------------------------------
// PROTECTED ROUTES (JWT required via authMiddleware)
// -------------------------------------------------------

// POST /api/links            → Create a new link
router.post('/', protect, createLink);

// PUT /api/links/:id         → Update an existing link
router.put('/:id', protect, updateLink);

// DELETE /api/links/:id      → Delete a link permanently
router.delete('/:id', protect, deleteLink);

module.exports = router;
