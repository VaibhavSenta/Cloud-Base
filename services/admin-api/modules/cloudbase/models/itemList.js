const mongoose = require('mongoose');
const { type } = require('os');

const itemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CATEGORYLIST',
        required: true
    },
    description: {
        type: String,
        trim: true,
        default: ""
    },
    hasMultipleFiles: {
        type: Boolean,
        default: false
    },
    thumbnail: {
        type: String, // Thumbnail image ka URL
        default: null
    },

    // fileIds of selected files from 'Storage'
    fileReferences: [ { 
        type: [mongoose.Schema.Types.Mixed],
        default: []
    } ],

    downloadUrl: {
        type: String, // Actual content/file ka link
        required: false,
        default: null
    },


    // FLEXIBLE METADATA: Dynamic fields will be here accordig to category
    metadata: {
        type: mongoose.Schema.Types.Mixed, 
        default: {}
    },
    
    // METADATA of original file caried with the file by default
    originalFileDetails: {
        type: [mongoose.Schema.Types.Mixed],
        default: [] 
    },

    // Esy for filer: It will becomes true when file will be uploade
    isReady: {
        type: Boolean,
        default: false
    },

    isFeatured: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isArchived: {
        type: Boolean,
        default: false
    },
    views: {
        type: Number,
        default: 0
    }
}, { 
    timestamps: true, // createdAt aur updatedAt automatic handle honge
    minimize: false
});


itemSchema.index({ title: 'text', slug: 1 });

const ITEMLIST = mongoose.model('ITEMLIST', itemSchema);

module.exports = {
    ITEMLIST
}