var Recipe = require('./models/recipe');
var User = require('./models/user');
var bcrypt = require('bcrypt');

exports.http = function (req, res) {
	console.log('Redirecting to a secure connection.');
	res.redirect('https://localhost:8443' + req.url);
}

exports.login = function(req, res, next) {
	var username = req.body.username.toLowerCase();
	console.log(username)
	User.findOne({'username':username}, function(err, user) {
		if (err) {
			console.error(err);
			return res.redirect('/');
		}
		if (!user) {
			console.log('User does not exist.');
			return res.redirect('/');
		}
		console.log(user);
		var password = req.body.password;
		var hash = user.password;
		bcrypt.compare(password, hash, function(err, test) {
			if (test) {
				req.logIn(user, function (err) {
					if (err) { 
						return next(err); 
					}
					return res.redirect('/myrecipes/'+username);
				});
			} else {
				return res.redirect('/');
			}
		});
	});	
}

exports.logout = function(req, res){
	req.logout();
	res.redirect('/');
}

exports.index = function(req,res) {
	res.sendfile(__dirname + '/views/login.html');
}

exports.deleteRecipe = function(req, res) {
	var id = req.params.id;
	
	Recipe.findById(id, 'dishname', function(err, doc) {
		if (err) {
			console.error(err);
			return res.redirect('/myrecipes/' + req.user.username);
		}
		res.render('delete', {title: 'Confirm?', id: id, dishname: doc.dishname, user: req.user.username}, function(err, content) {
			if (err) {
				console.error(err);
				return res.redirect('/myrecipes/' + req.user.username);
			}
			return res.end(content);
		});
	});
}
