// load all the things we need
var LocalStrategy = require('passport-local').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var jwt = require('jwt-simple');

// load up the user model
var User = require('../model/user');

// expose this function to our app using module.exports
module.exports = function(passport) {

    //Bearer token strategy
    passport.use('bearer', new BearerStrategy(
      function(token, done) {

        console.log('passport.js: the token is ' + token);
        User.findOne({ token: token }, function (err, user) {
          if (err) { return done(err); }
          if (!user) { return done(null, false); }
          return done(null, user, { scope: 'all' });
        });
      }
    ));

	passport.serializeUser(function(user, done) {
        console.log("passport.js: serialize");
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        çonsole.log("passport.js: deserializeUser")
        User.findById(id, function(err, user) {
            done(err, user);
            console.log("passport.js: " + user);
        });
    });

    passport.use('local-signup', new LocalStrategy(function(username, password, done) {

        User.findOne({ 'local.username' : username }, function(err, user) {

          if (err) { return done(err); }

          if (user) {

            return done("That username is already taken");
          }
          else {
         
            //Add new User
            var newUser = new User();

            // set the user's local credentials
            newUser.local.username = username;
            newUser.local.password = newUser.generateHash(password);
            newUser.local.token = jwt.encode({username: user.username}, secret);

            // save the user
            newUser.save(function(err, user) {
                if (err)
                    return done(err);

                return done(null, user);
            });
          }
        });

    }));

    passport.use('local-login', new LocalStrategy(function(username, password, done) {
        
            User.findOne({ 'local.username' : username }, function(err, user) {
            
                if (err) { return done(err); }

                // if no user is found, return the message
                if (!user)
                    return done("wrong credentials"); // req.flash is the way to set flashdata using connect-flash
                

                // if the user is found but the password is wrong
                if (!user.validPassword(password))
                    return done("wrong credentials"); // create the loginMessage and save it to session as flashdata
                
                console.log("mooi");

                // all is well, return successful user
                return done(null, user);
            });
    }));

    module.exports = passport;
};
