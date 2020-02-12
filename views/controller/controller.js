var express = require("express");
var router = express.Router();
var path = require("path");
var cheerio = require("cheerio");
var axios = require("axios");
var notes = require("../models/note.js");
var Article = require("../models/Article.js");

router.get("/", function(req, res) {
res.redirect("/articles");

});

router.get("/scrape", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://celebrityinsider.org/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("h5").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");
        res.redirect("/");
  });
    });
        });
    router.get("/articles", function(req, res) {
        Article.find().sort({_id: -1}).exec(function(err, doc)) {
            if (err) {
                console.log(err);
            } else {
                var artcl = {article: doc};
                res.render("index", artcl);

   });
    });
     