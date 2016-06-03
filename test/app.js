var request = require('supertest');
var app = require('../app');

describe('GET /', function(){
    it('should return 302, redirect to login page', function(done){
        request(app).get('/').expect(302, done);
    });
});