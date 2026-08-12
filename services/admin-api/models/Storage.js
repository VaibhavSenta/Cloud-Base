/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
const mongoose = require('mongoose');

const storageSchema = new mongoose.Schema({
    // Google Drive ki unique File ID
    fileId: {
        type: String,
        required: true,
        unique: true
    },
    // File ka original naam (upload ke waqt jo tha)
    originalName: {
        type: String,
        required: true
    },

    originalFileDetails: {
        type: Object,
        required: true
    },

    // Unique name jo humne Drive ke liye banaya (Timestamp ke saath)
    uniqueName: {
        type: String,
        required: true
    },
    // MimeType (e.g., video/mp4, image/png)
    mimeType: {
        type: String,
        required: true
    },
    // File size bytes mein (40GB ke liye ye Number hi rahega)
    size: {
        type: Number,
        required: true
    },
    // Konsa cloud provider use ho raha hai
    provider: {
        type: String,
        default: 'google-drive'
    },
    // Kis folder mein save hai (Drive Folder ID)
    parentFolderId: {
        type: String,
        required: true
    },
    // Kis admin ne upload kiya (Reference to Admin)
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    }
}, { timestamps: true });

// Indexing taaki search fast ho
storageSchema.index({ fileId: 1 });

const STORAGE = mongoose.model('STORAGE', storageSchema);
module.exports = {
    STORAGE
}