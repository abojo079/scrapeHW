var express = require("express");
var exphbs = require("express-handlebars");
var logger = require("morgan")
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var dotenv = require('dotenv');
var Promise = require('bluebird');

dotenv.config();
//Scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

//Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

//Initialze express
var app = express();

// Use the express.static middleware to serve static content for the app from the "public" directory in the application directory.
app.use(express.static("public"));

// Sets up the Express app to handle data parsing
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.engine("handlebars", exphbs({
  defaultLayout: "main"
}));
app.set("view engine", "handlebars");

//Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/scrapeHW";
mongoose.Promise = Promise;

// Connect to the Mongo DB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true

});
// Routes


// Serve index.handlebars to the root route.
app.get("/", function (req, res) {
  db.Article.find({}).sort({createdAt: -1})
    .then(function (dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.render("index", {
        results: dbArticle
      });
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


app.get("/saved", function (req,res) {
  db.Article.find({saved: true}).sort({updatedAt: -1})
    .then(function (dbArticle) {
      // If we were able to successfully find Articles that have been saved, send them back to the client
      res.render("saved", {
        results: dbArticle
      });
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// A GET route for scraping the newschoolers website
app.get("/scrape", function (req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://celebrityinsider.org/").then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

$("h5").each(function(i, element) {
          var result = {};
      // Save the text and href of each link enclosed in the current element
      result.title = $(this)
      .children("a").text();
      
      result.link = $(this)
      .children("a").attr("href");
 
      //console.log(result)
      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function (dbArticle) {
          // View the added result in the console
           console.log(dbArticle);
        })
        .catch(function (err) {
          // If an error occurred, log it
          console.log(err);
        });
    });
    res.redirect("/");
  });
});

 //Route for grabbing a specific Article by id
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, find the specified article and update it's saved value to true
  db.Article.findOneAndUpdate({ _id: req.params.id }, {$set:{saved: true, updatedAt: new Date()}})
      // Populate all of the comments associated with the Article
    .populate("comment")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
     res.json(err);
    });
});

// Route for saving/updating an Article's associated Comment
app.post("/articles/:id", function(req, res) {
  // Create a new comment and pass the req.body to the entry
  db.Comment.create(req.body)
    .then(function(dbComment) {
      // If a Comment was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Comment
       //{ new: true } //tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
     return db.Article.findOneAndUpdate({ _id: req.params.id }, {$push:{comment: dbComment._id }}, { new: true });
   })
   .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

//Route for deleting comments
app.post("/comments/:id", function (req,res) {
  db.Comment.findByIdAndRemove({_id: req.params.id}, function(err){
    if(err){
      console.log(err)
   }
  })
})

// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});

/////ccc