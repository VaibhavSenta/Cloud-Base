const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({


    title: {
        type: String,
        required: true,
        unique: true
    },
    ucbid: {
        type: String,
        required: true,
        unique: true
    },
    description:{
        type: String,
        required: true,
        default: '',
        maxlength: 1000,
        minlength: 10
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
        type: String,
        required: false,
        default: ''
    },
    Director: {
        type: String,
        required: false,
        default: 'Detail, not available',
        maxlength: 100,
        minlength: 1
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
    releasedInCountry: {
        type: String,
        required: false,
        default: 'Detail not available',
        maxlength: 100,
        minlength: 1
    },
    audioTrack: {
        type: Array,
        required: false,
        default: [],
        maxlength: 100,
        minlength: 1,
    },
    subtitleTrack: {
        type: Array,
        required: false,
        default: [],
        maxlength: 100,
        minlength: 1,
    },
    resolutions:{
        type: Array,
        required: false,
        default: [],
        maxlength: 100,
        minlength: 1,
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
    uploadedOnSiteAt: {
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