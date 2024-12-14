import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { Table } from 'antd';
import type { TableColumnsType, TableProps } from 'antd';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { billingDataContext } from '../contexts/DataContext';

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
  const navigate = useNavigate();

  const { invoice, setInvoice } = useContext(billingDataContext);

  useEffect(() => {
    const getInvoice = async () => {
      try {
        const response = await axios.get(
          'https://inventory-backend-azure.vercel.app/api/reports/getInvoice',
        );
        // Flatten data for the table

        const formattedData = response.data.data.map(
          (invoice: any, index: number) => {
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
              // tax: invoice?.items[0].tax,
              // serviceCharge: invoice?.items[0].serviceCharge,
              // ...invoice.items[1], // Use the first item for simplicity
              // item_id: invoice.items[0]?.id,
              // item_description: invoice.items[0]?.description,
              // item_quantity: invoice.items[0]?.quantity,
              // item_rate: invoice.items[0]?.rate,
              // item_total: invoice.items[0]?.total,
            };
          },
        );
        console.log('formattedData', formattedData);

        setInvoice(formattedData);
      } catch (error) {
        console.error('Error fetching the invoice:', error);
      }
    };
    getInvoice();
  }, []);

  return (
    <Table<DataType>
      columns={columns}
      dataSource={invoice}
      onChange={onChange}
      onRow={(record) => ({
        onClick: () => {
          navigate(`/report/${record.id}`);
        },
      })}
    />
  );
};

export default Calendar;
