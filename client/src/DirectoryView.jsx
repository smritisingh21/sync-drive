import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DirectoryHeader from "./components/DirectoryHeader";
import CreateDirectoryModal from "./components/CreateDirectoryModal";
import RenameModal from "./components/RenameModal";
import DirectoryList from "./components/DirectoryList";
import DirectoryGrid from "./components/DirectoryGrid";

function DirectoryView() {
  const BASE_URL = "http://localhost:8000";
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
  const fileInputRef = useRef(null);
  const [uploadQueue, setUploadQueue] = useState([]); 
  const [uploadXhrMap, setUploadXhrMap] = useState({}); 
  const [progressMap, setProgressMap] = useState({}); 
  const [isUploading, setIsUploading] = useState(false); 
  const [activeContextMenu, setActiveContextMenu] = useState(null);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [previewIndex, setPreviewIndex] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);

const [viewMode, setViewMode] = useState(() => {
  const savedView = localStorage.getItem("memo-deck-view-mode");
  return savedView ? savedView : "list";
});
useEffect(() => {
  localStorage.setItem("memo-deck-view-mode", viewMode);
}, [viewMode]);

function handleRowClick(type, id) {
  if (type === "directory") {
    navigate(`/directory/${id}`);
  } else {
    // 1. Find the clicked file
    const clickedFile = combinedItems.find(f => f.id === id);
    if (!clickedFile) return;

    // 2. Check if it's an image
    const isImg = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(
      clickedFile.name.split('.').pop().toLowerCase()
    );

    if (isImg) {
      // 3. Create a list of ONLY images from the current folder
      const allImagesInFolder = combinedItems.filter(f => {
        const ext = f.name.split('.').pop().toLowerCase();
        return !f.isDirectory && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
      });

      // 4. Find where our clicked image sits in that specific list
      const index = allImagesInFolder.findIndex(img => img.id === id);

      setPreviewImages(allImagesInFolder);
      setPreviewIndex(index);
    } else {
      // Normal file download
      window.location.href = `${BASE_URL}/file/${id}?action=download`;
    }
  }
}
  async function handleFetchErrors(response) {
    if (!response.ok) {
      let errMsg = `Request failed with status ${response.status}`;
      try {
        const data = await response.json();
        if (data.error) errMsg = data.error;
      } catch (_) {}
      throw new Error(errMsg);
    }
    return response;
  }

  async function getDirectoryItems() {
    setErrorMessage("");
    try {
      const response = await fetch(`${BASE_URL}/directory/${dirId || ""}`, {
        credentials: "include",
      });
      if (response.status === 401) { navigate("/login"); return; }
      await handleFetchErrors(response);
      const data = await response.json();
      setDirectoryName(dirId ? data.name : "My Drive");
      setDirectoriesList([...data.directories].reverse());
      setFilesList([...data.files].reverse());
    } catch (error) { setErrorMessage(error.message); }
  }

  useEffect(() => {
    getDirectoryItems();
    setActiveContextMenu(null);
  }, [dirId]);

  function getFileIcon(filename) {
    const ext = filename.split(".").pop().toLowerCase();
    switch (ext) {
      case "pdf": return "pdf";
      case "png": case "jpg": case "jpeg": case "gif": return "image";
      case "mp4": case "mov": case "avi": return "video";
      case "zip": case "rar": case "tar": case "gz": return "archive";
      case "js": case "jsx": case "ts": case "tsx": case "html": case "css": case "py": case "java": return "code";
      default: return "alt";
    }
  }

  function handleRowClick(type, id) {
    if (type === "directory") { navigate(`/directory/${id}`); } 
    else { window.location.href = `${BASE_URL}/file/${id}`; }
  }

  function handleFileSelect(e) {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;
    const newItems = selectedFiles.map((file) => {
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      return { file, name: file.name, id: tempId, isUploading: false };
    });
    setFilesList((prev) => [...newItems, ...prev]);
    newItems.forEach((item) => { setProgressMap((prev) => ({ ...prev, [item.id]: 0 })); });
    setUploadQueue((prev) => [...prev, ...newItems]);
    e.target.value = "";
    if (!isUploading) {
      setIsUploading(true);
      processUploadQueue([...uploadQueue, ...newItems.reverse()]);
    }
  }

  function processUploadQueue(queue) {
    if (queue.length === 0) {
      setIsUploading(false);
      setUploadQueue([]);
      setTimeout(() => { getDirectoryItems(); }, 1000);
      return;
    }
    const [currentItem, ...restQueue] = queue;
    setFilesList((prev) => prev.map((f) => f.id === currentItem.id ? { ...f, isUploading: true } : f ));
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE_URL}/file/${dirId || ""}`, true);
    xhr.withCredentials = true;
    // Encode the filename so non-ISO-8859-1 characters (e.g. emoji, accents) don't break setRequestHeader
    xhr.setRequestHeader("filename", encodeURIComponent(currentItem.name));
    xhr.upload.addEventListener("progress", (evt) => {
      if (evt.lengthComputable) {
        const progress = (evt.loaded / evt.total) * 100;
        setProgressMap((prev) => ({ ...prev, [currentItem.id]: progress }));
      }
    });
    xhr.addEventListener("load", () => { processUploadQueue(restQueue); });
    setUploadXhrMap((prev) => ({ ...prev, [currentItem.id]: xhr }));
    xhr.send(currentItem.file);
  }

  function handleCancelUpload(tempId) {
    const xhr = uploadXhrMap[tempId];
    if (xhr) xhr.abort();
    setUploadQueue((prev) => prev.filter((item) => item.id !== tempId));
    setFilesList((prev) => prev.filter((f) => f.id !== tempId));
    setProgressMap((prev) => { const { [tempId]: _, ...rest } = prev; return rest; });
    setUploadXhrMap((prev) => { const copy = { ...prev }; delete copy[tempId]; return copy; });
  }

  async function handleDeleteFile(id) {
    setErrorMessage("");
    try {
      const response = await fetch(`${BASE_URL}/file/${id}`, { method: "DELETE", credentials: "include" });
      await handleFetchErrors(response);
      getDirectoryItems();
    } catch (error) { setErrorMessage(error.message); }
  }

  async function handleDeleteDirectory(id) {
    setErrorMessage("");
    try {
      const response = await fetch(`${BASE_URL}/directory/${id}`, { method: "DELETE", credentials: "include" });
      await handleFetchErrors(response);
      getDirectoryItems();
    } catch (error) { setErrorMessage(error.message); }
  }

  async function handleCreateDirectory(e) {
    e.preventDefault();
    setErrorMessage("");
    try {
      const response = await fetch(`${BASE_URL}/directory/${dirId || ""}`, {
        method: "POST",
        headers: { dirname: newDirname },
        credentials: "include",
      });
      await handleFetchErrors(response);
      setNewDirname("New Folder");
      setShowCreateDirModal(false);
      getDirectoryItems();
    } catch (error) { setErrorMessage(error.message); }
  }

  function openRenameModal(type, id, currentName) {
    setRenameType(type);
    setRenameId(id);
    setRenameValue(currentName);
    setShowRenameModal(true);
  }

  async function handleRenameSubmit(e) {
    e.preventDefault();
    setErrorMessage("");
    try {
      const url = renameType === "file" ? `${BASE_URL}/file/${renameId}` : `${BASE_URL}/directory/${renameId}`;
      const response = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(renameType === "file" ? { newFilename: renameValue } : { newDirName: renameValue }),
        credentials: "include",
      });
      await handleFetchErrors(response);
      setShowRenameModal(false);
      setRenameValue("");
      setRenameType(null);
      setRenameId(null);
      getDirectoryItems();
    } catch (error) { setErrorMessage(error.message); }
  }

  function handleContextMenu(e, id) {
    e.stopPropagation(); e.preventDefault();
    if (activeContextMenu === id) { setActiveContextMenu(null); } 
    else { setActiveContextMenu(id); setContextMenuPos({ x: e.clientX - 110, y: e.clientY }); }
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
  // 1. Filter items based on search query
const filteredItems = combinedItems.filter((item) =>
  item.name.toLowerCase().includes(searchQuery.toLowerCase())
);

// 2. Define the props once to keep the JSX clean
const listProps = {
  items: filteredItems,
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
};

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8">
        
        {/* Error Alert */}
        {errorMessage && errorMessage !== "Directory not found or you do not have access to it!" && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm animate-in fade-in slide-in-from-top-2">
            <span className="text-xl font-bold">⚠️</span>
            <p className="text-sm font-medium">{errorMessage}</p>
          </div>
        )}

        {/* Dynamic Header Component */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <DirectoryHeader
            directoryName={directoryName}
            onCreateFolderClick={() => setShowCreateDirModal(true)}
            onUploadFilesClick={() => fileInputRef.current.click()}
            fileInputRef={fileInputRef}
            handleFileSelect={handleFileSelect}
            disabled={errorMessage === "Directory not found or you do not have access to it!"}
          />
        </div>
        {/* Toolbar Section */}
<div className="mb-4 flex flex-col md:flex-row items-center justify-between gap-4 px-2">
  
  {/* Search Bar */}
  <div className="relative w-full md:w-96 group">
    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </span>
    <input
      type="text"
      placeholder="Search in folder..."
      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm shadow-sm"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  </div>

  <div className="flex items-center gap-3 w-full md:w-auto justify-end">
    {/* Sort Button */}
    <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
      </svg>
      Sort
    </button>

    {/* View Toggles */}
    <div className="flex bg-slate-200/50 p-1 rounded-xl">
      <button 
        onClick={() => setViewMode("list")}
        className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <button 
        onClick={() => setViewMode("grid")}
        className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      </button>
    </div>
  </div>
</div>

        {/* Content Section */}
<main className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden min-h-[400px]">
  {filteredItems.length === 0 ? (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 text-6xl opacity-20">
        {searchQuery ? "🔍" : "📂"}
      </div>
      <p className="text-lg font-medium text-slate-400">
        {searchQuery 
          ? `No results found for "${searchQuery}"`
          : errorMessage === "Directory not found or you do not have access to it!" 
            ? "Access Denied or Directory Missing" 
            : "This folder is empty"}
      </p>
      <p className="text-sm text-slate-400">
        {searchQuery ? "Try a different search term" : "Upload files to get started"}
      </p>
    </div>
  ) : (
    <div className={viewMode === "list" ? "overflow-x-auto" : ""}>
      {viewMode === "list" ? (
        <DirectoryList {...listProps} />
      ) : (
        <DirectoryGrid {...listProps} />
      )}
    </div>
  )}
</main>
      </div>

      {/* Modals (Logic triggers remains same) */}
      {showCreateDirModal && (
        <CreateDirectoryModal
          newDirname={newDirname}
          setNewDirname={setNewDirname}
          onClose={() => setShowCreateDirModal(false)}
          onCreateDirectory={handleCreateDirectory}
        />
      )}

      {showRenameModal && (
        <RenameModal
          renameType={renameType}
          renameValue={renameValue}
          setRenameValue={setRenameValue}
          onClose={() => setShowRenameModal(false)}
          onRenameSubmit={handleRenameSubmit}
        />
      )}
      {previewIndex !== null && (
  <ImagePreview 
    images={previewImages}
    currentIndex={previewIndex}
    setCurrentIndex={setPreviewIndex}
    onClose={() => setPreviewIndex(null)}
    BASE_URL={BASE_URL}
  />
)}
    </div>

    
  );
}

export default DirectoryView;