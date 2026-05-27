const { USER } = require('../models/centralstation');

/**
 * Fetch all users with pagination, search and filtering
 */
async function getUsers({ page = 1, limit = 10, search = '', role = 'all' }) {
    const skip = (page - 1) * limit;
    
    // 1. Build Query
    let query = {};
    
    if (search) {
        query.$or = [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { userName: { $regex: search, $options: 'i' } }
        ];
    }
    
    if (role !== 'all') {
        query.role = role;
    }

    // 2. Execute Query with Pagination
    const users = await USER.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    // 3. Get Total Count for Pagination metadata
    const total = await USER.countDocuments(query);

    return {
        users,
        pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        }
    };
}

async function updateUserStatus(id, status) {
    return await USER.findByIdAndUpdate(id, { accountStatus: status }, { new: true });
}

module.exports = { getUsers, updateUserStatus };
