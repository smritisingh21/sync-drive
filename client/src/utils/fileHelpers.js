export const IMAGE_EXTENSIONS = [
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "svg",
  "bmp",
  "avif",
];

export const VIDEO_EXTENSIONS = [
  "mp4",
  "mov",
  "avi",
  "webm",
  "mkv",
  "m4v",
  "ogg",
];

export const ARCHIVE_EXTENSIONS = ["zip", "rar", "tar", "gz"];

export const CODE_EXTENSIONS = [
  "js",
  "jsx",
  "ts",
  "tsx",
  "html",
  "css",
  "py",
  "java",
];

export function getFileCategory(filename = "") {
  const ext = filename.split(".").pop().toLowerCase();
  if (ext === "pdf") return "pdf";
  if (IMAGE_EXTENSIONS.includes(ext)) return "image";
  if (VIDEO_EXTENSIONS.includes(ext)) return "video";
  if (ARCHIVE_EXTENSIONS.includes(ext)) return "archive";
  if (CODE_EXTENSIONS.includes(ext)) return "code";
  return "alt";
}

export function formatSize(bytes = 0) {
  const KB = 1024;
  const MB = KB * 1024;
  const GB = MB * 1024;

  if (bytes >= GB) return (bytes / GB).toFixed(2) + " GB";
  if (bytes >= MB) return (bytes / MB).toFixed(2) + " MB";
  if (bytes >= KB) return (bytes / KB).toFixed(2) + " KB";
  return bytes + " B";
}
