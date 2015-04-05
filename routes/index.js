var express = require('express');
var mongoose = require('mongoose');
var _ = require('underscore');
var router = express.Router();
var flash = require('connect-flash');
var jwt = require('jwt-simple');
var secret = 'stinoisawsome';

	
module.exports = function(app, passport) {
	
	// process the signup form
	app.post('/signup', function(req, res, next){

		passport.authenticate('local-signup', function(err, user, info) {

			if(err){return res.send(err);}
			else{ 
				
						
			}

		})(req, res, next);
	});

	app.post('/login', function(req, res, next){

		var err = passport.authenticate('local-login', function(err, user, info) {

			if(err){return res.send(err);}
			else{

				// encode
				var token = jwt.encode({username: username}, secret);
				res.json({token: token});
			
			}

		})(req, res, next);
	});

    app.get('/profile', isLoggedIn, function(req, res) {
    	console.log(req.user);
    	console.log(req.session.passport);
    	req.json({id: req.user._id, username: req.user.username});
    });
   
	function isLoggedIn(req, res, next) {

	    // if user is authenticated in the session, carry on 
	    if (!req.isAuthenticated())
	    {
	        return next();
	    }
	    else
	    {
	    	res.send(401);
	    }
	}


	return router; //export
}

