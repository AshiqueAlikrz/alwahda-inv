import React, { ReactNode } from 'react';

interface CardDataStatsProps {
  title: string;
  total: string;
  rate: string;
  levelUp?: boolean;
  levelDown?: boolean;
  children: ReactNode;
}

const CardDataStats: React.FC<CardDataStatsProps> = ({
  title,
  total,
  rate,
  levelUp,
  levelDown,
  children,
}) => {
  return (
    <div className="relative rounded-xl border border-transparent bg-gradient-to-br from-white via-gray-100 to-gray-50 p-6 shadow-xl hover:shadow-2xl transition-shadow duration-300 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border text-white text-2xl shadow-inner">
        {children}
      </div>

      <div className="mt-5 flex items-end justify-between">
        <div>
          <h4 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            {title != 'Total Invoice' ? total.toFixed(2) : total}
          </h4>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </span>
        </div>

        <span
          className={`flex items-center gap-1 text-sm font-semibold ${
            levelUp ? 'text-green-500' : ''
          } ${levelDown ? 'text-red-500' : ''}`}
        >
          {rate}

          {levelUp && (
            <svg
              className="fill-current"
              width="12"
              height="12"
              viewBox="0 0 10 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M4.35716 2.47737L0.908974 5.82987L5.0443e-07 4.94612L5 0.0848689L10 4.94612L9.09103 5.82987L5.64284 2.47737L5.64284 10.0849L4.35716 10.0849L4.35716 2.47737Z" />
            </svg>
          )}

          {levelDown && (
            <svg
              className="fill-current"
              width="12"
              height="12"
              viewBox="0 0 10 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M5.64284 7.69237L9.09102 4.33987L10 5.22362L5 10.0849L-8.98488e-07 5.22362L0.908973 4.33987L4.35716 7.69237L4.35716 0.0848701L5.64284 0.0848704L5.64284 7.69237Z" />
            </svg>
          )}
        </span>
      </div>

      {/* subtle decorative accent */}
      <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-indigo-400 opacity-50 animate-pulse"></div>
    </div>
  );
};

export default CardDataStats;
