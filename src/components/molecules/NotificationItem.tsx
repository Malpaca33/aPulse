import { Heart, MessageCircle, UserPlus, Star, type LucideIcon } from 'lucide-react';

type NotificationType = 'like' | 'comment' | 'follow' | 'feature';

const iconMap: Record<NotificationType, LucideIcon> = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  feature: Star,
};

const colorMap: Record<NotificationType, string> = {
  like: 'text-semantic-like',
  comment: 'text-cyan-400',
  follow: 'text-semantic-success',
  feature: 'text-semantic-star',
};

interface NotificationItemProps {
  type: NotificationType;
  message: string;
  time: string;
  isRead: boolean;
  onClick?: () => void;
}

export function NotificationItem({ type, message, time, isRead, onClick }: NotificationItemProps) {
  const Icon = iconMap[type];
  const color = colorMap[type];

  return (
    <button
      onClick={onClick}
      className={`flex items-start gap-3 w-full px-4 py-3 text-left transition-colors hover:bg-white/[0.02] ${!isRead ? 'bg-cyan-500/[0.03]' : ''}`}
    >
      <div className={`shrink-0 mt-0.5 ${color}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-primary">{message}</p>
        <span className="text-xs text-tertiary">{time}</span>
      </div>
      {!isRead && (
        <span className="shrink-0 mt-1.5 h-2 w-2 rounded-full bg-cyan-500" />
      )}
    </button>
  );
}
