'use strict';

var should = require('should'),
mongoose = require('mongoose'),
User = mongoose.model('User'),
Database = mongoose.model('Database'),
request = require('supertest'),
passport = require('passport'),
app = require('../../server.js');

var user, database;

describe('Database Controller Tests:', function() {
  beforeEach(function(done) {
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: 'username',
      password: 'password'
    });

    user.save(function() { 
      database = new Database({
        name: 'Database Name',
        host:'host',
        port: 1000,
        user: user
      });
      done();
    });
  });

  describe('POST /database', function () {
    it('should require user login', function(done){
      request(app)
      .post('/databases')
      .send(database)
      .expect(401, done);
    });

    xit('should create a new database', function(done) {
      var cookie;
      request(app)
      .post('/auth/signin')
      .send({ user: 'username', password: 'password' })
      .end(function(err,res){
        cookie = res.headers['set-cookie'];
        console.log(res.status);
        console.log(cookie);
        request(app)
        .post('/databases')
        .set('cookie', cookie)
        .expect(200, done);
      });
    });
  });

    afterEach(function(done) { 
   //   Database.remove().exec();
    //  User.remove().exec();
      done();
    });
  });
