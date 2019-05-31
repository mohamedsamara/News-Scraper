const express = require('express');
const router = express.Router();
const cheerio = require('cheerio');
const request = require('request');
const { body } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

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
    if (error) {
      req.flash(
        'error',
        'Something went wrong! We could not scrape any articles now, Please try again!'
      );
      res.send('Something went wrong!');
    } else {
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
            req.flash(
              'error',
              'Something went wrong! We could not scrape any articles now, Please try again!'
            );
            res.redirect('/');
          }
        });
      });

      req.flash('success', 'Articles were added successfully!');
      res.send('Scrape is done!');
    }
  });
});

// get not saved articles process
router.post('/article/save/:id', (req, res) => {
  let query = { _id: req.params.id };

  Article.updateOne(query, { saved: true }).exec(function(err, doc) {
    if (err) {
      req.flash('error', 'Something went wrong!');
      res.redirect('/');
    } else {
      req.flash('success', 'Article has been saved successfully!');
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
      req.flash('error', 'Something went wrong!');
      res.redirect('/');
    } else {
      req.flash('success', 'Article has been deleted successfully!');
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

  req.checkBody('comment').notEmpty();

  let errors = req.validationErrors();

  if (errors) {
    req.flash('error', 'Please add your comment!');
    res.redirect('/saved');
  } else {
    newComment.save((error, comment) => {
      if (error) {
        req.flash('error', 'Something went wrong!');
        res.redirect('/');
      } else {
        Article.updateOne(query, { $push: { comments: comment } }).exec(
          function(err) {
            if (err) {
              req.flash('error', 'Something went wrong!');
              res.redirect('/');
            } else {
              req.flash('success', 'Your Comment has been added!');
              res.redirect('/saved');
            }
          }
        );
      }
    });
  }
});

// Delete an article comment
router.delete('/comment/delete/:comment_id/:article_id', (req, res) => {
  let commentId = { _id: req.params.comment_id };
  let articleId = { _id: req.params.article_id };

  Comment.deleteOne(commentId, function(err) {
    if (err) {
      req.flash('error', 'Something went wrong!');
      res.redirect('/');
    } else {
      Article.updateOne(articleId, {
        $pull: { comments: commentId }
      }).exec(function(err) {
        if (err) {
          req.flash('error', 'Something went wrong!');
          res.redirect('/');
          res.send(err);
        } else {
          req.flash('success', 'Your comment has been deleted successfully!');
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
