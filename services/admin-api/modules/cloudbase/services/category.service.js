const { name } = require('ejs');
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

const fetchAllCategories = async (page = 1, limit = 50) => {
    const skip = (page - 1) * limit;
    const total = await CATEGORYLIST.countDocuments(filter); // Frontend ko pagination dikhane ke liye total chahiye hoga

    const categories = await CATEGORYLIST.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
    

    return { categories, total, page, pages: Math.ceil(total / limit) };
};


// 3. Update Category

const updateCategoryById = async (id, updateData) => {
    // Agar name update ho raha hai toh naya slug bhi banana padega
    if (updateData.name) {
        updateData.slug = slugify(updateData.name, { lower: true, strict: true });
    }


    try {
        
        const result = await CATEGORYLIST.findOneAndUpdate(
            {name: id},
            { $set: updateData },
            { new: true, runValidators: true }
        );
        return result

    } catch (error) {
        console.log(`=============== Error in category.service.js   START ===============`);
        console.log(error);
        console.log(`=============== Error in category.service.js   END ===============`);
        
        throw error
    }
};

module.exports = {
    createCategory,
    fetchAllCategories,
    updateCategoryById
};