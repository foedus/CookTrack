var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var url = require('url');
	
exports.myRecipes = function(req,res) {
	if (req.params.username !== req.user.username) {
		console.log('Attempting to access invalid user.');
		res.redirect('/myrecipes/'+req.user.username);
	}
	
	MongoClient.connect('mongodb://localhost:27017/CookTrackDB', function(err, db) {
		var recipes = db.collection('recipes');
		recipes.find({'username':req.user.username}).sort({'date':1}).limit(10).toArray(function(err,docs) {
			var myrecipes = docs;
			var lgth = myrecipes.length;		
			res.render('myrecipes', {title: 'My Recipes', myrecipes: myrecipes, lgth: lgth}, function (err, stuff) {
				if (!err) {
					res.end(stuff);
				}
			});
		});
	});
}

exports.newRecipe = function(req,res) {
	console.log('Routing request for new.html');
	
	var now = new Date();
	var month = (now.getMonth() + 1);               
	var day = now.getDate();
	if(month < 10) {
		month = "0" + month;
	}
	if(day < 10) {
		day = "0" + day;
	}
	var date = now.getFullYear() + '-' + month + '-' + day;

	res.render('new', {title: 'New Recipe', date: date, username: req.user.username}, function (err, stuff) {
		if (err) {
			console.log(err);
		}
		console.log('Parse request for new successful.');
		res.end(stuff);
	});
}

exports.submitRecipe = function(req,res,next) {
	var newRecipe = {
						"dishname":req.body.dishname,
						"date":req.body.date,
						"recipe":req.body.recipetext,
						"notes":req.body.notes,
						"username":req.user.username
					};
	var id = url.parse(req.headers.referer).path.substr(6,29);
	
	MongoClient.connect('mongodb://localhost:27017/CookTrackDB', function(err, db) {
		var recipes = db.collection('recipes');
		if (id) {
			recipes.update({'_id':new ObjectID(id)}, {$set: newRecipe}, function(err, object) {
				if (err) {
					console.log(err);
				} else {	
					console.log('Recipe for ' + newRecipe.dishname + ' updated!');
					return res.redirect('/myrecipes/'+req.user.username);
				}
			});	
		}
		if (!id) {
			recipes.insert(newRecipe, function(err, object) {
				if (err) {
					console.warn(err.message);
				} else {	
					console.log('Recipe for ' + newRecipe.dishname + ' posted as a new recipe!');
					return res.redirect('/myrecipes/'+req.user.username);
				}
			});
		}
	});
}

exports.editRecipe = function(req,res) {
	var id = req.params.id;
	
	MongoClient.connect('mongodb://localhost:27017/CookTrackDB', function(err, db) {
		var recipes = db.collection('recipes');
		recipes.findOne({_id:new ObjectID(id)},function(err,recipe) {
			if (!err) {
				return res.render('edit', {recipe: recipe, username: req.user.username}, function (err,stuff) {
					if (!err) {
						res.end(stuff);
					}
				});
			}	
		});
	})
}

exports.deleteRecipe = function(req,res) {
	var id = req.params.id;
	
	MongoClient.connect('mongodb://localhost:27017/CookTrackDB', function(err, db) {
		var recipes = db.collection('recipes');
		recipes.remove({_id:new ObjectID(id)}, function(err,recipe) {
			if (!err) {
				console.log('Recipe ' + id + ' deleted.');
				return res.redirect('/myrecipes/'+req.user.username);
			}
		});		
	});
}