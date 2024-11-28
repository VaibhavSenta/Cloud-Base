const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    firstName: {
        type: 'string',
        required: true,
        unique: false
    },

    lastName: {
        type: 'string',
        required: true,
        unique: false
    },

    adminId: {
        type: 'string',
        unique: true,
        required: true,

    }
})


const ADMIN = mongoose.model('ADMIN',adminSchema)

module.exports = {
    ADMIN
}