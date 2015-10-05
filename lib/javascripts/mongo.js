var bcrypt = require('bcrypt');
var account = require('./../../lib/javascripts/user');
var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/calendarize");
mongoose.set('debug', true);

var usersSchema = new mongoose.Schema({
  username: String,
  password: String,
  calendar: Object
});

var calendarSchema = new mongoose.Schema({
  type: String,
  data: Object
});

var Users = mongoose.model('User', usersSchema);
var Calendars = mongoose.model('Calendar', calendarSchema);

var createAccount = function (req) {
  var hash = bcrypt.hashSync(req.body.password, 8);
  return Users.findOne({username: req.body.username})
  .then(function (user) {
    return account.signUpValidation(req, user);
  })
  .then(function (errors) {
    if(errors.length === 0) {
      return Calendars.create({type: 'default', data: req.body.calendar})
      .then(function (calendar) {
        return Users.create({username: req.body.username, password: hash, calendar: calendar._id})
      })
    }
    else {
      return errors;
    }
  })
}

module.exports = {
  createAccount: createAccount
}
