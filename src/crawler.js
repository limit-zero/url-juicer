const rp = require('request-promise');
const cheerio = require('cheerio');
const urlUtil = require('./url');
const extractor = require('./extractor');

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

    return {
      status: response.statusCode,
      url: { original: url, resolved, redirected: url !== resolved },
      host: urlUtil.parse(resolved).hostname,
      time: response.timings.end,
      title: extractTitle($),
      meta: {
        description: extractDescription($),
        og: extractOpenGraph($),
      },
    };
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
   * @param {string} value
   * @return {boolean}
   * @throws {Error}
   */
  validate(url) {
    if (!urlUtil.isValid(url)) {
      throw new Error(`The provided value '${url}' is not a valid URL.`);
    }
    return true;
  },
};
