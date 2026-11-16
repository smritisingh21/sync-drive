import { useEffect, useState } from "react";
import {
  FaTimes,
  FaFolder,
  FaFileImage,
  FaFileVideo,
  FaFilePdf,
  FaFileArchive,
  FaFileCode,
  FaFileAlt,
  FaDownload,
} from "react-icons/fa";

export const formatSize = (bytes = 0) => {
  const KB = 1024;
  const MB = KB * 1024;
  const GB = MB * 1024;

  if (bytes >= GB) return (bytes / GB).toFixed(2) + " GB";
  if (bytes >= MB) return (bytes / MB).toFixed(2) + " MB";
  if (bytes >= KB) return (bytes / KB).toFixed(2) + " KB";
  return bytes + " B";
};

function getItemIcon(item) {
  if (item.isDirectory) {
    return <FaFolder className="text-amber-500 text-xl" />;
  }
  const ext = (item.name || "").split(".").pop().toLowerCase();
  if (["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "avif"].includes(ext)) {
    return <FaFileImage className="text-orange-500 text-xl" />;
  }
  if (["mp4", "mov", "avi", "webm", "mkv", "m4v", "ogg"].includes(ext)) {
    return <FaFileVideo className="text-red-500 text-xl" />;
  }
  if (ext === "pdf") {
    return <FaFilePdf className="text-red-600 text-xl" />;
  }
  if (["zip", "rar", "tar", "gz"].includes(ext)) {
    return <FaFileArchive className="text-blue-600 text-xl" />;
  }
  if (["js", "jsx", "ts", "tsx", "html", "css", "py", "java"].includes(ext)) {
    return <FaFileCode className="text-orange-400 text-xl" />;
  }
  return <FaFileAlt className="text-blue-500 text-xl" />;
}

function DetailsPopup({ item, onClose, currentPath = "My Drive" }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!item) {
      setIsVisible(false);
      return;
    }
    const raf = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [item]);

  useEffect(() => {
    if (!item) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [item, onClose]);

  if (!item) return null;

  const {
    name,
    isDirectory,
    size = 0,
    createdAt,
    updatedAt,
    extension,
    directories,
    files,
    url,
    downloadUrl,
  } = item;

  const ext = (name || "").split(".").pop().toLowerCase();
  const isImage =
    !isDirectory &&
    ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "avif"].includes(ext);

  const numberOfFolders = directories?.length ?? 0;
  const numberOfFiles = files?.length ?? 0;

  return (
    <div
      className={`fixed inset-0 z-[60] flex justify-end transition-colors duration-200 ${
        isVisible ? "bg-black/40 backdrop-blur-[2px]" : "bg-black/0"
      }`}
      onClick={onClose}
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        className={`h-full w-full max-w-sm bg-white shadow-2xl border-l border-gray-200 flex flex-col transform transition-transform duration-250 ease-out ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between gap-3 bg-[#f7f7f2]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-2xs">
              {getItemIcon(item)}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-gray-900 truncate">
                {name}
              </h2>
              <p className="text-[11px] text-gray-500">
                {isDirectory ? "Folder Details" : "File Details"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close details sidebar"
            className="w-8 h-8 rounded-full hover:bg-gray-200/70 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors cursor-pointer shrink-0"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Thumbnail preview for images */}
          {isImage && url && (
            <div className="w-full h-44 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
              <img
                src={url}
                alt={name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Metadata rows */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Properties
            </h3>

            <div className="bg-[#f7f7f2] rounded-2xl p-4 space-y-3 text-xs border border-gray-100">
              <div className="flex justify-between gap-4">
                <span className="text-gray-500 shrink-0">Type</span>
                <span className="font-semibold text-gray-800 text-right">
                  {isDirectory
                    ? "Folder"
                    : extension
                      ? `${extension.replace(".", "").toUpperCase()} File`
                      : "File"}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500 shrink-0">Location</span>
                <span className="font-semibold text-gray-800 text-right truncate">
                  {currentPath}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500 shrink-0">Size</span>
                <span className="font-semibold text-gray-800 text-right">
                  {formatSize(size)}
                </span>
              </div>

              {isDirectory && (
                <>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500 shrink-0">Files</span>
                    <span className="font-semibold text-gray-800 text-right">
                      {numberOfFiles}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500 shrink-0">Folders</span>
                    <span className="font-semibold text-gray-800 text-right">
                      {numberOfFolders}
                    </span>
                  </div>
                </>
              )}

              <div className="border-t border-gray-200/80 pt-3 flex justify-between gap-4">
                <span className="text-gray-500 shrink-0">Created</span>
                <span className="font-medium text-gray-800 text-right">
                  {createdAt ? new Date(createdAt).toLocaleString() : "—"}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500 shrink-0">Modified</span>
                <span className="font-medium text-gray-800 text-right">
                  {updatedAt ? new Date(updatedAt).toLocaleString() : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-[#f7f7f2] flex items-center gap-2">
          {!isDirectory && downloadUrl && (
            <button
              type="button"
              onClick={() => {
                window.location.href = downloadUrl;
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#2b2ffb] hover:bg-[#1f23d9] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <FaDownload className="text-xs" />
              <span>Download</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className={`${
              !isDirectory && downloadUrl ? "px-4" : "w-full"
            } py-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-semibold transition-colors cursor-pointer`}
          >
            Close
          </button>
        </div>
      </aside>
    </div>
  );
}

export default DetailsPopup;
