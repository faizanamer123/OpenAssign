const dotenv = require("dotenv");
const AWS = require("aws-sdk");

dotenv.config();
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

const awsFolders = {
  assignments: "assignments",
  submissions: "submissions",
};
module.exports = { s3, awsFolders };
