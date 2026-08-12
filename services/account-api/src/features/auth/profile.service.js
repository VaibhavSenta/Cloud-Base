/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
const { USER } = require('./auth.model');
const { firebaseAdminActive, admin } = require('../../common/config/firebaseAdmin');

/**
 * PROFILE SERVICE
 * Handles updating user information.
 */
const updateProfile = async (userId, updateData) => {
  const allowedFields = ['userName', 'firstName', 'lastName', 'dob', 'gender', 'countryCode', 'phonenumber', 'profilePic', 'recoveryEmail'];
  const filteredUpdate = {};
  
  Object.keys(updateData).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredUpdate[key] = updateData[key];
    }
  });

  // Verify Firebase Phone Token if phone number is being updated
  if (filteredUpdate.phonenumber) {
    const allowedRegions = ['+91'];
    const isAllowed = allowedRegions.some(reg => filteredUpdate.phonenumber.startsWith(reg));
    if (!isAllowed) {
      console.warn(`⚠️ [REGIONAL LIMIT EXCEEDED] Phone ${filteredUpdate.phonenumber} is not in Firebase allowed regions (+91).`);
      throw new Error('UNSUPPORTED_REGION');
    }

    const firebaseToken = updateData.firebaseToken;
    if (firebaseAdminActive) {
      if (!firebaseToken) {
        throw new Error('Verification token is required to update phone number');
      }
      try {
        const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
        if (decodedToken.phone_number !== filteredUpdate.phonenumber) {
          throw new Error('Verification token phone number mismatch');
        }
        console.log('✅ Phone number verified securely via Firebase Admin.');
      } catch (err) {
        console.error('❌ Firebase Phone Auth Verification failed:', err.message);
        throw new Error('Phone number verification failed: ' + err.message);
      }
    } else {
      console.log('ℹ️  Skipping backend token verification (firebaseAdminActive is false). saving phonenumber...');
    }
  }

  // Intercept base64 profile picture and save it
  if (filteredUpdate.profilePic && filteredUpdate.profilePic.startsWith('data:image/')) {
    const base64Data = filteredUpdate.profilePic;
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const mimeType = matches[1];
      const extension = mimeType.split('/')[1] || 'png';
      let fileBuffer = Buffer.from(matches[2], 'base64');
      
      // Sanitize and compress the image to a fixed 300x300 size using sharp (strips EXIF & malware payloads)
      const sharp = require('sharp');
      try {
        fileBuffer = await sharp(fileBuffer)
          .resize(300, 300, { fit: 'cover' })
          .png({ quality: 85, compressionLevel: 8 })
          .toBuffer();
      } catch (sharpErr) {
        console.error("⚠️ Sharp image processing failed:", sharpErr.message);
        throw new Error("Invalid image format or corrupted file");
      }

      const filename = `profile_${userId}_${Date.now()}.${extension}`;
      const { drive } = require('../../common/config/googleDrive');
      
      if (drive) {
        try {
          const { uploadToDrive } = require('./drive.service');
          const publicUrl = await uploadToDrive(fileBuffer, filename, mimeType, userId);
          
          // Clean up previous local custom profile picture if it existed
          const user = await USER.findById(userId);
          if (user && user.profilePic && user.profilePic.startsWith('/uploads/profile_')) {
            const fs = require('fs');
            const path = require('path');
            const oldFile = path.join(__dirname, '../../../public', user.profilePic);
            if (fs.existsSync(oldFile)) {
              try {
                fs.unlinkSync(oldFile);
              } catch (err) {
                console.error("Failed to delete old avatar file:", err.message);
              }
            }
          }
          
          filteredUpdate.profilePic = publicUrl;
        } catch (driveErr) {
          console.error("⚠️ Google Drive upload failed, falling back to local storage:", driveErr.message);
          // Fallback to local storage on Drive failure
          const fs = require('fs');
          const path = require('path');
          const uploadDir = path.join(__dirname, '../../../public/uploads');
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          
          // Encrypt fileBuffer before saving to local disk
          const crypto = require('crypto');
          const { deriveKeyAndIv } = require('./drive.service');
          const { key, iv } = deriveKeyAndIv(userId);
          const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
          const encryptedBuffer = Buffer.concat([cipher.update(fileBuffer), cipher.final()]);

          const filePath = path.join(uploadDir, filename);
          fs.writeFileSync(filePath, encryptedBuffer);
          filteredUpdate.profilePic = `/uploads/${filename}`;
        }
      } else {
        // Local storage standard fallback
        const fs = require('fs');
        const path = require('path');
        
        const uploadDir = path.join(__dirname, '../../../public/uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        // Encrypt fileBuffer before saving to local disk
        const crypto = require('crypto');
        const { deriveKeyAndIv } = require('./drive.service');
        const { key, iv } = deriveKeyAndIv(userId);
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        const encryptedBuffer = Buffer.concat([cipher.update(fileBuffer), cipher.final()]);

        const filePath = path.join(uploadDir, filename);
        fs.writeFileSync(filePath, encryptedBuffer);
        
        // Clean up previous custom profile picture if it exists
        const user = await USER.findById(userId);
        if (user && user.profilePic && user.profilePic.startsWith('/uploads/profile_')) {
          const oldFile = path.join(__dirname, '../../../public', user.profilePic);
          if (fs.existsSync(oldFile)) {
            try {
              fs.unlinkSync(oldFile);
            } catch (err) {
              console.error("Failed to delete old avatar file:", err.message);
            }
          }
        }
        
        filteredUpdate.profilePic = `/uploads/${filename}`;
      }
    }
  }

  if (Object.keys(filteredUpdate).length === 0) {
    throw new Error('No valid fields provided for update');
  }

  try {
    const updatedUser = await USER.findByIdAndUpdate(
      userId,
      { $set: filteredUpdate },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      throw new Error('User not found');
    }

    return updatedUser;
  } catch (err) {
    if (err.code === 11000 || err.message.includes('E11000')) {
      throw new Error('Username is already taken');
    }
    throw err;
  }
};

const deactivateAccount = async (userId, password) => {
  const bcrypt = require('bcryptjs');
  const user = await USER.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Incorrect password');
  }

  user.accountStatus = 'deactivated';
  user.sessions = []; // Terminate all sessions
  await user.save();

  return { success: true };
};

const deleteAccount = async (userId, password) => {
  const bcrypt = require('bcryptjs');
  const user = await USER.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Incorrect password');
  }

  user.accountStatus = 'scheduled_deletion';
  user.deletionDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days grace period
  user.sessions = []; // Terminate all sessions
  await user.save();

  return { success: true, deletionDate: user.deletionDate };
};

const reactivateAccount = async (email, password) => {
  const bcrypt = require('bcryptjs');
  const user = await USER.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new Error('User not found');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Incorrect password');
  }

  if (user.accountStatus !== 'scheduled_deletion') {
    throw new Error('Account is not scheduled for deletion');
  }

  user.accountStatus = 'active';
  user.deletionDate = undefined;
  await user.save();

  return user;
};

module.exports = {
  updateProfile,
  deactivateAccount,
  deleteAccount,
  reactivateAccount
};
