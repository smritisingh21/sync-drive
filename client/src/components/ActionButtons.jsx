import { FaFolderPlus, FaUpload } from "react-icons/fa";

function ActionButtons({
  onCreateFolderClick,
  onUploadFilesClick,
  disabled = false,
  compact = false,
}) {
  const padding = compact ? "py-1.5 px-2.5" : "py-2 px-4";

  return (
    <div className={compact ? "grid grid-cols-2 gap-1.5" : "flex items-center justify-center gap-2.5"}>
      <button
        type="button"
        disabled={disabled}
        onClick={onCreateFolderClick}
        className={`${padding} rounded-lg bg-white border border-[#E6E6E4] hover:bg-[#EFEFEE] disabled:opacity-50 disabled:cursor-not-allowed text-[#37352F] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer`}
      >
        <FaFolderPlus className="text-xs text-[#787774]" />
        <span>New Folder</span>
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={onUploadFilesClick}
        className={`${padding} rounded-lg bg-[#191919] hover:bg-[#2F2F2F] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer`}
      >
        <FaUpload className="text-xs" />
        <span>Upload</span>
      </button>
    </div>
  );
}

export default ActionButtons;
