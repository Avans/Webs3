var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var cookieSession = require('cookie-session');
var expressHbs = require('express3-handlebars');

//Require models and routes and configs
require('./model/gameboard');
require('./model/game');
require('./model/user');

var dbConfig = require('./config/database');
var passConfig = require('./config/passport')(passport);
mongoose.connect(dbConfig.url);

var app = express();

app.engine('hbs', expressHbs({extname:'hbs', defaultLayout:'main.hbs'}));
app.set('view engine', 'hbs');



// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser()); // read cookies (needed for auth)
app.use(express.static(path.join(__dirname, 'public')));

//passport
app.use(session({ secret: 'linksonderisthebestleagueplayerintheworld' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

//Route all the routes!
var gameboard = require('./routes/gameboard');
var game = require('./routes/game');
var index = require("./routes/index")(app, passport);
app.use('/games', game);
app.use('/gameboards', gameboard);
app.use('/', index);

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
