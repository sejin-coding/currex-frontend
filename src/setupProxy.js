const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api', // '/api'로 시작하는 요청을 프록시
    createProxyMiddleware({
      target: 'https://currex.kro.kr', // 백엔드 서버 URL
      changeOrigin: true, // 원본 출처 변경
    })
  );

  app.use(
    '/socket.io', // WebSocket 요청을 프록시
    createProxyMiddleware({
      target: 'https://currex.kro.kr', // 백엔드 서버 URL
      changeOrigin: true, // 원본 출처 변경
      ws: true, // WebSocket 허용
    })
  );
};
