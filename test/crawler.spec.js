const rp = require('request-promise');
const cheerio = require('cheerio');
const crawler = require('../src/crawler');
const sandbox = sinon.createSandbox();

describe('crawler', function() {
  before(function() {
    // sandbox.stub(rp, 'Request').resolves()
  });

  it('should export an object.', function(done) {
    expect(crawler).to.be.an('object');
    done();
  });
  describe('#validate', function() {
    ['', null, undefined, false, 0, 'somestring', 'ftp://google.com', 'localhost', '//some/path', 'http://', 'https://', 'http://not-fqdn'].forEach((value) => {
      it(`should throw an error when the url is '${value}'.`, function() {
        expect(() => crawler.validate(value)).to.throw(Error, `The provided value '${value}' is not a valid URL.`);
      });
    });
    ['http://google.com', 'https://google.com/', 'http://www.google.com:80', 'https://www.google.com/foo?bar=baz', 'http://user:password@google.com'].forEach((value) => {
      it(`should return true when the url is '${value}'.`, function() {
        expect(crawler.validate(value)).to.be.true;
      });
    });
  });

});
