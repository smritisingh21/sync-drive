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
import { formatSize, getFileCategory } from "../utils/fileHelpers";

export { formatSize };

function getItemIcon(item) {
  if (item.isDirectory) {
    return <FaFolder className="text-[#787774] text-lg" />;
  }
  const category = getFileCategory(item.name);
  switch (category) {
    case "image":
      return <FaFileImage className="text-[#787774] text-lg" />;
    case "video":
      return <FaFileVideo className="text-[#787774] text-lg" />;
    case "pdf":
      return <FaFilePdf className="text-[#787774] text-lg" />;
    case "archive":
      return <FaFileArchive className="text-[#787774] text-lg" />;
    case "code":
      return <FaFileCode className="text-[#787774] text-lg" />;
    default:
      return <FaFileAlt className="text-[#787774] text-lg" />;
  }
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

  const isImage = !isDirectory && getFileCategory(name) === "image";
  const numberOfFolders = directories?.length ?? 0;
  const numberOfFiles = files?.length ?? 0;

  return (
    <div
      className={`fixed inset-0 z-[60] flex justify-end transition-colors duration-200 ${
        isVisible ? "bg-black/25 backdrop-blur-[1px]" : "bg-black/0"
      }`}
      onClick={onClose}
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        className={`h-full w-full max-w-sm bg-white shadow-xl border-l border-[#E6E6E4] flex flex-col transform transition-transform duration-200 ease-out text-[#37352F] ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E6E6E4] flex items-center justify-between gap-3 bg-[#F7F7F5]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-md bg-white border border-[#E6E6E4] flex items-center justify-center shrink-0">
              {getItemIcon(item)}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-[#191919] truncate">
                {name}
              </h2>
              <p className="text-[11px] text-[#787774]">
                {isDirectory ? "Folder details" : "File details"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close details sidebar"
            className="w-7 h-7 rounded-md hover:bg-[#EFEFEE] flex items-center justify-center text-[#787774] hover:text-[#191919] transition-colors cursor-pointer shrink-0"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {isImage && url && (
            <div className="w-full h-44 rounded-lg overflow-hidden bg-[#F7F7F5] border border-[#E6E6E4]">
              <img
                src={url}
                alt={name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="space-y-2.5">
            <h3 className="text-[11px] font-medium uppercase tracking-wider text-[#9B9A97]">
              Properties
            </h3>

            <div className="bg-[#F7F7F5] rounded-lg p-4 space-y-3 text-xs border border-[#E6E6E4]">
              <div className="flex justify-between gap-4">
                <span className="text-[#787774] shrink-0">Type</span>
                <span className="font-medium text-[#191919] text-right">
                  {isDirectory
                    ? "Folder"
                    : extension
                      ? `${extension.replace(".", "").toUpperCase()} File`
                      : "File"}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-[#787774] shrink-0">Location</span>
                <span className="font-medium text-[#191919] text-right truncate">
                  {currentPath}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-[#787774] shrink-0">Size</span>
                <span className="font-medium text-[#191919] text-right">
                  {formatSize(size)}
                </span>
              </div>

              {isDirectory && (
                <>
                  <div className="flex justify-between gap-4">
                    <span className="text-[#787774] shrink-0">Files</span>
                    <span className="font-medium text-[#191919] text-right">
                      {numberOfFiles}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[#787774] shrink-0">Folders</span>
                    <span className="font-medium text-[#191919] text-right">
                      {numberOfFolders}
                    </span>
                  </div>
                </>
              )}

              <div className="border-t border-[#E6E6E4] pt-3 flex justify-between gap-4">
                <span className="text-[#787774] shrink-0">Created</span>
                <span className="font-normal text-[#37352F] text-right">
                  {createdAt ? new Date(createdAt).toLocaleString() : "—"}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-[#787774] shrink-0">Modified</span>
                <span className="font-normal text-[#37352F] text-right">
                  {updatedAt ? new Date(updatedAt).toLocaleString() : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E6E6E4] bg-[#F7F7F5] flex items-center gap-2">
          {!isDirectory && downloadUrl && (
            <button
              type="button"
              onClick={() => {
                window.location.href = downloadUrl;
              }}
              className="flex-1 py-2 px-4 rounded-lg bg-[#191919] hover:bg-[#2F2F2F] text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
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
            } py-2 rounded-lg bg-white border border-[#E6E6E4] hover:bg-[#EFEFEE] text-[#37352F] text-xs font-medium transition-colors cursor-pointer`}
          >
            Close
          </button>
        </div>
      </aside>
    </div>
  );
}

export default DetailsPopup;
