import { useNavigate } from "react-router-dom";
import { FaChevronRight, FaHome, FaFolder, FaFile } from "react-icons/fa";

function DirectoryHeader({
  directoryName,
  breadcrumbs = [],
  previewItem = null,
  onClearPreview,
  onSelectPreview,
}) {
  const navigate = useNavigate();

  const folderCrumbs =
    breadcrumbs.length > 0
      ? breadcrumbs
      : [{ id: "", name: directoryName || "My Drive" }];

  const allCrumbs = previewItem
    ? [
      ...folderCrumbs.map((c) => ({ ...c, isFile: false })),
      {
        id: previewItem.id,
        name: previewItem.name,
        isFile: true,
        fileItem: previewItem,
      },
    ]
    : folderCrumbs.map((c) => ({ ...c, isFile: false }));

  const handleCrumbClick = (crumb) => {
    if (crumb.isFile) {
      onSelectPreview?.(crumb.fileItem);
      return;
    }
    onClearPreview?.();
    navigate(crumb.id ? `/directory/${crumb.id}` : "/");
  };

  return (
    <header className="flex items-center border-b border-gray-300 py-2.5 mb-2 min-w-0">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-y-1 gap-x-1 min-w-0"
      >
        {allCrumbs.map((crumb, index) => {
          const isLast = index === allCrumbs.length - 1;
          const isRoot = index === 0 && !crumb.isFile;

          return (
            <div
              key={`${crumb.isFile ? "file" : "dir"}-${crumb.id || "root"}-${index}`}
              className="flex items-center gap-1"
            >
              {index > 0 && (
                <FaChevronRight className="text-gray-400 text-[10px] shrink-0 mx-0.5" />
              )}

              <button
                type="button"
                onClick={() => handleCrumbClick(crumb)}
                title={crumb.name}
                className={`rounded-lg px-2 py-1 flex items-center gap-1.5 transition-colors cursor-pointer ${isLast
                  ? "text-base sm:text-lg font-semibold text-gray-900 bg-gray-200/50 hover:bg-gray-200"
                  : "text-sm sm:text-base font-medium text-gray-600 hover:text-[#2b2ffb] hover:bg-gray-200/60"
                  }`}
              >
                {isRoot ? (
                  <FaHome
                    className={`text-sm shrink-0 ${isLast ? "text-[#2b2ffb]" : "text-gray-500"
                      }`}
                  />
                ) : crumb.isFile ? (
                  <FaFile className="text-xs text-[#2b2ffb] shrink-0" />
                ) : (
                  <FaFolder
                    className={`text-xs shrink-0 ${isLast ? "text-amber-500" : "text-amber-500/80"
                      }`}
                  />
                )}
                <span>{crumb.name}</span>
              </button>
            </div>
          );
        })}
      </nav>
    </header>
  );
}

export default DirectoryHeader;
