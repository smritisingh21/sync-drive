import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaFolder,
  FaFolderOpen,
  FaChevronRight,
  FaChevronDown,
  FaHome,
  FaClock,
  FaPlus,
  FaUpload,
  FaFolderPlus,
} from "react-icons/fa";
import { getDirectoryItems } from "../api/directoryApi";

function FolderTreeNode({
  folder,
  currentDirId,
  onSelectFolder,
  depth = 0,
  refreshTrigger,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [subFolders, setSubFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const isSelected = String(currentDirId) === String(folder.id);

  const fetchSubFolders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getDirectoryItems(folder.id);
      setSubFolders([...(data.directories || [])].reverse());
      setHasLoaded(true);
    } catch (err) {
      console.error("Failed to load nested folders:", err);
    } finally {
      setLoading(false);
    }
  }, [folder.id]);

  // Reload children if already expanded and workspace changes (create/rename/delete)
  useEffect(() => {
    if (isExpanded) {
      fetchSubFolders();
    }
  }, [refreshTrigger, isExpanded, fetchSubFolders]);

  const handleToggleExpand = async (e) => {
    e.stopPropagation();
    const nextState = !isExpanded;
    setIsExpanded(nextState);
    if (nextState && !hasLoaded) {
      await fetchSubFolders();
    }
  };

  return (
    <div className="select-none">
      <div
        onClick={() => onSelectFolder(folder.id)}
        style={{ paddingLeft: `${depth * 14 + 10}px` }}
        className={`group flex items-center gap-1.5 py-1.5 pr-2.5 rounded-xl text-xs font-medium cursor-pointer transition-all duration-150 ${
          isSelected
            ? "bg-[#2b2ffb] text-white font-semibold shadow-sm"
            : "text-gray-700 hover:bg-gray-200/70"
        }`}
      >
        <button
          type="button"
          onClick={handleToggleExpand}
          aria-label={isExpanded ? "Collapse folder" : "Expand folder"}
          className={`w-4 h-4 flex items-center justify-center rounded transition-colors shrink-0 ${
            isSelected
              ? "text-white/90 hover:bg-white/20"
              : "text-gray-400 hover:text-gray-700 hover:bg-gray-300/60"
          }`}
        >
          {isExpanded ? (
            <FaChevronDown className="text-[9px]" />
          ) : (
            <FaChevronRight className="text-[9px]" />
          )}
        </button>

        <span className="shrink-0">
          {isExpanded ? (
            <FaFolderOpen
              className={`text-sm ${
                isSelected ? "text-[#cded9e]" : "text-amber-500"
              }`}
            />
          ) : (
            <FaFolder
              className={`text-sm ${
                isSelected ? "text-[#cded9e]" : "text-amber-500"
              }`}
            />
          )}
        </span>

        <span className="truncate flex-1">{folder.name}</span>
      </div>

      {isExpanded && (
        <div className="mt-0.5 space-y-0.5">
          {loading && !hasLoaded ? (
            <div
              style={{ paddingLeft: `${(depth + 1) * 14 + 26}px` }}
              className="py-1 text-[11px] text-gray-400 italic"
            >
              Loading...
            </div>
          ) : subFolders.length === 0 ? (
            <div
              style={{ paddingLeft: `${(depth + 1) * 14 + 26}px` }}
              className="py-1 text-[11px] text-gray-400"
            >
              No subfolders
            </div>
          ) : (
            subFolders.map((sub) => (
              <FolderTreeNode
                key={sub.id}
                folder={sub}
                currentDirId={currentDirId}
                onSelectFolder={onSelectFolder}
                depth={depth + 1}
                refreshTrigger={refreshTrigger}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function Sidebar({
  currentDirId,
  recentFolders = [],
  onCreateFolderClick,
  onUploadFilesClick,
  refreshTrigger = 0,
  disabled = false,
  isOpenMobile = false,
  onCloseMobile,
}) {
  const navigate = useNavigate();
  const [rootFolders, setRootFolders] = useState([]);
  const [isRootExpanded, setIsRootExpanded] = useState(true);
  const [loadingRoot, setLoadingRoot] = useState(false);
  const [showNewDropdown, setShowNewDropdown] = useState(false);

  const isHomeActive = !currentDirId;

  const fetchRootFolders = useCallback(async () => {
    try {
      setLoadingRoot(true);
      const data = await getDirectoryItems("");
      setRootFolders([...(data.directories || [])].reverse());
    } catch (err) {
      console.error("Error loading root folders for sidebar:", err);
    } finally {
      setLoadingRoot(false);
    }
  }, []);

  useEffect(() => {
    fetchRootFolders();
  }, [fetchRootFolders, refreshTrigger]);

  const handleSelectFolder = (folderId) => {
    if (folderId) {
      navigate(`/directory/${folderId}`);
    } else {
      navigate("/");
    }
    if (onCloseMobile) onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-gray-200/80 w-64 shrink-0 select-none">
      {/* Brand Header */}
      <div className="px-5 pt-5 pb-4 flex items-center justify-between">
        <div
          onClick={() => handleSelectFolder("")}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-xl bg-[#2b2ffb] flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
            SD
          </div>
          <span className="text-base font-extrabold tracking-tight text-gray-900">
            Sync Drive
          </span>
        </div>

        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 text-sm"
          >
            ✕
          </button>
        )}
      </div>

      {/* Google Drive style "+ New" Action Button */}
      <div className="px-4 mb-4 relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setShowNewDropdown((prev) => !prev)}
          className="w-full py-2.5 px-4 rounded-2xl bg-[#cded9e] hover:bg-[#c1e68a] disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <FaPlus className="text-xs" />
          <span>New</span>
        </button>

        {showNewDropdown && (
          <div
            onMouseLeave={() => setShowNewDropdown(false)}
            className="absolute left-4 right-4 top-12 z-40 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 overflow-hidden"
          >
            <button
              type="button"
              onClick={() => {
                setShowNewDropdown(false);
                onCreateFolderClick?.();
                onCloseMobile?.();
              }}
              className="w-full px-4 py-2.5 text-left text-xs font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-2.5 cursor-pointer"
            >
              <FaFolderPlus className="text-amber-500 text-sm" />
              <span>New Folder</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowNewDropdown(false);
                onUploadFilesClick?.();
                onCloseMobile?.();
              }}
              className="w-full px-4 py-2.5 text-left text-xs font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-2.5 cursor-pointer"
            >
              <FaUpload className="text-[#2b2ffb] text-sm" />
              <span>File Upload</span>
            </button>
          </div>
        )}
      </div>

      {/* Scrollable Navigation Content */}
      <div className="flex-1 overflow-y-auto px-3 pb-6 space-y-6">
        {/* Primary Navigation & Nested Folder Tree */}
        <div>
          <p className="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Navigation
          </p>

          {/* Home / My Drive Root Item */}
          <div
            onClick={() => handleSelectFolder("")}
            className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              isHomeActive
                ? "bg-[#2b2ffb] text-white shadow-sm"
                : "text-gray-800 hover:bg-gray-200/70"
            }`}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsRootExpanded((prev) => !prev);
              }}
              aria-label={isRootExpanded ? "Collapse My Drive" : "Expand My Drive"}
              className={`w-4 h-4 flex items-center justify-center rounded transition-colors shrink-0 ${
                isHomeActive
                  ? "text-white/90 hover:bg-white/20"
                  : "text-gray-400 hover:text-gray-700 hover:bg-gray-300/60"
              }`}
            >
              {isRootExpanded ? (
                <FaChevronDown className="text-[9px]" />
              ) : (
                <FaChevronRight className="text-[9px]" />
              )}
            </button>

            <FaHome
              className={`text-sm shrink-0 ${
                isHomeActive ? "text-[#cded9e]" : "text-[#2b2ffb]"
              }`}
            />
            <span className="truncate flex-1">Home (My Drive)</span>
          </div>

          {/* Nested Folders Tree under My Drive */}
          {isRootExpanded && (
            <div className="mt-1 space-y-0.5">
              {loadingRoot && rootFolders.length === 0 ? (
                <p className="pl-8 py-1.5 text-[11px] text-gray-400 italic">
                  Loading folders...
                </p>
              ) : rootFolders.length === 0 ? (
                <p className="pl-8 py-1.5 text-[11px] text-gray-400">
                  No folders yet
                </p>
              ) : (
                rootFolders.map((folder) => (
                  <FolderTreeNode
                    key={folder.id}
                    folder={folder}
                    currentDirId={currentDirId}
                    onSelectFolder={handleSelectFolder}
                    depth={1}
                    refreshTrigger={refreshTrigger}
                  />
                ))
              )}
            </div>
          )}
        </div>

        {/* Last 3 Recently Opened Folders Section */}
        <div>
          <div className="px-2.5 mb-1.5 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <FaClock className="text-[10px]" />
              <span>Recent Folders</span>
            </p>
            <span className="text-[10px] font-medium text-gray-400">Last 3</span>
          </div>

          {recentFolders.length === 0 ? (
            <p className="px-2.5 py-2 text-[11px] text-gray-400">
              No recently opened folders
            </p>
          ) : (
            <div className="space-y-0.5">
              {recentFolders.slice(0, 3).map((folder) => {
                const isSelected = String(currentDirId) === String(folder.id);
                return (
                  <div
                    key={folder.id}
                    onClick={() => handleSelectFolder(folder.id)}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[#2b2ffb] text-white font-semibold shadow-sm"
                        : "text-gray-700 hover:bg-gray-200/70"
                    }`}
                  >
                    <FaFolder
                      className={`text-sm shrink-0 ${
                        isSelected ? "text-[#cded9e]" : "text-amber-500"
                      }`}
                    />
                    <span className="truncate flex-1">{folder.name}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block sticky top-0 h-screen shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-50 lg:hidden bg-black/50 backdrop-blur-xs flex"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="h-full max-w-[80vw]"
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
