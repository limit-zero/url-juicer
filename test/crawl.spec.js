const crawl = require('../src/crawl');

describe('crawl', function() {
  it('should export a function.', function(done) {
    expect(crawl).to.be.a('function');
    done();
  });
  ['', null, undefined, false, 0, 'somestring', 'ftp://google.com', 'localhost', '//some/path', 'http://', 'https://', 'http://not-fqdn'].forEach((value) => {
    it(`should reject when the URL value is '${value}'.`, async function() {
      await expect(crawl(value)).to.be.rejectedWith(Error, `The provided value '${value}' is not a valid URL.`);
    });
  });
  ['http://google.com', 'https://www.google.com', 'https://www.google.com/some-path/?andquery=bar'].forEach((value) => {
    it(`should resolve when the URL value is '${value}'.`, async function() {
      await expect(crawl(value)).to.eventually.be.fulfilled;
    });
  });

});
