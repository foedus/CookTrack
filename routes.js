var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var bcrypt = require('bcrypt');

exports.http = function (req, res) {
	console.log('Redirecting to a secure connection.');
	res.redirect('https://localhost:8443'+req.url);
}

exports.login = function(req, res, next) {
	MongoClient.connect('mongodb://localhost:27017/CookTrackDB', function(err, db) {
		var users = db.collection('users');
		var username = req.body.username.toLowerCase();
		users.findOne({'username':username}, function (err,user) {
			if (!user) {
				console.log('User does not exist.');
				db.close()
				console.log('DB connection in login Closed.');
				return res.redirect('/');
			}
			var password = req.body.password;
			var hash = user.password;
			bcrypt.compare(password,hash,function(err, test) {
				if (test) {
					req.logIn(user, function (err) {
						if (err) { return next(err); }
						db.close()
						console.log('DB connection in login Closed.');
						return res.redirect('/myrecipes/'+username);
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

exports.deleteRecipe = function (req, res) {
	var id = req.params.id;
	
	
	MongoClient.connect('mongodb://localhost:27017/CookTrackDB', function(err, db) {
		var recipes = db.collection('recipes');
		recipes.findOne({'_id':new ObjectID(id)}, function(err, doc) {
			res.render('delete', {title: 'Confirm?', id: id, dishname: doc.dishname, user: req.user.username}, function(err,stuff) {
				if (!err) {
					res.end(stuff);
				}
				db.close();
				console.log('DB connection in deleteRecipe Closed.');
			});
		});
	});
}
