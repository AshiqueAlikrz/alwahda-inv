import React from 'react';

interface CardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  extra?: React.ReactNode;
  // no body padding, for tables that should run edge to edge
  flush?: boolean;
  className?: string;
  children: React.ReactNode;
}

const Card = ({
  title,
  subtitle,
  extra,
  flush = false,
  className = '',
  children,
}: CardProps) => (
  <section
    className={`min-w-0 rounded-2xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark ${className}`}
  >
    {(title || extra) && (
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 pb-4 pt-5">
        <div>
          {title && (
            <h3 className="text-lg font-semibold text-black dark:text-white">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-0.5 text-sm text-body dark:text-bodydark">
              {subtitle}
            </p>
          )}
        </div>
        {extra}
      </div>
    )}
    <div className={flush ? '' : `px-6 pb-6 ${title || extra ? '' : 'pt-6'}`}>
      {children}
    </div>
  </section>
);

export default Card;
