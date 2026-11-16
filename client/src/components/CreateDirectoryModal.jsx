import { useEffect, useRef } from "react";

function CreateDirectoryModal({
  newDirname,
  setNewDirname,
  onClose,
  onCreateDirectory,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <form onSubmit={onCreateDirectory} className="space-y-4">
      <input
        ref={inputRef}
        type="text"
        className="w-full px-3 py-2 bg-white border border-[#E6E6E4] rounded-lg text-sm text-[#191919] placeholder-[#9B9A97] focus:outline-none focus:border-[#37352F] focus:ring-2 focus:ring-[#37352F]/10 transition-all"
        placeholder="Enter folder name"
        value={newDirname}
        onChange={(e) => setNewDirname(e.target.value)}
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-3.5 py-2 rounded-lg bg-white border border-[#E6E6E4] hover:bg-[#EFEFEE] text-[#37352F] text-xs font-medium transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-[#191919] hover:bg-[#2F2F2F] text-white text-xs font-medium transition-colors cursor-pointer"
        >
          Create
        </button>
      </div>
    </form>
  );
}

export default CreateDirectoryModal;
