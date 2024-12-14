import React, { useEffect, useState } from 'react';
import { Table, TableColumnsType, TableProps } from 'antd';
import { useLocation, useParams } from 'react-router-dom';
import axios from 'axios';

interface Item {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  total: number;
}

const columns: TableColumnsType<Item> = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
    align: 'center',
  },
  {
    title: 'Quantity',
    dataIndex: 'quantity',
    key: 'quantity',
    align: 'center',
  },
  {
    title: 'Rate',
    dataIndex: 'rate',
    key: 'rate',
    align: 'center',
    render: (rate) => `${rate.toFixed(2)}`,
  },
  {
    title: 'Service Chr.',
    dataIndex: 'serviceCharge',
    key: 'serviceCharge',
    align: 'center',
    // render: (rate) => `${rate.toFixed(2)}`,
  },
  {
    title: 'Tax.',
    dataIndex: 'tax',
    key: 'tax',
    align: 'center',
    // render: (rate) => `${rate.toFixed(2)}`,
  },
  {
    title: 'Total',
    dataIndex: 'total',
    key: 'total',
    align: 'center',
    render: (total) => `${total.toFixed(2)}`,
  },
];

const InvoiceDetail = () => {
  const [items, setItems] = useState<Item[]>([]);

  const { id } = useParams<{ id: string }>();
  useEffect(() => {
    const getInvoice = async () => {
      try {
        const response = await axios.get(
          `https://inventory-backend-azure.vercel.app/api/reports/items/${id}`,
        );
        const formattedData = response.data.data.map(
          (items: any, index: number) => {
            return {
              id: index + 1,
              description: items.description.name,
              quantity: items.quantity,
              rate: items.rate,
              total: items.total,
              tax: items.tax,
              serviceCharge: items.serviceCharge,
            };
          },
        );
        setItems(formattedData);
      } catch (error) {
        console.error('Error fetching the invoice:', error);
      }
    };
    getInvoice();
  }, []);

  const onChange: TableProps<Item>['onChange'] = (
    pagination,
    filters,
    sorter,
    extra,
  ) => {
    // console.log('params', pagination, filters, sorter, extra);
  };

  return (
    <Table<Item> columns={columns} dataSource={items} onChange={onChange} />
  );
};

export default InvoiceDetail;
