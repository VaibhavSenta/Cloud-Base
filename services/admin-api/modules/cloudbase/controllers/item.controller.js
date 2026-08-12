/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
const itemService = require('../services/items.service'); // Path check kar lena
const { ITEMLIST } = require('../models/itemList')

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

// 4. LINK ITEM (Item details and filedetails from storage)
const linkItem = async (req, res, next) => {
    try {
        
        const { itemId, selectedFiles } = req.body;
        // console.log("BODY ::", req.body);

        if (!itemId || !selectedFiles || !Array.isArray(selectedFiles)) {
            return res.status(400).json({
                success: false,
                message: "Missing itemId or selectedFiles array"
            });
        }

        let selectedFilesIds = new Array();
        selectedFiles.forEach(element => {
            console.log(element.fileid);
            selectedFilesIds.push(element.fileid)
            
        });


        console.log("ARRAY ::", selectedFilesIds);
        
        const result = await itemService.linkFilesToItem(itemId, selectedFilesIds, selectedFiles)

        return res.status(200).json({
            success: true,
            message: "Files linked successfully to the item",
            // data: result
        });
        



    } catch (error) {
        console.error("Controller Error:", error.message);
        console.log(`
            ============ Controller Error ============ \n
            ${error}
            \n
            `);
        
        return res.status(500).json({ // For server error ususally 500
            success: false,
            message: error.message
        });
    }
}


const getItemDetails = async (req, res) => {
    try {
        const { slug } = req.params; // URL se ID uthayenge e.g., /items/:itemId

        const item = await ITEMLIST.findOne({slug: slug});

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Item not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: item // Isme fileReferences (objects) pehle se honge
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}











// 5. UNLINK ALL FILES  
const unlinkAllFiles = async (req, res, next) => {
    try {
        const { itemId } = req.body;

        if (!itemId) {
            return res.status(400).json({
                success: false,
                message: "itemId is required to unlink all files"
            });
        }

        const result = await itemService.unlinkAllFiles(itemId);

        return res.status(200).json({
            success: true,
            message: "All files unlinked and item cleaned up!",
            data: result
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};




// 6. UNLINK SELECTED FILES
const unlinkItemFile = async (req, res, next) => {
    try {
        const { itemId, selectedFileIds } = req.body;

        if (!itemId || !Array.isArray(selectedFileIds) || selectedFileIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "itemId and an array of fileIds are required"
            });
        }

        const result = await itemService.unlinkSelectedFiles(itemId, selectedFileIds);

        return res.status(200).json({
            success: true,
            message: "File unlinked successfully",
            data: result
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};









// 7. SOFT DELETE ITEM (Archive item) Toggle (Agar archived:true hai to false and false hai to true)
const archiveItem = async (req, res) => {
    try {
        const { slug } = req.params;

        const item = await ITEMLIST.findOne({slug: slug});
        if (!item) return res.status(404).json({ success: false, message: "Item not found" });

        // Seedha toggle aur safety ke liye isActive false agar archive ho raha hai
        const nextStatus = !item.isArchived;

        const result = await ITEMLIST.findOneAndUpdate(
            {slug: slug},
            { 
                $set: { 
                    isArchived: nextStatus,
                    isActive: nextStatus ? false : true
                } 
            },
            { new: true }
        );

        return res.status(200).json({ success: true, data: result });

    } catch (error) {
        
        console.log(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};






module.exports = {
    addItem,
    getItems,
    updateItem,
    linkItem,
    unlinkAllFiles,
    unlinkItemFile,
    getItemDetails,
    archiveItem
};