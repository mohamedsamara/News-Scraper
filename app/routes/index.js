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

// Delete an article
router.post('/article/delete/:id', function(req, res) {
  let query = { _id: req.params.id };

  Article.updateOne(query, { saved: false, comments: [] }).exec(function(
    err,
    doc
  ) {
    if (err) {
      console.log(err);
    } else {
      res.send(doc);
    }
  });
});

// Create a new comment
router.post('/comment/save/:id', function(req, res) {
  const newComment = new Comment({
    body: req.body.comment,
    article: req.params.id
  });

  let query = { _id: req.params.id };

  newComment.save((error, comment) => {
    if (error) {
      console.log(error);
    } else {
      Article.updateOne(query, { $push: { comments: comment } }).exec(function(
        err
      ) {
        if (err) {
          console.log(err);
          res.send(err);
        } else {
          res.redirect('/saved');
        }
      });
    }
  });
});

// Delete an article comment
router.delete('/comment/delete/:comment_id/:article_id', (req, res) => {
  let commentId = { _id: req.params.comment_id };
  let articleId = { _id: req.params.article_id };

  Comment.deleteOne(commentId, function(err) {
    if (err) {
      console.log(err);
      res.send(err);
    } else {
      Article.updateOne(articleId, {
        $pull: { comments: commentId }
      }).exec(function(err) {
        if (err) {
          console.log(err);
          res.send(err);
        } else {
          res.send('Comment Deleted');
        }
      });
    }
  });
});

// 404 not found view
router.get('*', (req, res) => {
  res.render('404Page');
});

module.exports = router;
