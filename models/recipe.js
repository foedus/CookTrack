var mongoose = require('mongoose');

var recipeSchema = mongoose.Schema({
	dishname: String,
	date: {type: Date, default: Date.now},
	recipe: String,
	notes: String,
	username: String
});

module.exports = mongoose.model('Recipe', recipeSchema);