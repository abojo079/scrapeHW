var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// handlebars

app.engine("handlebars", exphbs({defaultLayout: "main"}))
app.set("view engine", "handlebars");


// Use morgan logger for logging requests
app.use(logger("dev"));

app.use(bodyParser.urlencoded({
    extended: false
}));


// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect('mongodb://abojo079:Amang0o79**@ds063177.mlab.com:63177/heroku_wlszfm9t', {useNewUrlParser: true, useUnifiedTopology: true});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
