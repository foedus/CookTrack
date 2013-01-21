/******************
* CookTrack 0.0.0 *
* January 2013    *
* by Andrew Smeall*
*******************/

// External modules
var express = require('express');
var mongoose = require('mongoose');
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
var photoHandler = require('./lib/photoHandler');
var routes = require('./routes');

// Connect to db
mongoose.connect('mongodb://localhost/CookTrackDB');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
	console.log('Mongoose connected!');
});

var recipeSchema = mongoose.Schema({
	name: String,
	date: Date,
	recipe: String,
	notes: String
});

var userSchema = mongoose.Schema({
	username: String,
	password: String,
	email: String
});

var Recipe = mongoose.model('Recipe', recipeSchema);
var User = mongoose.model('User', userSchema);

// Test mongoose
var kungpao = new Recipe({
	name: 'Kung Pao Chicken',
	date: 2013-01-23,
	recipe: '1 Kung Pao Chicken',
	notes: 'Don\'t put too much salt'
});

kungpao.save(function (err, recipe) {
	if (err) {
		console.error(err);
		return;
	}
	console.log(recipe);
});

Recipe.find({ name: /^Kung/}, function(err, recipe) {
	if (err) {
		console.error(err);
	}
	console.log(recipe);
});

// Authentication user search
function findById(id, fn) {
	MongoClient.connect('mongodb://localhost:27017/CookTrackDB', function(err, db) {
		var users = db.collection('users');
		if(!err) {
			var user = users.findOne({_id:new ObjectID(id)},function(err,user) {
				db.close();
				console.log('DB connection in findById Closed.');
				if (user) {	
					fn(null, user);
				} else {
					fn(new Error('User ' + id + ' does not exist'));
				}
			});
		}
	});
}	

// Authentication verification
function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) { return next(); }
	res.redirect('/');
}

// ------App configuration-------
var app = express();
var http = express();

var options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

app.configure(function() {
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.use(express.static(__dirname + '/public'));
	app.use(function(req, res, next) {
	  console.log('handling request for: ' + req.url);
	  next();
	});
	// app.use(express.logger());
	app.use(express.cookieParser());
	app.use(express.limit('1mb'));
	app.use(express.bodyParser({
	      uploadDir: __dirname + '/tmp',
	      keepExtensions: true
	    }));
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
		MongoClient.connect('mongodb://localhost:27017/CookTrackDB', function(err, db) {
			var users = db.collection('users');
			username = username.toLowerCase();
			users.findOne({'username':username}, function(err,user) {
				db.close();
				console.log('DB connection in LocalStrategy Closed.');
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
		});
	}
));

// -----Routing starts here-----
http.get('*', routes.http);
app.get('/', routes.index);
app.post('/login', routes.login);
app.get('/logout', routes.logout);
app.post('/newaccount', accountCreator.newAccount);
app.get('/new', ensureAuthenticated, recipeHandler.newRecipe);
app.put('/edit/:id', ensureAuthenticated, recipeHandler.editRecipe);
app.get('/delete/:id', ensureAuthenticated, routes.deleteRecipe);
app.del('/delete/:id/confirm', ensureAuthenticated, recipeHandler.deleteRecipe);
app.post('/submit', ensureAuthenticated, recipeHandler.submitRecipe); 
app.get('/myrecipes/:username', ensureAuthenticated, recipeHandler.myRecipes);
app.post('/upload/photo', ensureAuthenticated, photoHandler.photoUpload);

// -----Run server-----
http.listen(8080, function() {
	console.log('CookTrackHTTP listening on Port 8080.');
});
https.createServer(options, app).listen(8443, function() {
	console.log('CookTrackHTTPS listening on Port 8443.');
});
