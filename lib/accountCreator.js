var MongoClient = require('mongodb').MongoClient;
var passport = require('passport');
var bcrypt = require('bcrypt');
	
exports.newAccount = function (req, res, next) {

	// Validate form entry
	var username = req.body.username;
	if (username === '""' || username.length < 3 || username.length > 18) { 
		console.log('Invalid username.');
		return res.redirect('/');
	}
	var oldPassword = req.body.password;
	if (oldPassword.length < 6 || oldPassword.length > 22) { 
		console.log('Invalid password.');
		return res.redirect('/');
	}
	var email = req.body.email;
	if (email.indexOf('@') === -1 || email.indexOf('.') === -1 || email.length > 42) { 
		console.log('Invalid email.');
		return res.redirect('/');
	}

	console.log('Attempting to create a new account for user: ' + username);
	
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(oldPassword, salt, function(err, password) {
			console.log(oldPassword);
			console.log(password);
			
			var newUser = {'username':username, 'password':password, 'email':email};

			MongoClient.connect('mongodb://localhost:27017/CookTrackDB', function(err, db) {
				var users = db.collection('users');
				
				users.findOne({$or:[{'username':username}, {'email':email}]}, function(err,checkUser) {	
					if (checkUser !== null) {
						console.log('Duplicate user error.');
						return res.redirect('/');		
					}	
					
					users.insert(newUser, function(err,result) {
						console.log('User ' + newUser.username + ' created!');
						req.body.password = password;
						
						passport.authenticate('local', function(err, user, info) {
							if (err) { return next(err); }
							if (!user) { return res.redirect('/') }
							req.logIn(user, function (err) {
								if (err) { return next(err); }
								return res.redirect('/myrecipes');
							});
						})(req, res, next);
					});
				});
			});
		});
	});		
};
