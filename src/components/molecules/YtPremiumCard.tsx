import { Check, ShoppingCart, Crown } from 'lucide-react';

export function YtPremiumCard() {
  const benefits = [
    'YouTube Premium 无广告',
    'YouTube Music 畅听',
    '后台播放 + 离线下载',
    '全年稳定不涨价',
  ];

  return (
    <div className="rounded-2xl border border-border-default bg-gradient-to-br from-amber-500/5 via-surface-secondary to-amber-500/5 p-4">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className="h-8 w-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
          <Crown size={18} className="text-amber-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-primary">YouTube Premium</h3>
          <p className="text-[11px] text-tertiary">个人年度会员</p>
        </div>
      </div>

      {/* Price */}
      <div className="text-center py-3 mb-2">
        <span className="text-3xl font-black text-primary">¥188</span>
        <span className="text-xs text-secondary ml-1">/ 年</span>
      </div>

      {/* Benefits */}
      <ul className="space-y-1.5 mb-4">
        {benefits.map((b) => (
          <li key={b} className="flex items-center gap-2 text-xs text-secondary">
            <Check size={14} className="text-semantic-success shrink-0" />
            {b}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <a
        href="https://wpa.qq.com/msgrd?v=3&uin=2696751170&site=qq&menu=yes"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full h-9 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-black text-sm font-bold flex items-center justify-center gap-2 hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20"
      >
        <ShoppingCart size={16} />
        立即购买
      </a>
    </div>
  );
}
