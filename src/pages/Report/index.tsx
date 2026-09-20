import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { Button, Dropdown, Menu, Popconfirm, Table } from 'antd';
import type { TableColumnsType, TableProps } from 'antd';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
// import { billingDataContext } from '../contexts/DataContext';
import { IoMdMore } from 'react-icons/io';
import { QuestionCircleOutlined } from '@ant-design/icons';
import useReportApi from '../../api/report';
import { useSelector } from 'react-redux';
import {
  useGetUsersByIdQuery,
  useGetUsersQuery,
} from '../../store/slice/reportSlice';
import ButtonCard from '../../components/buttonCard';
import {
  IoCalendarOutline,
  IoDocumentTextOutline,
  IoStatsChartOutline,
} from 'react-icons/io5';

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
    title: 'Invoice Number',
    dataIndex: 'invoice_number',
  },
  {
    title: 'Date',
    dataIndex: 'date',
  },
  {
    title: 'Name',
    dataIndex: 'name',
  },
  {
    title: 'Sub Total',
    dataIndex: 'sub_total',
  },
  {
    title: 'Discount',
    dataIndex: 'discount',
  },
  {
    title: 'Grand Total',
    dataIndex: 'grand_total',
  },
  {
    title: 'Paid',
    dataIndex: 'paid',
    render: (paid) => (paid ? 'Yes' : 'No'), // Renders as "Yes" or "No"
  },
  {
    title: '',
    dataIndex: 'edit',
    render: (_, record) => (
      <Dropdown overlay={menu} trigger={['click']}>
        <Button icon={<IoMdMore />} onClick={(e) => e.stopPropagation()} />
      </Dropdown>
    ),
  },
];

const onChange: TableProps<DataType>['onChange'] = (
  pagination,
  filters,
  sorter,
  extra,
) => {
  // console.log('params', pagination, filters, sorter, extra);
};

const Calendar = () => {
  // const allInvoices = useSelector((state: any) => state.report.reportData);
  const navigate = useNavigate();
  // const { getInvoice } = useReportApi();

  const { data, error, isLoading } = useGetUsersQuery();

  // useEffect(() => {
  //   if (!data?.data?.length) {
  //     fetchReport();
  //   }
  // }, []);

  // const fetchReport = async () => {
  //   await getInvoice();
  // };

  const formattedData = data
    ? data?.data?.map((invoice: any, index: number) => {
        return {
          key: index,
          id: invoice._id,
          invoice_number: invoice.invoice_number,
          date: moment(invoice.date).format('DD-MM-YYYY'),
          name: invoice.name,
          sub_total: invoice.sub_total,
          grand_total: invoice.grand_total,
          discount: invoice.discount,
          paid: invoice?.paid,
          edit: <IoMdMore />,
          // tax: invoice?.items[0].tax,
          // serviceCharge: invoice?.items[0].serviceCharge,
          // ...invoice.items[1], // Use the first item for simplicity
          // item_id: invoice.items[0]?.id,
          // item_description: invoice.items[0]?.description,
          // item_quantity: invoice.items[0]?.quantity,
          // item_rate: invoice.items[0]?.rate,
          // item_total: invoice.items[0]?.total,
        };
      })
    : [];

  const reportsButton = [
    {
      text: 'All Reports',
      description: 'Every invoice with its totals, VAT and profit.',
      accent: '#2a78d6',
      icon: <IoDocumentTextOutline />,
      onClick: function Click() {
        navigate('/report/allreports');
      },
    },
    {
      text: 'Daily Reports',
      description: 'Expense, profit, VAT and discount for each day.',
      accent: '#eb6834',
      icon: <IoCalendarOutline />,
      onClick: function Click() {
        navigate('/report/dailyreports');
      },
    },
    {
      text: 'Monthly Reports',
      description: 'The same totals rolled up month by month.',
      accent: '#1baf7a',
      icon: <IoStatsChartOutline />,
      onClick: function Click() {
        navigate('/report/montlyreports');
      },
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:gap-6">
      {reportsButton.map((data) => {
        return (
          <ButtonCard
            key={data.text}
            text={data.text}
            description={data.description}
            icon={data.icon}
            accent={data.accent}
            onClick={data.onClick}
          />
        );
      })}
    </div>
  );
};

export default Calendar;
