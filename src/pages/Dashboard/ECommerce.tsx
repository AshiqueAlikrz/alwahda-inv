import React from 'react';
import { FaSpinner } from 'react-icons/fa6';
import {
  IoCalculatorOutline,
  IoDocumentTextOutline,
  IoPricetagOutline,
  IoTrendingUpOutline,
  IoWalletOutline,
} from 'react-icons/io5';
import { toast } from 'react-toastify';

import CardDataStats from '../../components/CardDataStats';
import DashboardCharts from '../../components/Charts/DashboardCharts';
import { useGetDashboardReportQuery } from '../../store/slice/reportSlice';
import { formatMoney } from '../../utils/money';

const ECommerce: React.FC = () => {
  const { data, error, isLoading } = useGetDashboardReportQuery();

  const totals = data?.data?.todayReport?.[0];

  // accent hues match the charts: expense is blue, profit is orange
  const stats = [
    {
      title: 'Total Expense',
      value: formatMoney(totals?.expense),
      unit: 'AED',
      accent: '#2a78d6',
      icon: <IoWalletOutline />,
    },
    {
      title: 'Total Profit',
      value: formatMoney(totals?.profit),
      unit: 'AED',
      accent: '#eb6834',
      icon: <IoTrendingUpOutline />,
    },
    {
      title: 'Total VAT',
      value: formatMoney(totals?.vat),
      unit: 'AED',
      accent: '#4a3aa7',
      icon: <IoCalculatorOutline />,
    },
    {
      title: 'Total Discount',
      value: formatMoney(totals?.discount),
      unit: 'AED',
      accent: '#d55181',
      icon: <IoPricetagOutline />,
    },
    {
      title: 'Total Invoices',
      value: String(data?.data?.totalUsers || 0),
      accent: '#1baf7a',
      icon: <IoDocumentTextOutline />,
    },
  ];

  if (error) {
    toast.error('Error');
  }

  return (
    <>
      {isLoading ? (
        <div className="flex h-[60vh] w-full items-center justify-center">
          <FaSpinner className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5 2xl:gap-6">
          {stats.map((stat) => (
            <CardDataStats
              key={stat.title}
              title={stat.title}
              value={stat.value}
              unit={stat.unit}
              accent={stat.accent}
            >
              {stat.icon}
            </CardDataStats>
          ))}
        </div>
      )}

      {!isLoading && <DashboardCharts />}
    </>
  );
};

export default ECommerce;
