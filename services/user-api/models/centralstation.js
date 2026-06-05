const mongoose = require('mongoose');

// Shared Ecosystem Models (from local package)
const { USER, MANAGEDAPP, AUDITLOG } = require('schema-package');

// Local Models for User API (Movies, Games, etc.)
// Note: We use the shared categories from the central station database
const categorySchema = new mongoose.Schema({
    name: String,
    thubnailsurl: String,
    status: { type: String, default: 'active' }
});

const movieSchema = new mongoose.Schema({
    title: String,
    description: String,
    thumbnail: String,
    url: String,
    category: String,
    rating: Number,
    year: String,
}, { timestamps: true });

const CATEGORY = mongoose.models.CATEGORIES || mongoose.model('CATEGORIES', categorySchema);
const MOVIE = mongoose.models.MOVIES || mongoose.model('MOVIES', movieSchema);

module.exports = {
  USER,
  MANAGEDAPP,
  AUDITLOG,
  CATEGORY,
  MOVIE
};
