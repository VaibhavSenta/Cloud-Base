/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({


},{timestamps: true})

const MOVIE = mongoose.model('MOVIE',movieSchema)

module.exports = {
    MOVIE
}