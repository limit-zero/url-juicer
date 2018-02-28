const fs = require('fs');
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

  describe('#extractUrls', function() {
    [
      '',
      '<a>foo</a>',
      `<a>foo</a><a href="">bar</a>`,
      `<a href="ftp://foo.com">baz</a>`,
      `<a href="tel://1234567">baz</a>`,
      `<a href="mailto://bar@foo.com">baz</a>`,
      `<a href="www.foo.com">baz</a>`,
      `<a href="http">baz</a><a href="http:">baz</a>`,
      `<a href="https">baz</a><a href="https:">baz</a>`,
    ].forEach((value) => {
      it(`should return an empty array when the value is '${value}'.`, function(done) {
        const $ = cheerio.load(value);
        const urls = extractor.extractUrls($);
        expect(urls).to.be.an('array');
        expect(urls).to.deep.equal([]);
        done();
      });
    });
    [
      `
      <a href="http://www.google.com"></a>
      <a href="https://www.google.com"></a>
      `,
      `
      <a href="http://www.google.com"></a>
      <a href="http://www.google.com"></a>
      <a href="https://www.google.com"></a>
      `,
      `
      <a href="http://www.google.com"></a>
      <a href="http://www.google.com"></a>
      <a href="http://www.google.com"></a>
      <a href="https://www.google.com"></a>
      <a href="https://www.google.com"></a>
      `,
    ].forEach((value) => {
      it(`should return the a unique array of URLs when the value is '${value}'.`, function(done) {
        const $ = cheerio.load(value);
        const urls = extractor.extractUrls($);
        expect(urls).to.be.an('array');
        expect(urls).to.deep.equal(['http://www.google.com', 'https://www.google.com']);
        done();
      });
    });
    it(`should not inherently trim the URL values.`, function(done) {
      const $ = cheerio.load(`<a href="http://www.google.com "></a><a href="http://www.google.com"></a>`);
      const urls = extractor.extractUrls($);
      expect(urls).to.be.an('array');
      expect(urls).to.deep.equal(['http://www.google.com ', 'http://www.google.com']);
      done();
    });
    it('should handle not-so-pretty markup.', function(done) {
     const value = `
        <a href=http://www.google.com></a>
        <a href='http://www.amazon.com'></a>
        <a HREF=http://www.foo.com></a>
      `;
      const $ = cheerio.load(value);
      const urls = extractor.extractUrls($);
      expect(urls).to.be.an('array');
      expect(urls).to.deep.equal(['http://www.google.com', 'http://www.amazon.com', 'http://www.foo.com']);
      done();

    });
    [
      { value: '<a href="http://www.google.com?foo=bar&amp;baz=dill"></a>', expected: 'http://www.google.com?foo=bar&baz=dill' },
      { value: '<a href="http://www.google.com?foo=bar&#38;baz=dill"></a>', expected: 'http://www.google.com?foo=bar&baz=dill' },
    ].forEach((html) => {
      it(`should properly decode HTML ampersand entities in the URLs when the value is '${html.value}'.`, function(done) {
        const $ = cheerio.load(html.value);
        const urls = extractor.extractUrls($);
        expect(urls[0]).to.equal(html.expected);
        done();
      });
    });
    [
      { value: '<a href="http://www.google.com/some%20path"></a>', expected: 'http://www.google.com/some%20path' },
      { value: '<a href="http://www.google.com?q=%3Ffoo%3Dbar"></a>', expected: 'http://www.google.com?q=%3Ffoo%3Dbar' },
    ].forEach((html) => {
      it(`should properly retain URL encoded values when the value is '${html.value}'.`, function(done) {
        const $ = cheerio.load(html.value);
        const urls = extractor.extractUrls($);
        expect(urls[0]).to.equal(html.expected);
        done();
      });
    });
    [
      { value: '<a href="http://www.google.com?foo=🙃"></a>', expected: 'http://www.google.com?foo=🙃' },
      { value: '<a href="http://www.google.com/🙃/🙃"></a>', expected: 'http://www.google.com/🙃/🙃' },
      { value: '<a href="http://www.google.com/?🙃=🙃"></a>', expected: 'http://www.google.com/?🙃=🙃' },
    ].forEach((html) => {
      it(`should properly retain unicode values when the value is '${html.value}'.`, function(done) {
        const $ = cheerio.load(html.value);
        const urls = extractor.extractUrls($);
        expect(urls[0]).to.equal(html.expected);
        done();
      });
    });
    it('should ignore commented-out URLs.', function(done) {
      const value = `
        <a href="http://www.google.com"></a>
        <!-- <a href="https://www.google.com"></a> -->
        <!--a href="https://www.amazon.com"></a-->
      `;
      const $ = cheerio.load(value);
      const urls = extractor.extractUrls($);
      expect(urls).to.be.an('array');
      expect(urls).to.deep.equal(['http://www.google.com']);
      done();
    });

    const fileUrls = {};
    before(function(done) {
      fs.readFile(__dirname + '/html-samples/email-1.samp', 'utf8', (err, html) => {
        if (err) {
          done(err);
        } else {
          const $ = cheerio.load(html);
          fileUrls['email-1.samp'] = extractor.extractUrls($);
          done();
        }
      });
    });

    it(`should properly extract URLs from a large HTML file.`, function(done) {
      const urls = [
        'http://pubads.g.doubleclick.net/gampad/jump?co=1&iu=137873098/IEN-Newsletters-600x100&sz=600x100&c=2035059159&t=dayofweek%3DTue%26nl_date%3D2018-02-27%26weeknum%3D09%26month%3D02%26day%3D27%26year%3D2018%26nl_name%3DIEN%2BToday%26nl_id%3D56781dd03aab46f646b2f060',
        'http://www.ien.com',
        'http://www.ien.com/operations/news/20994104/fed-points-to-strong-outlook-gradual-rate-hikes',
        'http://www.ien.com/product-development/video/20994112/how-to-ruin-a-selfdriving-car',
        'http://www.ien.com/operations/news/20994141/boeing-trump-reach-deal-on-air-force-one',
        'http://www.ien.com/operations/news/20994077/jack-daniels-fights-whiskey-barrel-tax',
        'https://ien.wufoo.com/forms/zfvbiuf02nohd9/',
        'https://www.facebook.com/IndustrialEquipmentNews/',
        'http://www.ien.com/product-development/news/20994115/how-to-use-bitcoin-to-buy-a-subaru',
        'http://www.ien.com/operations/news/20994098/residents-protest-lead-plant-in-indiana',
        'http://ezledmh.oeo.com/08-ien_20_for_1000_eblast_3/',
        'http://www.ien.com/product-development/news/20994139/ford-forms-test-bed-for-selfdriving-cars',
        'http://www.ien.com/product-development/news/20994085/state-oks-autonomous-vehicle-tests-without-backup-drivers',
        'http://www.ien.com/new-products/material-handling-storage/product/20993424/creform-simple-cart-offers-flexibility-durability',
        'https://www.khkgears.us/products/',
        'http://www.khkgears.us',
        'http://www.ien.com/operations/news/20994110/incinerating-trash-is-not-effective',
        'http://www.ien.com/new-products/general-equipment/product/20993954/ledtronics-led-machine-status-indicator-utility-bulbs',
        'https://www.sealconusa.com/products/circular-connectors/twilock/',
        'http://www.ien.com/operations/news/20994088/durable-goods-down-37-percent',
        'http://www.ien.com/regulation/news/20994081/geman-courts-approve-diesel-ban-option',
        'http://ladderindustries.com/',
        'http://www.ladderindustries.com',
        'http://www.ien.com/product-development/news/20994119/researchers-enhance-computer-chips-for-impending-advancements',
        'http://www.ien.com/new-products/marking-packaging/product/20993437/laser-photonics-handheld-marking-engraving',
        'https://www.dornerconveyors.com/iene',
        'http://www.ien.com/product-development/news/20994152/scapa-opens-3-rd-centers',
        'http://www.ien.com/contact-us',
        'http://www.ien.com/subscribe/email',
        'http://www.ien.com/advertise',
        'http://www.ien.com/privacy-policy'
      ];
      const extracted = fileUrls['email-1.samp'];
      urls.forEach((url) => {
        expect(extracted).to.include(url);
      });
      expect(extracted.length).to.equal(urls.length);
      done();
    });
  });
});
