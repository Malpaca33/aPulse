import { useState } from 'react';
import { SearchBar } from '../molecules/SearchBar';
import { ArchiveCalendar } from '../molecules/ArchiveCalendar';
import { YtPremiumCard } from '../molecules/YtPremiumCard';
import { ContactCard } from '../molecules/ContactCard';
import { ShoppingCart } from 'lucide-react';

export function RightSidebar() {
  const [showPremium, setShowPremium] = useState(false);

  return (
    <aside className="flex flex-col gap-4 py-4">
      {/* Search */}
      <SearchBar />

      {/* Archive Calendar */}
      <ArchiveCalendar />

      {/* YouTube Premium — collapsed by default */}
      {showPremium ? (
        <div className="relative">
          <button
            onClick={() => setShowPremium(false)}
            className="absolute top-2 right-2 text-xs text-tertiary hover:text-white transition-colors z-10"
          >
            收起
          </button>
          <YtPremiumCard />
        </div>
      ) : (
        <button
          onClick={() => setShowPremium(true)}
          className="flex items-center gap-2 rounded-2xl border border-border-default bg-surface-secondary p-3 text-sm text-secondary hover:text-white hover:bg-white/[0.04] transition-colors"
        >
          <ShoppingCart size={16} className="text-amber-400" />
          <span>YouTube Premium</span>
        </button>
      )}

      {/* Contact */}
      <ContactCard />
    </aside>
  );
}
