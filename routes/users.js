var express = require('express');
var router = express.Router();
var db = require('./../lib/javascripts/mongo');

// Sign up / New Account
router.post('/new_account', function (req, res, next) {
  console.log(req);
  db.createAccount(req).then(function (user) {
    // console.log('server', user);
    res.json({user: user})
  })
});

module.exports = router;
