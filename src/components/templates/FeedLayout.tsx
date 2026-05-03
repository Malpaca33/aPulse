import { LeftSidebar } from '../organisms/LeftSidebar';
import { RightSidebar } from '../organisms/RightSidebar';

interface FeedLayoutProps {
  children: React.ReactNode;
  user?: {
    nickname?: string | null;
    avatarUrl?: string | null;
  } | null;
  onLogin?: (provider: 'google' | 'qq') => void;
  onAnonymousLogin?: () => void;
  onLogout?: () => void;
  sessionLoading?: boolean;
  currentPath?: string;
  hideRightSidebar?: boolean;
}

export function FeedLayout({
  children,
  user,
  onLogin,
  onAnonymousLogin,
  onLogout,
  sessionLoading,
  currentPath,
  hideRightSidebar,
}: FeedLayoutProps) {
  return (
    <div className="relative mx-auto flex h-dvh max-w-[1320px] overflow-hidden">
      {/* Background glowing blobs */}
      <div className="blob-container" aria-hidden="true">
        <div className="blob blob-cyan" />
        <div className="blob blob-indigo" />
        <div className="blob blob-rose" />
      </div>

      {/* Left Sidebar — fixed */}
      <div className="relative z-10 hidden md:block w-[68px] xl:w-[220px] shrink-0 h-full overflow-y-auto glass-sidebar">
        <div className="xl:px-3">
          <LeftSidebar
            user={user}
            onLogin={onLogin}
            onAnonymousLogin={onAnonymousLogin}
            onLogout={onLogout}
            sessionLoading={sessionLoading}
            currentPath={currentPath}
          />
        </div>
      </div>

      {/* Main Content — scrollable glass container */}
      <main className="relative z-10 flex-1 min-w-0 border border-glass-border/60 overflow-y-auto glass-card rounded-2xl">
        {children}
      </main>

      {/* Right Sidebar — fixed */}
      {!hideRightSidebar && (
        <div className="relative z-10 hidden lg:block w-[320px] shrink-0 h-full overflow-y-auto px-4">
          <RightSidebar />
        </div>
      )}
    </div>
  );
}
