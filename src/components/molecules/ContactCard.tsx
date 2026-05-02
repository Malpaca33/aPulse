import { Mail } from 'lucide-react';

export function ContactCard() {
  return (
    <div className="rounded-2xl border border-border-default bg-surface-secondary p-4">
      <h3 className="text-sm font-semibold text-primary mb-3">联系方式</h3>

      <a
        href="https://mail.google.com/mail/?view=cm&fs=1&to=malpaca56@gmail.com"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-white/5 transition-colors group"
      >
        <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
          <Mail size={16} className="text-red-400" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-primary group-hover:text-cyan-400 transition-colors">malpaca56@gmail.com</p>
          <p className="text-xs text-tertiary">Gmail</p>
        </div>
      </a>

      <a
        href="https://wpa.qq.com/msgrd?v=3&uin=2696751170&site=qq&menu=yes"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-white/5 transition-colors group"
      >
        <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 100 100" fill="none" className="h-4 w-4">
            {/* Body */}
            <ellipse cx="50" cy="58" rx="26" ry="28" fill="currentColor" className="text-green-400"/>
            {/* Head */}
            <circle cx="50" cy="28" r="20" fill="currentColor" className="text-green-400"/>
            {/* Belly */}
            <ellipse cx="50" cy="62" rx="15" ry="18" fill="white" opacity="0.9"/>
            {/* Eyes - white */}
            <circle cx="40" cy="26" r="4" fill="white"/>
            <circle cx="60" cy="26" r="4" fill="white"/>
            {/* Pupils */}
            <circle cx="41" cy="26" r="2" fill="#111"/>
            <circle cx="61" cy="26" r="2" fill="#111"/>
            {/* Beak */}
            <ellipse cx="50" cy="33" rx="4" ry="2.5" fill="#F59E0B"/>
            {/* Feet */}
            <ellipse cx="36" cy="84" rx="7" ry="3" fill="#F59E0B"/>
            <ellipse cx="64" cy="84" rx="7" ry="3" fill="#F59E0B"/>
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-sm text-primary group-hover:text-cyan-400 transition-colors">2696751170</p>
          <p className="text-xs text-tertiary">QQ</p>
        </div>
      </a>
    </div>
  );
}
