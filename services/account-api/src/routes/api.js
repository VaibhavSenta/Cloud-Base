const express = require('express');
const router = express.Router();
const authRoutes = require('../features/auth/auth.routes');

// Route management
router.use('/auth', authRoutes);

// More features can be added here like:
// router.use('/profile', profileRoutes);

module.exports = router;
