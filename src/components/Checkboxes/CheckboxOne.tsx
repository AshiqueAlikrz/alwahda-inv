import { useState } from 'react';

type CheckboxOneProps = {
  className?: string;
  label?: string;
  isChecked?: boolean;
  setIsChecked?: (checked: boolean) => void;
};
const CheckboxOne = ({
  className,
  label,
  isChecked,
  setIsChecked,
}: CheckboxOneProps) => {
  return (
    <div>
      <label
        htmlFor="checkboxLabelOne"
        className="flex cursor-pointer select-none items-center gap-2"
      >
        <div className="relative">
          <input
            type="checkbox"
            id="checkboxLabelOne"
            className="sr-only"
            checked={isChecked}
            onChange={() => setIsChecked(!isChecked)}
          />

          <div
            className={`${className} flex h-4 w-4 items-center justify-center rounded border transition-all
              ${isChecked ? 'border-primary bg-primary' : 'border-gray-400'}
            `}
          >
            {isChecked && (
              <svg
                className="h-3 w-3 text-white"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path
                  d="M5 10l3 3 7-7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        </div>
      </label>
    </div>
  );
};

export default CheckboxOne;
