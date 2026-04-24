const passport      = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const User          = require('../models/User')
require('dotenv').config()

// Sanitize environment variables to remove any accidental whitespace/newlines
const GOOGLE_CLIENT_ID     = process.env.GOOGLE_CLIENT_ID?.trim();
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET?.trim();
const GOOGLE_CALLBACK_URL  = process.env.GOOGLE_CALLBACK_URL?.trim();

console.log('🛠️ Passport Google Strategy Initializing...');
console.log('   - Client ID:', GOOGLE_CLIENT_ID ? '✅ Loaded' : '❌ Missing');
console.log('   - Callback:', GOOGLE_CALLBACK_URL || '❌ Missing');

passport.use(new GoogleStrategy({
  clientID:     GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL:  GOOGLE_CALLBACK_URL,
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
  proxy: true,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ 
      $or: [{ googleId: profile.id }, { email: profile.emails[0].value }] 
    })

    const googleData = {
      name:     profile.displayName,
      googleId: profile.id,
      avatar:   profile.photos[0]?.value,
      isVerified: true
    }

    if (!user) {
      user = await User.create({
        ...googleData,
        email: profile.emails[0].value
      })
    } else {
      // Always sync Google name and avatar to profile on login
      user.googleId = googleData.googleId
      user.name     = googleData.name
      user.avatar   = googleData.avatar
      user.isVerified = true
      await user.save()
    }
    
    return done(null, user)
  } catch (err) {
    return done(err, null)
  }
}))
