import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SearchBar: React.FC = () => {
  const [value, setValue] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(value.trim())}`);
    }
  };

  return (
    <form
      className="flex items-center bg-gray-100 rounded-full px-4 py-2  mx-8 max-w-md"
      onSubmit={handleSearch}
    >
      <Search className="text-gray-400 mr-2" />
      <input
        type="text"
        placeholder="Tìm kiếm bài viết..."
        className="bg-transparent outline-none text-gray-700 flex-1"
        value={value}
        onChange={e => setValue(e.target.value)}
      />
    </form>
  );
};

export default SearchBar;