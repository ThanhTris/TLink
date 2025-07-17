import React from 'react';
import { Search } from 'lucide-react';

const SearchBar: React.FC = () => {
  return (
    <div className="flex items-center bg-gray-100 rounded-full px-4 py-2  mx-8 max-w-md">
      <Search className="text-gray-400 mr-2" />
      <input
        type="text"
        placeholder="Tìm kiếm bài viết..."
        className="bg-transparent outline-none text-gray-700 flex-1"
      />
    </div>
  );
};

export default SearchBar;