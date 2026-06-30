'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  return (
    <form
      className="relative w-full sm:max-w-sm"
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = query.trim();
        if (trimmed) {
          router.push(`/search?q=${encodeURIComponent(trimmed)}`);
        }
      }}
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar tudo..."
        className="h-11 w-full rounded-lg border border-white/10 bg-slate-950 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300"
      />
    </form>
  );
}
