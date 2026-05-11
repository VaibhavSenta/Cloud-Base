const {CATEGORYLIST} = require('../models/central.models'); // Path check kar lena
const slugify = require('slugify'); 

// 1. Add New Category
const addCategory = async (req, res, next) => {



    try {
        const { name, description, thumbnail } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: "Category name is required" });
        }

        // Slug generater
        const slug = slugify(name, { lower: true, strict: true });

        // Check if category already exists
        const existingCategory = await CATEGORYLIST.findById({name})
        if (existingCategory) {
            return res.status(400).json({ success: false, message: "Category already exists" });
        }

        const newCategory = new Category({
            name,
            slug,
            description,
            thumbnail,
            isActive: true
        });

        await newCategory.save();

        res.status(201).json({
            success: true,
            message: "Category added successfully",
            data: newCategory
        });
    } catch (error) {
        next(error);
    }
};

// 2. Get All Categories (For Admin/User Side)
const getAllCategories = async (req, res, next) => {
    try {
        // Hum yahan filter bhi laga sakte hain agar sirf active chahiye
        const categories = await Category.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        next(error);
    }
};

// 3. Update Category
const updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, thumbnail, isActive } = req.body;

        let updateData = { description, thumbnail, isActive };

        // Agar name change ho raha hai toh slug bhi update hoga
        if (name) {
            updateData.name = name;
            updateData.slug = slugify(name, { lower: true, strict: true });
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: updatedCategory
        });
    } catch (error) {
        next(error);
    }
};

// 4. Delete Category
const deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;

        const category = await Category.findByIdAndDelete(id);

        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    addCategory,
    getAllCategories,
    updateCategory,
    deleteCategory
};