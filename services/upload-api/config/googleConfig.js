// config/googleConfig.js
const { google } = require('googleapis');

// 1. Google OAuth2 Client initialize karna
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    // process.env.GOOGLE_REDIRECT_URI || 'https://developers.google.com/oauthplayground'
    "https://developers.google.com/oauthplayground"
);

// 2. Refresh Token set karna (taaki login expire na ho)
oauth2Client.setCredentials({ 
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN 
});

// 3. Drive instance banana
const drive = google.drive({ 
    version: 'v3', 
    auth: oauth2Client 
});

module.exports = { drive };