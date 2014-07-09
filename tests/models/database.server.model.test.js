'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
mongoose = require('mongoose'),
User = mongoose.model('User'),
Info = mongoose.model('Info'),
redis = require('redis'),
Database = mongoose.model('Database');

/**
 * Globals
 */
var user, database;
var database1;

/**
 * Unit tests
 */
describe('Database Model Unit Tests:', function() {
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
        host:'localhost',
        port: 6379,
        user: user
      });

      done();
    });
  });

  describe('Method Save', function() {
    it('should be able to save without problems', function(done) {
      return database.save(function(err) {
        should.not.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without name', function(done) { 
      database.name = '';

      return database.save(function(err) {
        should.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without host', function(done) {
      database.host = '';
      return database.save(function(err) {
        should.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without port', function(done) {
      database.port = '';

      return database.save(function(err) {
        should.exist(err);
        done();
      });
    });
  });

  describe('Method execute', function(){
    it('should return command result', function(done){
      database.save();
      database.execute('select 1', function(err, res){
        res.should.equal('OK');
        done();
      });
    });

    it('should disable flush,eval commands', function(done){
      database.save();
      database.execute('flushdb',function(err, res){
        should.exist(err);
        err.message.should.equal('You can not flush db!');
      });
      database.execute('eval', function(err, res){
        should.exist(err);
        err.message.should.equal('Eval is evil!');
        done();
      });
    });

    it('should give error for invalid commands', function(done){
      database.save();
      database.execute('dadsf',function(err, res){
        should.exist(err);
        done();
      });
    });
  });

  describe('Method connectionFactory',function () {
   it('should create client', function(done){
    database.save();
    database.connectionFactory(function(error, client){
      should.exist(client);
      done();
    });
   });

   it('should give error when tries to connect to an unavailable redis', function(done){
    var db = new Database({
      name: 'New DB',
      host: '1.1.1.1',
      port: 1000,
      user: user
    });
    db.save();
    db.connectionFactory(function (error, client) {
      should.exist(error);
      done();
    })
   });

  });
  describe('#fetchInfoFromClient',function(){
    it('should fetch info from redis and save as Info model', function(done){
      var database1 = new Database({
        name:'name',
        port:6379,
        host:'localhost'
      });
      database1.save(function(){
        var client = redis.createClient(database1.port, database1.host);
        database1.fetchInfoFromClient(function(err, info){
          client.info(function(){
            var process_id = client.server_info.process_id;
            (info.content.process_id).should.equal(process_id);
            Info.count({}, function(err, data){
              data.should.equal(1);
              for (var i in info.content){
                if(/^db[0-9]*$/.test(i)){
                  info.content[i].keys.should.be.a.Number;
                }
              };
              client.quit();
              done();
            });
          });
        });
      });
    });
  });

  describe('#getInfo',function(){
    beforeEach(function(done){
      database1 = new Database({
        name:'name',
        port:6379,
        host:'localhost'
      });
      database1.save(function(){
        done();
      });
    });

    it('should fetch and save info from client if no info exists', function(done){
      database1.getInfo(function(err, info){
        Info.count({}, function(err, data){
          data.should.equal(1);
          Info.find({database : database1._id}).exec(function(err, infoFromDatabase){
            (info.content.process_id).should.equal(info.content.process_id);
            done();
          })
        });
      });
    });

    it('should fetch info from database if info exists', function(done){
      database1.fetchInfoFromClient(function(error, infoFromClient){
        database1.getInfo(function(err, info){
          Info.count({}, function(err, data){
            data.should.equal(1);
            (infoFromClient.content.process_id).should.equal(info.content.process_id);
            done();
          });
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
