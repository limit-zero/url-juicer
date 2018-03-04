const cheerio = require('cheerio');
const urlUtil = require('./url');

module.exports = {
  /**
   * Creates a Cheerio function instance from the provided HTML.
   *
   * @param {string} html
   * @return {function}
   */
  cheerio(html) {
    return cheerio.load(html);
  },

  /**
   * Extracts the description text from the `<meta name="description">` content value.
   *
   * @param {function} $ The Cheerio function instance (with loaded HTML).
   * @return {string}
   */
  extractDescription($) {
    return $('meta[name="description" i]').first().attr('content') || '';
  },

  /**
   * Extracts OpenGraph (og:*) meta property values.
   *
   * @param {function} $ The Cheerio function instance (with loaded HTML).
   * @return {object}
   */
  extractOpenGraph($) {
    const og = {};
    $('meta[property^="og:" i]').each(function extract() {
      const key = $(this).attr('property').toLowerCase().replace('og:', '');
      og[key] = $(this).attr('content') || '';
    });
    return og;
  },

  /**
   * Extracts the title text from the `<title>` element.
   *
   * @param {function} $ The Cheerio function instance (with loaded HTML).
   * @return {string}
   */
  extractTitle($) {
    return $('title').first().text();
  },

  /**
   * Extracts all href values from `<a>` elements and returns as a unique array.
   * Will only include URLs that are deemed valid from the URL utility.
   *
   * @param {function} $ The Cheerio function instance (with loaded HTML).
   * @return {string}
   */
  extractUrls($) {
    const hrefs = [];
    $('a[href]').each(function extract() {
      const href = $(this).attr('href').trim();
      if (urlUtil.isValid(href)) hrefs.push(href);
    });
    return [...new Set(hrefs)];
  },
};
