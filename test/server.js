const express = require('express');

const app = express();

const body = `
  <html>
    <head>
      <title>Test title</title>
      <meta name="description" content="Test description">
      <meta property="og:title" content="Graph title">
      <meta property="og:description" content="Graph description">
    </head>
    <body>
      <h1>Hello world!</h1>
    </body>
  </html>
`;

app.get('/exists', (req, res) => {
  res.set('Content-Type', 'text/html');
  res.send(body);
});

app.get('/internal-server-error', (req, res) => {
  res.status(500);
  res.set('Content-Type', 'text/html');
  res.send();
});

app.get('/redirect-302', (req, res) => {
  res.redirect(302, '/exists');
});

app.get('/redirect-301', (req, res) => {
  res.redirect(301, '/exists');
});

module.exports = () => {
  let server;
  return {
    getBody() {
      return body;
    },
    listen(port) {
      return new Promise((resolve, reject) => {
        server = app.listen(port, undefined, undefined, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    },
    close() {
      return new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    },
  };
};
