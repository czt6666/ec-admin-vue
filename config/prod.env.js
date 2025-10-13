module.exports = {
  NODE_ENV: '"production"',
  //可以在nginx上把/api代理到后端:  proxy_pass http://localhost:8080/;
  BASE_URL: '"/api"',
  // BASE_URL: '"/"', //可以在nginx上把/api代理到后端:  proxy_pass http://localhost:8080/;
  // BASE_URL: '"/webofd"', // tomcat使用
  IS_LOGIN: true, // 是否是登录模式
  // LONG_CONNECT_URL: "'192.168.170.11:8020'", // 长连接URL
  LONG_CONNECT_URL: "'localhost:8020'", // 长连接URL
};
