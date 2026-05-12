const itemService = require('../services/items.service'); // Path check kar lena

// 1. ADD NEW ITEM (Step 1: Details Only)
const addItem = async (req, res) => {
    try {
        // title, category, description, metadata will com in req.body
        const item = await itemService.createItemDetails(req.body);
        
        res.status(201).json({
            success: true,
            message: "Item details added successfully. Pending file upload.",
            data: item
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// 2. LIST ITEMS (With Search & Pagination)
const getItems = async (req, res) => {
    try {
        // page, limit, search, etc. will be collected from req.query 
        const result = await itemService.fetchItems(req.query);
        
        res.status(200).json({
            success: true,
            ...result // contains items, total, currentPage, totalPages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 3. UPDATE ITEM (Step 2: File Linking or metadata update)
const updateItem = async (req, res) => {
    try {
        const { id } = req.params; // URL se ID uthayenge e.g., /update/:id
        
        const updatedItem = await itemService.updateItemDetails(id, req.body);
        
        res.status(200).json({
            success: true,
            message: "Item updated successfully",
            data: updatedItem
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    addItem,
    getItems,
    updateItem
};