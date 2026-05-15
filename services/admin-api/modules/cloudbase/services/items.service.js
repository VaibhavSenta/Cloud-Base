const { ITEMLIST } = require('../models/central.models');
const mongoose = require('mongoose')



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
        .select('_id title slug description category hasMultipleFiles metadata thumbnail fileReferences originalFileDetails isReady isFeatured isActive views')
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




const linkFilesToItem = async (itemId, fileIdList,selectedFiles) => {
    try {
        // 1. Storage collection se in saari files ka poora data uthao
        // Hum 'fileId' (Drive ID) ke basis pe search kar rahe hain
        const storageFiles = await mongoose.connection.db.collection('storages')
            .find({ fileId: { $in: fileIdList } })
            .toArray();

        if (!storageFiles || storageFiles.length === 0) {
            throw new Error("Selected files not found in storage");
        }

        //  fileReferences ke liye zaroori details nikaalo
        const referencesToSave = storageFiles.map(file => ({
            fileId: file.fileId,
            uniqueName: file.uniqueName,
            originalName: file.originalName
        }));

        // 2. originalFileDetails array ke liye Storage ki 'originalFileDetails' filed ka array banao
        const detailsToSave = storageFiles.map(file => {
            return {
                ...file.originalFileDetails, 
                fileId: file.fileId
            };
        });

        // 3. ItemList ko update karo
        const result = await ITEMLIST.findByIdAndUpdate(
            itemId,
            {
                $addToSet: { 
                    // $each isliye taaki array ke saare elements check ho ke add hon
                    fileReferences: { $each: referencesToSave },
                    originalFileDetails: { $each: detailsToSave } 
                },
                $set: { 
                    isReady: true,
                    "metadata.fileList": selectedFiles
                }
            },
            { new: true }
        );

        return result;
    } catch (error) {
        throw error;
    }
};

const unlinkAllFiles = async (itemId) => {
    try {
        const result = await ITEMLIST.findByIdAndUpdate(
            itemId,
            {
                $set: {
                    fileReferences: [],
                    originalFileDetails: [],
                    isReady: false
                },
                $unset: {
                    // Isse metadata ke andar se sirf fileList field delete ho jayegi
                    "metadata.fileList": "" 
                }
            },
            { new: true }
        );

        if (!result) {
            throw new Error("Item not found");
        }

        return result;
    } catch (error) {
        throw error;
    }
};

const unlinkSelectedFiles = async (itemId, selectedFileIds) => {
    try {
        const result = await ITEMLIST.findByIdAndUpdate(
            itemId,
            {
                $pull: {
                    // FileReferences array se wo objects uda do jiniki fileId inme se koi ek hai
                    fileReferences: { fileId: { $in: selectedFileIds } },

                    // originalFileDetails array se wo objects uda do jiniki fileId inme se koi ek hai
                    originalFileDetails: { fileId: { $in: selectedFileIds } },

                    // 3. metadata.fileList se udaao (Dhyan rakhna yahan 'fileid' small hai frontend wale object mein)
                    "metadata.fileList": { fileid: { $in: selectedFileIds } }
                }
            },
            { new: true }
        );

        // If the array become empty, set isReady: false
        if (result && result.fileReferences.length === 0) {
            await ITEMLIST.findByIdAndUpdate(itemId, { $set: { isReady: false } });
        }

        return result;
    } catch (error) {
        throw error;
    }
};










module.exports = {
    createItemDetails,
    fetchItems,
    updateItemDetails,
    linkFilesToItem,
    unlinkAllFiles,
    unlinkSelectedFiles
};