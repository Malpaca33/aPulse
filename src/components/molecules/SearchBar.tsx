import { Search } from 'lucide-react';
import { useState, useCallback } from 'react';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

export function SearchBar({ placeholder = '搜索', onSearch }: SearchBarProps) {
  const [focused, setFocused] = useState(false);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const data = new FormData(e.currentTarget as HTMLFormElement);
      const query = data.get('search') as string;
      onSearch?.(query);
    },
    [onSearch]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative flex items-center transition-all duration-fast rounded-full border ${
        focused
          ? 'border-border-accent bg-bg-primary shadow-brand-glow'
          : 'border-border-default bg-white/5'
      }`}
    >
      <Search
        size={18}
        className={`absolute left-4 transition-colors ${
          focused ? 'text-cyan-400' : 'text-tertiary'
        }`}
      />
      <input
        name="search"
        type="text"
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full bg-transparent pl-11 pr-4 h-11 text-sm text-primary placeholder:text-tertiary outline-none"
      />
    </form>
  );
}
