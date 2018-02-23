const { isURL } = require('validator');

const urlOpts = {
  protocols: ['http', 'https'],
  require_protocol: true,
};

module.exports = async (url) => {
  if (!isURL(String(url), urlOpts)) throw new Error(`The provided value '${url}' is not a valid URL.`);
};
