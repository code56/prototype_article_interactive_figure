// testing the node installation
//If your installation is successful then you will get a hello world output in the screen.

var sys = require("sys");
sys.puts("Hello World");

// to test the file upload of my server
// http://stackoverflow.com/questions/10120866/how-to-unit-test-with-a-file-upload-in-mocha
var should = require('should'),
    supertest = require('supertest');
var request = supertest('localhost:8182');

describe('upload', function() {
    it('a file', function(done) {
       request.post('/uploads')  //request.post('/your/endpoint')
              .field('extra_info', '{"in":"case you want to send json along with your file"}')
              .attach('image', 'path/to/file.jpg')
              .end(function(err, res) {
                  res.should.have.status(200); // 'success' status
                  done();
              });
    });
});





