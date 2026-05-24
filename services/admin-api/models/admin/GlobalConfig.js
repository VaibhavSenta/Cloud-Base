const mongoose = require('mongoose');

const globalConfigSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ADMIN'
    }
}, { timestamps: true });

const GLOBALCONFIG = mongoose.model('GLOBALCONFIG', globalConfigSchema);

module.exports = { GLOBALCONFIG };
