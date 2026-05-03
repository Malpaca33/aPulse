import { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { motion } from 'framer-motion';
import { Sparkles, Image, Bookmark, FileText, User, Bell, PenLine } from 'lucide-react';
import { SessionCard } from '../molecules/SessionCard';
import { Divider } from '../atoms/Divider';
import { $unreadCount, loadNotifications } from '../../stores/notifications';
import { $session } from '../../stores/session';

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

const baseNavItems: Omit<NavItem, 'badge'>[] = [
  { href: '/', icon: <Sparkles size={30} />, label: '主页' },
  { href: '/photos', icon: <Image size={30} />, label: '照片墙' },
  { href: '/bookmarks', icon: <Bookmark size={30} />, label: '书签' },
  { href: '/blog', icon: <FileText size={30} />, label: '文章' },
  { href: '/profile', icon: <User size={30} />, label: '个人主页' },
];

interface LeftSidebarProps {
  user?: {
    nickname?: string | null;
    avatarUrl?: string | null;
  } | null;
  onLogin?: (provider: 'google' | 'qq') => void;
  onAnonymousLogin?: () => void;
  onLogout?: () => void;
  sessionLoading?: boolean;
  currentPath?: string;
}

export function LeftSidebar({ user, onLogin, onAnonymousLogin, onLogout, sessionLoading, currentPath = '/' }: LeftSidebarProps) {
  const unreadCount = useStore($unreadCount);
  const session = useStore($session);

  useEffect(() => {
    if (session) loadNotifications();
  }, [session?.id]);

  const navItems: NavItem[] = [
    ...baseNavItems,
    ...(session
      ? [{ href: '/blog/manage', icon: <PenLine size={28} />, label: '写文章' }]
      : []),
    ...(unreadCount > 0
      ? [{ href: '#', icon: (
        <span className="relative inline-flex">
          <Bell size={26} />
          <span className="absolute -top-1.5 -right-2 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        </span>
      ), label: '通知' }]
      : []),
  ];

  return (
    <nav className="flex flex-col h-full py-4">
      {/* Logo */}
      <div className="px-4 mb-6">
        <span className="text-2xl font-black text-white tracking-tight">
          a<span className="text-cyan-400">P</span>ulse
        </span>
      </div>

      {/* Nav items — flex-1 pushes SessionCard to bottom */}
      <div className="flex-1">
        <div className="flex flex-col gap-1">
          {navItems.map((item, i) => {
            const isActive = item.href === currentPath;
            return (
              <motion.a
                key={item.href + item.label}
                href={item.href}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`glass-sidebar-item flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[15px] font-medium ${
                  isActive
                    ? 'text-white font-bold glass-card'
                    : 'text-secondary hover:text-white'
                }`}
              >
                {item.icon}
                <span className="hidden xl:inline">{item.label}</span>
              </motion.a>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="my-3 px-4">
        <Divider />
      </div>

      {/* Session card — pinned to bottom */}
      <div className="px-2">
        <SessionCard user={user} onLogin={onLogin} onAnonymousLogin={onAnonymousLogin} onLogout={onLogout} loading={sessionLoading} />
      </div>

      {/* Footer — only visible on xl */}
      <div className="hidden xl:block px-4 mt-3">
        <p className="text-[11px] text-tertiary/50">aPulse &middot; 个人主页</p>
      </div>
    </nav>
  );
}
