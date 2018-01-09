// default config
const VERSION = require('fs').readFileSync(think.ROOT_PATH +'/.version','utf8');
const CDN = '/';
const STATIC_CDN = CDN.replace(/(\/$)/, '') + '/static/' + VERSION + '/';
const SEO = require('./seo');
module.exports = {
  workers: 0,
  proxy_host: '',
  proxy_port: '',
  CDN: CDN,
  HOST_NAME: '//localhost:8080',
  "X-Powered-By": 'test',
  NODE_ENV: think.env,
  STATIC_CDN: STATIC_CDN,
  VERSION: VERSION,
  SEO: SEO
};
