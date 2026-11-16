import { useDirectoryContext } from "../context/DirectoryContext";

function ContextMenu({ item, isUploadingItem }) {
  const {
    handleCancelUpload,
    setDeleteItem,
    openRenameModal,
    openDetailsPopup,
    BASE_URL,
  } = useDirectoryContext();

  const menuClass =
    "bg-white border border-[#E6E6E4] shadow-lg rounded-lg py-1 text-xs text-[#37352F] min-w-[140px] z-50 overflow-hidden";
  const itemClass =
    "px-3.5 py-2 hover:bg-[#EFEFEE] cursor-pointer transition-colors whitespace-nowrap font-medium";

  if (item.isDirectory) {
    return (
      <div className={menuClass} onClick={(e) => e.stopPropagation()}>
        <div
          className={itemClass}
          onClick={() => openRenameModal("directory", item.id, item.name)}
        >
          Rename
        </div>
        <div
          className={itemClass}
          onClick={() => openDetailsPopup(item)}
        >
          Details
        </div>
        <div className="my-1 border-t border-[#E6E6E4]" />
        <div
          className="px-3.5 py-2 hover:bg-[#FBEAEA] text-[#B83232] cursor-pointer transition-colors whitespace-nowrap font-medium"
          onClick={() => setDeleteItem(item)}
        >
          Delete
        </div>
      </div>
    );
  }

  if (isUploadingItem && item.isUploading) {
    return (
      <div className={menuClass} onClick={(e) => e.stopPropagation()}>
        <div
          className="px-3.5 py-2 hover:bg-[#FBEAEA] text-[#B83232] cursor-pointer transition-colors whitespace-nowrap font-medium"
          onClick={() => handleCancelUpload(item.id)}
        >
          Cancel upload
        </div>
      </div>
    );
  }

  const apiBaseUrl =
    BASE_URL || import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:4000";

  return (
    <div className={menuClass} onClick={(e) => e.stopPropagation()}>
      <div
        className={itemClass}
        onClick={() =>
          (window.location.href =
            item.downloadUrl || `${apiBaseUrl}/file/${item.id}?action=download`)
        }
      >
        Download
      </div>
      <div
        className={itemClass}
        onClick={() => openRenameModal("file", item.id, item.name)}
      >
        Rename
      </div>
      <div
        className={itemClass}
        onClick={() => openDetailsPopup(item)}
      >
        Details
      </div>
      <div className="my-1 border-t border-[#E6E6E4]" />
      <div
        className="px-3.5 py-2 hover:bg-[#FBEAEA] text-[#B83232] cursor-pointer transition-colors whitespace-nowrap font-medium"
        onClick={() => setDeleteItem(item)}
      >
        Delete
      </div>
    </div>
  );
}

export default ContextMenu;
