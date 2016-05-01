var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({

	_id: String,
	name: String,
	token: String,
	isTeacher: Boolean

});

module.exports = mongoose.model('User', userSchema);