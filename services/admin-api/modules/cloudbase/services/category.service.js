const { CATEGORYLIST } = require('../models/central.models');
const slugify = require('slugify');


//  1. Create Category

const createCategory = async (categoryData) => {
    const { name, description, thumbnail } = categoryData;

    //  Generate slug 
    const slug = slugify(name, { lower: true, strict: true });

    // Check duplicate 
    const existingCategory = await CATEGORYLIST.findOne({ name });
    if (existingCategory) {
        const error = new Error("Category name already exists");
        error.statusCode = 400; // Global handler ise pakad lega
        throw error;
    }

    const newCategory = new CATEGORYLIST({
        name,
        slug,
        description,
        thumbnail
    });

    return await newCategory.save();
};


// 2. Fetch Categories 

const fetchAllCategories = async () => {
    return await CATEGORYLIST.find().sort({ createdAt: -1 });
};


// 3. Update Category

const updateCategoryById = async (id, updateData) => {
    // Agar name update ho raha hai toh naya slug bhi banana padega
    if (updateData.name) {
        updateData.slug = slugify(updateData.name, { lower: true, strict: true });
    }

    return await CATEGORYLIST.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
    );
};

module.exports = {
    createCategory,
    fetchAllCategories,
    updateCategoryById
};