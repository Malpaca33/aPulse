import { useState } from 'react';
import { SearchBar } from '../molecules/SearchBar';
import { ArchiveCalendar } from '../molecules/ArchiveCalendar';
import { YtPremiumCard } from '../molecules/YtPremiumCard';
import { ContactCard } from '../molecules/ContactCard';
import { ShoppingCart } from 'lucide-react';

function GlassSection({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`glass-card rounded-2xl p-4 animate-entrance-up ${className}`} style={style}>
      {children}
    </div>
  );
}

export function RightSidebar() {
  const [showPremium, setShowPremium] = useState(false);

  return (
    <aside className="flex flex-col gap-4 py-4">
      {/* Search */}
      <GlassSection style={{ animationDelay: '0ms' }}>
        <SearchBar />
      </GlassSection>

      {/* Archive Calendar */}
      <GlassSection style={{ animationDelay: '80ms' }}>
        <ArchiveCalendar />
      </GlassSection>

      {/* YouTube Premium — collapsed by default */}
      {showPremium ? (
        <GlassSection className="relative" style={{ animationDelay: '160ms' }}>
          <button
            onClick={() => setShowPremium(false)}
            className="absolute top-2 right-2 text-xs text-tertiary hover:text-white transition-colors z-10"
          >
            收起
          </button>
          <YtPremiumCard />
        </GlassSection>
      ) : (
        <button
          onClick={() => setShowPremium(true)}
          className="glass-card rounded-2xl flex items-center gap-2 p-3 text-sm text-secondary hover:text-white transition-all duration-300"
        >
          <ShoppingCart size={16} className="text-amber-400" />
          <span>YouTube Premium</span>
        </button>
      )}

      {/* Contact */}
      <GlassSection style={{ animationDelay: '240ms' }}>
        <ContactCard />
      </GlassSection>
    </aside>
  );
}
