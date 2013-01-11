var MongoClient = require('mongodb').MongoClient;
var bcrypt = require('bcrypt');

exports.http = function (req, res) {
	console.log('Redirecting to a secure connection.');
	res.redirect('https://localhost:8443'+req.url);
}

exports.login = function(req, res, next) {
	MongoClient.connect('mongodb://localhost:27017/CookTrackDB', function(err, db) {
		var users = db.collection('users');
		users.findOne({'username':req.body.username}, function (err,user) {
			if (!user) {
				console.log('User does not exist.');
				return res.redirect('/');
			}
			var password = req.body.password;
			var hash = user.password;
			bcrypt.compare(password,hash,function(err, test) {
				if (test) {
					req.logIn(user, function (err) {
						if (err) { return next(err); }
						return res.redirect('/myrecipes');
					});
				} else {
					return res.redirect('/');
				}
			});
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

exports.newRecipe = function(req,res) {
	res.sendfile(__dirname + '/views/new.html');
}
