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
  useGetMonthlyReportsQuery,
  useGetUsersByIdQuery,
  useGetUsersQuery,
} from '../../store/reportSlice';
import ButtonCard from '../../components/buttonCard';

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
    title: 'Serial No.',
    dataIndex: 'id',
  },
  {
    title: 'Date',
    dataIndex: 'date',
  },
  {
    title: 'Expense',
    dataIndex: 'expense',
  },
  {
    title: 'Profit',
    dataIndex: 'profit',
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

const Calendar = () => {
  // const allInvoices = useSelector((state: any) => state.report.reportData);
  const navigate = useNavigate();
  // const { getInvoice } = useReportApi();

  const { data, error, isLoading } = useGetMonthlyReportsQuery();

  console.log('data, error, isLoading', data, error, isLoading); 

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
          id: index + 1,
          date: invoice.month + '/' + invoice.year,
          expense: invoice.expense,
          profit: invoice.profit,
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
    <Table<DataType>
      loading={isLoading}
      columns={columns}
      dataSource={formattedData}
    //   onChange={onChange}
    //   onRow={(record) => ({
    //     onClick: () => {
    //       navigate(`/report/${record.id}`);
    //     },
    //   })}
    />
  );
};

export default Calendar;
