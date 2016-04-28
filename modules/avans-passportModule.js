var OAuthStrategy = require('passport-oauth').OAuthStrategy;
var mongoose = require('mongoose');
var OAuth = require('oauth');
var User = mongoose.model("User");
var oauthConfig = require('.././config/oauth');
var jwt = require('jwt-simple');
var secret = "linksonderisthebestleagueplayerintheworld";

module.exports = function(passport){

    
    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    
    //We need an oauth object to make the oath requests
    var oauth = new OAuth.OAuth(
        oauthConfig.requestTokenURL,
        oauthConfig.accessTokenURL,
        oauthConfig.public,
        oauthConfig.secret,
        '1.0A',
        null,
        'HMAC-SHA1'
    );

    //Register a new strategy to the passport object
    passport.use('avans', new OAuthStrategy({
            requestTokenURL:   oauthConfig.requestTokenURL,
            accessTokenURL: oauthConfig.accessTokenURL,
            userAuthorizationURL: oauthConfig.userAuthorizationURL,
            consumerKey: oauthConfig.public,
            consumerSecret: oauthConfig.secret,
            callbackURL: oauthConfig.callbackURL,
        },
        function(token, tokenSecret, profile, done) {
            oauth.get(
                'https://publicapi.avans.nl/oauth/people/@me',
                token, //test user token
                tokenSecret, //test user secret            
                function (e, data, res){
                    if (e) console.error(e); 
                
                    var userData = JSON.parse(data);

                    User.findById(userData.emails[0], function(err, user){
                        if(user)
                        {
                            done(null, user);
                        }
                        else
                        {
                            var user = new User();
                            user._id =  userData.emails[0];
                            user.name =  userData.nickname;
                            user.isTeacher = userData.student === "false";
                            user.token =  jwt.encode(user._id, secret);

                            user.save(function(err, user){
             
                                done(null, user);
                            });
                        }
                    });
                 });    
        }
    ));
}

