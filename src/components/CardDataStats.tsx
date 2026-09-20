import React, { ReactNode } from 'react';

interface CardDataStatsProps {
  title: string;
  value: string;
  // small unit tag shown in the top corner, e.g. "AED"
  unit?: string;
  // accent hue for the icon chip; the tint is derived from it
  accent: string;
  children: ReactNode;
}

const CardDataStats: React.FC<CardDataStatsProps> = ({
  title,
  value,
  unit,
  accent,
  children,
}) => {
  return (
    <div className="min-w-0 rounded-2xl border border-stroke bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-strokedark dark:bg-boxdark">
      <div className="flex items-center justify-between">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-2xl"
          style={{ color: accent, backgroundColor: `${accent}1f` }}
        >
          {children}
        </span>
        {unit && (
          <span className="rounded-md bg-gray-2 px-2 py-0.5 text-xs font-semibold text-body dark:bg-meta-4 dark:text-bodydark">
            {unit}
          </span>
        )}
      </div>

      <p className="mt-4 text-sm font-medium text-body dark:text-bodydark">
        {title}
      </p>
      <p
        title={value}
        className="mt-0.5 truncate text-2xl font-bold text-black dark:text-white"
      >
        {value}
      </p>
    </div>
  );
};

export default CardDataStats;
