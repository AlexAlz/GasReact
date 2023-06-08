const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/Apis', // La ruta base de tu API
    createProxyMiddleware({
      target: 'https://sistematpilot.com', // El servidor de destino
      changeOrigin: true,
    })
  );

  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://api.samsara.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/fleet/reports/vehicles/fuel-energy',
      },
    })
  );
  
};
