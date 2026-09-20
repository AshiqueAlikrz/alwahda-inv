import React from 'react';
import { IoArrowForward } from 'react-icons/io5';

type props = {
  className?: string;
  text?: string;
  description?: string;
  icon?: React.ReactNode;
  accent?: string;
  onClick?: any;
};

const ButtonCard = ({
  className = '',
  text,
  description,
  icon,
  accent = '#3C50E0',
  onClick,
}: props) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-start gap-4 rounded-2xl border border-stroke bg-white p-6 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-strokedark dark:bg-boxdark ${className}`}
    >
      {icon && (
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
          style={{ color: accent, backgroundColor: `${accent}1f` }}
        >
          {icon}
        </span>
      )}

      <span className="min-w-0 flex-1">
        <span className="block text-lg font-semibold text-black dark:text-white">
          {text}
        </span>
        {description && (
          <span className="mt-1 block text-sm text-body dark:text-bodydark">
            {description}
          </span>
        )}
      </span>

      <IoArrowForward
        size={18}
        className="mt-1 shrink-0 text-body duration-200 group-hover:translate-x-1 group-hover:text-primary dark:text-bodydark"
      />
    </button>
  );
};

export default ButtonCard;
