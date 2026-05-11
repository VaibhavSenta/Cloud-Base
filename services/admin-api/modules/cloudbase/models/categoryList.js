const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // e.g. "Movies"
    slug: { type: String, required: true, unique: true }, // e.g. "movies"
    description: { type: String }, 
    thumbnail: { type: String }, // Image path/URL
    isActive: { type: Boolean, default: true }
}, { timestamps: true });
const CATEGORYLIST = mongoose.model('CATEGORYLIST', categorySchema);

module.exports = {
    CATEGORYLIST
};