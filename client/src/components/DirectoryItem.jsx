import {
  FaFolder,
  FaFilePdf,
  FaFileImage,
  FaFileVideo,
  FaFileArchive,
  FaFileCode,
  FaFileAlt,
  FaCheckCircle
} from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import ContextMenu from "../components/ContextMenu";

function DirectoryItem({
  item,
  handleRowClick,
  activeContextMenu,
  contextMenuPos,
  handleContextMenu,
  getFileIcon,
  isUploading,
  uploadProgress,
  handleCancelUpload,
  handleDeleteFile,
  handleDeleteDirectory,
  openRenameModal,
  BASE_URL,
}) {
  // Logic: Decide which icon component to render
  function renderFileIcon(iconString) {
    const iconClass = "w-5 h-5"; 
    switch (iconString) {
      case "pdf": return <FaFilePdf className={`${iconClass} text-red-500`} />;
      case "image": return <FaFileImage className={`${iconClass} text-blue-500`} />;
      case "video": return <FaFileVideo className={`${iconClass} text-purple-500`} />;
      case "archive": return <FaFileArchive className={`${iconClass} text-orange-500`} />;
      case "code": return <FaFileCode className={`${iconClass} text-emerald-500`} />;
      default: return <FaFileAlt className={`${iconClass} text-slate-400`} />;
    }
  }

  const isUploadingItem = String(item.id).startsWith("temp-");

  return (
    <div
      className="group grid grid-cols-12 items-center px-6 py-3 bg-white border-b border-slate-100 hover:bg-indigo-50/40 transition-all cursor-pointer relative"
      onClick={() =>
        !(activeContextMenu || isUploading)
          ? handleRowClick(item.isDirectory ? "directory" : "file", item.id)
          : null
      }
      onContextMenu={(e) => handleContextMenu(e, item.id)}
    >
      <div className="col-span-8 md:col-span-6 flex items-center gap-4 min-w-0">

        <div className={`flex shrink-0 items-center justify-center w-10 h-10 rounded-xl transition-transform group-hover:scale-105 ${
          item.isDirectory ? 'bg-amber-100 text-amber-600' : 'bg-slate-100'
        }`}>
          {item.isDirectory ? (
            <FaFolder className="w-5 h-5" />
          ) : (
            renderFileIcon(getFileIcon(item.name))
          )}
        </div>
        
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium text-slate-700 truncate group-hover:text-indigo-600 transition-colors">
            {item.name}
          </span>
          {/* Inline uploading label for mobile */}
          {isUploadingItem && (
            <span className="md:hidden text-[10px] font-bold text-indigo-500 uppercase">
              {Math.floor(uploadProgress)}% Uploading...
            </span>
          )}
        </div>
      </div>

      {/* COLUMN 2: Status & Inline Progress Bar (Desktop Only) */}
      <div className="hidden md:flex col-span-3 items-center px-4">
        {isUploadingItem ? (
          <div className="w-full flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <span className="text-xs font-bold text-indigo-600 w-8">
              {Math.floor(uploadProgress)}%
            </span>
          </div>
        ) : ("")
        }
      </div>
      <div className="col-span-4 md:col-span-3 flex justify-end items-center gap-3">
        <div className="text-xs text-gray-400">
           {
            item.isDirectory? "" :
            item.size < 1024 * 1024
               ? (item.size / 1024).toFixed(2) + " KB"
              : (item.size / (1024 * 1024)).toFixed(2) + " MB"
          
           }
        </div>
        <div
          className="p-2 rounded-full text-slate-400  transition-all"
          onClick={(e) => {
            e.stopPropagation();
            handleContextMenu(e, item.id);
          }}
        >
         
          <div className="flex items-center justify-center text-xs gap-3">
          {
            item.isDirectory? `${item.itemsCount || 0 } items` : ""
          }
          <BsThreeDotsVertical className=" hover:bg-white hover:text-indigo-600 hover:shadow-sm size-4" />
          </div>
        </div>
      </div>

      {/* Context Menu Overlay */}
      {activeContextMenu === item.id && (
        <ContextMenu
          item={item}
          contextMenuPos={contextMenuPos}
          isUploadingItem={isUploadingItem}
          handleCancelUpload={handleCancelUpload}
          handleDeleteFile={handleDeleteFile}
          handleDeleteDirectory={handleDeleteDirectory}
          openRenameModal={openRenameModal}
          BASE_URL={BASE_URL}
        />
      )}
    </div>
  );
}

export default DirectoryItem;