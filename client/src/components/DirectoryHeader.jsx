import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaFolderPlus,
  FaUpload,
  FaUser,
  FaSignOutAlt,
  FaSignInAlt,
} from "react-icons/fa";

function DirectoryHeader({
  directoryName,
  onCreateFolderClick,
  onUploadFilesClick,
  fileInputRef,
  handleFileSelect,
  disabled = false,
}) {
  const BASE_URL = "http://localhost:8000";
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState("Guest User");
  const [userEmail, setUserEmail] = useState("guest@example.com");

  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch(`${BASE_URL}/user`, { credentials: "include" });
        if (response.ok) {
          const data = await response.json();
          setUserName(data.name);
          setUserEmail(data.email);
          setLoggedIn(true);
        } else if (response.status === 401) {
          setUserName("Guest User");
          setUserEmail("guest@example.com");
          setLoggedIn(false);
        }
      } catch (err) { console.error("Error fetching user info:", err); }
    }
    fetchUser();
  }, [BASE_URL]);

  const handleUserIconClick = () => setShowUserMenu((prev) => !prev);

  const handleLogout = async () => {
    try {
      const response = await fetch(`${BASE_URL}/user/logout`, { method: "POST", credentials: "include" });
      if (response.ok) {
        setLoggedIn(false);
        setUserName("Guest User");
        setUserEmail("guest@example.com");
        navigate("/login");
      }
    } catch (err) { console.error("Logout error:", err); } finally { setShowUserMenu(false); }
  };
  const handleLogoutAll = async () => {
    try {
      const response = await fetch(`${BASE_URL}/user/logoutAllDevices`, { method: "POST", credentials: "include" });
      if (response.ok) {
        setLoggedIn(false);
        setUserName("Guest User");
        setUserEmail("guest@example.com");
        navigate("/login");
      }
    } catch (err) { console.error("Logout error:", err); } finally { setShowUserMenu(false); }
  };

  useEffect(() => {
    function handleDocumentClick(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleDocumentClick);
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, []);

  return (
    <header className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-slate-800 tracking-tight truncate max-w-[50%]">
        {directoryName}
      </h1>

      <div className="flex items-center gap-2">
        {/* Action Buttons */}
        <div className="flex gap-2 ">
          <button
            title="Create Folder"
            onClick={onCreateFolderClick}
            disabled={disabled}
            className="p-2.5 border-2 text-sm flex items-center gap-2 justify-center text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm rounded-lg transition-all disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <FaFolderPlus size={18} fill="blue"/> <p className="dsm\:hidden">New Folder</p>
          </button>

          <button
            title="Upload Files"
            onClick={onUploadFilesClick}
            disabled={disabled}
            className="p-2.5 border-2 text-sm flex items-center gap-2 justify-center  text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm rounded-lg transition-all disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <FaUpload size={18}  fill="purple"/> New file
          </button>
        </div>

        <input
          ref={fileInputRef}
          id="file-upload"
          type="file"
          className="hidden"
          multiple
          onChange={handleFileSelect}
        />

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={handleUserIconClick}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
          >
            <FaUser size={16} />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl ring-1 ring-black/5 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              {loggedIn ? (
                <>
                  <div className="px-4 py-4 bg-slate-50/50">
                    <p className="text-sm font-semibold text-slate-900 truncate">{userName}</p>
                    <p className="text-xs text-slate-500 truncate">{userEmail}</p>
                  </div>
                  <div className="border-t border-slate-100" />
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <FaSignOutAlt />
                    <span className="font-medium">Logout</span>
                  </button>
               
                  <div className="border-t border-slate-100" />
                  <button
                    onClick={handleLogoutAll}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <FaSignOutAlt />
                    <span className="font-medium">Logout from all devices</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { navigate("/login"); setShowUserMenu(false); }}
                  className="flex w-full items-center gap-3 px-4 py-4 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <FaSignInAlt className="text-indigo-600" />
                  <span className="font-medium">Login</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default DirectoryHeader;