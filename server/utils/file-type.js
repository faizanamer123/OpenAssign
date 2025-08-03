function getContentType(filename) {
  if (!filename) return "application/octet-stream";

  const fileExtension = filename.split(".").pop()?.toLowerCase() || "";

  switch (fileExtension) {
    case "pdf":
      return "application/pdf";
    case "doc":
      return "application/msword";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "txt":
      return "text/plain";
    case "zip":
      return "application/zip";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
}

module.exports = {
  getContentType,
};
