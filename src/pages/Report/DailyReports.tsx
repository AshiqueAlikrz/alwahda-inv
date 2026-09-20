import axios from 'axios';
import React, { useMemo, useState } from 'react';
import { Button, DatePicker, Dropdown, Menu, Popconfirm, Table } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import type { TableColumnsType, TableProps } from 'antd';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { IoMdMore } from 'react-icons/io';
import { QuestionCircleOutlined } from '@ant-design/icons';
import useReportApi from '../../api/report';
import { useSelector } from 'react-redux';
import {
  useGetDailyReportsQuery,
  //   useGetDailyReportQuery,
  useGetUsersByIdQuery,
  useGetUsersQuery,
} from '../../store/slice/reportSlice';
import Card from '../../components/ui/Card';
import FilterBar from '../../components/ui/FilterBar';
import CsvButton from '../../components/ui/CsvButton';
import { CsvColumn, csvFilename } from '../../utils/csv';
import { formatMoney } from '../../utils/money';

interface Item {
  id: number;
  description: string;
  quantity: number;
  rate: number;
  total: number;
}

export interface DataType {
  key: React.Key;
  invoice_number: number;
  date: string;
  name: string;
  items: Item[];
  sub_total: number;
  grand_total: number;
  paid: boolean;
  id: string;
}
const handleMenuClick = (e: any) => {
  console.log('eee', e);
  // Handle your edit or delete action here
};
const handleDelete = async () => {
  await axios.delete('http://localhost:8081/api/reports/invoice/:invoiceId');
  console.log('Task deleted'); // Handle the delete action here
};

const menu = (
  <Menu
    onClick={(e) => {
      e.domEvent.stopPropagation();
      handleMenuClick(e); // Call the function properly
    }}
  >
    <Menu.Item key="edit">Edit</Menu.Item>
    <Menu.Item key="delete">
      {' '}
      <Popconfirm
        title="Delete the task"
        description="Are you sure to delete this task?"
        icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
        onConfirm={handleDelete}
        // onCancel={handleCancel}
      >
        Delete
      </Popconfirm>{' '}
    </Menu.Item>
  </Menu>
);

const columns: TableColumnsType<DataType> = [
  {
    title: '#',
    dataIndex: 'id',
    width: 64,
  },
  {
    title: 'Date',
    dataIndex: 'date',
  },
  {
    title: 'Expense',
    dataIndex: 'expense',
    align: 'right',
  },
  {
    title: 'Profit',
    dataIndex: 'profit',
    align: 'right',
  },
  {
    title: 'VAT',
    dataIndex: 'vat',
    align: 'right',
  },
  {
    title: 'Discount',
    dataIndex: 'discount',
    align: 'right',
  },

  //   {
  //     title: '',
  //     dataIndex: 'edit',
  //     render: (_, record) => (
  //       <Dropdown overlay={menu} trigger={['click']}>
  //         <Button icon={<IoMdMore />} onClick={(e) => e.stopPropagation()} />
  //       </Dropdown>
  //     ),
  //   },
];

// const onChange: TableProps<DataType>['onChange'] = (
//   pagination,
//   filters,
//   sorter,
//   extra,
// ) => {
//   // console.log('params', pagination, filters, sorter, extra);
// };

const dailyCsvColumns: CsvColumn<any>[] = [
  {
    header: 'Date',
    value: (report) => moment.utc(report.date).format('YYYY-MM-DD'),
  },
  { header: 'Expense', value: (report) => report.expense, money: true },
  { header: 'Profit', value: (report) => report.profit, money: true },
  { header: 'VAT', value: (report) => report.vat ?? 0, money: true },
  { header: 'Discount', value: (report) => report.discount ?? 0, money: true },
];

const Calendar = () => {
  // const allInvoices = useSelector((state: any) => state.report.reportData);
  //   const navigate = useNavigate();
  // const { getInvoice } = useReportApi();

  const { data, error, isLoading } = useGetDailyReportsQuery();
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);

  const filteredReports = useMemo(() => {
    const [from, to] = dateRange ?? [null, null];
    return (data?.data ?? []).filter((report: any) => {
      if (!from || !to) return true;
      const date = dayjs(report.date);
      return (
        !date.isBefore(from.startOf('day')) && !date.isAfter(to.endOf('day'))
      );
    });
  }, [data, dateRange]);

  const csvName = csvFilename(
    'daily-report',
    dateRange?.[0] && dateRange?.[1]
      ? `${dateRange[0].format('YYYY-MM-DD')}_to_${dateRange[1].format(
          'YYYY-MM-DD',
        )}`
      : dayjs().format('YYYY-MM-DD'),
  );

  // useEffect(() => {
  //   if (!data?.data?.length) {
  //     fetchReport();
  //   }
  // }, []);

  // const fetchReport = async () => {
  //   await getInvoice();
  // };

  const formattedData = data
    ? filteredReports.map((invoice: any, index: number) => {
        return {
          id: index + 1,
          date: moment(invoice.date).format('DD-MM-YYYY'),
          expense: formatMoney(invoice.expense),
          profit: formatMoney(invoice.profit),
          vat: formatMoney(invoice.vat),
          discount: formatMoney(invoice.discount),
          //   paid: invoice?.paid,
          //   edit: <IoMdMore />,
          //   // tax: invoice?.items[0].tax,
          //   // serviceCharge: invoice?.items[0].serviceCharge,
          //   // ...invoice.items[1], // Use the first item for simplicity
          //   // item_id: invoice.items[0]?.id,
          //   // item_description: invoice.items[0]?.description,
          //   // item_quantity: invoice.items[0]?.quantity,
          //   // item_rate: invoice.items[0]?.rate,
          //   // item_total: invoice.items[0]?.total,
        };
      })
    : [];

  return (
    <Card flush className="overflow-hidden">
      <FilterBar
        active={!!dateRange?.[0]}
        onReset={() => setDateRange(null)}
        summary={
          data
            ? `${filteredReports.length} of ${data.data.length} days`
            : undefined
        }
        actions={
          <CsvButton
            filename={csvName}
            columns={dailyCsvColumns}
            rows={filteredReports}
          />
        }
      >
        <DatePicker.RangePicker
          value={dateRange as any}
          onChange={(range) => setDateRange(range as any)}
        />
      </FilterBar>
      <Table<DataType>
        loading={isLoading}
        columns={columns}
        dataSource={formattedData}
        scroll={{ x: 'max-content' }}
        pagination={{ hideOnSinglePage: true, style: { margin: 16 } }}
        //   onChange={onChange}
        //   onRow={(record) => ({
        //     onClick: () => {
        //       navigate(`/report/${record.id}`);
        //     },
        //   })}
      />
    </Card>
  );
};

export default Calendar;
