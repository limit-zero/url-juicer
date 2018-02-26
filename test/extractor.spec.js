const cheerio = require('cheerio');
const extractor = require('../src/extractor');


describe('extractor', function() {
  describe('#cheerio', function() {
    it('should return a Cheerio function.', function(done) {
      expect(extractor.cheerio('<div></div>')).to.be.a('function');
      done();
    });
  });

  describe('#extractTitle', function() {
    [
      '<title data-some-attr="foo">Title here&excl;</title>',
      '<html><head><title>Title here!</title></head></html>',
      '<html><body><title>Title here&#33;</title><title>Another title</title></body></html>',
      '<TITLE>Title here&#x00021;</TITLE>',
      '<Title>Title here&excl;</Title>',
      '<TITLE>Title here&excl;</title>',
    ].forEach((value) => {
      it(`should return the proper title when provided a Cheerio instance with value of '${value}'.`, function(done) {
        const $ = extractor.cheerio(value);
        expect(extractor.extractTitle($)).to.equal('Title here!');
        done();
      });
    });
    [
      '',
      '<html><head></head></html>',
      '<title></title>',
      '&#x3C;title&#x3E;Foo&#x3C;/title&#x3E;',
    ].forEach((value) => {
      it(`should return the an empty title when provided a Cheerio instance with value of '${value}'.`, function(done) {
        const $ = cheerio.load(value);
        expect(extractor.extractTitle($)).to.equal('');
        done();
      });
    });
    [
      '<title>Title 🍺</title>',
      '<title>Title &#x1F37A;</title>'
    ].forEach((value) => {
      it(`should return the proper title when provided a Cheerio instance with unicode value of '${value}'.`, function(done) {
        const $ = cheerio.load(value);
        expect(extractor.extractTitle($)).to.equal('Title 🍺');
        done();
      });
    });
  });

  describe('#extractDescription', function() {
    [
      '<meta name="description" content="Description">',
      '<meta name=description content=Description>',
      '<meta name=\'description\' content=\'Description\'>',
      '<html><head><meta name="description" content="Description">',
      '<meta name="description" content="Description" />',
      '<meta name="description" content="Description"></meta>',
      '<meta name="description" content="Description"><meta name="description" content="Description 2">',
      '<meta name="Description" content="Description">',
      '<meta name="DESCRIPTION" content="Description">',
    ].forEach((value) => {
      it(`should return the proper description when provided a Cheerio instance with value of '${value}'.`, function(done) {
        const $ = cheerio.load(value);
        expect(extractor.extractDescription($)).to.equal('Description');
        done();
      });
    });
    [
      '<meta name="description" content="Description 🍺">',
      '<meta name="description" content="Description &#x1F37A;">',
    ].forEach((value) => {
      it(`should return the proper description when provided a Cheerio instance unicode with value of '${value}'.`, function(done) {
        const $ = cheerio.load(value);
        expect(extractor.extractDescription($)).to.equal('Description 🍺');
        done();
      });
    });
    [
      '<meta name="description">',
      '<meta name="description" content="">',
      '<meta name=description content=>',
    ].forEach((value) => {
      it(`should return the an empty description when provided a Cheerio instance with unicode value of '${value}'.`, function(done) {
        const $ = cheerio.load(value);
        expect(extractor.extractDescription($)).to.equal('');
        done();
      });
    });
  });

  describe('#extractOpenGraph', function() {
    [
      `
      <meta property="og:title" content="Title">
      <meta property="og:description" content="Description">
      <meta property="og:image" content="Image">
      <meta property="something else" content="foo">
      `,
      `
      <meta property="OG:TITLE" content="Title">
      <meta property="Og:Description" content="Description">
      <meta property="og:image" content="Image">
      `,
      `
      <meta property=og:title content=Title>
      <meta property='og:description' content='Description'>
      <meta property="og:image" content="Image">
      `,
    ].forEach((value) => {
      it(`should return the proper object graph object when provided a Cheerio instance with value of '${value}'.`, function(done) {
        const $ = cheerio.load(value);
        const og = extractor.extractOpenGraph($);
        expect(og).to.be.an('object');
        expect(og).to.have.property('title', 'Title');
        expect(og).to.have.property('description', 'Description');
        expect(og).to.have.property('image', 'Image');
        done();
      });
    });

    [
      `
      <meta property="og:title" content="">
      <meta property="og:description" content="">
      <meta property="og:image" content="">
      `,
      `
      <meta property="og:title" content=>
      <meta property="og:description" content=>
      <meta property="og:image" content=>
      `,
      `
      <meta property="og:title">
      <meta property="og:description">
      <meta property="og:image">
      `,
    ].forEach((value) => {
      it(`should return an open graph object with empty properties when provided a Cheerio instance with value of '${value}'.`, function(done) {
        const $ = cheerio.load(value);
        const og = extractor.extractOpenGraph($);
        expect(og).to.be.an('object');
        expect(og).to.have.property('title', '');
        expect(og).to.have.property('description', '');
        expect(og).to.have.property('image', '');
        done();
      });
    });

    [
      '',
      '<meta name="description" content="">',
      '<meta name="og:title">',
    ].forEach((value) => {
      it(`should return the an empty open graph object when provided a Cheerio instance with value of '${value}'.`, function(done) {
        const $ = cheerio.load(value);
        const og = extractor.extractOpenGraph($);
        expect(og).to.be.an('object');
        expect(og).to.not.have.property('title');
        done();
      });
    });
  });
});
