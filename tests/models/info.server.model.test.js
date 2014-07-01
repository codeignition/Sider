'use strict';

/**
 * Module dependencies.
 */

var should = require('should'),
mongoose = require('mongoose'),
User = mongoose.model('User'),
Database = mongoose.model('Database'),
Info = mongoose.model('Info');
/**
 * Globals
 */
var user, info, database;

/**
 * Unit tests
 */
describe('Info Model Unit Tests:', function() {
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
        host: 'host',
        port: 1000,
        user: user
      });
      database.save(function(){
        info = new Info({
          database: database,
          content: { redis_version: '2.6.16',
            redis_git_sha1: '00000000',
            versions: [ 2, 6, 16 ] }
        });
        done();
      });
    });
  });


  describe('Method Save', function() {
    it('should be able to save without problems', function(done) {
      info.save(function(err) {
        should.not.exist(err);
        done();
      });
    });
  });

  afterEach(function(done) {
    Info.remove().exec();
    User.remove().exec();

    done();
  });
});
