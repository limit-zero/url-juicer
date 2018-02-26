const rp = require('request-promise');
const cheerio = require('cheerio');
const { URL } = require('url');
const { isURL } = require('validator');
const extractor = require('./extractor');

const urlOpts = {
  protocols: ['http', 'https'],
  require_protocol: true,
};

module.exports = {
  /**
   * Crawls the provided URL and resolves with a URL output object.
   * Will reject on an invalid URL, connection issue, or non-200 response.
   *
   * @param {string} url
   * @return {Promise}
   */
  async crawl(url) {
    const response = await this.request(url);
    const $ = cheerio.load(response.body);
    const resolved = response.request.uri.href;

    const { extractTitle, extractDescription, extractOpenGraph } = extractor;

    const output = {
      status: response.statusCode,
      url: { original: url, resolved, redirected: url !== resolved },
      host: (new URL(resolved)).host,
      time: response.timings.end,
      title: extractTitle($),
      meta: {
        description: extractDescription($),
        og: extractOpenGraph($),
      },
    };
    console.info(output);
    return output;
  },

  /**
   * Requests the provided URL and resolves with a `request-promise` Response object.
   * Will reject on an invalid URL, connection issue, or non-200 response.
   *
   * @param {string} url
   * @return {Promise}
   */
  async request(url) {
    this.validate(url);
    const response = await rp({
      uri: url,
      resolveWithFullResponse: true,
      time: true,
    });
    return response;
  },

  /**
   * Validates the provided URL.
   * If valid, will return `true`, otherwise will throw an `Error`.
   *
   * @param {string} url
   * @return {boolean}
   * @throws {Error}
   */
  validate(url) {
    if (!isURL(String(url), urlOpts)) {
      throw new Error(`The provided value '${url}' is not a valid URL.`);
    }
    return true;
  },
};
