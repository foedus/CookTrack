var fs = require('fs');

exports.photoUpload = function(req,res) {
	console.log(req.files);
	var path = req.files.file.path;
	//.substr(51,85);
	
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
	
	fs.readFile(path, "binary", function(error, file) {
	    if(error) {
	      res.writeHead(500, {"Content-Type": "text/plain"});
	      res.write(error + "\n");
	      res.end();
	    } else {
	      res.writeHead(200, {"Content-Type": "image/png"});
	      res.write(file, "binary");
		  res.end();
	    }
	  });
	// 
	// res.render('new', {title: 'New Recipe', date: date, photo: path, username: req.user.username}, function (err, stuff) {
	// 	if (err) {
	// 		console.log(err);
	// 	}
	// 	console.log('Parse request for new successful.');
	// 	res.end(stuff);
	// });
}