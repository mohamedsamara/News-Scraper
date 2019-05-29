const express = require('express');
const router = express.Router();
const cheerio = require('cheerio');
const request = require('request');

// Bring in Models
const Article = require('../models/article'),
  Comment = require('../models/comment');

// get not saved articles process
router.get('/', (req, res) => {
  Article.find({ saved: false }, function(error, data) {
    const hbsObject = {
      article: data
    };
    res.render('home', hbsObject);
  });
});

// get saved articles process
router.get('/saved', (req, res) => {
  Article.find({ saved: true })
    .populate('comments')
    .exec(function(error, articles) {
      const hbsObject = {
        article: articles
      };

      res.render('saved', hbsObject);
    });
});

// scrape process
router.get('/scrape', (req, res) => {
  request('https://www.nytimes.com/', function(error, response, html) {
    var $ = cheerio.load(html);
    $('article').each(function(i, element) {
      const result = {};

      summary = '';
      if ($(this).find('ul').length) {
        summary = $(this)
          .find('li')
          .first()
          .text();
      } else {
        summary = $(this)
          .find('p')
          .text();
      }

      result.title = $(this)
        .find('h2')
        .text();
      result.summary = summary;
      result.link =
        'https://www.nytimes.com' +
        $(this)
          .find('a')
          .attr('href');

      const newArticle = new Article(result);

      newArticle.save((err, articles) => {
        if (err) {
          console.log(err);
        } else {
          console.log(articles);
        }
      });
    });
    res.send('scrape is done!');
  });
});

// get not saved articles process
router.post('/article/save/:id', (req, res) => {
  let query = { _id: req.params.id };

  Article.updateOne(query, { saved: true }).exec(function(err, doc) {
    if (err) {
      console.log(err);
    } else {
      res.redirect('/saved');
    }
  });
});

// 404 not found view
router.get('*', (req, res) => {
  res.render('404Page');
});

module.exports = router;
