/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
const { google } = require('googleapis');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

let drive = null;

// Initialize OAuth2 Client and Google Drive service
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_REFRESH_TOKEN) {
  try {
    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({ 
      refresh_token: GOOGLE_REFRESH_TOKEN 
    });

    drive = google.drive({ 
      version: 'v3', 
      auth: oauth2Client 
    });
    console.log('✅ Google Drive service configured successfully.');
  } catch (error) {
    console.error('❌ Failed to initialize Google Drive service:', error.message);
  }
} else {
  console.warn('⚠️ Google Drive credentials missing in environment variables. File uploads will fallback to local storage.');
}

module.exports = { drive, GOOGLE_DRIVE_FOLDER_ID };
