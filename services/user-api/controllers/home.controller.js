const { name } = require('ejs');
const mongoose = require('mongoose');


async function getHomeData(req, res, next) {
    // fatch require data for home
    try {
        const categories = await mongoose.connection.db.collection('categories')
        .find({status: "active"}).project({
            _id: 0,
            name: 1,
            thubnailsurl: 1
        }).toArray();
    
        return res.json({
            msg: "Accessed home route",
            categories: categories
        })
    } catch (error) {
        console.error(error);
        next(error)
    }
    
}



module.exports = {
    getHomeData
}
