var express = require('express');
var router = express.Router();
var passport = require('passport');

router.get('/', function(req, res) {
	res.render('index', {
		user: req.user
	});
});

// AUTH SECTION =========================
router.get('/login', passport.authenticate('avans'));

router.get('/auth/avans/callback', passport.authenticate('avans', {
	successRedirect: '/',
	failureRedirect: '/'
}));

// DOCS SECTION =========================
router.get('/docs', function(req, res) {
	res.render('docs', {
		user: req.user
	});
});

router.get('/demo', function(req, res) {
	res.render('demo');
});

// PROFILE SECTION =========================
router.get('/profile', isLoggedIn, function(req, res) {
	res.render('profile', {
		user: req.user
	});
});

router.get('/logout', function(req, res) {
	req.logout();
	return res.redirect(req.query.returnUrl);
});


// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
	if(req.isAuthenticated()) {
		return next();
	}
	res.redirect('/');
}

module.exports = router;
