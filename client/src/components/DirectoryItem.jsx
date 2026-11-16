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
import { formatSize, getFileCategory } from "../utils/fileHelpers";

function DirectoryItem({ item, uploadProgress }) {
  const {
    handleRowClick,
    activeContextMenu,
    handleContextMenu,
    isUploading,
  } = useDirectoryContext();

  function renderFileIcon(filename) {
    if (item.isDirectory) {
      return <FaFolder className="text-[#787774] text-base" />;
    }

    const category = getFileCategory(filename);
    const sizeClass = "text-base text-[#787774]";

    switch (category) {
      case "pdf":
        return <FaFilePdf className={sizeClass} />;
      case "image":
        return <FaFileImage className={sizeClass} />;
      case "video":
        return <FaFileVideo className={sizeClass} />;
      case "archive":
        return <FaFileArchive className={sizeClass} />;
      case "code":
        return <FaFileCode className={sizeClass} />;
      default:
        return <FaFileAlt className={sizeClass} />;
    }
  }

  const isUploadingItem = String(item.id).startsWith("temp-");

  const getFolderItemCount = () => {
    const dirCount = item.directories?.length || 0;
    const fileCount = item.files?.length || 0;
    const total = dirCount + fileCount;
    return `${total} ${total === 1 ? "item" : "items"}`;
  };

  return (
    <div
      className={`
        grid
        grid-cols-[minmax(200px,1.8fr)_1fr_1fr_40px]
        items-center
        px-3
        h-12
        bg-white
        border-b
        border-[#E6E6E4]
        last:border-b-0
        hover:bg-[#F7F7F5]
        transition-colors
        cursor-pointer
        relative
        ${activeContextMenu === item.id ? "z-30" : ""}
        ${isUploadingItem ? "opacity-70" : ""}
      `}
      onClick={() =>
        !(activeContextMenu || isUploading) &&
        handleRowClick(item.isDirectory ? "directory" : "file", item.id)
      }
      onContextMenu={(e) => handleContextMenu(e, item.id)}
    >
      {/* Name Column */}
      <div className="flex items-center gap-3 min-w-0 pr-3">
        <div className="shrink-0 flex items-center justify-center w-5">
          {renderFileIcon(item.name)}
        </div>
        <p className="text-sm text-[#191919] font-medium truncate">
          {item.name}
        </p>
      </div>

      {/* Metadata Column */}
      <div className="text-xs text-[#787774] truncate">
        {item.isDirectory ? getFolderItemCount() : formatSize(item.size)}
      </div>

      {/* Type Column */}
      <div className="text-xs text-[#9B9A97] truncate capitalize">
        {item.isDirectory ? "Folder" : getFileCategory(item.name)}
      </div>

      {/* Actions Column */}
      <div className="relative flex justify-center">
        <button
          type="button"
          className="w-7 h-7 flex items-center justify-center rounded-md text-[#787774] hover:bg-[#EFEFEE] hover:text-[#191919] transition-colors cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleContextMenu(e, item.id);
          }}
          aria-label="More options"
        >
          <BsThreeDotsVertical size={13} />
        </button>

        {activeContextMenu === item.id && (
          <div className="absolute right-0 top-8 z-50">
            <ContextMenu item={item} isUploadingItem={isUploadingItem} />
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {isUploadingItem && (
        <div className="absolute bottom-0 left-0 right-0">
          <div className="w-full h-[2px] bg-[#E6E6E4]">
            <div
              className="h-full bg-[#191919]"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default DirectoryItem;
