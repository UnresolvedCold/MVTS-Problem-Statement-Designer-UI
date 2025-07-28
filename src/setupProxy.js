const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy API requests to MVTS backend
  app.use(
    '/mvts',
    createProxyMiddleware({
      target: `http://${process.env.REACT_APP_MVTS_HOST || 'localhost'}:${process.env.REACT_APP_MVTS_PORT || '8080'}`,
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log('Proxying request:', req.method, req.url, '-> target:', proxyReq.path);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log('Proxy response:', proxyRes.statusCode, req.url);
      }
    })
  );
};
