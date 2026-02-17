//load required packages
var express = require('express');
var MongoClient= require('mongodb').MongoClient;
var bParser = require('body-parser')
var app = express();

var path = require('path');//necessary to call html file from path wasn't working without it


//middleware allows requests from all domains
app.use(function (req,res, next){
	res.header("Access-Control-Allow-Orgin", "*");
	res.header("Access-Control-Allow-Headers", "Orgin,X-Requested-With, Content-Type, Accept");
	next();
})

//parse form submissions
app.use(bParser.urlencoded({ extended: true}));

//HTML file path on get request to load html page
app.get('/', function (req, res){
	res.sendFile(path.join(__dirname, 'index.html'));
})

//Form submission on post save to mongodb then show all memos on submission screen
app.post('/', function(req, res){
	var userNote = req.body.userMemo;
	var userName = req.body.memoName;
	
	MongoClient.connect('mongodb://localhost:27017', function (err, client){
		if(err) throw err;
		
		//creates and uses database named clip_board and collection called notes
		var db = client.db('clip_board'); //database name 
		var dbCollection = db.collection('notes'); //collection name
		
		
		//adds note to dbcollection and fomats for display on submission screen
		dbCollection.insertOne(
		{noteName: userName, noteValue: userNote, createdAt: new Date()},//only use date for submission screen note on board div
		function(err,result){
			if(err) throw err;
			
			//fetch all notes from db collection and format 
			dbCollection.find().toArray(function(err, documents){
				if(err) throw err;
				var listItems = documents.map(function (doc) {
				return `<li>Memo assigned to: ${doc.noteName} Date: ${doc.createdAt}<br> --Memo-- ${doc.noteValue}</li>`;
				}).join('');
				var html =
				'<h1>New MEMO\\RE\ Has Been Saved!</h1>'+
				'<ul>'+listItems+'</ul>'+
				'<hr><a href="/"><h2>CLICK TO RETURN TO HOMEPAGE<h2></a>'; //link to home page from submission screen
			
				res.send(html);
				client.close();
				});
			}
		);
		
		
	});
});

// used by Javascript to get and display memos as list items in index.html div element
app.get('/memos', function(req, res) {
  MongoClient.connect('mongodb://localhost:27017', function(err, client) {
    if (err) throw err;

    var db = client.db('clip_board');
    var dbCollection = db.collection('notes');
	//fetch all notes from db collection and format 
    dbCollection.find().toArray(function(err, docs) {
      if (err) throw err;
      var listItems = docs.map(function(doc) {
        return `<li>Memo assigned to: ${doc.noteName}<br>--Memo--<br>${doc.noteValue}</li>`;
      }).join('');
	  var html = '<ul>'+listItems+'</ul>';//variable with formated list item

      res.send(html);
      client.close();
    });
  });
});



app.listen(4000, function(){
	console.log("Listening on port 4000 http://127.0.0.1:4000");
});
