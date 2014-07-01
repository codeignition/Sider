'use strict';

var should = require('should'),
mongoose = require('mongoose'),
User = mongoose.model('User'),
Database = mongoose.model('Database'),
request = require('supertest'),
path = require('path'),
app = require('../../server.js'),
helpers = require('../test_helper.js'),
redis = require('redis');

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
        host:'localhost',
        port: 6379,
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
      var user2 = new User({
        firstName: 'Full',
        lastName: 'Name2',
        displayName: 'Full Name2',
        email: 'test2@test.com',
        username: 'username2',
        password: 'password2',
        provider: 'local'
      });

      database.save();

      user2.save();
      helpers.login('username2', 'password2', function(cookie) {
        request(app)
        .get('/databases')
        .set('cookie',cookie)
        .expect(200)
        .end(function(err, res){
          Database.find({ 'user2_id' : res.body['user2']}, function(err, dbs){
            dbs[0].name.should.not.equal(database['name']);
            done();
          });
        });
      });

    });
  });

  describe('GET /databases/:id/info', function() {
    it('should require user to login', function(done) {
      database.save();
      request(app)
      .get('/databases/' + database._id + '/info')
      .expect(401, done);
    });

    it('should allow only authurized user', function(done) {
      var user2 = new User({
        firstName: 'Full',
        lastName: 'Name2',
        displayName: 'Full Name2',
        email: 'test2@test.com',
        username: 'username2',
        password: 'password2',
        provider: 'local'
      });
      database.save();
      user2.save(function(err) {
        helpers.login('username2', 'password2', function(cookie) {
          request(app)
          .get('/databases/' + database._id + '/info')
          .set('cookie',cookie)
          .expect(403, done);
        });
      });
    });

    it('should return redis db info', function(done){
      database.save();

      helpers.login('username', 'password', function(cookie) {
        request(app)
        .get('/databases/' + database._id + '/info')
        .set('cookie',cookie)
        .expect(200)
        .end(function(err, res) {
          if(res.body!==null) JSON.stringify(res.body).should.containDeep('keys');
          done();
        });
      });
    });
  });

  describe('GET /databases/:id', function() {
    it('should require user to login', function(done) {
      database.save();
      request(app)
      .get('/databases/' + database._id)
      .expect(401, done);
    });

    it('should allow only authurized user', function(done) {
      var user2 = new User({
        firstName: 'Full',
        lastName: 'Name2',
        displayName: 'Full Name2',
        email: 'test2@test.com',
        username: 'username2',
        password: 'password2',
        provider: 'local'
      });
      database.save();
      user2.save(function(err) {
        helpers.login('username2', 'password2', function(cookie) {
          request(app)
          .get('/databases/' + database._id)
          .set('cookie',cookie)
          .expect(403, done);
        });
      });
    });

    it('should return db content', function(done){
      database.save();
      helpers.login('username', 'password', function(cookie) {
        request(app)
        .get('/databases/' + database._id)
        .set('cookie',cookie)
        .expect(200)
        .end(function(err, res) {
          JSON.stringify(res.body._id).should.equal(JSON.stringify(database._id));
          done();
        });
      });
    });
  });

  describe('GET /databases/:id/execute', function() {
    it('should require user to login', function(done) {
      database.save();
      request(app)
      .get('/databases/' + database._id+'/execute')
      .expect(401, done);
    });

    it('should allow only authurized user', function(done) {
      var user2 = new User({
        firstName: 'Full',
        lastName: 'Name2',
        displayName: 'Full Name2',
        email: 'test2@test.com',
        username: 'username2',
        password: 'password2',
        provider: 'local'
      });
      database.save();
      user2.save(function(err) {
        helpers.login('username2', 'password2', function(cookie) {
          request(app)
          .get('/databases/' + database._id+'/execute')
          .set('cookie',cookie)
          .expect(403, done);
        });
      });
    });

    it('should return command result', function(done){
      database.save();
      helpers.login('username', 'password', function(cookie) {
        request(app)
        .get('/databases/' + database._id+'/execute')
        .send({command:'ping'})
        .set('cookie',cookie)
        .expect(200)
        .end(function(err, res) {
           res.body.result.should.equal("PONG");
           done();
        });
      });
    });

    it('should disable flush commands from redis server', function(done){
      database.save();
      helpers.login('username','password',function(cookie) {
        request(app)
        .get('/databases/' + database._id+'/execute')
        .send({command:'flushall'})
        .set('cookie',cookie)
        .expect(200)
        .end(function(err, res) {
           res.body.result.should.equal("You can not flush db");
           done();
        });
      });
    });

    it('should handle commands with spaces', function(done){
      database.save();
      helpers.login('username','password',function(cookie) {
        request(app)
        .get('/databases/' + database._id+'/execute')
        .send({command:'set foo bar'})
        .set('cookie',cookie)
        .expect(200)
        .end(function(err, res) {
          should.exist(res.body.result);
          res.body.result.should.equal('OK');
          done();
        });
      });
    });
  });


  describe('PUT /databases/:id', function() {
    it('should require user to login', function(done) {
      database.save();
      request(app)
      .put('/databases/' + database._id)
      .expect(401, done);
    });

    it('should allow only authurized user', function(done) {
      var user2 = new User({
        firstName: 'Full',
        lastName: 'Name2',
        displayName: 'Full Name2',
        email: 'test2@test.com',
        username: 'username2',
        password: 'password2',
        provider: 'local'
      });
      database.save();
      user2.save(function(err) {
        helpers.login('username2', 'password2', function(cookie) {
          request(app)
          .put('/databases/' + database._id)
          .set('cookie',cookie)
          .expect(403, done);
        });
      });
    });

    xit('should return update db content', function(done){
      database.save();

      helpers.login('username', 'password', function(cookie) {
        request(app)
        .put('/databases/' + database._id)
        .set('cookie',cookie)
        .send(database)
        .expect(200)
        .end(function(err, res) {
          JSON.stringify(res.body._id).should.equal(JSON.stringify(database._id));
          done();
        });
      });
    });
  });

  describe('DELETE /databases/:id', function() {
    it('should require user to login', function(done) {
      database.save();
      request(app)
      .delete('/databases/' + database._id)
      .expect(401, done);
    });

    it('should allow only authurized user', function(done) {
      var user2 = new User({
        firstName: 'Full',
        lastName: 'Name2',
        displayName: 'Full Name2',
        email: 'test2@test.com',
        username: 'username2',
        password: 'password2',
        provider: 'local'
      });
      database.save();
      user2.save(function(err) {
        helpers.login('username2', 'password2', function(cookie) {
          request(app)
          .delete('/databases/' + database._id)
          .set('cookie',cookie)
          .expect(403, done);
        });
      });
    });

    xit('should delete db', function(done){
      database.save();

      helpers.login('username', 'password', function(cookie) {
        request(app)
        .delete('/databases/' + database._id)
        .set('cookie',cookie)
        .end(function(err, res){
          Database.findOne({ '_id' : database._id}, function(err, db){
            //if (db) ;
            if (err) done();
          });
      });
    });
  });
  });



  afterEach(function(done) {
    Database.remove().exec();
    User.remove().exec();
    done();
  });
});
