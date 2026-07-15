const { Readable } = require('stream');
const crypto = require('crypto');
const { drive, GOOGLE_DRIVE_FOLDER_ID } = require('../../common/config/googleDrive');

/**
 * Derives a user-specific 256-bit AES key and 16-byte IV deterministically.
 * @param {string} userId - The unique user ID database string.
 * @returns {{key: Buffer, iv: Buffer}} Derived key and initialization vector.
 */
const deriveKeyAndIv = (userId) => {
  const masterSecret = process.env.JWT_SECRET;
  if (!masterSecret) {
    throw new Error('Master secret (JWT_SECRET) is missing in environment variables.');
  }

  // Derive 32-byte key using HMAC-SHA256
  const key = crypto.createHmac('sha256', masterSecret)
    .update(userId.toString())
    .digest();

  // Derive 16-byte IV using HMAC-SHA256
  const iv = crypto.createHmac('sha256', masterSecret)
    .update(userId.toString() + '-avatar-iv')
    .digest()
    .slice(0, 16);

  return { key, iv };
};

/**
 * Encrypts a file buffer and uploads it to Google Drive.
 * @param {Buffer} fileBuffer - The binary buffer of the file.
 * @param {string} filename - The name of the file.
 * @param {string} mimeType - The mime type of the file.
 * @param {string} userId - The database user ID for deriving encryption key.
 * @returns {Promise<string>} The raw Google Drive link containing the file ID.
 */
const uploadToDrive = async (fileBuffer, filename, mimeType, userId) => {
  if (!drive) {
    throw new Error('Google Drive integration is not configured. Environment variables are missing.');
  }

  const uniqueName = `${Date.now()}-${filename}`;

  try {
    // 1. Derive user-specific key and encrypt buffer
    const { key, iv } = deriveKeyAndIv(userId);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const encryptedBuffer = Buffer.concat([cipher.update(fileBuffer), cipher.final()]);

    // Convert encrypted buffer to Readable stream
    const fileStream = Readable.from(encryptedBuffer);

    // 2. Upload file to Google Drive (keep it 100% private!)
    const response = await drive.files.create({
      requestBody: {
        name: uniqueName,
        parents: GOOGLE_DRIVE_FOLDER_ID ? [GOOGLE_DRIVE_FOLDER_ID] : [],
        mimeType: mimeType
      },
      media: {
        mimeType: mimeType,
        body: fileStream
      },
      options: {
        resumable: true
      }
    });

    const fileId = response.data.id;
    console.log(`✅ Encrypted file uploaded to Google Drive. File ID: ${fileId}`);

    // Note: We do NOT make the file public in Google Drive! It remains 100% PRIVATE.
    // The backend proxy will read it using service/OAuth credentials.

    // 3. Return the standard URL containing the file ID
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  } catch (error) {
    console.error('❌ Google Drive encrypted upload error:', error.message);
    throw new Error('Failed to upload file to Google Drive: ' + error.message);
  }
};

module.exports = { uploadToDrive, deriveKeyAndIv };
