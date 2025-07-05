const User = require('../models/User');

/**
 * Find or create a user based on OAuth profile
 * @param {Object} profile - The OAuth profile
 * @param {String} provider - The OAuth provider (google, facebook, twitter)
 * @returns {Promise<User>} The user document
 */
const findOrCreateUser = async (profile, provider) => {
  try {
    // Check if user exists with this provider ID
    const providerId = `${provider}Id`;
    const query = { [providerId]: profile.id };
    
    // If email is available, also check by email
    if (profile.emails && profile.emails[0]) {
      query.$or = [{ email: profile.emails[0].value }];
    }

    let user = await User.findOne(query);

    if (!user) {
      // Create new user
      const userData = {
        name: profile.displayName,
        email: profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.username}@${provider}.com`,
        [providerId]: profile.id,
        isEmailVerified: true,
      };

      // Add photo if available
      if (profile.photos && profile.photos[0]) {
        userData.photo = profile.photos[0].value;
      }

      // For Twitter, we might not have a name in the same way
      if (provider === 'twitter' && !userData.name && profile.username) {
        userData.name = profile.username;
      }

      user = await User.create(userData);
    } else if (!user[providerId]) {
      // Add this provider to existing user
      user[providerId] = profile.id;
      await user.save({ validateBeforeSave: false });
    }

    return user;
  } catch (error) {
    console.error('Error in findOrCreateUser:', error);
    throw error;
  }
};

/**
 * Generate a JWT token for the user
 * @param {Object} user - The user document
 * @returns {String} JWT token
 */
const generateAuthToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

module.exports = {
  findOrCreateUser,
  generateAuthToken,
};
