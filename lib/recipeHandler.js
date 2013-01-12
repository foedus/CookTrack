var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
	
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

exports.submitRecipe = function(req,res,next) {
	var dishname = req.body.dishname;
	var date = req.body.date;
	var recipe = req.body.recipetext;
	var notes = req.body.notes;
	var username = req.user.username;
	var newRecipe = {
						"dishname":dishname,
						"date":date,
						"recipe":recipe,
						"notes":notes,
						"username":username
					};
	
	MongoClient.connect('mongodb://localhost:27017/CookTrackDB', function(err, db) {
		var recipes = db.collection('recipes');
		recipes.insert(newRecipe, function(err,result) {
			console.log('Recipe for ' + newRecipe.dishname + ' posted!');
			return res.redirect('/myrecipes/'+username);
		});
	});
}

exports.editRecipe = function(req,res) {
	var id = req.params.id;
	
	MongoClient.connect('mongodb://localhost:27017/CookTrackDB', function(err, db) {
		var recipes = db.collection('recipes');
		recipes.findOne({_id:new ObjectID(id)},function(err,recipe) {
			if (!err) {
				return res.render('new', {title: recipe.dishname || 'New Recipe', recipe: recipe, username: req.user.username}, function (err,stuff) {
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