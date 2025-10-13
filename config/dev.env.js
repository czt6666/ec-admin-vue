var merge = require("webpack-merge");
var prodEnv = require("./prod.env");

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  BASE_URL: '"/api"',
  IS_LOGIN: true, // 是否是登录模式
  // LONG_CONNECT_URL: "'192.168.170.55:8020'", // 长连接URL
  LONG_CONNECT_URL: "'localhost:8020'", // 长连接URL
  // BASE_URL: '"/proxy"'
  //BASE_URL: '"/"'
});
