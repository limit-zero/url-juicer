const cheerio = require('cheerio');
const index = require('../src/index');


describe('index', function() {
  it('should export an object with the correct properties.', function(done) {
    expect(index).to.be.an('object');
    expect(index).to.have.property('crawler');
    expect(index).to.have.property('extractor');
    done();
  });
});
