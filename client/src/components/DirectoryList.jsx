import { useDirectoryContext } from "../context/DirectoryContext";
import DirectoryItem from "./DirectoryItem";

function DirectoryList({ items }) {
  const { progressMap } = useDirectoryContext();

  return (
    <div className="divide-y divide-[#E6E6E4]">
      <div className="grid grid-cols-[minmax(200px,1.8fr)_1fr_1fr_40px] items-center px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-[#9B9A97] bg-[#F7F7F5] rounded-t-lg border-b border-[#E6E6E4]">
        <span>Name</span>
        <span>Size</span>
        <span>Type</span>
        <span />
      </div>
      <div>
        {items.map((item) => {
          const uploadProgress = progressMap[item.id] || 0;
          return (
            <DirectoryItem
              key={item.id}
              item={item}
              uploadProgress={uploadProgress}
            />
          );
        })}
      </div>
    </div>
  );
}

export default DirectoryList;
