var express = require('express');
var mongoose = require('mongoose');
var _ = require('underscore');
var router = express.Router();
var flash = require('connect-flash');

var secret = 'stinoisawsome';

	
module.exports = function(app, passport) {

	//process the home page
	app.get('/', function(req, res){
		res.render("index");
	});
	
	// process the signup form
	app.post('/signup', function(req, res, next){

		passport.authenticate('local-signup', function(err, user, info) {

			if(err){return res.send(err);}
			else{ 

		
			}

		})(req, res, next);
	});

 	app.post('/login', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/' // redirect back to the signup page if there is an error
    }));

	// app.post('/login', function(req, res, next){

	// 	var err = passport.authenticate('local-login', function(err, user, info) {

	// 		if(err){return res.send(err);}
	// 		else{
	// 			var token = jwt.encode({username: user.username}, secret);
	// 			user.token = token;
	// 			console.log("index.js: the token is  " + token);
	// 			user.save(function(err, user){
	// 				if(err){return res.send(err);}
	// 				res.json({token: user.token}); //Return token
	// 			});
	// 		}

	// 	})(req, res, next);
	// });

    app.get('/profile', isLoggedIn, function(req, res) {
    	console.log(req.user);
    	req.json({id: req.user._id, username: req.user.username}); //Return user
    });

    function isLoggedIn(req, res, next) {

	    // if user is authenticated in the session, carry on 
	    if (req.isAuthenticated())
	        return next();

	    // if they aren't redirect them to the home page
	    res.redirect('/');
	}
	   
	return router; //export
}

