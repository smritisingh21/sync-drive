import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DirectoryHeader from "./components/DirectoryHeader";
import CreateDirectoryModal from "./components/CreateDirectoryModal";
import RenameModal from "./components/RenameModal";
import DirectoryList from "./components/DirectoryList";
import ContextMenu from "./components/ContextMenu";
import Sidebar from "./components/Sidebar";
import { DirectoryContext } from "./context/DirectoryContext";
import { BsGrid, BsList } from "react-icons/bs";
import { FaBars, FaSearch, FaTimes } from "react-icons/fa";

import {
  getDirectoryItems,
  createDirectory,
  deleteDirectory,
  renameDirectory,
} from "./api/directoryApi";

import {
  deleteFile,
  renameFile,
  uploadComplete,
  uploadInitiate,
} from "./api/fileApi";
import DetailsPopup from "./components/DetailsPopup";
import ConfirmDeleteModal from "./components/ConfirmDeleteModel";

// Tailwind config color mappings used below:
// primary: '#2b2ffb'
// secondary: '#cded9e'
// off-white: '#f7f7f2'

function DirectoryView() {
  const { dirId } = useParams();
  const navigate = useNavigate();

  const [directoryName, setDirectoryName] = useState("My Drive");
  const [directoriesList, setDirectoriesList] = useState([]);
  const [filesList, setFilesList] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showCreateDirModal, setShowCreateDirModal] = useState(false);
  const [newDirname, setNewDirname] = useState("New Folder");
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameType, setRenameType] = useState(null);
  const [renameId, setRenameId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [uploadItem, setUploadItem] = useState(null);


  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem("syncDriveViewMode") || "grid";
  });
  useEffect(() => {
    localStorage.setItem("syncDriveViewMode", viewMode);
  }, [viewMode]);


  const fileInputRef = useRef(null);
  const xhrRef = useRef(null);

  const [activeContextMenu, setActiveContextMenu] = useState(null);
  const [detailsItem, setDetailsItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: "", name: "My Drive" }]);
  const [searchQuery, setSearchQuery] = useState("");

  const [recentFolders, setRecentFolders] = useState(() => {
    try {
      const saved = localStorage.getItem("syncDriveRecentFolders");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const openDetailsPopup = (item) => setDetailsItem(item);
  const closeDetailsPopup = () => setDetailsItem(null);

  const loadDirectory = async () => {
    try {
      const data = await getDirectoryItems(dirId);
      setDirectoryName(dirId ? data.name : "My Drive");
      setDirectoriesList([...data.directories].reverse());
      setFilesList([...data.files].reverse());

      if (Array.isArray(data.breadcrumbs) && data.breadcrumbs.length > 0) {
        setBreadcrumbs(data.breadcrumbs);
      } else if (!dirId) {
        setBreadcrumbs([{ id: "", name: "My Drive" }]);
      } else {
        // Fallback if backend hasn't been updated yet: walk up parentDirId
        const trail = [];
        let cursor = data;
        const visited = new Set();
        while (cursor && !visited.has(String(cursor._id || cursor.id))) {
          visited.add(String(cursor._id || cursor.id));
          if (!cursor.parentDirId) {
            trail.unshift({ id: "", name: "My Drive" });
            break;
          }
          trail.unshift({
            id: String(cursor._id || cursor.id),
            name: cursor.name,
          });
          try {
            cursor = await getDirectoryItems(cursor.parentDirId);
          } catch {
            trail.unshift({ id: "", name: "My Drive" });
            break;
          }
        }
        setBreadcrumbs(
          trail.length > 0 ? trail : [{ id: "", name: "My Drive" }]
        );
      }

      if (dirId && data.name) {
        setRecentFolders((prev) => {
          const updated = [
            { id: dirId, name: data.name, openedAt: Date.now() },
            ...prev.filter((f) => String(f.id) !== String(dirId)),
          ].slice(0, 3);
          localStorage.setItem(
            "syncDriveRecentFolders",
            JSON.stringify(updated)
          );
          return updated;
        });
      }
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      else setErrorMessage(err.response?.data?.error || err.message);
    }
  };

  useEffect(() => {
    loadDirectory();
    setActiveContextMenu(null);
    setPreviewItem(null);
    setSearchQuery("");
  }, [dirId]);

  function getFileIcon(filename = "") {
    const ext = filename.split(".").pop().toLowerCase();
    switch (ext) {
      case "pdf": return "pdf";
      case "png": case "jpg": case "jpeg": case "gif": case "webp": case "svg": case "bmp": case "avif": return "image";
      case "mp4": case "mov": case "avi": case "webm": case "mkv": case "m4v": case "ogg": return "video";
      case "zip": case "rar": case "tar": case "gz": return "archive";
      case "js": case "jsx": case "ts": case "tsx":
      case "html": case "css": case "py": case "java": return "code";
      default: return "alt";
    }
  }

  const backendBaseUrl =
    import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:4000";

  function handleRowClick(type, id) {
    if (type === "directory") {
      navigate(`/directory/${id}`);
    } else {
      const targetFile = filesList.find((f) => f.id === id);
      if (!targetFile) return;

      const iconType = getFileIcon(targetFile.name);
      if (iconType === "image" || iconType === "video") {
        setPreviewItem(targetFile);
      } else {
        // PDFs and other files are downloaded only
        const downloadUrl =
          targetFile.downloadUrl ||
          targetFile.url ||
          `${backendBaseUrl}/file/${id}?action=download`;
        window.location.href = downloadUrl;
      }
    }
  }

  const previewableFiles = filesList.filter((f) => {
    const type = getFileIcon(f.name);
    return type === "image" || type === "video";
  });

  useEffect(() => {
    if (!previewItem) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (!detailsItem) setPreviewItem(null);
      } else if (e.key === "ArrowRight" && previewableFiles.length > 1) {
        const idx = previewableFiles.findIndex((f) => f.id === previewItem.id);
        if (idx !== -1) {
          setPreviewItem(previewableFiles[(idx + 1) % previewableFiles.length]);
        }
      } else if (e.key === "ArrowLeft" && previewableFiles.length > 1) {
        const idx = previewableFiles.findIndex((f) => f.id === previewItem.id);
        if (idx !== -1) {
          setPreviewItem(
            previewableFiles[
            (idx - 1 + previewableFiles.length) % previewableFiles.length
            ]
          );
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewItem, previewableFiles]);

  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (uploadItem?.isUploading) {
      setErrorMessage("An upload is already in progress. Please wait.");
      setTimeout(() => setErrorMessage(""), 3000);
      e.target.value = "";
      return;
    }

    const tempItem = {
      file,
      name: file.name,
      size: file.size,
      id: `temp-${Date.now()}`,
      isUploading: true,
      progress: 0,
      url:
        file.type.startsWith("image/") || file.type.startsWith("video/")
          ? URL.createObjectURL(file)
          : null,
    };

    try {
      const data = await uploadInitiate({
        name: file.name,
        size: file.size,
        contentType: file.type,
        parentDirId: dirId,
      });

      const { uploadSignedUrl, fileId } = data;
      setFilesList((prev) => [tempItem, ...prev]);
      setUploadItem(tempItem);
      e.target.value = "";

      startUpload({ item: tempItem, uploadUrl: uploadSignedUrl, fileId });
    } catch (err) {
      setErrorMessage(err.response.data.error);
      setTimeout(() => setErrorMessage(""), 3000);
    }
  }

  function startUpload({ item, uploadUrl, fileId }) {
    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;
    xhr.open("PUT", uploadUrl);

    if (item.file?.type) {
      xhr.setRequestHeader("Content-Type", item.file.type);
    }

    xhr.upload.addEventListener("progress", (evt) => {
      if (evt.lengthComputable) {
        const progress = (evt.loaded / evt.total) * 100;
        setUploadItem((prev) => (prev ? { ...prev, progress } : prev));
      }
    });

    xhr.onload = async () => {
      if (xhr.status === 200) {
        const fileUploadResponse = await uploadComplete(fileId);
        console.log(fileUploadResponse);
      } else {
        setErrorMessage("File not uploaded");
        setTimeout(() => setErrorMessage(""), 3000);
      }
      setUploadItem(null);
      loadDirectory();
    };

    xhr.onerror = () => {
      setErrorMessage("Something went wrong!");
      setFilesList((prev) => prev.filter((f) => f.id !== item.id));
      setUploadItem(null);
      setTimeout(() => setErrorMessage(""), 3000);
    };

    xhr.send(item.file);
  }

  function handleCancelUpload(tempId) {
    if (uploadItem && uploadItem.id === tempId && xhrRef.current) {
      xhrRef.current.abort();
    }
    setFilesList((prev) => prev.filter((f) => f.id !== tempId));
    setUploadItem(null);
  }

  async function confirmDelete(item) {
    try {
      if (item.isDirectory) {
        await deleteDirectory(item.id);
        setRecentFolders((prev) => {
          const updated = prev.filter((f) => String(f.id) !== String(item.id));
          localStorage.setItem("syncDriveRecentFolders", JSON.stringify(updated));
          return updated;
        });
        setSidebarRefreshKey((k) => k + 1);
      } else {
        await deleteFile(item.id);
      }
      setDeleteItem(null);
      loadDirectory();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || err.message);
    }
  }

  async function handleCreateDirectory(e) {
    e.preventDefault();
    try {
      await createDirectory(dirId, newDirname);
      setNewDirname("New Folder");
      setShowCreateDirModal(false);
      setSidebarRefreshKey((k) => k + 1);
      loadDirectory();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || err.message);
    }
  }

  function openRenameModal(type, id, currentName) {
    setRenameType(type);
    setRenameId(id);
    setRenameValue(currentName);
    setShowRenameModal(true);
  }

  async function handleRenameSubmit(e) {
    e.preventDefault();
    try {
      if (renameType === "file") {
        await renameFile(renameId, renameValue);
      } else {
        await renameDirectory(renameId, renameValue);
        setRecentFolders((prev) => {
          const updated = prev.map((f) =>
            String(f.id) === String(renameId) ? { ...f, name: renameValue } : f
          );
          localStorage.setItem("syncDriveRecentFolders", JSON.stringify(updated));
          return updated;
        });
        setSidebarRefreshKey((k) => k + 1);
      }

      setShowRenameModal(false);
      setRenameValue("");
      setRenameType(null);
      setRenameId(null);
      loadDirectory();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || err.message);
    }
  }

  useEffect(() => {
    const handleDocumentClick = () => setActiveContextMenu(null);
    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, []);

  const allItems = [
    ...directoriesList.map((d) => ({ ...d, isDirectory: true })),
    ...filesList.map((f) => ({ ...f, isDirectory: false })),
  ];

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const combinedItems = normalizedQuery
    ? allItems.filter((item) =>
        (item.name || "").toLowerCase().includes(normalizedQuery)
      )
    : allItems;

  const isUploading = !!uploadItem?.isUploading;
  const progressMap = uploadItem
    ? { [uploadItem.id]: uploadItem.progress || 0 }
    : {};

  const isAccessDenied =
    errorMessage === "Directory not found or you do not have access to it!";

  return (
    <DirectoryContext.Provider
      value={{
        handleRowClick,
        activeContextMenu,
        handleContextMenu: (e, id) => {
          e.stopPropagation();
          e.preventDefault();
          setActiveContextMenu((prev) => (prev === id ? null : id));
        },
        getFileIcon,
        isUploading,
        progressMap,
        handleCancelUpload,
        setDeleteItem,
        openRenameModal,
        openDetailsPopup,
        BASE_URL: backendBaseUrl,
      }}
    >
      {/* Page wrapper — Clean Pinterest off-white background with Google Drive Sidebar */}
      <div className="min-h-screen flex bg-[#f7f7f2] font-sans text-gray-900 antialiased">
        <Sidebar
          currentDirId={dirId}
          recentFolders={recentFolders}
          onCreateFolderClick={() => setShowCreateDirModal(true)}
          onUploadFilesClick={() => fileInputRef.current?.click()}
          refreshTrigger={sidebarRefreshKey}
          disabled={isAccessDenied}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Inner content container */}
        <div className="flex-1 min-w-0 max-w-[1800px] mx-auto px-4 sm:px-8 py-6">

          {/* Error banner — Toast-style design */}
          {errorMessage && !isAccessDenied && (
            <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-[#2b2ffb] text-white text-sm font-medium rounded-full shadow-lg flex items-center gap-2 animate-bounce">

              <span>⚠️</span> {errorMessage}
            </div>
          )}

          {/* Header section — Clean, integrated aesthetic */}
          <div className="mb-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 shadow-xs cursor-pointer"
            >
              <FaBars className="text-sm" />
            </button>
            <div className="flex-1 min-w-0">
              <DirectoryHeader
                directoryName={directoryName}
                breadcrumbs={breadcrumbs}
                previewItem={previewItem}
                onClearPreview={() => setPreviewItem(null)}
                onSelectPreview={(file) => setPreviewItem(file)}
              />
            </div>
            <input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          {/* Controls Segment: Pinterest-styled List/Icon layout button + Search Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 px-2">
            <div className="bg-gray-200/60 p-1 rounded-full flex gap-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-2 text-xs font-bold rounded-full transition-opacity duration-200 ${viewMode === "grid"
                  ? "bg-[#2b2ffb] text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-300/50"
                  }`}
              >
                <BsGrid />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 text-xs font-bold rounded-full transition-all duration-100 ${viewMode === "list"
                  ? "bg-[#2b2ffb] text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-300/50"
                  }`}
              >
                <BsList />
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative flex-1 max-w-sm min-w-[200px]">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files & folders..."
                className="w-full pl-9 pr-9 py-2 rounded-full bg-white border border-gray-200 text-xs text-gray-800 placeholder-gray-400 shadow-2xs focus:outline-none focus:border-[#2b2ffb] focus:ring-2 focus:ring-[#2b2ffb]/15 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  <FaTimes className="text-[10px]" />
                </button>
              )}
            </div>
          </div>

          {/* Main Workspace Display Content */}
          {combinedItems.length === 0 ? (
            isAccessDenied ? (
              <div className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto shadow-sm border border-gray-100">
                <p className="text-sm font-semibold text-gray-500 tracking-wider">
                  Access Denied or Directory Missing
                </p>
              </div>
            ) : normalizedQuery ? (
              <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-14 text-center max-w-xl mx-auto shadow-sm">
                <div className="mb-3 text-3xl text-gray-400">🔍</div>
                <p className="text-base font-bold text-gray-700">
                  No results for "{searchQuery}"
                </p>
                <p className="text-xs text-gray-400 mt-1 mb-4">
                  Try a different file or folder name.
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="px-4 py-2 rounded-full bg-[#2b2ffb] text-white text-xs font-bold hover:bg-[#1f23d9] transition-colors cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-16 text-center max-w-xl mx-auto shadow-sm">
                <div className="mb-4 text-4xl text-gray-400">📂</div>
                <p className="text-base font-bold text-gray-700">This folder is empty now!</p>
                <p className="text-xs text-gray-400 mt-1">
                  Upload files to build your collection.
                </p>
              </div>
            )
          ) : viewMode === "grid" ? (
            /* Pinterest home layout (Masonry Fluid Grid System) */
            <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-4 space-y-4 mx-auto pb-24">
              {combinedItems.map((item) => {
                const iconType = item.isDirectory ? "folder" : getFileIcon(item.name);
                return (
                  <div
                    key={item.id}
                    onClick={() =>
                      !(activeContextMenu || isUploading) &&
                      handleRowClick(item.isDirectory ? "directory" : "file", item.id)
                    }
                    onContextMenu={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setActiveContextMenu((prev) => (prev === item.id ? null : item.id));
                    }}
                    className={`break-inside-avoid bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer border border-gray-100 relative ${activeContextMenu === item.id ? "overflow-visible z-30" : "overflow-hidden"
                      }`}
                  >
                    {/* Thumbnail or Icon Cover Canvas */}
                    <div
                      className={`w-full rounded-t-2xl flex items-center justify-center overflow-hidden transition-colors ${item.isDirectory
                        ? "h-32 bg-[#cded9e]/30"
                        : iconType === "image" || iconType === "video"
                          ? "h-48 bg-gray-100 relative"
                          : "h-44 bg-gray-100/70"
                        }`}
                    >
                      {!item.isDirectory && iconType === "image" ? (
                        <div className="w-full h-full relative flex items-center justify-center bg-gray-100">
                          <img
                            src={
                              item.url ||
                              (item.file
                                ? URL.createObjectURL(item.file)
                                : `${backendBaseUrl}/file/${item.id}`)
                            }
                            alt={item.name}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              const fallback = e.currentTarget.parentElement?.querySelector(".fallback-icon");
                              if (fallback) fallback.classList.remove("hidden");
                            }}
                          />
                          <div className="fallback-icon hidden w-full h-full items-center justify-center">
                            <span className="text-4xl">🖼️</span>
                          </div>
                        </div>
                      ) : !item.isDirectory && iconType === "video" ? (
                        <div className="w-full h-full relative flex items-center justify-center bg-gray-900">
                          <video
                            src={`${item.url ||
                              (item.file
                                ? URL.createObjectURL(item.file)
                                : `${backendBaseUrl}/file/${item.id}`)
                              }#t=0.5`}
                            preload="metadata"
                            muted
                            playsInline
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              const fallback = e.currentTarget.parentElement?.querySelector(".fallback-icon");
                              if (fallback) fallback.classList.remove("hidden");
                            }}
                          />
                          <div className="fallback-icon hidden w-full h-full items-center justify-center">
                            <span className="text-4xl">🎬</span>
                          </div>
                          {/* Play Icon Overlay Badge */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-11 h-11 rounded-full bg-black/60 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:bg-[#2b2ffb] transition-all duration-200">
                              <span className="text-sm ml-0.5">▶</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-4xl group-hover:scale-110 transition-transform duration-200">
                          {item.isDirectory
                            ? "📁"
                            : iconType === "pdf"
                              ? "📕"
                              : iconType === "archive"
                                ? "📦"
                                : iconType === "code"
                                  ? "💻"
                                  : "📄"}
                        </span>
                      )}
                    </div>

                    {/* Meta information row strip underneath layout image card */}
                    <div className="p-3 flex justify-between items-center relative">
                      <div className="truncate pr-2">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {item.isDirectory
                            ? "Folder"
                            : iconType === "image"
                              ? "Image"
                              : iconType === "video"
                                ? "Video"
                                : iconType === "pdf"
                                  ? "PDF (Click to download)"
                                  : "Document File"}
                        </p>
                      </div>

                      {/* Context Menu Button Interaction Hook Toggle area */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setActiveContextMenu((prev) => (prev === item.id ? null : item.id));
                          }}
                          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 font-bold text-sm"
                        >
                          •••
                        </button>

                        {activeContextMenu === item.id && (
                          <div className="absolute right-0 top-8 z-50">
                            <ContextMenu
                              item={item}
                              isUploadingItem={String(item.id).startsWith("temp-")}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Structured clean minimal alternate list layout styling standard */
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 max-w-5xl mx-auto mb-24">
              <DirectoryList items={combinedItems} />
            </div>
          )}

          {/* Create Directory Modal Overlay Backdrop View */}
          {showCreateDirModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm mx-4 overflow-hidden transform transition-all border border-gray-100">
                <div className="px-6 py-4 bg-[#cded9e] flex justify-between items-center">
                  <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                    New Folder
                  </h2>
                </div>
                <div className="p-6 bg-[#f7f7f2]">
                  <CreateDirectoryModal
                    newDirname={newDirname}
                    setNewDirname={setNewDirname}
                    onClose={() => setShowCreateDirModal(false)}
                    onCreateDirectory={handleCreateDirectory}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Rename Modal View Container Overlay Backdrop View */}
          {showRenameModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm mx-4 overflow-hidden border border-gray-100">
                <div className="px-6 py-4 bg-[#cded9e]">
                  <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                    Rename {renameType === "file" ? "File" : "Folder"}
                  </h2>
                </div>
                <div className="p-6 bg-[#f7f7f2]">
                  <RenameModal
                    renameType={renameType}
                    renameValue={renameValue}
                    setRenameValue={setRenameValue}
                    onClose={() => setShowRenameModal(false)}
                    onRenameSubmit={handleRenameSubmit}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Sync Progress Status Interface Strip Dock Panel bottom area */}
          {uploadItem && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white shadow-xl rounded-full border border-gray-200 px-6 py-3 flex items-center gap-4 w-[90%] max-w-xl animate-fade-in">
              <span className="text-xs font-bold text-gray-700 truncate max-w-[150px]">
                {uploadItem.name}
              </span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2b2ffb] rounded-full transition-all duration-200"
                  style={{ width: `${Math.round(uploadItem.progress || 0)}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-gray-600">
                {Math.round(uploadItem.progress || 0)}%
              </span>
              <button
                onClick={() => handleCancelUpload(uploadItem.id)}
                className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-full transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Safety Confirm System Deletion modal item view node overlay box */}
          {deleteItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm mx-4 overflow-hidden border border-gray-100">
                <div className="px-6 py-4 bg-red-50 border-b border-red-100">
                  <h2 className="text-sm font-bold text-red-600 uppercase tracking-wider">
                    Confirm Deletion
                  </h2>
                </div>
                <div className="p-6 bg-[#f7f7f2]">
                  <ConfirmDeleteModal
                    item={deleteItem}
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteItem(null)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* In-App Media Preview Modal (Images & Videos Only) */}
          {previewItem && (
            <div
              onClick={() => setPreviewItem(null)}
              className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-md animate-fade-in"
            >
              {/* Top Toolbar */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-between px-4 sm:px-8 py-4 bg-black/40 border-b border-white/10 text-white"
              >
                <div className="flex items-center gap-3 min-w-0 pr-4">
                  <span className="text-xl shrink-0">
                    {getFileIcon(previewItem.name) === "video" ? "🎬" : "🖼️"}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold truncate">
                      {previewItem.name}
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      {getFileIcon(previewItem.name) === "video"
                        ? "Video Preview"
                        : "Image Preview"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <button
                    onClick={() => {
                      const dlUrl =
                        previewItem.downloadUrl ||
                        `${backendBaseUrl}/file/${previewItem.id}?action=download`;
                      window.location.href = dlUrl;
                    }}
                    className="px-4 py-2 rounded-full bg-[#cded9e] text-gray-900 hover:bg-[#b8df80] text-xs font-bold transition-colors cursor-pointer"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => openDetailsPopup(previewItem)}
                    className="px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => setPreviewItem(null)}
                    aria-label="Close preview"
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-lg font-bold transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Main Media Stage */}
              <div className="relative flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden">
                {/* Previous Media Button */}
                {previewableFiles.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const idx = previewableFiles.findIndex(
                        (f) => f.id === previewItem.id
                      );
                      if (idx !== -1) {
                        setPreviewItem(
                          previewableFiles[
                          (idx - 1 + previewableFiles.length) %
                          previewableFiles.length
                          ]
                        );
                      }
                    }}
                    aria-label="Previous media"
                    className="absolute left-3 sm:left-6 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 border border-white/15 flex items-center justify-center text-white text-2xl transition-colors cursor-pointer"
                  >
                    ‹
                  </button>
                )}

                {/* Media Element */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="max-w-5xl max-h-full flex items-center justify-center"
                >
                  {getFileIcon(previewItem.name) === "video" ? (
                    <video
                      key={previewItem.id}
                      src={
                        previewItem.url ||
                        (previewItem.file
                          ? URL.createObjectURL(previewItem.file)
                          : `${backendBaseUrl}/file/${previewItem.id}`)
                      }
                      controls
                      autoPlay
                      playsInline
                      className="max-h-[78vh] max-w-[90vw] rounded-2xl shadow-2xl bg-black outline-none border border-white/10"
                    />
                  ) : (
                    <img
                      key={previewItem.id}
                      src={
                        previewItem.url ||
                        (previewItem.file
                          ? URL.createObjectURL(previewItem.file)
                          : `${backendBaseUrl}/file/${previewItem.id}`)
                      }
                      alt={previewItem.name}
                      className="max-h-[78vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl select-none"
                    />
                  )}
                </div>

                {/* Next Media Button */}
                {previewableFiles.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const idx = previewableFiles.findIndex(
                        (f) => f.id === previewItem.id
                      );
                      if (idx !== -1) {
                        setPreviewItem(
                          previewableFiles[(idx + 1) % previewableFiles.length]
                        );
                      }
                    }}
                    aria-label="Next media"
                    className="absolute right-3 sm:right-6 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 border border-white/15 flex items-center justify-center text-white text-2xl transition-colors cursor-pointer"
                  >
                    ›
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Sliding Right Sidebar for Item Details (renders above preview modal) */}
          <DetailsPopup
            item={detailsItem}
            onClose={closeDetailsPopup}
            currentPath={breadcrumbs.map((b) => b.name).join(" / ")}
          />

        </div>
      </div>
    </DirectoryContext.Provider>
  );
}

export default DirectoryView;