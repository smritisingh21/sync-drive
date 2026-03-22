import DirectoryItem from "./DirectoryItem";

function DirectoryList({
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
  return (
    <div className="w-full">
      {/* Table Header - Only visible on desktop for that sleek "Explorer" feel */}
      <div className="grid grid-cols-12 px-6 py-3 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
        <div className="col-span-8 md:col-span-6">Name</div>
      </div>

      <div className="flex flex-col divide-y divide-slate-50">
        {items.map((item) => {
          const uploadProgress = progressMap[item.id] || 0;

          return (
            <DirectoryItem
              key={item.id}
              size={item.size}
              item={item}
              handleRowClick={handleRowClick}
              activeContextMenu={activeContextMenu}
              contextMenuPos={contextMenuPos}
              handleContextMenu={handleContextMenu}
              getFileIcon={getFileIcon}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              handleCancelUpload={handleCancelUpload}
              handleDeleteFile={handleDeleteFile}
              handleDeleteDirectory={handleDeleteDirectory}
              openRenameModal={openRenameModal}
              BASE_URL={BASE_URL}
              
            />
          );
        })}
      </div>
    </div>
  );
}

export default DirectoryList;