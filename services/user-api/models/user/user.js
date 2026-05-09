const mongoose = require('mongoose');

const useSchema = new mongoose.Schema({

    userName: {
        type: String,
        required: true,
        unique: true

    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    recoveryEmail: {
        type: String,
        required: false,
        default: 'not added',
        unique: false
    },
    password: {
        type: String,
        required: true

    },
    firstName: {
        type: String,
        required: false
        
    },
    lastName: {
        type: String,
        required: false

    },
    profilePic: {
        type: String,
        required: false,
        default: '../public//defaultLogos/DefaultProfilePic-90.png'
    },
    dob: {
        type: Date,
        required: false

    },
    gender: {
        type: String,
        required: false,
        enum: ['Male', 'Female', 'Other', 'Not selected'],
        default: 'Not selected'
    },
    countryCode: {
        type: String,
        required: false
    },
    phonenumber: {
        type: String,
        required: false,
        unique: true,
        default: null
    },
    accountStatus: {
        type: String,
        enum: ['active', 'deleted'],
        default: 'active'
    },

},{timestamps: true})



const USER = mongoose.model('USER',useSchema)


module.exports = {
    USER
}