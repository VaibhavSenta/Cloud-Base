const { ITEMLIST } = require('../models/central.models');
const slugify = require('slugify');

const createItemDetails = async (itemData) => {
    try {
        // 1. Generat eslug
        const slug = slugify(itemData.title, { lower: true, strict: true });

        // 2. Create new item
        const newItem = new ITEMLIST({
            ...itemData,
            slug: slug
        });

        return await newItem.save();
    } catch (error) {
        // IF Duplicate Key error (e.g., same slug/title)
        if (error.code === 11000) {
            throw new Error("Item with this title already exists!");
        }
        // Other generic errors will be sent to the controller
        throw new Error("Error creating item: " + error.message);
    }
};

const fetchItems = async (query) => {
    try {
        const { page = 1, limit = 50, search = "", category, isReady, isActive } = query;
        let filter = {};

        if (search) filter.title = { $regex: search, $options: 'i' };
        if (category) filter.category = category;
        if (isReady !== undefined) filter.isReady = isReady === 'true';
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const items = await ITEMLIST.find(filter)
            .populate('category', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await ITEMLIST.countDocuments(filter);

        return {
            items,
            total,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit)
        };
    } catch (error) {
        throw new Error("Error fetching items: " + error.message);
    }
};

const updateItemDetails = async (id, updateData) => {
    try {
        if (updateData.title) {
            updateData.slug = slugify(updateData.title, { lower: true, strict: true });
        }

        const updatedItem = await ITEMLIST.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedItem) {
            throw new Error("Item not found to update!");
        }

        return updatedItem;
    } catch (error) {
        throw new Error("Error updating item: " + error.message);
    }
};

module.exports = {
    createItemDetails,
    fetchItems,
    updateItemDetails
};