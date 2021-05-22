"use strict";

const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");

exports.handler = async (event) => {
  console.log("Method ARN: " + event.methodArn);

  const idToken = extractTokenIdFromEvent(event);
  if (!idToken) {
    throw "Authorization token not found.";
  }

  const client = jwksClient({
    jwksUri:
      "https://cognito-idp.eu-west-1.amazonaws.com/eu-west-1_I1eQ1QbXK/.well-known/jwks.json",
  });

  let username;
  const signingKey = await client.getSigningKey(
    "Y2eZuORz2Hg7A9vY5g1AG+YF1pwODnous8FmZJvNGPk="
  );
  jwt.verify(idToken, signingKey.publicKey, function (err, decoded) {
    if (err) {
      console.log(`Authorization failed with the following error: ${err}`);
      throw "Authorization failed.";
    }
    username = decoded["cognito:username"];
  });

  // Example ARN: "arn:aws:execute-api:eu-west-1:701812189816:blygk2u464/ESTestInvoke-stage/GET/"
  // Extract AWS constants
  const arnArray = event.methodArn.split(":");
  const region = arnArray[3];
  const awsAccountId = arnArray[4];

  // Extract API Gateway constants
  const apiGatewayArnArray = arnArray[5].split("/");
  const restApiId = apiGatewayArnArray[0];
  const stage = apiGatewayArnArray[1];
  const method = apiGatewayArnArray[2];

  const authResponse = {
    principalId: username, // The principal user identification associated with the token sent by the client.
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: "Allow",
          Resource: `arn:aws:execute-api:${region}:${awsAccountId}:${restApiId}/${stage}/${method}/*`,
        },
      ],
    },
  };

  console.log(
    `Authorization successful, the following IAM policy was generated: ${JSON.stringify(
      authResponse
    )}`
  );
  return authResponse;
};

function extractTokenIdFromEvent(event) {
  const cookieStrings = event.authorizationToken.split("; ");
  const cookieObjects = {};
  for (const cookieString of cookieStrings) {
    const [key, value] = cookieString.split("=");
    cookieObjects[key] = value;
  }
  return cookieObjects?.id_token;
}
