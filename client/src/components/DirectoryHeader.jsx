function DirectoryHeader({ directoryName }) {
  return (
    <header className="flex items-center border-b border-gray-300 py-2 mb-4">
      <h1 className="text-xl font-semibold truncate">{directoryName}</h1>
    </header>
  );
}

export default DirectoryHeader;
