var url = require('url');
var Recipe = require('../models/recipe');
	
exports.myRecipes = function(req,res) {
	if (req.params.username !== req.user.username) {
		console.log('Attempting to access invalid user.');
		res.redirect('/myrecipes/'+req.user.username);
	}
	
	Recipe.find({'username':req.user.username}).sort({'date':1}).limit(10).exec(function(err, docs) {
		var lgth = docs.length;
		res.render('myrecipes', {title: 'My Recipes', myrecipes: docs, lgth: lgth}, function(err, content) {
			if (err) {
				console.error(err);
				return res.redirect('/');
			}
			res.end(content);
		})
	});
}

exports.newRecipe = function(req,res) {	
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
			console.error(err);
		}
		res.end(stuff);
	});
}

exports.submitRecipe = function(req,res,next) {
	var id = url.parse(req.headers.referer).path.substr(6,29);
	// Check if this is an edit or a new recipe
	if (id) {
		Recipe.update({ _id:id }, 
					  {dishname: req.body.dishname, 
					   date: req.body.date, 
					   recipe: req.body.recipetext, 
					   notes: req.body.notes}, 
					   function(err, num, raw) {
			if (err) {
				console.error(err);
				return res.redirect('/edit/' + id);
			}
			console.log('Recipe for ' + req.body.dishname + ' updated!');
			return res.redirect('/myrecipes/' + req.user.username);
		});
	} else {
		var newRecipe = new Recipe({
							dishname: req.body.dishname,
							date: req.body.date,
							recipe: req.body.recipetext,
							notes: req.body.notes,
							username: req.user.username
						});
		newRecipe.save(function(err) {
			if (err) {
				return console.error(err);
			}
			console.log('Recipe for ' + newRecipe.dishname + ' created!');
			return res.redirect('/myrecipes/' + req.user.username);
		});
	}
}

exports.editRecipe = function(req, res) {
	var id = req.params.id;
	
	Recipe.findOne({_id:id}, function(err, recipe) {
		if (err) {
			console.error(err);
			return res.redirect('/myrecipes/' + req.user.username);
		}
		return res.render('edit', {recipe: recipe, username: req.user.username}, function(err, content) {
			if (err) {
				console.error(err);
				return res.redirect('/myrecipes/' + req.user.username);
			}
			res.end(content);
		});
	});
}

exports.deleteRecipe = function(req,res) {
	var id = req.params.id;
	
	Recipe.findByIdAndRemove(id, function(err) {
		if (err) {
			console.error(err);
			return res.redirect('/myrecipes/'+req.user.username);
		}
		return res.redirect('/myrecipes/'+req.user.username);
	});
}