var GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user')

const strategy = (passport) => {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback"
      },
      async (accessToken, refreshToken, profile, cb) => {
        const user = await User.findOne({userId:profile.id});
        if(user) {
            cb(null,user)
        }
        else{
            const newUser = await User.create({
                userId: profile.id,
                name: profile.displayName
            })
            cb(null,newUser)
        }
      }
      
    ));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
      
    passport.deserializeUser( async(id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
          } catch (error) {
            console.error(error);
            done(error, null);
          }
    });
      
}

module.exports = strategy;