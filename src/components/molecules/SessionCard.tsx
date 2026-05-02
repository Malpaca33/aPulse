import { Avatar } from '../atoms/Avatar';

interface LoginMethod {
  provider: 'google' | 'qq';
  label: string;
  icon: string;
  color: string;
}

const LOGIN_OPTIONS: LoginMethod[] = [
  { provider: 'google', label: 'Google 登录', icon: 'G', color: 'hover:bg-white/10 hover:text-white' },
  { provider: 'qq', label: 'QQ 登录', icon: 'Q', color: 'hover:bg-green-500/10 hover:text-green-400' },
];

interface SessionCardProps {
  user?: {
    nickname?: string | null;
    avatarUrl?: string | null;
  } | null;
  onLogin?: (provider: 'google' | 'qq') => void;
  onAnonymousLogin?: () => void;
  onLogout?: () => void;
  loading?: boolean;
}

export function SessionCard({ user, onLogin, onAnonymousLogin, onLogout, loading }: SessionCardProps) {
  if (loading) {
    return (
      <div className="p-4 rounded-2xl border border-border-default bg-surface-secondary">
        <div className="animate-pulse flex gap-3 items-center">
          <div className="h-8 w-8 rounded-full bg-white/10" />
          <div className="h-4 flex-1 rounded bg-white/10" />
        </div>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="p-4 rounded-2xl border border-border-default bg-surface-secondary">
        <p className="text-sm text-secondary mb-3">登录后即可发布和互动</p>
        <div className="flex flex-col gap-2">
          {LOGIN_OPTIONS.map((method) => (
            <button
              key={method.provider}
              onClick={() => onLogin?.(method.provider)}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl border border-border-default text-sm text-secondary ${method.color} transition-all`}
            >
              <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                {method.icon}
              </span>
              {method.label}
            </button>
          ))}
          <button
            onClick={onAnonymousLogin}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl border border-border-default text-sm text-secondary hover:bg-white/5 hover:text-white transition-all"
          >
            <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs">?</span>
            匿名体验
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl border border-border-default bg-surface-secondary">
      <Avatar src={user.avatarUrl} alt={user.nickname || '用户'} size="md" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-primary truncate">
          {user.nickname || '用户'}
        </p>
      </div>
      <button
        onClick={onLogout}
        className="text-xs text-tertiary hover:text-semantic-danger transition-colors"
      >
        退出
      </button>
    </div>
  );
}
