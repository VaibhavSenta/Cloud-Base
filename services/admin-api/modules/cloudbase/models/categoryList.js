/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Category name is required"],
        unique: true, // Admin side handle karne ke liye unique zaroori hai
        trim: true,
        index: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        default: ""
    },
    thumbnail: {
        type: String, 
        default: "default-category.png"
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const CATEGORYLIST = mongoose.model('CATEGORYLIST', categorySchema);

module.exports = { 
    CATEGORYLIST
};