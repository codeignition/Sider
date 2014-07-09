'use strict';

var should = require('should'),
mongoose = require('mongoose'),
User = mongoose.model('User'),
Database = mongoose.model('Database'),
Info = mongoose.model('Info'),
request = require('supertest'),
superrequest = require('super-request'),
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
          res.body['name'].should.equal(database['name']);
          done();
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
            JSON.stringify(res.body).should.containDeep('Database Name');
            done();
          });
        });
      });
    });

    it('should not be able to see databases of other users', function(done) {
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
      user2.save(function(err){
        var db = new Database({
          name: 'User2db',
          host:'localhost',
          port:6379,
          user: user2
        });
        db.save(function(err){
          if(err)console.log(err);
        });
      });
      helpers.login('username2', 'password2', function(cookie) {
        request(app)
        .get('/databases')
        .set('cookie',cookie)
        .expect(200)
        .end(function(err, res){
          JSON.stringify(res.body).should.containDeep('Full Name2');
          JSON.stringify(res.body).should.not.containDeep('Database Name');
          done();
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

    it('should return redis db info from Info database', function(done){
      database.save();

      helpers.login('username', 'password', function(cookie) {
        request(app)
        .get('/databases/' + database._id + '/info')
        .set('cookie',cookie)
        .expect(200)
        .end(function(err, res) {
          JSON.stringify(res.body).should.containDeep('keys');
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

    it('should disable eval commands from redis server', function(done){
      database.save();
      helpers.login('username','password',function(cookie) {
        request(app)
        .get('/databases/' + database._id+'/execute')
        .send({command:'eval'})
        .set('cookie',cookie)
        .expect(200)
        .end(function(err, res) {
          res.body.result.should.equal("You can not do eval");
          done();
        });
      });
    });

    it('should set workingdb attribute in req.session for select commands', function(done){
      database.save();
      helpers.login('username','password',function(cookie) {
        request(app)
        .get('/databases/' + database._id+'/execute')
        .send({command:'select 1'})
        .set('cookie',cookie)
        .end(function(err, res){
          res.body.result.should.equal('OK');
          res.body.workingdb.should.equal('1');
          done();
        })
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

    it('should respond with error message for invalid commands', function(done){
      database.save();
      helpers.login('username','password',function(cookie) {
        request(app)
        .get('/databases/' + database._id+'/execute')
        .send({command:'asdfads'})
        .set('cookie',cookie)
        .expect(400)
        .end(function(err, res) {
          should.exist(res.body.result);
          res.body.result.should.equal('Invalid Command');
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

    it('should return update db content', function(done){
      database.name='New Name';
      database.save();
      helpers.login('username', 'password', function(cookie) {
        request(app)
        .put('/databases/' + database._id)
        .set('cookie',cookie)
        .send(database)
        .expect(200)
        .end(function(err, res) {
          JSON.stringify(res.body).should.containDeep('New Name');
          JSON.stringify(res.body).should.not.containDeep('Database Name');
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

    it('should delete db', function(done){
      database.save();
      var databaseId = JSON.stringify(database._id);
      helpers.login('username', 'password', function(cookie) {
        request(app)
        .delete('/databases/' + database._id)
        .set('cookie',cookie)
        .end(function(err, res){
          JSON.stringify(res.body._id).should.equal(databaseId);
          done();
        });
      });
    });
  });

  describe('GET /databases/:id/infos', function(){
    it('should require user login', function(done){
      database.save();
      request(app)
      .get('/databases/' + database._id +'/infos')
      .expect(401, done);
    });

    it('should allow only authorized user', function(done){
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
          .get('/databases/' + database._id+'/infos')
          .set('cookie',cookie)
          .expect(403, done);
        });
      });
    });
    it('should give the info-db of req database', function(done){
      database.save(function(){
        helpers.login('username', 'password', function(cookie) {
          request(app)
          .get('/databases/' + database._id+ '/infos')
          .set('cookie',cookie)
          .end(function(err, res){
            Info.find({database : database._id}).sort('-timestamp').limit(10)
            .exec(function(error, data){
              JSON.stringify(data).should.equal(JSON.stringify(res.body));
              done();
            });
          });
        });
      });
    });
  });

  describe('GET  /databases/:databaseId/currentCollection', function(done){
    it('should require user login', function(done){
      database.save();
      request(app)
      .get('/databases/'+database._id+'/currentCollection')
      .expect(401, done);
    });

    it('should allow only authorized users', function(done){
      var user2 = new User({
        firstName: 'Full',
        lastName: 'Name2',
        displayName: 'Full Name2',
        email: 'test2@test.com',
        username: 'username2',
        password: 'password2',
        provider: 'local'
      });
      user2.save();
      database.save();
      helpers.login('username2','password2',function(cookie){
        request(app)
        .get('/databases/'+database._id+'/currentCollection')
        .set({'cookie':cookie})
        .expect(403, done);
      });
    });

    it('should return currentCollection selected in user-redisConsole', function(done){
      database.save();
      helpers.login('username', 'password', function(cookie){
        request(app)
        .get('/databases/'+database._id+'/execute')
        .set({'cookie':cookie})
        .send({command:'select 1'})
        .expect(200)
        .end(function(err, res){
          res.body.result.should.equal("OK");
          request(app)
          .get('/databases/'+database._id+'/currentCollection')
          .set({'cookie':cookie})
          .expect(200)
          .end(function(err, res){
            res.body.workingdb.should.equal('1');
            done();
          });
        });
      });
    });
  });

  describe('GET /databases/:id/keySearch', function(){
    it('should require user login', function(done){
      database.save();
      request(app)
      .get('/databases/' + database._id +'/keySearch')
      .expect(401, done);
    });

    it('should allow only authorized user', function(done){
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
          .get('/databases/' + database._id+'/keySearch')
          .set('cookie',cookie)
          .expect(403, done);
        });
      });
    });

    it('should return keys matching to searchKeyword in selectedCollection', function(done){
      database.save(function(){
        helpers.login('username', 'password', function(cookie) {
          request(app)
          .get('/databases/' + database._id+ '/keySearch')
          .send({searchKeyword:'foo',selectedCollection:'db0'})
          .set('cookie',cookie)
          .end(function(err, res){
            JSON.stringify(res.body).should.equal(JSON.stringify({result:["foo234567890","foo","foo123435366","foo34534253425234567890"]})); done();
          });
        });
      });
    });

    it('should return keys matching to searchKeyword in AllCollections', function(done){
      database.save();
      helpers.login('username','password', function(cookie){
        request(app)
        .get('/databases/'+database._id+'/keySearch')
        .send({searchKeyword:'d', selectedCollection:'All Collections'})
        .set('cookie', cookie)
        .end(function(err, res){
          JSON.stringify(res.body).should.equal(JSON.stringify({result:['dsafad-db0', 'dsafadf-db0', 'dsaf2-db2','dasfs-db2']}));
          done();
        });
      });
    });
  });

  describe('GET /databases/:databaseId/keyValue', function(){
    it('should require user login', function(done){
      database.save();
      request(app)
      .get('/databases/'+database._id+'/keyValue')
      .expect(401, done);
    });

    it('should allow only authentic users', function(done){
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
          .get('/databases/' + database._id+'/keyValue')
          .set('cookie',cookie)
          .expect(403, done);
        });
      });
    });

    it('should return value of the selected key', function(done){
      database.save();
      helpers.login('username','password', function(cookie){
        request(app)
        .get('/databases/'+database._id+'/keyValue')
        .set('cookie',cookie)
        .send({key:'foo', selectedCollection:'db1'})
        .expect(200)
        .end(function (error,res) {
          res.body.value.should.equal('bar');
          done();
        });
      });
    });
  });

  afterEach(function(done) {
    Database.remove().exec();
    User.remove().exec();
    Info.remove().exec();
    done();
  });
});
