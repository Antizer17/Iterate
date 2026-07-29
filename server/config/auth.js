import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/users.js'; // Your MongoDB User Schema

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://iterate-gy7v.onrender.com/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // 1. Look at the profile data Google sent back
      const email = profile.emails[0].value;
      
      // 2. Check if this user already exists in your MongoDB
      let user = await User.findOne({ email });
      
      if (!user) {
        // 3. Lazy registration! Create them on the fly if they are new
        user = await User.create({
          email,
          name: profile.displayName,
          googleId: profile.id
        });
      }
      
      // 4. Pass the user object forward to your routing layer
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));