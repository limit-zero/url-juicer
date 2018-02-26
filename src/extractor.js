const cheerio = require('cheerio');

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
};
