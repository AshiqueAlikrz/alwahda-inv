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
  },
  {
    title: 'Quantity',
    dataIndex: 'quantity',
    key: 'quantity',
    align: 'right',
  },
  {
    title: 'Rate',
    dataIndex: 'rate',
    key: 'rate',
    align: 'right',
    render: (rate) => `${rate.toFixed(2)}`,
  },
  {
    title: 'Total',
    dataIndex: 'total',
    key: 'total',
    align: 'right',
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
          `http://localhost:8081/api/reports/items/${id}`,
        );
        const formattedData = response.data.data.map(
          (items: any, index: number) => {
            return {
              id: items._id,
              description: items.description,
              quantity: items.quantity,
              rate: items.rate,
              total: items.total,
            };
          },
        );
        setItems(formattedData);
        console.log('items', items);
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
    console.log('params', pagination, filters, sorter, extra);
  };

  return (
    <Table<Item> columns={columns} dataSource={items} onChange={onChange} />
  );
};

export default InvoiceDetail;
