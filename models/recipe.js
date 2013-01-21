var mongoose = require('mongoose');

var recipeSchema = mongoose.Schema({
	name: String,
	date: {type: Date, default: Date.now},
	recipe: String,
	notes: String
});

module.exports = mongoose.model('Recipe', recipeSchema);