/******************
* CookTrack 0.0.0 *
* January 2013    *
* by Andrew Smeall*
*******************/

// External modules
var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var ejs = require('ejs');
var http = require('http');
var https = require('https');
var fs = require('fs');

// Library modules
var accountCreator = require('./lib/accountCreator');
var recipeHandler = require('./lib/recipeHandler');
var routes = require('./routes');

// -----Connect to DB--Could move this db call inside authentication?
MongoClient.connect('mongodb://localhost:27017/CookTrackDB', function(err, db) {
	if(!err) {
		console.log('Connected to CookTrackDB.');
	}
	
	var users = db.collection('users');
	var recipes = db.collection('recipes');
	
	// Authentication user search
	function findById(id, fn) {
		var user = users.findOne({_id:new ObjectID(id)},function(err,user) {
			if (user) {
				fn(null, user);
			} else {
				fn(new Error('User ' + id + ' does not exist'));
			}
		});
	}	
	
	// Authentication verification
	function ensureAuthenticated(req, res, next) {
		if (req.isAuthenticated()) { return next(); }
		res.redirect('/')
	}

// ------App configuration-------
	var app = express();
	
	var options = {
	  key: fs.readFileSync('key.pem'),
	  cert: fs.readFileSync('cert.pem')
	};
	
	app.configure(function() {
		app.set('views', __dirname + '/views');
		app.set('view engine', 'ejs');
		app.use(express.static(__dirname + '/public'));
		app.use(express.logger());
		app.use(express.cookieParser());
		app.use(express.bodyParser());
		app.use(express.methodOverride());
		app.use(express.session({ secret: 'qWeRty,d0g' }));
		app.use(passport.initialize());
		app.use(passport.session());
		app.use(app.router);
	});
	
// -----Authentication configuration-----
	passport.serializeUser(function(user, done) {
		done(null, user._id);
	});

	passport.deserializeUser(function(id, done) {
	  findById(id, function (err, user) {
	    done(err, user);
	  });
	}); 
	
	passport.use(new LocalStrategy(
		function(username, password, done) {
			users.findOne({'username':username}, function(err,user) {
				if (err) { 
					console.log(err);
					return done(err); 
					}
		        if (!user) { 
					console.log('Attempted login by unknown user: ' + username);
					return done(null, false, { message: 'Unknown user ' + username }); 
					}
		        if (user.password != password) {
					console.log('Password error for user: ' + username); 
					return done(null, false, { message: 'Invalid password' }); 
					}
		        console.log('Success!');
				return done(null, user);
		      });
			}
		));

// -----Routing starts here-----
	app.get('/', routes.index);
	app.post('/login', routes.login);
	app.get('/logout', routes.logout);
	app.get('/new', ensureAuthenticated, routes.newRecipe);
	app.post('/newaccount', accountCreator.newAccount);
	app.put('/edit',ensureAuthenticated, recipeHandler.editRecipe);
	app.post('delete', ensureAuthenticated, recipeHandler.deleteRecipe);
	app.post('/submit', ensureAuthenticated, recipeHandler.submitRecipe); 
	app.get('/myrecipes', ensureAuthenticated, recipeHandler.myRecipes);

// -----Run server-----
	http.createServer(app).listen(3000, function() {
		console.log('CookTrack listening on Port 3000.')
	});
	https.createServer(options, app).listen(3001, function() {
		console.log('CookTrackHTTPS listening on Port 3001.')
	});
});
