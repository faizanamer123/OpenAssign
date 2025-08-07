export interface FileTypeInfo {
  contentType: string;
  icon: string;
  color: string;
}

export function getFileTypeInfo(filename: string): FileTypeInfo {
  if (!filename) {
    return {
      contentType: "application/octet-stream",
      icon: "FILE",
      color: "text-gray-400",
    };
  }

  const fileExtension = filename.split(".").pop()?.toLowerCase() || "";

  switch (fileExtension) {
    case "pdf":
      return {
        contentType: "application/pdf",
        icon: "PDF",
        color: "text-red-500",
      };
    case "doc":
      return {
        contentType: "application/msword",
        icon: "DOC",
        color: "text-blue-700",
      };
    case "docx":
      return {
        contentType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        icon: "DOC",
        color: "text-blue-700",
      };
    case "txt":
      return {
        contentType: "text/plain",
        icon: "TXT",
        color: "text-gray-500",
      };
    case "zip":
      return {
        contentType: "application/zip",
        icon: "ZIP",
        color: "text-yellow-600",
      };
    case "jpg":
    case "jpeg":
      return {
        contentType: "image/jpeg",
        icon: "IMG",
        color: "text-green-500",
      };
    case "png":
      return {
        contentType: "image/png",
        icon: "IMG",
        color: "text-green-500",
      };
    case "gif":
      return {
        contentType: "image/gif",
        icon: "IMG",
        color: "text-green-500",
      };
    default:
      return {
        contentType: "application/octet-stream",
        icon: "FILE",
        color: "text-gray-400",
      };
  }
}

export function getContentType(filename: string): string {
  return getFileTypeInfo(filename).contentType;
}

export function getFileIcon(filename: string): string {
  return getFileTypeInfo(filename).icon;
}

export function getFileColor(filename: string): string {
  return getFileTypeInfo(filename).color;
}
