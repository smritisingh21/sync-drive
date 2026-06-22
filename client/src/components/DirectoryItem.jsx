
import {
  FaFolder,
  FaFilePdf,
  FaFileImage,
  FaFileVideo,
  FaFileArchive,
  FaFileCode,
  FaFileAlt,
} from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import ContextMenu from "./ContextMenu";
import { useDirectoryContext } from "../context/DirectoryContext";
import { formatSize } from "./DetailsPopup";

function DirectoryItem({ item, uploadProgress, viewMode = "grid" }) {
  const {
    handleRowClick,
    activeContextMenu,
    handleContextMenu,
    getFileIcon,
    isUploading,
  } = useDirectoryContext();

  const isList = viewMode === "list";

  function renderFileIcon(filename) {
    if (item.isDirectory) {
      return <FaFolder className="text-amber-500 text-lg" />;
    }

    const ext = filename.split(".").pop().toLowerCase();
    const sizeClass = "text-lg";

    switch (ext) {
      case "pdf":
        return <FaFilePdf className={`text-red-500 ${sizeClass}`} />;
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
        return <FaFileImage className={`text-orange-500 ${sizeClass}`} />;
      case "mp4":
      case "mov":
        return <FaFileVideo className={`text-red-400 ${sizeClass}`} />;
      case "zip":
      case "rar":
        return <FaFileArchive className={`text-blue-600 ${sizeClass}`} />;
      case "js":
      case "jsx":
      case "ts":
      case "tsx":
      case "py":
      case "ipynb":
        return <FaFileCode className={`text-orange-400 ${sizeClass}`} />;
      default:
        return <FaFileAlt className={`text-blue-500 ${sizeClass}`} />;
    }
  }

  const isUploadingItem = item.id.startsWith("temp-");

  const getFolderItemCount = () => {
    const dirCount = item.directories?.length || 0;
    const fileCount = item.files?.length || 0;
    const total = dirCount + fileCount;
    return `${total} ${total === 1 ? "item" : "items"}`;
  };

  // ==========================================
  // LIST VIEW
  // ==========================================

if (!isList) {
  return (
    <div
      className={`
        grid
        grid-cols-[minmax(300px,1.8fr)_1fr_1fr_48px]
        items-center
        px-4
        h-14
        bg-white
        border-b
        border-gray-200
        hover:bg-gray-50
        transition-colors
        cursor-pointer
        relative
        ${isUploadingItem ? "opacity-75" : ""}
      `}
      onClick={() =>
        !(activeContextMenu || isUploading) &&
        handleRowClick(item.isDirectory ? "directory" : "file", item.id)
      }
      onContextMenu={(e) => handleContextMenu(e, item.id)}
    >
      {/* Name Column */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="shrink-0 flex items-center justify-center w-6">
          {renderFileIcon(item.name)}
        </div>

        <p className="text-sm text-gray-800 truncate">
          {item.name}
        </p>
      </div>

      {/* Metadata Column */}
      <div className="text-sm text-gray-500 truncate">
        {item.isDirectory ? (
          getFolderItemCount()
        ) : (
          formatSize(item.size)
        )}
      </div>

      {/* Location Column */}
      <div className="text-sm text-gray-500 truncate">
        My Drive
      </div>

      {/* Actions Column */}
      <div className="relative flex justify-center">
        <button
          className="
            w-8 h-8
            flex items-center justify-center
            rounded-full
            text-gray-500
            hover:bg-gray-100
            hover:text-gray-700
          "
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleContextMenu(e, item.id);
          }}
          aria-label="More options"
        >
          <BsThreeDotsVertical size={14} />
        </button>

        {activeContextMenu === item.id && (
          <div className="absolute right-0 top-10 z-30">
            <ContextMenu
              item={item}
              isUploadingItem={isUploadingItem}
            />
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {isUploadingItem && (
        <div className="absolute bottom-0 left-0 right-0">
          <div className="w-full h-[2px] bg-gray-100">
            <div
              className="h-full bg-[#2b2ffb]"
              style={{
                width: `${uploadProgress}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}


return (
  <div
    className={`bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300
      transition-all cursor-pointer flex flex-col relative
      ${isUploadingItem ? "opacity-75" : ""}
    `}
    onClick={() =>
      !(activeContextMenu || isUploading) &&
      handleRowClick(item.isDirectory ? "directory" : "file", item.id)
    }
    onContextMenu={(e) => handleContextMenu(e, item.id)}
  >
    {/* Folder Layout */}
    {item.isDirectory ? (
      <>
        <div className="relative h-16 bg-[#f8d775] flex items-center px-4">
          <div className="scale-125">
            {renderFileIcon(item.name)}
          </div>

          <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button
              className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-gray-500 hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleContextMenu(e, item.id);
              }}
            >
              <BsThreeDotsVertical size={14} />
            </button>
          </div>

          {activeContextMenu === item.id && (
            <div className="absolute top-10 right-2 z-30">
              <ContextMenu
                item={item}
                isUploadingItem={isUploadingItem}
              />
            </div>
          )}
        </div>

        <div className="p-3">
          <p className="text-sm font-medium text-gray-800 truncate">
            {item.name}
          </p>

          <p className="text-xs text-gray-500 mt-1">
            {getFolderItemCount()}
          </p>

          {isUploadingItem && (
            <div className="mt-2 w-full">
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2b2ffb] rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </>
    ) : (
      <>
        <div className="w-full h-28 bg-gray-50 flex items-center justify-center relative">
          <div className="scale-[1.8]">
            {renderFileIcon(item.name)}
          </div>

          <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button
              className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-gray-500 hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleContextMenu(e, item.id);
              }}
            >
              <BsThreeDotsVertical size={14} />
            </button>
          </div>

          {activeContextMenu === item.id && (
            <div className="absolute top-10 right-2 z-30">
              <ContextMenu
                item={item}
                isUploadingItem={isUploadingItem}
              />
            </div>
          )}
        </div>

        <div className="p-2.5 bg-white flex flex-col justify-between flex-grow min-w-0 border-t border-gray-100">
          <div className="truncate pr-1">
            <p className="text-sm font-normal text-gray-800 truncate">
              {item.name}
            </p>

            <p className="text-xs text-gray-400 mt-0.5">
              {formatSize(item.size)}
            </p>
          </div>

          {isUploadingItem && (
            <div className="mt-2 w-full">
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2b2ffb] rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </>
    )}
  </div>
);


}

export default DirectoryItem;

