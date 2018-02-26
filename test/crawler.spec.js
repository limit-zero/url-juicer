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
      it(`should throw an error when the url is '${value}'.`, function(done) {
        expect(() => crawler.validate(value)).to.throw(Error, `The provided value '${value}' is not a valid URL.`);
        done();
      });
    });
    ['http://google.com', 'https://google.com/', 'http://www.google.com:80', 'https://www.google.com/foo?bar=baz', 'http://user:password@google.com'].forEach((value) => {
      it(`should return true when the url is '${value}'.`, function(done) {
        expect(crawler.validate(value)).to.be.true;
        done();
      });
    });
  });

  describe('#request', function() {
    beforeEach(function() {
      sandbox.stub(rp, 'Request');
      rp.Request.resolves({});
    });
    afterEach(function() {
      sandbox.restore();
    });
    it('should reject with an invalid URL', async function() {
      await expect(crawler.request('')).to.be.rejectedWith(Error, /not a valid URL/i);
      sinon.assert.notCalled(rp.Request);
    });
    it('should resolve with a valid URL and the expected Request arguments.', async function() {
      await expect(crawler.request('https://www.google.com')).to.eventually.be.an('object');
      sinon.assert.calledWith(rp.Request, { uri: 'https://www.google.com', resolveWithFullResponse: true, time: true, callback: undefined });
    });
  });

  describe('#crawl', function() {
    beforeEach(function() {
      const commonArgs = { resolveWithFullResponse: true, time: true, callback: undefined };
      const body = `
        <html>
          <head>
            <title>Test title</title>
            <meta name="description" content="Test description">
            <meta property="og:title" content="Graph title">
            <meta property="og:description" content="Graph description">
          </head>
          <body>
            <h1>Hello world!</h1>
          </body>
        </html>
      `;

      sandbox.stub(rp, 'Request');
      rp.Request.withArgs(Object.assign({ uri: 'https://www.google.com' }, commonArgs)).resolves({
        statusCode: 200,
        body,
        timings: { end: 201.1 },
        request: { uri: { href: 'https://www.google.com' } },
      });
      rp.Request.withArgs(Object.assign({ uri: 'http://www.google.com:8080' }, commonArgs)).resolves({
        statusCode: 200,
        body,
        timings: { end: 201.1 },
        request: { uri: { href: 'http://www.google.com:8080' } },
      });
      rp.Request.withArgs(Object.assign({ uri: 'https://google.com' }, commonArgs)).resolves({
        statusCode: 200,
        body,
        timings: { end: 201.1 },
        request: { uri: { href: 'https://www.google.com' } },
      });
      rp.Request.callThrough();
    });
    afterEach(function() {
      sandbox.restore();
    });

    it('should reject with an invalid URL', async function() {
      await expect(crawler.crawl('')).to.be.rejectedWith(Error, /not a valid URL/i);
      sinon.assert.notCalled(rp.Request);
    });
    it('should return the desired output object.', async function() {
      const promise = crawler.crawl('https://www.google.com');
      await expect(promise).to.eventually.be.an('object');
      const output = await promise;
      expect(output.status).to.equal(200);
      expect(output.url).to.be.an('object');
      expect(output.url.original).to.equal('https://www.google.com');
      expect(output.url.resolved).to.equal('https://www.google.com');
      expect(output.url.redirected).to.equal(false);
      expect(output.host).to.equal('www.google.com');
      expect(output.time).to.equal(201.1);
      expect(output.title).to.equal('Test title');
      expect(output.meta).to.be.an('object');
      expect(output.meta.description).to.equal('Test description');
      expect(output.meta.og).to.be.an('object');
      expect(output.meta.og.title).to.equal('Graph title');
      expect(output.meta.og.description).to.equal('Graph description');
      sinon.assert.calledOnce(rp.Request);
    });
    it('should return the desired output object when redirected.', async function() {
      const promise = crawler.crawl('https://google.com');
      await expect(promise).to.eventually.be.an('object');
      const output = await promise;
      expect(output.status).to.equal(200);
      expect(output.url).to.be.an('object');
      expect(output.url.original).to.equal('https://google.com');
      expect(output.url.resolved).to.equal('https://www.google.com');
      expect(output.url.redirected).to.equal(true);
      expect(output.host).to.equal('www.google.com');
      sinon.assert.calledOnce(rp.Request);
    });

    it('should return the desired output object without the host containing a port.', async function() {
      const promise = crawler.crawl('http://www.google.com:8080');
      await expect(promise).to.eventually.be.an('object');
      const output = await promise;
      expect(output.status).to.equal(200);
      expect(output.host).to.equal('www.google.com');
      sinon.assert.calledOnce(rp.Request);
    });
  });

});
