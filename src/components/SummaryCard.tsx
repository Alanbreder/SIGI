import React from 'react';
import { ChevronRight } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  count: number | string;
  icon: React.ReactNode;
  iconBgColor: string;
  onClick: () => void;
  id?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  count,
  icon,
  iconBgColor,
  onClick,
  id,
}) => {
  return (
    <button
      id={id}
      onClick={onClick}
      type="button"
      className="w-full text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-4.5 hover:border-indigo-400/80 dark:hover:border-indigo-500/50 hover:shadow-md shadow-2xs transition-all duration-150 group flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className={`p-3 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBgColor}`}>
          {icon}
        </div>
        <div className="truncate">
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block truncate">
            {title}
          </span>
          <div className="text-xl md:text-2xl font-black text-slate-950 dark:text-white tracking-tight leading-none mt-1">
            {count}
          </div>
        </div>
      </div>

      <div className="p-1.5 rounded-xl text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:bg-indigo-50 dark:group-hover:bg-slate-800 transition-all flex-shrink-0 ml-2">
        <ChevronRight className="w-4 h-4" />
      </div>
    </button>
  );
};
