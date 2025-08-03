const fs = require("fs");
const { s3 } = require("./s3Client");
const { getContentType } = require("../utils/file-type");
// Simple file type detection for server-side

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

function getFileFromS3(s3Key, res) {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: s3Key,
  };

  const filename = s3Key.split("/").pop() || "download";
  const contentType = getContentType(filename);

  const fileStream = s3.getObject(params).createReadStream();

  // Set appropriate headers
  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  // Pipe to response
  fileStream.on("error", (err) => {
    console.error("S3 file error:", err);
    res.status(500).send("Error retrieving file.");
  });

  fileStream.pipe(res);
}

module.exports = {
  uploadFileToS3,
  deleteFileFromS3,
  getFileFromS3,
};
