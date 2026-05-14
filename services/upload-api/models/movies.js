const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({


},{timestamps: true})

const MOVIE = mongoose.model('MOVIE',movieSchema)

module.exports = {
    MOVIE
}