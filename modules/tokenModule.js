var mongoose = require('mongoose');

var User = mongoose.model('User');

module.exports = {

	validate : function(req, res, next)
	{
		var token = req.query.token;

		if(token)
		{
			User.findOne({ "token": token }, function (err, user) {
	          if (err) { res.json(err); }
	          else if (!user) { res.json({msg: "Error: not a valid API key.", key: token}); }
	          else{
	          	req.user = user;
	          	next();
	          }
        	});
		}
		else
		{
			var msg = "Error: Reuqest did not contain a API key. Request should use a URl with {{resource}}?token='apikeyhere'";
			res.json({msg: msg });
		}
	}

};