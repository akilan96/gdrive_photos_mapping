import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
  color?: 'cyan' | 'green' | 'amber' | 'purple' | 'red' | 'blue';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive = true,
  color = 'cyan',
  onClick,
}) => {
  const colorMap = {
    cyan: {
      bg: 'bg-[#50E2E5]/10',
      text: 'text-[#50E2E5]',
      border: 'border-[#50E2E5]/25 hover:border-[#50E2E5]/60',
      glow: 'group-hover:shadow-[0_0_25px_rgba(80,226,229,0.15)]',
    },
    green: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/25 hover:border-emerald-500/60',
      glow: 'group-hover:shadow-[0_0_25px_rgba(52,211,153,0.15)]',
    },
    amber: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/25 hover:border-amber-500/60',
      glow: 'group-hover:shadow-[0_0_25px_rgba(251,191,36,0.15)]',
    },
    purple: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      border: 'border-purple-500/25 hover:border-purple-500/60',
      glow: 'group-hover:shadow-[0_0_25px_rgba(192,132,252,0.15)]',
    },
    red: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      border: 'border-rose-500/25 hover:border-rose-500/60',
      glow: 'group-hover:shadow-[0_0_25px_rgba(244,63,94,0.15)]',
    },
    blue: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      border: 'border-blue-500/25 hover:border-blue-500/60',
      glow: 'group-hover:shadow-[0_0_25px_rgba(96,165,250,0.15)]',
    },
  }[color];

  return (
    <div
      onClick={onClick}
      className={`group relative p-5 rounded-2xl bg-[#092328]/80 backdrop-blur-md border ${
        colorMap.border
      } transition-all duration-300 ${colorMap.glow} ${
        onClick ? 'cursor-pointer hover:-translate-y-1' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[#AEC5C7] mb-1">
            {title}
          </p>
          <h4 className="text-2xl font-black text-white font-heading tracking-tight">{value}</h4>
          {subtitle && <p className="text-xs text-[#AEC5C7]/70 mt-1">{subtitle}</p>}
        </div>

        <div className={`p-3 rounded-xl ${colorMap.bg} ${colorMap.text} transition-transform group-hover:scale-110`}>
          <Icon size={22} />
        </div>
      </div>

      {trend && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <span className={`font-semibold ${trendPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend}
          </span>
          <span className="text-[#AEC5C7]/60">vs last month</span>
        </div>
      )}
    </div>
  );
};

