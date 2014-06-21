request = require('supertest'),
passport = require('passport'),
app = require('../../server.js');

exports.login = function (user, callback) {
  request(app)
  .post('/auth/signin')
  .send({ username: user.username, password: user.password })
  .end(function(err,res){
    callback(res.headers['set-cookie']);
  });
}
