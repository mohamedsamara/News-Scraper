const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('home');
});

// 404 not found view
router.get('*', (req, res) => {
  res.render('404Page');
});

module.exports = router;
