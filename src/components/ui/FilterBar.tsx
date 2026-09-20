import React from 'react';
import { Button } from 'antd';

interface FilterBarProps {
  // controls to render (inputs, pickers, selects)
  children: React.ReactNode;
  // text shown on the right, e.g. "3 of 12 invoices"
  summary?: React.ReactNode;
  // Reset is disabled while no filter is active
  active: boolean;
  onReset: () => void;
  // buttons pinned to the right, e.g. a CSV download
  actions?: React.ReactNode;
}

const FilterBar = ({
  children,
  summary,
  active,
  onReset,
  actions,
}: FilterBarProps) => (
  <div className="flex flex-wrap items-center gap-3 border-b border-stroke px-6 py-4 dark:border-strokedark">
    {children}
    <Button onClick={onReset} disabled={!active}>
      Reset
    </Button>
    {summary && (
      <span className="ml-auto text-sm text-body dark:text-bodydark">
        {summary}
      </span>
    )}
    {actions && <div className={summary ? '' : 'ml-auto'}>{actions}</div>}
  </div>
);

export default FilterBar;
