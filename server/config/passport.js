const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Determine callback URL based on environment
const getCallbackURL = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.GOOGLE_CALLBACK_URL_PROD;
  }
  return process.env.GOOGLE_CALLBACK_URL_DEV || 'http://localhost:5000/api/users/google/callback';
};

// Log the callback URL for debugging
const callbackURL = getCallbackURL();
console.log('🔐 Google OAuth Callback URL:', callbackURL);
console.log('🔐 Google Client ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing');
console.log('🔐 Google Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: callbackURL,
      proxy: true // Important for Vercel deployment
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google OAuth callback triggered');
        console.log('Profile ID:', profile.id);
        console.log('Profile Email:', profile.emails[0]?.value);

        // Check if user exists with this Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          console.log('User found with Google ID:', user._id);
          // Update last login
          user.lastLogin = Date.now();
          await user.save();
          return done(null, user);
        }

        // Check if user exists with this email
        const email = profile.emails[0]?.value;
        if (email) {
          user = await User.findOne({ email });

          if (user) {
            console.log('User found with email, linking Google account');
            // Link Google account to existing user
            user.googleId = profile.id;
            user.authProvider = 'google';
            user.isEmailVerified = true; // Google emails are pre-verified
            if (profile.photos && profile.photos[0]) {
              user.avatar = profile.photos[0].value;
            }
            user.lastLogin = Date.now();
            await user.save();
            return done(null, user);
          }
        }

        // Create new user
        console.log('Creating new user from Google OAuth');
        user = await User.create({
          name: profile.displayName || 'Google User',
          email: email,
          googleId: profile.id,
          authProvider: 'google',
          isEmailVerified: true,
          avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : undefined,
          lastLogin: Date.now()
        });

        console.log('New user created:', user._id);
        done(null, user);
      } catch (error) {
        console.error('Google OAuth error:', error);
        done(error, null);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
