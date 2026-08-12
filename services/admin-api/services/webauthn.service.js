/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
const {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
} = require('@simplewebauthn/server');
const { ADMIN } = require('../models/admin/admin');

const RP_ID = process.env.RP_ID || 'localhost';
const RP_NAME = 'CloudBase Admin Console';
const ORIGIN = process.env.ORIGIN || `http://${RP_ID}:3000`;

/**
 * Generate options for a user to register a new biometric credential
 */
async function getRegistrationOptions(adminId) {
    const user = await ADMIN.findById(adminId);
    if (!user) throw new Error('Admin not found');

    const options = await generateRegistrationOptions({
        rpName: RP_NAME,
        rpID: RP_ID,
        userID: new Uint8Array(Buffer.from(user._id.toString())), // v13 requires Uint8Array
        userName: user.loginid,
        userDisplayName: `${user.firstname} ${user.lastname}`,
        attestationType: 'none',
        excludeCredentials: (user.webauthnCredentials || []).map(cred => ({
            id: cred.credentialID.toString('base64url'), // Convert Buffer to Base64URL string
            type: 'public-key',
            transports: cred.transports,
        })),
        authenticatorSelection: {
            residentKey: 'preferred',
            userVerification: 'preferred',
            authenticatorAttachment: 'platform', // Fingerprint/FaceID on the device
        },
    });

    return options;
}

/**
 * Verify the registration response from the client
 */
async function verifyRegistration(adminId, body, expectedChallenge) {
    const user = await ADMIN.findById(adminId);
    if (!user) throw new Error('Admin not found');

    const verification = await verifyRegistrationResponse({
        response: body,
        expectedChallenge,
        expectedOrigin: ORIGIN,
        expectedRPID: RP_ID,
    });

    if (verification.verified && verification.registrationInfo) {
        const { credential } = verification.registrationInfo; // v13 uses .credential

        if (!user.webauthnCredentials) {
            user.webauthnCredentials = [];
        }

        user.webauthnCredentials.push({
            credentialID: Buffer.from(credential.id, 'base64url'),
            publicKey: Buffer.from(credential.publicKey),
            counter: credential.counter,
            transports: credential.transports,
        });

        await user.save();
    }

    return verification;
}

/**
 * Generate options for a user to authenticate via biometric
 */
async function getAuthenticationOptions(loginid) {
    const user = await ADMIN.findOne({ loginid });
    if (!user) throw new Error('Admin not found');

    const options = await generateAuthenticationOptions({
        rpID: RP_ID,
        allowCredentials: (user.webauthnCredentials || []).map(cred => ({
            id: cred.credentialID.toString('base64url'),
            type: 'public-key',
            transports: cred.transports,
        })),
        userVerification: 'preferred',
    });

    return options;
}

/**
 * Verify the authentication response from the client
 */
async function verifyAuthentication(loginid, body, expectedChallenge) {
    const user = await ADMIN.findOne({ loginid });
    if (!user) throw new Error('Admin not found');

    const dbCred = user.webauthnCredentials.find(cred => 
        cred.credentialID.toString('base64url') === body.id
    );

    if (!dbCred) throw new Error('Credential not found');

    const verification = await verifyAuthenticationResponse({
        response: body,
        expectedChallenge,
        expectedOrigin: ORIGIN,
        expectedRPID: RP_ID,
        credential: { // v13 uses credential instead of authenticator
            id: dbCred.credentialID.toString('base64url'),
            publicKey: new Uint8Array(dbCred.publicKey),
            counter: dbCred.counter,
        },
    });

    if (verification.verified) {
        dbCred.counter = verification.authenticationInfo.newCounter;
        await user.save();
    }

    return { verification, user };
}

module.exports = {
    getRegistrationOptions,
    verifyRegistration,
    getAuthenticationOptions,
    verifyAuthentication,
};
