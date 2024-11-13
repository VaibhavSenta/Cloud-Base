const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({


    title: {
        type: String,
        required: true,
        unique: true
    },
    ucbid: {
        type: String,
        required: false,
        unique: true
    },
    description:{
        type: String,
        required: false,
        default: '',
    },
    releaseDate: {
        type: String,
        required: false,
        default: 'Not Available'

    },
    cast: {
        type: Array,
        required: false,
        default: []
    },
    searchCatagory: {
        type: Array,
        required: false,
        default: []
    },
    director: {
        type: String,
        required: false,
        default: 'Detail, not available'
    },
    duration: {
        type: String,
        required: false,
        default: 'Detail not available',
        maxlength: 100,
        minlength: 1
    },
    size: {
        type: String,
        required: false,
        default: 'Detail not available'
        
    },
    originalFileData: {
        type: Object,
        required: false,
        default:{}
    },
    releasedInCountry: {
        type: String,
        required: false,
        default: 'Detail not available'
    },
    audioTrack: {
        type: Array,
        required: false,
        default: []
    },
    subtitleTrack: {
        type: Array,
        required: false,
        default: []
    },
    resolutions:{
        type: Array,
        required: false,
        default: []
    },
    poster: {
        type: String,
        required: false,
        default: '../public/defaultLogos/Poster_Not_Available2.jpeg'
    },
    trailer: {
        type: String,
        required: false,
        default: ''
    },
    databasepath: {
        type: String,
        required: false,
        default: ''
    },
    uploadedBy: {
        type: String,
        required: false,
        default: 'Unknown'
    },
    totalVisis: {
        type: Number,
        required: false,
        default: 0
    },
    totalRatings: {
        type: Number,
        required: false,
        default: 0
    },
    totalDownloads: {
        type: Number,
        required: false,
        default: 0
    },
    totalStreams: {
        type: Number,
        required: false,
        default: 0
    }


},{timestamps: true})

const MOVIE = mongoose.model('MOVIE',movieSchema)

module.exports = {
    MOVIE
}