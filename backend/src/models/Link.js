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

// السنين الدراسية المسموحة (نفس التي وضعناها في الـ Frontend)
const ACADEMIC_YEARS = [
  "الفرقة الأولى",
  "الفرقة الثانية",
  "الفرقة الثالثة",
  "الفرقة الرابعة",
  "عام / مشترك"
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
    // تم تحسين حقل السنة الدراسية هنا
    year: {
      type: String,
      required: [true, 'Academic year is required'], // رسالة خطأ واضحة
      enum: {
        values: ACADEMIC_YEARS, // تحديد القيم المسموحة فقط
        message: `Year must be one of: ${ACADEMIC_YEARS.join(', ')}`,
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
linkSchema.index({ year: 1 }); // تم إضافة Index للـ year لتسريع الفلترة
linkSchema.index({ title: 'text', description: 'text' }); // Text search index

// --- Static: expose allowed categories ---
linkSchema.statics.getCategories = function () {
  return CATEGORIES;
};

// إتاحة الوصول للسنين الدراسية أيضاً إذا احتجتها لاحقاً في الـ API
linkSchema.statics.getAcademicYears = function () {
  return ACADEMIC_YEARS;
};

const Link = mongoose.model('Link', linkSchema);

module.exports = Link;