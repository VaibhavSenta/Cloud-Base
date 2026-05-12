const categoryService = require('../services/category.service');

// 1. Add Category
const addCategory = async (req, res, next) => {
    try {
        const { name, description, thumbnail } = req.body;

        // [Controller Check]: Body validation 
        if (!name || name.trim() === "") {
            return res.status(400).json({ success: false, message: "Category name is required and cannot be empty" });
        }

        const category = await categoryService.createCategory(req.body);
        
        res.status(201).json({ 
            success: true, 
            message: "Category created successfully", 
            data: category 
        });
    } catch (error) {
        next(error);
    }
};

// 2. Get All
const getAllCategories = async (req, res, next) => {
    try {
        
        const categories = await categoryService.fetchAllCategories();
        
        res.status(200).json({ 
            success: true, 
            count: categories.length, 
            data: categories 
        });
    } catch (error) {
        next(error);
    }
};

// 3. Update
const updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;

        // [Controller Check]: ID check (Agar ID format hi galat hai)
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, message: "Invalid Category ID format" });
        }

        const updated = await categoryService.updateCategoryById(id, req.body);
        
        if (!updated) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
};



module.exports = {
    addCategory,
    getAllCategories,
    updateCategory
}