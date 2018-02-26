const { URL } = require('url');
const { isURL } = require('validator');

const validatorOpts = {
  protocols: ['http', 'https'],
  require_protocol: true,
};

module.exports = {
  /**
   * Determines if the URL is valid.
   *
   * @param {string} url
   * @return {boolean}
   */
  isValid(url) {
    return isURL(String(url), validatorOpts);
  },

  /**
   * Creates a Node URL instance from a URL string.
   *
   * @param {string} url
   * @return {URL}
   */
  parse(url) {
    return new URL(url);
  },
};
