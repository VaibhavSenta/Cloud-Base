// controllers/upload.controller.js
const Busboy = require('busboy');
const mongoose = require('mongoose');
const { uploadLargeFile } = require('../services/driveService');

const startUpload = (req, res) => {
    console.log(" ===== Upload controller ======");
    
    console.log(req.headers);
    

    console.log(" ===== Upload controller END ======");
    
    const busboy = Busboy({ headers: req.headers });
    const totalSize = req.headers['content-length']; // Total file size bytes mein
    let uploadedBytes = 0;

    busboy.on('file', async (fieldname, file, info) => {
        const { filename, mimeType } = info;

        console.log(`Uploading: ${filename}...`);

        // 1. Progress Monitor: Har chunk par bytes count karo
        file.on('data', (data) => {
            uploadedBytes += data.length;
            const progress = ((uploadedBytes / totalSize) * 100).toFixed(2);
            
            // Console par progress dikhega (Baad mein isse Socket.io se frontend bhej sakte ho)
            process.stdout.write(`\rUploading ${filename}: ${progress}% (${(uploadedBytes / (1024 * 1024)).toFixed(2)} MB)`);
        });
        

        try {
            // Seedha Drive service ko stream bhej do
            const driveResponse = await uploadLargeFile(file, {
                name: filename,
                mimeType: mimeType
            });

            console.log("Upload Finished:", driveResponse.id);
            
            if (driveResponse) {
                
                // Save file detailsmin 
                try {
                    console.log("FILE INFO FROM HEADERS   ::",info);
                    const storageCollection = mongoose.connection.db.collection('storages')
                        
                    const storageEntry = await storageCollection.insertOne({
                        fileId: driveResponse.id, // default by google drive
                        originalName: filename,
                        uniqueName: `${Date.now()}-${filename}`, // jo Collaction me uniq hoga
                        mimeType: mimeType,
                        size: parseInt(req.headers['content-length']), 
                        provider: 'google-drive',
                        parentFolderId: process.env.GOOGLE_DRIVE_FOLDER_ID,
                        originalFileDetails: info
                    });
                } catch (error) {
                    
                    console.error("Error saving file details in db :",error);
                    res.status(500).json({ success: false, message: err.message });
                }
                // Jab upload khatam ho jaye
                res.status(200).json({
                    success: true,
                    message: "File uploaded to Drive successfully!",
                    fileId: driveResponse.id,
                    details: driveResponse
                });
            }

        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    });

    req.pipe(busboy); // Request ka saara data busboy ko de do
};

module.exports = { startUpload };