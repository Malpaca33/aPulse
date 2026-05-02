import { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { motion } from 'framer-motion';
import { Sparkles, Image, Bookmark, FileText, User, Bell } from 'lucide-react';
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
  { href: '/', icon: <Sparkles size={26} />, label: '主页' },
  { href: '/photos', icon: <Image size={26} />, label: '照片墙' },
  { href: '/bookmarks', icon: <Bookmark size={26} />, label: '书签' },
  { href: '/blog', icon: <FileText size={26} />, label: '文章' },
  { href: '/profile', icon: <User size={26} />, label: '个人主页' },
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
    ...(unreadCount > 0
      ? [{ href: '#', icon: (
        <span className="relative inline-flex">
          <Bell size={22} />
          <span className="absolute -top-1.5 -right-2 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        </span>
      ), label: '通知' }]
      : []),
  ];

  return (
    <nav className="flex flex-col gap-2 py-4">
      {/* Logo */}
      <div className="px-4 mb-4">
        <span className="text-2xl font-black text-white tracking-tight">
          a<span className="text-cyan-400">P</span>ulse
        </span>
      </div>

      {/* Nav items */}
      <div className="flex flex-col gap-0.5">
        {navItems.map((item) => {
          const isActive = item.href === currentPath;
          return (
            <motion.a
              key={item.href + item.label}
              href={item.href}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={`flex items-center gap-4 px-4 py-3 rounded-2xl text-[15px] font-medium transition-colors ${
                isActive
                  ? 'text-white font-bold bg-white/[0.08]'
                  : 'text-secondary hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {item.icon}
              <span className="hidden xl:inline">{item.label}</span>
            </motion.a>
          );
        })}
      </div>

      <div className="my-3 px-4">
        <Divider />
      </div>

      {/* Session card */}
      <div className="px-2 mt-1">
        <SessionCard user={user} onLogin={onLogin} onAnonymousLogin={onAnonymousLogin} onLogout={onLogout} loading={sessionLoading} />
      </div>
    </nav>
  );
}
