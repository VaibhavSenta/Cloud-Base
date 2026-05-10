const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({

    loginid: {
        type: String,
        required: true,
        unique: true

    },
    password: {
        type: String,
        required: true

    },
    

},{timestamps: true})



const ADMIN = mongoose.model('ADMIN',adminSchema)


module.exports = {
    ADMIN
}