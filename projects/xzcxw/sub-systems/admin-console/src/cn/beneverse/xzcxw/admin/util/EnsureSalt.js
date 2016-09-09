/**
 * Created by duansj on 15-3-16.
 */
var crypto = require('crypto');
var utility = require('utility');

module.exports = function (user) {
  if (user.password) {
    // create password_sha on server
    user.salt = crypto.randomBytes(30).toString('hex');
    user.password_sha = utility.sha1(user.password + user.salt);


  }
  return user;
};
