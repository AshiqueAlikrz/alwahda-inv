import React, { useEffect, useMemo, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { FaSpinner } from 'react-icons/fa6';
import {
  useGetDailyReportsQuery,
  useGetMonthlyReportsQuery,
} from '../../store/slice/reportSlice';

const MONTHS = 12;
const DAYS = 30;
const CHART_HEIGHT = 300;

// Categorical slots 1 and 2 of the reference palette, validated against the card surfaces below
// (light #ffffff, dark #24303F). Color follows the measure: Profit is orange in every chart.
const SERIES_COLOR = {
  expense: { light: '#2a78d6', dark: '#3987e5' },
  profit: { light: '#eb6834', dark: '#d95926' },
};

// Chart chrome tinted from the app's own tokens (body / stroke / boxdark).
const CHROME = {
  light: { surface: '#ffffff', text: '#64748B', grid: '#E2E8F0', axis: '#CBD5E1' },
  dark: { surface: '#24303F', text: '#AEB7C0', grid: '#2E3A47', axis: '#3d4d60' },
};

export interface MonthlyRow {
  label: string;
  fullLabel: string;
  expense: number;
  profit: number;
}

export interface DailyRow {
  ts: number;
  label: string;
  profit: number;
}

const money = (value: number) =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const axisMoney = (value: number) =>
  Number(value).toLocaleString(undefined, {
    maximumFractionDigits: Math.abs(value) < 10 ? 1 : 0,
  });

// The dark class lives on <body> (toggled by the header switch), so watch it rather than keep a second copy of the mode.
const useIsDark = () => {
  const [isDark, setIsDark] = useState(() =>
    document.body.classList.contains('dark'),
  );

  useEffect(() => {
    const sync = () => setIsDark(document.body.classList.contains('dark'));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  return isDark;
};

const baseOptions = (isDark: boolean): ApexOptions => {
  const chrome = isDark ? CHROME.dark : CHROME.light;
  return {
    chart: {
      height: CHART_HEIGHT,
      background: 'transparent',
      foreColor: chrome.text,
      fontFamily: 'inherit',
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    grid: {
      borderColor: chrome.grid,
      strokeDashArray: 0,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    dataLabels: { enabled: false },
    yaxis: {
      min: 0,
      tickAmount: 4,
      forceNiceScale: true,
      labels: { formatter: axisMoney },
    },
    tooltip: { theme: isDark ? 'dark' : 'light' },
  };
};

const monthlyOptions = (rows: MonthlyRow[], isDark: boolean): ApexOptions => {
  const chrome = isDark ? CHROME.dark : CHROME.light;
  const mode = isDark ? 'dark' : 'light';
  const base = baseOptions(isDark);
  return {
    ...base,
    chart: { ...base.chart, type: 'bar' },
    colors: [SERIES_COLOR.expense[mode], SERIES_COLOR.profit[mode]],
    plotOptions: {
      bar: {
        columnWidth: '60%',
        borderRadius: 4,
        borderRadiusApplication: 'end',
      },
    },
    // 2px surface-colored gap between touching bars, not a border
    stroke: { show: true, width: 2, colors: [chrome.surface] },
    fill: { opacity: 1 },
    xaxis: {
      categories: rows.map((row) => row.label),
      axisBorder: { color: chrome.axis },
      axisTicks: { show: false },
      labels: { rotate: 0, hideOverlappingLabels: true },
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'left',
      fontSize: '13px',
      markers: { width: 10, height: 10, radius: 2 },
      itemMargin: { horizontal: 12 },
    },
    tooltip: {
      ...base.tooltip,
      // one tooltip for the whole month, listing both series, hoverable anywhere in the column band
      shared: true,
      intersect: false,
      x: { formatter: (_value, opts) => rows[opts.dataPointIndex]?.fullLabel },
      y: { formatter: (value: number) => `AED ${money(value)}` },
    },
  };
};

const dailyOptions = (rows: DailyRow[], isDark: boolean): ApexOptions => {
  const chrome = isDark ? CHROME.dark : CHROME.light;
  const color = SERIES_COLOR.profit[isDark ? 'dark' : 'light'];
  const base = baseOptions(isDark);
  return {
    ...base,
    chart: { ...base.chart, type: 'area' },
    colors: [color],
    stroke: { width: 2, curve: 'straight', lineCap: 'round' },
    fill: { type: 'solid', opacity: 0.1 },
    // markers only on hover, plus one end-dot on the latest day; each carries a 2px surface ring
    markers: {
      size: 0,
      strokeColors: chrome.surface,
      strokeWidth: 2,
      hover: { size: 5 },
      discrete: [
        {
          seriesIndex: 0,
          dataPointIndex: rows.length - 1,
          size: 5,
          fillColor: color,
          strokeColor: chrome.surface,
        },
      ],
    },
    xaxis: {
      type: 'datetime',
      axisBorder: { color: chrome.axis },
      axisTicks: { show: false },
      labels: { datetimeUTC: true, format: 'dd MMM', rotate: 0 },
      crosshairs: {
        show: true,
        stroke: { color: chrome.axis, width: 1, dashArray: 0 },
      },
      tooltip: { enabled: false },
    },
    legend: { show: false },
    tooltip: {
      ...base.tooltip,
      x: { format: 'dd MMM yyyy' },
      y: { formatter: (value: number) => `AED ${money(value)}` },
    },
  };
};

interface ChartCardProps {
  title: string;
  subtitle: string;
  className?: string;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isEmpty: boolean;
  chart: React.ReactNode;
  table: React.ReactNode;
}

const ChartCard = ({
  title,
  subtitle,
  className = '',
  isLoading,
  isFetching,
  isError,
  isEmpty,
  chart,
  table,
}: ChartCardProps) => {
  const [view, setView] = useState<'chart' | 'table'>('chart');

  const placeholder = (content: React.ReactNode) => (
    <div
      style={{ height: CHART_HEIGHT }}
      className="flex items-center justify-center text-sm text-body dark:text-bodydark"
    >
      {content}
    </div>
  );

  const body = () => {
    if (isLoading) return placeholder(<FaSpinner className="animate-spin" />);
    if (isError) return placeholder("Couldn't load this report.");
    if (isEmpty) return placeholder('No invoices in this period yet.');
    return view === 'chart' ? chart : table;
  };

  return (
    <div
      className={`min-w-0 rounded-xl border border-stroke bg-white p-5 shadow-default dark:border-strokedark dark:bg-boxdark ${className}`}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-black dark:text-white">
            {title}
          </h3>
          <p className="text-sm text-body dark:text-bodydark">{subtitle}</p>
        </div>

        <div
          role="group"
          aria-label={`${title} view`}
          className="flex shrink-0 overflow-hidden rounded-md border border-stroke text-xs dark:border-strokedark"
        >
          {(['chart', 'table'] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={view === option}
              onClick={() => setView(option)}
              className={`px-3 py-1 capitalize ${
                view === option
                  ? 'bg-primary text-white'
                  : 'text-body hover:bg-gray-2 dark:text-bodydark dark:hover:bg-meta-4'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* hold the previous render (dimmed) while refetching, so the card never jumps */}
      <div className={isFetching && !isLoading ? 'opacity-60' : ''}>
        {body()}
      </div>
    </div>
  );
};

const DataTable = ({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | number)[][];
}) => (
  <div style={{ height: CHART_HEIGHT }} className="overflow-y-auto">
    <table className="w-full text-left text-sm text-black dark:text-white">
      <thead className="sticky top-0 bg-white dark:bg-boxdark">
        <tr className="border-b border-stroke dark:border-strokedark">
          {headers.map((header, index) => (
            <th
              key={header}
              className={`py-2 font-medium ${index ? 'text-right' : ''}`}
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={row[0]}
            className="border-b border-stroke last:border-0 dark:border-strokedark"
          >
            {row.map((cell, index) => (
              <td
                key={index}
                className={`py-2 ${index ? 'text-right tabular-nums' : ''}`}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

interface DashboardChartsViewProps {
  monthly: MonthlyRow[];
  daily: DailyRow[];
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
}

export const DashboardChartsView = ({
  monthly,
  daily,
  isLoading = false,
  isFetching = false,
  isError = false,
}: DashboardChartsViewProps) => {
  const isDark = useIsDark();

  const dailyProfit = daily.reduce((sum, row) => sum + row.profit, 0);
  const shared = { isLoading, isFetching, isError };

  return (
    <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
      <ChartCard
        {...shared}
        className="col-span-12 xl:col-span-6"
        title="Expense vs profit by month"
        subtitle={`${monthly[0]?.fullLabel} – ${monthly[monthly.length - 1]?.fullLabel}`}
        isEmpty={monthly.every((row) => !row.expense && !row.profit)}
        chart={
          <ReactApexChart
            type="bar"
            height={CHART_HEIGHT}
            options={monthlyOptions(monthly, isDark)}
            series={[
              { name: 'Expense', data: monthly.map((row) => row.expense) },
              { name: 'Profit', data: monthly.map((row) => row.profit) },
            ]}
          />
        }
        table={
          <DataTable
            headers={['Month', 'Expense', 'Profit']}
            rows={monthly.map((row) => [
              row.fullLabel,
              money(row.expense),
              money(row.profit),
            ])}
          />
        }
      />

      <ChartCard
        {...shared}
        className="col-span-12 xl:col-span-6"
        title="Daily profit"
        subtitle={`Last ${DAYS} days · AED ${money(dailyProfit)}`}
        isEmpty={daily.every((row) => !row.profit)}
        chart={
          <ReactApexChart
            type="area"
            height={CHART_HEIGHT}
            options={dailyOptions(daily, isDark)}
            series={[
              {
                name: 'Profit',
                data: daily.map((row) => ({ x: row.ts, y: row.profit })),
              },
            ]}
          />
        }
        table={
          <DataTable
            headers={['Date', 'Profit']}
            rows={[...daily].reverse().map((row) => [row.label, money(row.profit)])}
          />
        }
      />
    </div>
  );
};

const pad = (value: number) => String(value).padStart(2, '0');

const DashboardCharts = () => {
  const monthlyQuery = useGetMonthlyReportsQuery();
  const dailyQuery = useGetDailyReportsQuery();

  // The reports only list periods that have invoices; fill the gaps with zero so the axes are continuous.
  const monthly = useMemo<MonthlyRow[]>(() => {
    const byMonth = new Map<string, any>(
      (monthlyQuery.data?.data ?? []).map((row: any) => [
        `${row.year}-${row.month}`,
        row,
      ]),
    );
    const now = new Date();
    return Array.from({ length: MONTHS }, (_, index) => {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - (MONTHS - 1 - index),
        1,
      );
      const row = byMonth.get(`${date.getFullYear()}-${date.getMonth() + 1}`);
      const month = date.toLocaleString('en', { month: 'short' });
      return {
        // a 12-month window has each month name once, so the axis needs no year
        label: month,
        fullLabel: `${month} ${date.getFullYear()}`,
        expense: Number(row?.expense ?? 0),
        profit: Number(row?.profit ?? 0),
      };
    });
  }, [monthlyQuery.data]);

  const daily = useMemo<DailyRow[]>(() => {
    // invoice dates are stored as UTC midnight of the chosen calendar day, so the first 10 chars are that day
    const byDay = new Map<string, any>(
      (dailyQuery.data?.data ?? []).map((row: any) => [
        String(row.date).slice(0, 10),
        row,
      ]),
    );
    const today = new Date();
    return Array.from({ length: DAYS }, (_, index) => {
      const date = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - (DAYS - 1 - index),
      );
      const key = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
      return {
        ts: Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
        label: `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`,
        profit: Number(byDay.get(key)?.profit ?? 0),
      };
    });
  }, [dailyQuery.data]);

  return (
    <DashboardChartsView
      monthly={monthly}
      daily={daily}
      isLoading={monthlyQuery.isLoading || dailyQuery.isLoading}
      isFetching={monthlyQuery.isFetching || dailyQuery.isFetching}
      isError={monthlyQuery.isError || dailyQuery.isError}
    />
  );
};

export default DashboardCharts;
