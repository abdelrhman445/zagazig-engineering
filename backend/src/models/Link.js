const mongoose = require('mongoose');

// Supported categories for study material links
const CATEGORIES = [
  'Lectures',
  'Books',
  'Sheets',
  'Past Papers',
  'Summaries',
  'Projects',
  'Other',
];

// URL validation regex (supports http, https, ftp)
const URL_REGEX =
  /^(https?:\/\/)(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)$/;

const linkSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
      trim: true,
      validate: {
        validator: function (value) {
          return URL_REGEX.test(value);
        },
        message: (props) =>
          `"${props.value}" is not a valid URL. Must start with http:// or https://`,
      },
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: CATEGORIES,
        message: `Category must be one of: ${CATEGORIES.join(', ')}`,
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// --- Index for faster queries ---
linkSchema.index({ category: 1 });
linkSchema.index({ title: 'text', description: 'text' }); // Text search index

// --- Static: expose allowed categories ---
linkSchema.statics.getCategories = function () {
  return CATEGORIES;
};

const Link = mongoose.model('Link', linkSchema);

module.exports = Link;
