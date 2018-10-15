module.exports = {
  "apps" : [{
    "name"        : "info-sever:dev",
    "script"      : "./app.js",
    "watch"       : true,
    "ignore_watch": ["out.log"],
    "out_file"    : "./out.log",
    "error_file"    : "./out.log",
    env: {
      "PORT": "3001",
      "DB_URL": "localhost:27017/digixdao",
      "WEB3_HTTP_PROVIDER": "https://mainnet.infura.io",
    },
  }]
}
