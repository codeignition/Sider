request = require('supertest'),
passport = require('passport'),
app = require('../server.js');

exports.login = function (username, password, callback) {
  request(app)
  .post('/auth/signin')
  .send({ username: username, password: password })
  .end(function(err,res){
    callback(res.headers['set-cookie']);
  });
}
