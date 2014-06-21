'use strict';

var should = require('should'),
mongoose = require('mongoose'),
User = mongoose.model('User'),
Database = mongoose.model('Database'),
request = require('supertest'),
path = require('path'),
app = require('../../server.js'),
helpers = require('../test_helper.js');

var user, database;

describe('Database Controller Tests:', function() {
  beforeEach(function(done) {
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: 'username',
      password: 'password',
      provider: 'local'
    });

    user.save(function(err) {
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

    it('should create a new database', function(done) {
      helpers.login('username', 'password', function(cookie) {
        request(app)
        .post('/databases')
        .set('cookie', cookie)
        .send(database)
        .expect(200)
        .end(function(err,res){
          Database.findOne({ '_id' : res.body['_id']}, function(err, db){
            db.name.should.equal(database['name']);
            done();
          });
        });
      });
    });
  });


  describe('GET /databases', function(){
    it('should require user login', function(done){
      request(app)
      .get('/databases')
      .expect(401, done);
    });

    it('should show list of databases of that user', function(done){
      database.save(function() {
        helpers.login('username', 'password', function(cookie){
          request(app)
          .get('/databases')
          .set('cookie', cookie)
          .expect(200)
          .end(function(err, res){
            Database.find({ 'user_id' : res.body['user']}, function(err, dbs){
              dbs[0].name.should.equal(database['name']);
              done();
            });
          });
        });
      });
    });

    xit('should not be able to see databases of other users', function() {
    });
  });

  afterEach(function(done) { 
    Database.remove().exec();
    User.remove().exec();
    done();
  });
});
