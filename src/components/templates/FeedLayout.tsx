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
    <div className="mx-auto flex h-screen max-w-[1320px] overflow-hidden">
      {/* Left Sidebar — fixed */}
      <div className="hidden md:block w-[68px] xl:w-[220px] shrink-0 h-screen overflow-y-auto">
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

      {/* Main Content — scrollable */}
      <main className="flex-1 min-w-0 border-x border-border-subtle overflow-y-auto">
        {children}
      </main>

      {/* Right Sidebar — fixed */}
      {!hideRightSidebar && (
        <div className="hidden lg:block w-[320px] shrink-0 h-screen overflow-y-auto px-4">
          <RightSidebar />
        </div>
      )}
    </div>
  );
}
