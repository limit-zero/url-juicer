const crawler = require('../src/crawler');
const createServer = require('./server');

describe('crawler.integration', function() {
  const server = createServer();
  const port = 2122;
  const host = `http://127.0.0.1.xip.io:${port}`;
  before(async function() {
    await server.listen(port);
  });
  after(async function() {
    await server.close();
  });

  describe('#request', function() {
    it('should resolve with a response object when using a valid url.', async function() {
      const promise = crawler.request(`${host}/exists`);
      await expect(promise).to.eventually.be.an('object');
      const response = await promise;
      expect(response.statusCode).to.equal(200);
      expect(response.body).to.be.a('string');
      expect(response.timings).to.be.an('object');
      expect(response.request).to.be.an('object');
    });
    it('should reject when using a url that returns a 400-range status code.', async function() {
      const promise = crawler.request(`${host}/does-not-exist`);
      await expect(promise).to.be.rejectedWith(Error, /404/);
    });
    it('should reject when using a url that returns a 500-range status code.', async function() {
      const promise = crawler.request(`${host}/internal-server-error`);
      await expect(promise).to.be.rejectedWith(Error, /500/);
    });
    it('should following a 301 redirect resolve with a response object from the final target.', async function() {
      const promise = crawler.request(`${host}/redirect-301`);
      await expect(promise).to.eventually.be.an('object');
      const response = await promise;
      expect(response.statusCode).to.equal(200);
    });
    it('should following a 302 redirect resolve with a response object from the final target.', async function() {
      const promise = crawler.request(`${host}/redirect-302`);
      await expect(promise).to.eventually.be.an('object');
      const response = await promise;
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('#crawl', function() {
    it('should resolve with the correct output object when using a valid url.', async function() {
      const url = `${host}/exists`;
      const promise = crawler.crawl(url);
      await expect(promise).to.eventually.be.an('object');
      const response = await promise;
      expect(response.status).to.equal(200);
      expect(response.time).to.be.a('number');
      expect(response.host).to.equal('127.0.0.1.xip.io');
      expect(response.url.original).to.equal(url);
      expect(response.url.resolved).to.equal(url);
      expect(response.url.redirected).to.be.false;
      expect(response.body).to.equal(server.getBody());
    });
    it('should resolve with the correct output object when using a valid url that is redirected (301).', async function() {
      const url = `${host}/redirect-301`;
      const promise = crawler.crawl(url);
      await expect(promise).to.eventually.be.an('object');
      const response = await promise;
      expect(response.status).to.equal(200);
      expect(response.time).to.be.a('number');
      expect(response.host).to.equal('127.0.0.1.xip.io');
      expect(response.url.original).to.equal(url);
      expect(response.url.resolved).to.equal(`${host}/exists`);
      expect(response.url.redirected).to.be.true;
      expect(response.body).to.equal(server.getBody());
    });
    it('should resolve with the correct output object when using a valid url that is redirected (302).', async function() {
      const url = `${host}/redirect-302`;
      const promise = crawler.crawl(url);
      await expect(promise).to.eventually.be.an('object');
      const response = await promise;
      expect(response.status).to.equal(200);
      expect(response.time).to.be.a('number');
      expect(response.host).to.equal('127.0.0.1.xip.io');
      expect(response.url.original).to.equal(url);
      expect(response.url.resolved).to.equal(`${host}/exists`);
      expect(response.url.redirected).to.be.true;
      expect(response.body).to.equal(server.getBody());
    });
    it('should reject when using a url that returns an bad status.', async function() {
      const promise = crawler.crawl(`${host}/does-not-exist`);
      await expect(promise).to.be.rejectedWith(Error, /404/);
    });
  });

});
