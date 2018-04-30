const rp = require('request-promise');
const cheerio = require('cheerio');
const urlUtil = require('./url');
const extractor = require('./extractor');

const { assign } = Object;

module.exports = {
  /**
   * Crawls the provided URL and resolves with a URL output object.
   * Will reject on an invalid URL, connection issue, or non-200 response.
   *
   * @param {string} url
   * @param {?object} options The `request` library options to include.
   * @return {Promise}
   */
  async crawl(url, options) {
    const response = await this.request(url, options);
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
      body: response.body,
    };
  },

  /**
   * Requests the provided URL and resolves with a `request-promise` Response object.
   * Will reject on an invalid URL, connection issue, or non-200 response.
   *
   * @param {string} url
   * @param {?object} options The `request` library options to include.
   * @return {Promise}
   */
  async request(url, options) {
    this.validate(url);
    const opts = assign({}, options, {
      uri: url,
      resolveWithFullResponse: true,
      time: true,
    });
    const response = await rp(opts);
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
