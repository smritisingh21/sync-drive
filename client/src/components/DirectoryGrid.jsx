import React from 'react';
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

export default function DirectoryGrid({
  items,
  handleRowClick,
  activeContextMenu,
  contextMenuPos,
  handleContextMenu,
  getFileIcon,
  isUploading,
  progressMap,
  handleCancelUpload,
  handleDeleteFile,
  handleDeleteDirectory,
  openRenameModal,
  BASE_URL,
}) {
  
  function renderFileIcon(iconString, isImagePreview = false, itemId = null) {
    const iconClass = "w-12 h-12"; 
    
    if (isImagePreview && itemId && !String(itemId).startsWith("temp-")) {
      return (
        <img 
          src={`${BASE_URL}/file/${itemId}?action=view`} 
          alt="preview"
          className="w-full h-full object-cover rounded-xl"
          onError={(e) => { e.target.style.display = 'none'; }} 
        />
      );
    }

    switch (iconString) {
      case "pdf": return <FaFilePdf className={`${iconClass} text-red-500`} />;
      case "image": return <FaFileImage className={`${iconClass} text-blue-500`} />;
      case "video": return <FaFileVideo className={`${iconClass} text-purple-500`} />;
      case "archive": return <FaFileArchive className={`${iconClass} text-orange-500`} />;
      case "code": return <FaFileCode className={`${iconClass} text-emerald-500`} />;
      default: return <FaFileAlt className={`${iconClass} text-slate-400`} />;
    }
  }

  return (
    <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      {items.map((item) => {
        const isUploadingItem = String(item.id).startsWith("temp-");
        const uploadProgress = progressMap[item.id] || 0;
        const fileType = getFileIcon(item.name);

        return (
          <div
            key={item.id}
            className="group relative flex flex-col items-center p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-sm hover:border-indigo-100 hover:bg-slate-50 transition-all duration-200 cursor-pointer"
            onClick={() =>
              !(activeContextMenu || isUploading)
                ? handleRowClick(item.isDirectory ? "directory" : "file", item.id)
                : null
            }
            onContextMenu={(e) => handleContextMenu(e, item.id)}
          >
            {/* Top Left: File Extension Badge (File only) */}
            {!item.isDirectory && !isUploadingItem && (
              <div className="absolute top-2 left-2 z-10 px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] font-bold uppercase text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                {item.name.split('.').pop()}
              </div>
            )}

            {/* Top Right: Context Menu Trigger */}
            <button
              className="absolute top-2 right-2 z-10 p-1.5 rounded-full text-slate-300 hover:bg-slate-50 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                handleContextMenu(e, item.id);
              }}
            >
              <BsThreeDotsVertical size={16} />
            </button>

            {/* Central Icon/Preview Container */}
            <div className={`flex items-center justify-center w-20 h-20 mb-3 rounded-2xl overflow-hidden transition-transform group-hover:scale-105 ${
              item.isDirectory ? 'bg-amber-50 text-amber-500' : 'bg-slate-50'
            }`}>
              {item.isDirectory ? (
                <FaFolder className="w-12 h-12" />
              ) : (
                renderFileIcon(fileType, fileType === "image", item.id)
              )}
            </div>

            {/* Name and Metadata */}
            <div className="w-full text-center flex flex-col min-w-0">
              <span className="text-sm font-semibold text-slate-700 truncate px-2 group-hover:text-indigo-600 transition-colors">
                {item.name}
              </span>
              
              <div className="flex items-center justify-center gap-2 mt-1">
                {/* Number of Items (Folder only) */}
                {item.isDirectory ? (
                  <span className="text-[10px] text-gray-500 font-bold px-1.5 py-0.5 rounded">
                    {item.itemsCount || 0} items
                  </span>
                ):
                 <span className="text-[10px] text-gray-500 font-bold px-1.5 py-0.5 rounded">
                    {item.size < 1024 * 1024
                       ? (item.size / 1024).toFixed(2) + " KB"
                       : (item.size / (1024 * 1024)).toFixed(2) + " MB"
                       
                       } 
                  </span>
                }

              </div>
            </div>

            {/* Uploading Overlay */}
            {isUploadingItem && (
              <div className="absolute inset-x-0 bottom-0 p-2 bg-white/95 backdrop-blur-sm rounded-b-2xl border-t border-slate-50">
                <div className="flex justify-between text-[10px] font-black text-indigo-600 mb-1 px-1">
                  <span>UPLOADING</span>
                  <span>{Math.floor(uploadProgress)}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-300 shadow-[0_0_8px_rgba(79,70,229,0.4)]"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

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
      })}
    </div>
  );
}