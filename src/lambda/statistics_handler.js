"use strict";

const fs = require("fs");
const path = require("path");
const AWS = require("aws-sdk");
let ejs = require("ejs");

exports.get = function (event, context, callback) {
  const quicksight = new AWS.QuickSight();
  let embeddedDashboardUrl;
  quicksight.getDashboardEmbedUrl(
    {
      AwsAccountId: "701812189816",
      DashboardId: "752cbeea-0481-4639-b829-db01bcfa2370",
      IdentityType: "QUICKSIGHT",
      UserArn:
        "arn:aws:quicksight:eu-west-1:701812189816:user/default/701812189816",
      ResetDisabled: true,
      SessionLifetimeInMinutes: 100,
      UndoRedoDisabled: false,
    },
    function (err, data) {
      console.log("Errors: ");
      console.log(err);
      console.log("Response: ");
      console.log(data);
      embeddedDashboardUrl = data.EmbedUrl;

      var contents = fs
        .readFileSync(`public${path.sep}statistics.html`)
        .toString();
      contents = ejs.render(contents, {
        embeddedDashboardUrl: embeddedDashboardUrl,
      });
      var result = {
        statusCode: 200,
        body: contents,
        headers: {
          "content-type": "text/html",
          "Content-Security-Policy":
            "default-src 'self' 'unsafe-inline' https://eu-west-1.quicksight.aws.amazon.com https://s3-eu-west-1.amazonaws.com https://unpkg.com; frame-ancestors https://*.quicksight.aws.amazon.com",
        },
      };

      callback(null, result);
    }
  );
};
