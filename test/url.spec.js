const { URL } = require('url');
const url = require('../src/url');

describe('url', function() {
  it('should export an object.', function(done) {
    expect(url).to.be.an('object');
    done();
  });
  describe('#validate', function() {
    ['', null, undefined, false, 0, 'somestring', 'ftp://google.com', 'localhost', '//some/path', 'http://', 'https://', 'http://localhost'].forEach((value) => {
      it(`should throw an error when the url is '${value}'.`, function(done) {
        expect(url.isValid(value)).to.be.false;
        done();
      });
    });
    ['http://google.com', 'http://google.com ', ' http://google.com', 'https://google.com/', 'http://www.google.com:80', 'https://www.google.com/foo?bar=baz', 'http://user:password@google.com'].forEach((value) => {
      it(`should return true when the url is '${value}'.`, function(done) {
        expect(url.isValid(value)).to.be.true;
        done();
      });
    });
  });
  describe('#parse', function() {
    it('should return a URL instance.', function(done) {
      expect(url.parse('http://www.google.com')).to.be.an.instanceOf(URL);
      done();
    });
  });
});
