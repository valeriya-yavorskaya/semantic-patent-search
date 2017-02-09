var request = require('request');
var assert = require('assert');
var http = require('http');
var app = require('../app');
var _ = require('lodash');

var api = app.get('api');

var server = http.createServer(app);
var port = 3001;
var url = 'http://localhost:' + port + '/api/users';
var srvUser = {
  id: '1234',
  name: 'user 1',
  email: 'name1@my.com'
};

var srvUser2 = {
  id: '2234',
  name: 'user 2',
  email: 'name2@my.com'
};

var srvUser3 = {
  id: '3234',
  name: 'user 3',
  email: 'name3@my.com'
};

describe('REST API for /users', function(){
  before (function(done){
    api.data.users = [srvUser, srvUser2];

    server.listen(port, done);
  });

  after (function(done){
    server.close(done);
  });

  it ('should return list of users', function(done) {

    request.get({url:url, json:true}, function(err, res, body){
      // console.log(body);
      assert.equal(2, body.length);
      var user = body[0];
      assert.ok(user);
      assert.deepEqual(srvUser, user);
      done();
    });

  });

  it ('should get user by id', function(done){

    request.get({url:url+'/1234', json:true}, function(err, res, body){
      var user = body;
      assert.deepEqual(srvUser, user);
      done();
    });

  });

  it ('should error when unknown user id', function(done){

    request.get({url:url+'/1235', json:true}, function(err, res, body){
      assert.equal(404, res.statusCode);
      done();
    });

  });

  it ('should create user', function(done){
    api.data.users = [srvUser, srvUser2];

    request.post({url:url, json:true, body:srvUser3}, function(err, res, body){
      assert.equal(200, res.statusCode);

      var user = _.find(api.data.users, srvUser3);
      assert.ok(user);

      done();
    });
  });

  it ('should not create existant user', function(done){
    api.data.users = [srvUser, srvUser2];

    request.post({url:url, json:true, body:srvUser2}, function(err, res, body){
      assert.equal(400, res.statusCode);

      done();
    });
  });
  
});
