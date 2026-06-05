const { CATEGORY, MOVIE } = require('../models/centralstation');

/**
 * getHomeData - Fetches top categories and featured content
 */
const getHomeData = async (req, res, next) => {
    try {
        console.log("🏠 Home Data Request Received");
        
        // 1. Fetch Categories (with fallback to empty array)
        const categories = await CATEGORY.find({ status: "active" })
            .select('name thubnailsurl')
            .lean() || [];
        
        // 2. Fetch Featured Movies (with fallback to empty array)
        let featuredMovies = [];
        try {
            featuredMovies = await MOVIE.find()
                .limit(6)
                .sort({ createdAt: -1 })
                .lean() || [];
        } catch (mErr) {
            console.warn("⚠️ Movies collection might be empty or missing:", mErr.message);
        }

        return res.json({
            success: true,
            msg: "Welcome to CloudBase Hub",
            data: {
                categories,
                featuredMovies
            }
        });
    } catch (error) {
        console.error("❌ Home Controller Error:", error.message);
        next(error);
    }
};

module.exports = {
    getHomeData
};
