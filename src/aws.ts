import AWS = require("aws-sdk");
import { config } from "./config/config";

// here we are iniatimg an aws S3 bucket that will allow our users to get or post thier media
// file to our S3 bucket.
// we will create two functions for requesting a temporary URL that we can send to our client
// to aalow him to load the object to his device and the other one for posting objects to our bucket.

const c = config.dev;

//Configure AWS
// it will set these credetial if we are in development mode
// because if we are on the cloud the app will have its permission automatecally
if (c.aws_profile !== "DEPLOYED") {
  var credentials = new AWS.SharedIniFileCredentials({ profile: c.aws_profile });
  AWS.config.credentials = credentials;
}

// creating access to our bucket
export const s3 = new AWS.S3({
  signatureVersion: "v4",
  region: c.aws_region,
  params: { Bucket: c.aws_media_bucket }
});

/* getGetSignedUrl generates an aws signed url to retreive an item
 * @Params
 *    key: string - the filename to be put into the s3 bucket
 * @Returns:
 *    a url as a string
 */
export function getGetSignedUrl(key: string): string {
  // the key variable for geeting the object from the bucket is coming from our database
  // where we saved the object or image url and now we are requesting that item to send to the client

  // expiration time for the url that will sent to our client
  // here will st it to 5 min
  const signedUrlExpireSeconds = 60 * 5;

  // setting what type of access we want
  // and the prameters for the access
  const url = s3.getSignedUrl("getObject", {
    Bucket: c.aws_media_bucket,
    Key: key,
    Expires: signedUrlExpireSeconds
  });

  return url;
}

/* getPutSignedUrl generates an aws signed url to put an item
 * @Params
 *    key: string - the filename to be retreived from s3 bucket
 * @Returns:
 *    a url as a string
 */
export function getPutSignedUrl(key: string) {
  // the key variable for our post url is comming from the client local image
  // as we send the image name to our bucket so we can only allow this image to be uploaded
  // to our bucket
  // finally, this function will create a url that we can use a put request it via our server to S3
  const signedUrlExpireSeconds = 60 * 5;

  const url = s3.getSignedUrl("putObject", {
    Bucket: c.aws_media_bucket,
    Key: key,
    Expires: signedUrlExpireSeconds
  });

  return url;
}
