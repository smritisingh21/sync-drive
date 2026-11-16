import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaFolder,
  FaFolderOpen,
  FaChevronRight,
  FaChevronDown,
  FaHome,
  FaClock,
  FaSignOutAlt,
  FaSignInAlt,
  FaUser,
} from "react-icons/fa";
import { getDirectoryItems } from "../api/directoryApi";
import { fetchUser, logoutUser, logoutAllSessions } from "../api/userApi";
import ActionButtons from "./ActionButtons";

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
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
        className={`group flex items-center gap-1.5 py-1.5 pr-2.5 rounded-md text-[13px] cursor-pointer transition-colors ${isSelected
            ? "bg-[#EBEBEA] text-[#191919] font-semibold"
            : "text-[#37352F] hover:bg-[#EFEFEE] font-normal"
          }`}
      >
        <button
          type="button"
          onClick={handleToggleExpand}
          aria-label={isExpanded ? "Collapse folder" : "Expand folder"}
          className="w-4 h-4 flex items-center justify-center rounded text-[#787774] hover:text-[#191919] hover:bg-[#E0E0DE] transition-colors shrink-0"
        >
          {isExpanded ? (
            <FaChevronDown className="text-[9px]" />
          ) : (
            <FaChevronRight className="text-[9px]" />
          )}
        </button>

        <span className="shrink-0 text-[#787774]">
          {isExpanded ? (
            <FaFolderOpen className="text-[13px]" />
          ) : (
            <FaFolder className="text-[13px]" />
          )}
        </span>

        <span className="truncate flex-1">{folder.name}</span>
      </div>

      {isExpanded && (
        <div className="mt-0.5 space-y-0.5">
          {loading && !hasLoaded ? (
            <div
              style={{ paddingLeft: `${(depth + 1) * 14 + 24}px` }}
              className="py-1 text-xs text-[#9B9A97] italic"
            >
              Loading...
            </div>
          ) : subFolders.length === 0 ? (
            <div
              style={{ paddingLeft: `${(depth + 1) * 14 + 24}px` }}
              className="py-1 text-xs text-[#9B9A97]"
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
  const [usedStorageInBytes, setUsedStorageInBytes] = useState(0);
  const [maxStorageInBytes, setMaxStorageInBytes] = useState(1073741824);
  const [userName, setUserName] = useState("Guest User");
  const [userEmail, setUserEmail] = useState("guest@example.com");
  const [userPicture, setUserPicture] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const usedGB = usedStorageInBytes / 1024 ** 3;
  const totalGB = maxStorageInBytes / 1024 ** 3;
  const usedPercent = Math.min((usedGB / totalGB) * 100 || 0, 100);

  useEffect(() => {
    fetchUser()
      .then((user) => {
        setUserName(user.name || "User");
        setUserEmail(user.email || "");
        setUserPicture(user.picture || "");
        setUsedStorageInBytes(user.usedStorageInBytes || 0);
        setMaxStorageInBytes(user.maxStorageInBytes || 1073741824);
        setLoggedIn(true);
      })
      .catch(() => {
        setLoggedIn(false);
        setUserName("Guest User");
        setUserEmail("guest@example.com");
        setUserPicture("");
      });
  }, [refreshTrigger]);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      navigate("/login");
    }
  };

  const handleLogoutAll = async () => {
    try {
      await logoutAllSessions();
    } catch (err) {
      console.error("Logout all error:", err);
    } finally {
      navigate("/login");
    }
  };

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
    navigate(folderId ? `/directory/${folderId}` : "/");
    onCloseMobile?.();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#F7F7F5] border-r border-[#E6E6E4] w-64 shrink-0 select-none text-[#37352F]">
      {/* Brand Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div
          onClick={() => handleSelectFolder("")}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-md bg-[#191919] flex items-center justify-center text-white font-semibold text-xs">
            SD
          </div>
          <span className="text-sm font-semibold tracking-tight text-[#191919]">
            Sync Drive
          </span>
        </div>

        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden w-7 h-7 rounded-md hover:bg-[#EFEFEE] flex items-center justify-center text-[#787774] text-sm cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      {/* Quick Actions */}
      <div className="px-3 mb-4">
        <ActionButtons
          compact
          disabled={disabled}
          onCreateFolderClick={() => {
            onCreateFolderClick?.();
            onCloseMobile?.();
          }}
          onUploadFilesClick={() => {
            onUploadFilesClick?.();
            onCloseMobile?.();
          }}
        />
      </div>

      {/* Scrollable Navigation Content */}
      <div className="flex-1 overflow-y-auto px-2.5 pb-4 space-y-5">
        {/* Primary Navigation & Nested Folder Tree */}
        <div>
          <p className="px-2 mb-1 text-[11px] font-medium text-[#9B9A97]">
            Workspace
          </p>

          <div
            onClick={() => handleSelectFolder("")}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[13px] cursor-pointer transition-colors ${isHomeActive
                ? "bg-[#EBEBEA] text-[#191919] font-semibold"
                : "text-[#37352F] hover:bg-[#EFEFEE] font-medium"
              }`}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsRootExpanded((prev) => !prev);
              }}
              aria-label={isRootExpanded ? "Collapse My Drive" : "Expand My Drive"}
              className="w-4 h-4 flex items-center justify-center rounded text-[#787774] hover:text-[#191919] hover:bg-[#E0E0DE] transition-colors shrink-0"
            >
              {isRootExpanded ? (
                <FaChevronDown className="text-[9px]" />
              ) : (
                <FaChevronRight className="text-[9px]" />
              )}
            </button>

            <FaHome className="text-[13px] text-[#787774] shrink-0" />
            <span className="truncate flex-1">My Drive</span>
          </div>

          {isRootExpanded && (
            <div className="mt-0.5 space-y-0.5">
              {loadingRoot && rootFolders.length === 0 ? (
                <p className="pl-7 py-1 text-xs text-[#9B9A97] italic">
                  Loading folders...
                </p>
              ) : rootFolders.length === 0 ? (
                <p className="pl-7 py-1 text-xs text-[#9B9A97]">
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

        {/* Last 3 Recently Opened Folders */}
        <div>
          <div className="px-2 mb-1 flex items-center justify-between">
            <p className="text-[11px] font-medium text-[#9B9A97] flex items-center gap-1.5">
              <FaClock className="text-[10px]" />
              <span>Recent</span>
            </p>
            <span className="text-[10px] text-[#9B9A97]">Last 3</span>
          </div>

          {recentFolders.length === 0 ? (
            <p className="px-2 py-1.5 text-xs text-[#9B9A97]">
              No recent folders
            </p>
          ) : (
            <div className="space-y-0.5">
              {recentFolders.slice(0, 3).map((folder) => {
                const isSelected = String(currentDirId) === String(folder.id);
                return (
                  <div
                    key={folder.id}
                    onClick={() => handleSelectFolder(folder.id)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[13px] cursor-pointer transition-colors ${isSelected
                        ? "bg-[#EBEBEA] text-[#191919] font-semibold"
                        : "text-[#37352F] hover:bg-[#EFEFEE]"
                      }`}
                  >
                    <FaFolder className="text-[13px] text-[#787774] shrink-0" />
                    <span className="truncate flex-1">{folder.name}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Storage & Profile Details */}
      <div className="border-t border-[#E6E6E4] px-3 py-3 space-y-2.5">
        {/* <div className="px-1">
          <div className="w-full h-1 bg-[#E6E6E4] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#37352F] rounded-full"
              style={{ width: `${usedPercent}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-[#787774]">
            {usedGB.toFixed(2)} GB of {totalGB.toFixed(0)} GB used
          </p>
        </div> */}

        <div>
          <button
            type="button"
            onClick={() => setShowProfileMenu((prev) => !prev)}
            className="w-full flex items-center gap-2.5 p-1.5 rounded-md hover:bg-[#EFEFEE] transition-colors cursor-pointer text-left"
          >
            {userPicture ? (
              <img
                src={userPicture}
                alt={userName}
                className="w-7 h-7 rounded-full object-cover shrink-0 border border-[#E6E6E4]"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#EBEBEA] text-[#37352F] flex items-center justify-center shrink-0">
                <FaUser className="text-[11px]" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-[#191919] truncate">
                {userName}
              </p>
              <p className="text-[11px] text-[#787774] truncate">
                {userEmail}
              </p>
            </div>

            <span className="w-5 h-5 rounded flex items-center justify-center text-[#787774] shrink-0">
              {showProfileMenu ? (
                <FaChevronDown className="text-[10px]" />
              ) : (
                <FaChevronRight className="text-[10px]" />
              )}
            </span>
          </button>

          {showProfileMenu && (
            <div className="mt-1 space-y-0.5 pl-1">
              {loggedIn ? (
                <>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full py-1.5 px-2.5 rounded-md text-[#37352F] hover:bg-[#EFEFEE] text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <FaSignOutAlt className="text-[11px] text-[#787774] shrink-0" />
                    <span>Log out</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLogoutAll}
                    className="w-full py-1.5 px-2.5 rounded-md text-[#B83232] hover:bg-[#FBEAEA] text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <FaSignOutAlt className="text-[11px] shrink-0" />
                    <span>Log out of all devices</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate("/login");
                  }}
                  className="w-full py-1.5 px-2.5 rounded-md text-[#37352F] hover:bg-[#EFEFEE] text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <FaSignInAlt className="text-[11px] text-[#787774] shrink-0" />
                  <span>Login</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block sticky top-0 h-screen shrink-0">
        {sidebarContent}
      </aside>

      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-50 lg:hidden bg-black/30 backdrop-blur-[1px] flex"
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
