import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DirectoryHeader from "./components/DirectoryHeader";
import CreateDirectoryModal from "./components/CreateDirectoryModal";
import RenameModal from "./components/RenameModal";
import DirectoryList from "./components/DirectoryList";
import { DirectoryContext } from "./context/DirectoryContext";
import { BsGrid } from "react-icons/bs";
import { BsList } from "react-icons/bs";

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
    return localStorage.getItem("syncDriveViewMode") || "list";
  });
  useEffect(() => {
    localStorage.setItem("syncDriveViewMode", viewMode);
  }, [viewMode]);
  
  
  const fileInputRef = useRef(null);
  const xhrRef = useRef(null);

  const [activeContextMenu, setActiveContextMenu] = useState(null);
  const [detailsItem, setDetailsItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  const openDetailsPopup = (item) => setDetailsItem(item);
  const closeDetailsPopup = () => setDetailsItem(null);

  const loadDirectory = async () => {
    try {
      const data = await getDirectoryItems(dirId);
      setDirectoryName(dirId ? data.name : "My Drive");
      setDirectoriesList([...data.directories].reverse());
      setFilesList([...data.files].reverse());
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      else setErrorMessage(err.response?.data?.error || err.message);
    }
  };

  useEffect(() => {
    loadDirectory();
    setActiveContextMenu(null);
  }, [dirId]);

  function getFileIcon(filename) {
    const ext = filename.split(".").pop().toLowerCase();
    switch (ext) {
      case "pdf": return "pdf";
      case "png": case "jpg": case "jpeg": case "gif": return "image";
      case "mp4": case "mov": case "avi": return "video";
      case "zip": case "rar": case "tar": case "gz": return "archive";
      case "js": case "jsx": case "ts": case "tsx":
      case "html": case "css": case "py": case "java": return "code";
      default: return "alt";
    }
  }

  function handleRowClick(type, id) {
    if (type === "directory") navigate(`/directory/${id}`);
    else window.location.href = `http://localhost:4000/file/${id}`;
  }

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
      if (item.isDirectory) await deleteDirectory(item.id);
      else await deleteFile(item.id);
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
      if (renameType === "file") await renameFile(renameId, renameValue);
      else await renameDirectory(renameId, renameValue);

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

  const combinedItems = [
    ...directoriesList.map((d) => ({ ...d, isDirectory: true })),
    ...filesList.map((f) => ({ ...f, isDirectory: false })),
  ];

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
      }}
    >
      {/* Page wrapper — Clean Pinterest off-white background */}
      <div className="min-h-screen bg-[#f7f7f2] font-sans text-gray-900 antialiased">

        {/* Inner content container */}
        <div className="max-w-[1800px] mx-auto px-4 sm:px-8 py-6">

          {/* Error banner — Toast-style design */}
          {errorMessage && !isAccessDenied && (
            <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-[#2b2ffb] text-white text-sm font-medium rounded-full shadow-lg flex items-center gap-2 animate-bounce">
             
              <span>⚠️</span> {errorMessage}
            </div>
          )}

          {/* Header section — Clean, integrated aesthetic */}
          <div className="mb-4">
            <DirectoryHeader
              directoryName={directoryName}
              onCreateFolderClick={() => setShowCreateDirModal(true)}
              onUploadFilesClick={() => fileInputRef.current.click()}
              fileInputRef={fileInputRef}
              handleFileSelect={handleFileSelect}
              disabled={isAccessDenied}
            />
          </div>

          {/* Controls Segment: Pinterest-styled List/Icon layout button */}
          <div className="flex items-center justify-start mb-6 px-2">
            <div className="bg-gray-200/60 p-1 rounded-full flex gap-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-2 text-xs font-bold rounded-full transition-opacity duration-200 ${
                  viewMode === "grid"
                    ? "bg-[#2b2ffb] text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-300/50"
                }`}
              >
                <BsGrid/>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 text-xs font-bold rounded-full transition-all duration-100 ${
                  viewMode === "list"
                    ? "bg-[#2b2ffb] text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-300/50"
                }`}
              >
                <BsList/>
              </button>
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
                    onClick={() => handleRowClick(item.isDirectory ? "directory" : "file", item.id)}
                    className="break-inside-avoid bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer border border-gray-100 relative"
                  >
                    {/* Fake Visual Dynamic Height Cover Canvas to copy Pinterest feel */}
                    <div
                      className={`w-full flex items-center justify-center transition-colors ${
                        item.isDirectory ? "h-32 bg-[#cded9e]/30" : "h-44 bg-gray-100/70"
                      }`}
                    >
                      <span className="text-4xl group-hover:scale-110 transition-transform duration-200">
                        {item.isDirectory ? "📁" : iconType === "image" ? "🖼️" : "📄"}
                      </span>
                    </div>

                    {/* Meta information row strip underneath layout image card */}
                    <div className="p-3 flex justify-between items-center">
                      <div className="truncate pr-2">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {item.isDirectory ? "Folder" : "Document File"}
                        </p>
                      </div>
                      
                      {/* Context Menu Button Interaction Hook Toggle area */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setActiveContextMenu(activeContextMenu === item.id ? null : item.id);
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 font-bold text-sm"
                      >
                        •••
                      </button>
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

          {/* Details Metadata Drawer Info Interface Popup Display layout */}
          {detailsItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm mx-4 overflow-hidden border border-gray-100">
                <div className="px-6 py-4 bg-[#cded9e]">
                  <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                    Item Metadata Details
                  </h2>
                </div>
                <div className="p-6 bg-[#f7f7f2]">
                  <DetailsPopup item={detailsItem} onClose={closeDetailsPopup} />
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

        </div>
      </div>
    </DirectoryContext.Provider>
  );
}

export default DirectoryView;