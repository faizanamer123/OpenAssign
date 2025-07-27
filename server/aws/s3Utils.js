const fs = require("fs");
const { s3 } = require("./s3Client");

async function uploadFileToS3(localFilePath, s3Key) {
  const fileStream = fs.createReadStream(localFilePath);

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: s3Key,
    Body: fileStream,
  };

  const uploadResult = await s3.upload(params).promise();

  if (fs.existsSync(localFilePath)) {
    fs.unlinkSync(localFilePath);
    console.log("File deleted:", localFilePath);
  } else {
    console.log("File does not exist:", localFilePath);
  }

  return uploadResult.Location;
}

async function deleteFileFromS3(s3Key) {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: s3Key,
  };

  return s3.deleteObject(params).promise();
}

function getSignedUrl(s3Key, expiresInSeconds = 3600) {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: s3Key,
    Expires: expiresInSeconds,
  };

  return s3.getSignedUrl("getObject", params);
}

module.exports = {
  uploadFileToS3,
  deleteFileFromS3,
  getSignedUrl,
};
