const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const User = require('../models/User');

// Serialize user into the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL}${process.env.GOOGLE_CALLBACK_URL}`,
    proxy: true
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ email: profile.emails[0].value });

      if (user) {
        // Update user's Google ID if not set
        if (!user.googleId) {
          user.googleId = profile.id;
          await user.save();
        }
        return done(null, user);
      }

      // Create new user
      user = await User.create({
        name: profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id,
        isEmailVerified: true,
        avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : undefined
      });

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }
));

// Facebook OAuth Strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: `${process.env.BACKEND_URL}${process.env.FACEBOOK_CALLBACK_URL}`,
    profileFields: ['id', 'emails', 'name', 'displayName', 'photos'],
    proxy: true
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ email: profile.emails[0].value });

      if (user) {
        // Update user's Facebook ID if not set
        if (!user.facebookId) {
          user.facebookId = profile.id;
          await user.save();
        }
        return done(null, user);
      }

      // Create new user
      user = await User.create({
        name: profile.displayName,
        email: profile.emails[0].value,
        facebookId: profile.id,
        isEmailVerified: true,
        avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : undefined
      });

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }
));

// Twitter OAuth Strategy
passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: `${process.env.BACKEND_URL}${process.env.TWITTER_CALLBACK_URL}`,
    includeEmail: true,
    proxy: true
  },
  async (token, tokenSecret, profile, done) => {
    try {
      // Twitter might not provide email, so we need to handle that
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.username}@twitter.com`;
      
      // Check if user already exists
      let user = await User.findOne({ twitterId: profile.id });
      
      if (!user) {
        // Try to find by email if user exists but doesn't have twitterId set
        user = await User.findOne({ email });
        
        if (user) {
          // Update user's Twitter ID
          user.twitterId = profile.id;
          await user.save();
        } else {
          // Create new user
          user = await User.create({
            name: profile.displayName,
            username: profile.username,
            email,
            twitterId: profile.id,
            isEmailVerified: true,
            avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : undefined
          });
        }
      }

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }
));

module.exports = passport;
