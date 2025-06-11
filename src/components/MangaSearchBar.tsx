
import React, { useState } from 'react';
import { Search, BookOpen } from 'lucide-react';

interface MangaSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const MangaSearchBar: React.FC<MangaSearchBarProps> = ({ onSearch, placeholder = "Search manga..." }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <BookOpen className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="search-input w-full pl-12 pr-4 py-3 text-lg border-2 border-purple-400/30 focus:border-purple-400"
        />
      </div>
    </form>
  );
};

export default MangaSearchBar;
