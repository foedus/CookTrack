var MongoClient = require('mongodb').MongoClient;
	
exports.myRecipes = function(req,res) {
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
			return res.redirect('/myrecipes');
		});
	});
}

exports.editRecipe = function(req,res) {
	res.redirect('/myrecipes');
}

exports.deleteRecipe = function(req,res) {
	res.redirect('/myrecipes');
}