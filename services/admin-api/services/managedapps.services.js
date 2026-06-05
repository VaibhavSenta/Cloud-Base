const { MANAGEDAPP } = require('../models/centralstation');

async function addApp(allDetails) {
    const { title, name, userUrl, icon, description, port, updatedBy } = allDetails;
    const newApp = new MANAGEDAPP({ title, name, userUrl, icon, description, port, updatedBy });
    return await newApp.save();
}

async function getAllApps() {
    return await MANAGEDAPP.find({}).sort({ createdAt: -1 });
}

async function toggleMaintenance(id, updatedBy) {
    const app = await MANAGEDAPP.findById(id);
    if (!app) throw new Error("App infrastructure not found");
    
    // Toggle boolean status (make sure key matches your schema spelling)
    app.inMaintenance = !app.inMaintenance; 
    app.updatedBy = updatedBy;
    
    return await app.save();
}

async function updateApp(id, updateData) {
    return await MANAGEDAPP.findByIdAndUpdate(
        id, 
        { $set: updateData }, 
        { new: true, runValidators: true }
    );
}

async function getAppByName(name) {
    return await MANAGEDAPP.findOne({ name });
}

async function deleteApp(id) {
    return await MANAGEDAPP.findByIdAndDelete(id);
}

module.exports = { addApp, getAllApps, toggleMaintenance, updateApp, getAppByName, deleteApp };