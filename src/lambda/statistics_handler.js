"use strict";

var fs = require("fs");
var path = require("path");

exports.get = function (event, context, callback) {
  var contents = fs.readFileSync(`public${path.sep}statistics.html`);
  var result = {
    statusCode: 200,
    body: contents.toString(),
    headers: {
      "content-type": "text/html",
      "Content-Security-Policy":
        "default-src 'unsafe-inline' https://eu-west-1.quicksight.aws.amazon.com https://s3-eu-west-1.amazonaws.com https://unpkg.com; frame-ancestors https://*.quicksight.aws.amazon.com",
    },
  };

  callback(null, result);
};
