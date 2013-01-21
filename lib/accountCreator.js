var passport = require('passport');
var bcrypt = require('bcrypt');
var User = require('../models/user');
	
exports.newAccount = function (req, res, next) {
	// Validate form entry
	var username = req.body.username;
	if (username === '""' || username.length < 3 || username.length > 18) { 
		console.log('Invalid username.');
		return res.redirect('/');
	}
	var oldPassword = req.body.password;
	var conPassword = req.body.conPassword;
	if (oldPassword.length < 6 || oldPassword.length > 22) { 
		console.log('Password too short.');
		return res.redirect('/');
	}
	if (oldPassword !== conPassword) {
		console.log('Passwords do not match.');
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
			username = username.toLowerCase();
			var newUser = new User({'username':username, 'password':password, 'email':email});
			
			User.findOne({$or: [{'username':username}, {'email':email}]}, function(err, checkUser) {
				if (checkUser !== null) {
					console.log('Duplicate user.');
					return res.redirect('/')
				}
				newUser.save(function(err) {
					if (err) {
						return console.error(err);
					}
					console.log('User ' + newUser.username + ' created!');
					
					req.body.password = password;
					passport.authenticate('local', function(err, user, info) {
						if (err) { return next(err); }
						if (!user) { return res.redirect('/'); }
						req.logIn(user, function(err) {
							if (err) { return next(err); }
							return res.redirect('/myrecipes/' + newUser.username);
						});
					})(req, res, next);
				});
			});
		});
	});		
};
