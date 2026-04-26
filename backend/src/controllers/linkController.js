const Link = require('../models/Link');

// -------------------------------------------------------
// @desc    Get all active links (with optional filters)
// @route   GET /api/links
// @access  Public
// -------------------------------------------------------
const getAllLinks = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (category) {
      filter.category = category;
    }

    // Text search across title and description
    if (search) {
      filter.$text = { $search: search };
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [links, total] = await Promise.all([
      Link.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Link.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        links,
      },
    });
  } catch (error) {
    next(error);
  }
};

// -------------------------------------------------------
// @desc    Get a single link by ID
// @route   GET /api/links/:id
// @access  Public
// -------------------------------------------------------
const getLinkById = async (req, res, next) => {
  try {
    const link = await Link.findById(req.params.id);

    if (!link || !link.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Link not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: { link },
    });
  } catch (error) {
    next(error);
  }
};

// -------------------------------------------------------
// @desc    Get all available categories
// @route   GET /api/links/categories
// @access  Public
// -------------------------------------------------------
const getCategories = async (req, res, next) => {
  try {
    const categories = Link.getCategories();

    res.status(200).json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
};

// -------------------------------------------------------
// @desc    Create a new link
// @route   POST /api/links
// @access  Private (Admin only)
// -------------------------------------------------------
const createLink = async (req, res, next) => {
  try {
    const { title, url, category, description } = req.body;

    const link = await Link.create({ title, url, category, description });

    res.status(201).json({
      success: true,
      message: 'Link created successfully.',
      data: { link },
    });
  } catch (error) {
    // Mongoose validation errors (e.g., invalid URL, bad category)
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(422).json({
        success: false,
        message: 'Validation failed.',
        errors: messages,
      });
    }
    next(error);
  }
};

// -------------------------------------------------------
// @desc    Update an existing link
// @route   PUT /api/links/:id
// @access  Private (Admin only)
// -------------------------------------------------------
const updateLink = async (req, res, next) => {
  try {
    const { title, url, category, description, isActive } = req.body;

    // Build update payload from only provided fields
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (url !== undefined) updateData.url = url;
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    const link = await Link.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,           // Return the updated document
        runValidators: true, // Run schema validators on update
      }
    );

    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Link not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Link updated successfully.',
      data: { link },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(422).json({
        success: false,
        message: 'Validation failed.',
        errors: messages,
      });
    }
    next(error);
  }
};

// -------------------------------------------------------
// @desc    Delete a link (hard delete)
// @route   DELETE /api/links/:id
// @access  Private (Admin only)
// -------------------------------------------------------
const deleteLink = async (req, res, next) => {
  try {
    const link = await Link.findByIdAndDelete(req.params.id);

    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Link not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Link deleted successfully.',
      data: { deletedId: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllLinks,
  getLinkById,
  getCategories,
  createLink,
  updateLink,
  deleteLink,
};
