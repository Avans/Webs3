
var express = require('express');
var exphbs = require('express-handlebars');
var session = require('express-session');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var passport = require('passport');

var dbConfig = require('./config/database');
var corsConfig = require('./config/cors');

//Require models
require('./model/gameboard');
require('./model/game');
require('./model/user');

mongoose.connect(dbConfig.url);

var app = express();

//Include passports
require("./modules/avans-passportModule")(passport);
app.use(session({ secret: 'linksonderisthebestleagueplayerintheworld' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); 

//View Engine
app.engine('hbs', exphbs({extname:'hbs', defaultLayout:'main.hbs'}));
app.set('view engine', 'hbs');

// Add headers
app.use(corsConfig);

//global settings
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


//Route all the routes!
var gameboard = require('./routes/gameboard');
var game = require('./routes/game');
var user = require('./routes/user');
var ship = require('./routes/ships');
var index = require("./routes/index");

app.use('/', index);
app.use('/', gameboard); //Starts @ root
app.use('/users', user);
app.use('/ships', ship);
app.use('/games', game);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.send({
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send({
        message: err.message,
        error: {}
    });
});


module.exports = app;
