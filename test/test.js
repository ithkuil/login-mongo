// Generated by ToffeeScript 1.6.3-5
(function() {
  var Mongolian, assert, col, db, fs, mongoConnection, sinon, t, users;

  assert = require('assert');

  users = require('../lib/users.js');

  Mongolian = require('mongolian');

  mongoConnection = "mongo://localhost:27017/test_login";

  db = new Mongolian(mongoConnection);

  t = require('timed');

  fs = require('fs');

  sinon = require('sinon');

  col = db.collection('users');

  users.config({
    connect: mongoConnection
  });

  col.remove();

  describe('login-mongo', function() {
    describe('config', function() {
      return it('should extend the config object and create a connection', function() {
        col.remove();
        assert.equal(users.opts.mail.mailer, 'sendmail');
        users.config({
          mail: {
            bodyadd: 'test'
          }
        });
        assert.ok(users.opts.mail != null);
        assert.equal(users.opts.mail.bodyadd, 'test');
        return assert.equal(users.opts.mail.mailer, 'sendmail');
      });
    });
    describe('checkExists', function() {
      return it('should return true if user with that email exists or false if not', function(done) {
        var found, foundnow,
          _this = this;
        col.remove();
        users.checkExists('bob@home.com', function() {
          found = arguments[0];
          assert.equal(found, false);
          t.reset();
          col.insert({
            name: 'bob',
            email: 'bob@home.com'
          }, function() {
            console.log("insert elapsed: " + (t.rounded()) + " ms");
            users.checkExists('bob@home.com', function() {
              foundnow = arguments[0];
              assert.equal(foundnow, true);
              col.remove();
              return done();
            });
          });
        });
      });
    });
    describe('addNoEmail', function() {
      return it('should add a user to the configured db and collection with password hash', function(done) {
        var e, user,
          _this = this;
        users.addNoEmail('bob@home.com', 'bob', '123', function() {
          col.findOne({
            name: 'bob',
            email: 'bob@home.com'
          }, function() {
            e = arguments[0], user = arguments[1];
            assert.ok(user != null);
            assert.equal(user.email, 'bob@home.com');
            return done();
          });
        });
      });
    });
    function makeFakeSender() {
      var fakeSender, sendMail;
      fakeSender = {
        sendMail: function() {}
      };
      sendMail = sinon.stub(fakeSender, 'sendMail');
      sendMail.returns({
        message: '..'
      });
      return fakeSender;
    };
    describe('add', function() {
      return it('should add a user and send a welcome email based on the config', function(done) {
        var conf, e, fakeSender, ret, sendMailArgs, user,
          _this = this;
        col.remove();
        fakeSender = makeFakeSender();
        conf = {
          mail: {
            bodyadd: "{{name}}",
            mailer: fakeSender
          }
        };
        users.config(conf);
        users.add('eddie@home.com', 'eddie', 'pass', function() {
          e = arguments[0], ret = arguments[1];
          col.findOne({
            name: 'eddie'
          }, function() {
            e = arguments[0], user = arguments[1];
            assert.ok(user != null);
            sendMailArgs = fakeSender.sendMail.getCall(0).args[0];
            assert.equal(sendMailArgs.text, 'eddie');
            return done();
          });
        });
      });
    });
    describe('resetPassword', function() {
      return it('resets a users password to a random password and sends an email', function(done) {
        var conf, fakeSender, tempPass,
          _this = this;
        fakeSender = makeFakeSender();
        conf = {
          mail: {
            bodyreset: "{{name}}"
          }
        };
        users.config(conf);
        users.resetPassword('eddie', function() {
          tempPass = arguments[0];
          return done();
        });
      });
    });
    return describe('checkPassword', function() {
      return it('checks for a valid password in constant time', function(done) {
        var stillValid, valid,
          _this = this;
        users.add('guy@place.io', 'guy', 'pass', function() {
          users.checkPassword('guy', 'pass', function() {
            valid = arguments[0];
            assert.ok(valid);
            users.checkPassword('guy', 'badpass', function() {
              stillValid = arguments[0];
              assert.equal(false, stillValid);
              return done();
            });
          });
        });
      });
    });
  });

}).call(this);
