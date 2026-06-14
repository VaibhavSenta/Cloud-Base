const { USER } = require('./auth.model');

/**
 * PROFILE SERVICE
 * Handles updating user information.
 */
const updateProfile = async (userId, updateData) => {
  // Prevent sensitive fields from being updated via this endpoint
  const allowedFields = ['firstName', 'lastName', 'dob', 'gender', 'countryCode', 'phonenumber'];
  const filteredUpdate = {};
  
  Object.keys(updateData).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredUpdate[key] = updateData[key];
    }
  });

  if (Object.keys(filteredUpdate).length === 0) {
    throw new Error('No valid fields provided for update');
  }

  const updatedUser = await USER.findByIdAndUpdate(
    userId,
    { $set: filteredUpdate },
    { new: true, runValidators: true }
  ).select('-password');

  if (!updatedUser) {
    throw new Error('User not found');
  }

  return updatedUser;
};

module.exports = {
  updateProfile
};
