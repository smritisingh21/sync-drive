import { useEffect } from "react";

function ConfirmDeleteModal({ item, onConfirm, onCancel }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  if (!item) return null;

  return (
    <div className="space-y-5">
      <p className="text-xs text-[#37352F] leading-relaxed">
        Are you sure you want to delete{" "}
        <span className="font-semibold text-[#191919]">"{item.name}"</span>{" "}
        {item.isDirectory ? "folder" : "file"}? This action cannot be undone.
      </p>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3.5 py-2 rounded-lg bg-white border border-[#E6E6E4] hover:bg-[#EFEFEE] text-[#37352F] text-xs font-medium transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onConfirm(item)}
          className="px-4 py-2 rounded-lg bg-[#B83232] hover:bg-[#9E2828] text-white text-xs font-medium transition-colors cursor-pointer"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default ConfirmDeleteModal;
