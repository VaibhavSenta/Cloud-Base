// services/driveService.js
const { drive } = require('../config/googleConfig');

const uploadLargeFile = async (fileStream, fileMetadata) => {
    try {
        console.log(` ==== Google Drive Serrvices =======`);
        // 1. Google Drive ko batana ki hum file bhej rahe hain

        // console.log("BODY ::", fileMetadata);
        
        

        const uniqueName = `${Date.now()}-${fileMetadata.name}`;
        const response = await drive.files.create({
            requestBody: {
                name: uniqueName,
                parents: [process.env.GOOGLE_DRIVE_FOLDER_ID], // Wahi folder jo tune banaya
                mimeType: fileMetadata.mimeType
            },
            media: {
                mimeType: fileMetadata.mimeType,
                body: fileStream, // Ye hamara 'Pipe' hai jahan se data behta rahega
            },
            // 'resumable: true' sabse important hai badi files ke liye
            options: {
                resumable: true,
            },
        });

        return response.data; // Isme File ID aur details hongi
    } catch (error) {
        console.error("Drive Upload Error:", error);
        throw error;
    }
};

module.exports = { uploadLargeFile };