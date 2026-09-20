import axios from 'axios';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Button, Dropdown, Input, Menu, Popconfirm, Table } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { TableColumnsType, TableProps } from 'antd';
import moment from 'moment';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
// import { billingDataContext } from '../contexts/DataContext';
import { IoMdMore } from 'react-icons/io';
import { QuestionCircleOutlined } from '@ant-design/icons';
import useReportApi from '../../api/report';
import { useSelector } from 'react-redux';
import {
  useDeleteServiceMutation,
  useGetAllServiceQuery,
  useGetUsersByIdQuery,
  useGetUsersQuery,
} from '../../store/slice/reportSlice';
import { IoAdd } from 'react-icons/io5';
import Card from '../../components/ui/Card';
import CsvButton from '../../components/ui/CsvButton';
import FilterBar from '../../components/ui/FilterBar';
import { CsvColumn, csvFilename } from '../../utils/csv';
import { formatMoney } from '../../utils/money';
import ServiceModal from '../../components/ServiceModal';
import { toast } from 'react-toastify';

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
  price: number;
}
const serviceCsvColumns: CsvColumn<any>[] = [
  { header: 'Name', value: (service) => service.name },
  { header: 'Price (AED)', value: (service) => service.price, money: true },
];

const handleMenuClick = (e: any) => {
  // Handle your edit or delete action here
};

const onChange: TableProps<DataType>['onChange'] = (
  pagination,
  filters,
  sorter,
  extra,
) => {
  // console.log('params', pagination, filters, sorter, extra);
};

const Service = () => {
  const navigate = useNavigate();

  const user = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user') || '{}')
    : null;
  //
  console.log('user', user);

  const [mode, setMode] = useState<'Add' | 'Edit'>('Add');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serviceData, setServiceData] = useState({
    name: '',
    price: 0,
  });
  const [serviceId, setServiceId] = useState('');
  const [search, setSearch] = useState('');

  const handleDelete = async () => {
    const response = await deleteService({ serviceId });
    toast.success(response.data.message);
  };

  const menu = (
    <Menu
      onClick={(e) => {
        e.domEvent.stopPropagation();
        handleMenuClick(e); // Call the function properly
      }}
    >
      <Menu.Item
        key="edit"
        onClick={(e) => {
          setIsModalOpen(true);
        }}
      >
        Edit
      </Menu.Item>
      <Menu.Item key="delete">
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
      title: 'Name',
      dataIndex: 'name',
      render: (name) => (
        <span className="font-medium text-black dark:text-white">{name}</span>
      ),
    },
    {
      title: 'Price (AED)',
      dataIndex: 'price',
      align: 'right',
      render: (price) => formatMoney(price),
    },

    {
      title: '',
      dataIndex: 'edit',
      width: 64,
      render: (_, record) => (
        <Dropdown overlay={menu} trigger={['click']}>
          <Button
            icon={<IoMdMore />}
            onClick={(e) => {
              console.log('record', record);
              e.stopPropagation();
              setMode('Edit');
              setServiceData({ name: record.name, price: record.price });
              setServiceId(record.id);
            }}
          />
        </Dropdown>
      ),
    },
  ];

  const { data, error, isLoading } = useGetAllServiceQuery();
  const [deleteService] = useDeleteServiceMutation();

  if (error) {
    toast.error('Error fetching services');
  }

  const filteredServices = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (data?.data ?? []).filter(
      (service: any) =>
        !query ||
        String(service.name ?? '')
          .toLowerCase()
          .includes(query),
    );
  }, [data, search]);

  const formattedData = data
    ? filteredServices.map((invoice: any, index: number) => {
        return {
          key: index,
          id: invoice._id,
          //   invoice_number: invoice.invoice_number,
          //   date: moment(invoice.date).format('DD-MM-YYYY'),
          name: invoice.name,
          price: invoice.price,
          //   grand_total: invoice.grand_total,
          //   discount: invoice.discount,
          //   paid: invoice?.paid,
          //   edit: <IoMdMore />,
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

  const showModal = () => {
    setMode('Add');
    setServiceData({ name: '', price: 0 });
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-3">
      <Card
        title="Services"
        subtitle={`${data?.data?.length ?? 0} ${
          data?.data?.length === 1 ? 'service' : 'services'
        }`}
        extra={
          <Button type="primary" icon={<IoAdd size={18} />} onClick={showModal}>
            Add Service
          </Button>
        }
        flush
        className="overflow-hidden"
      >
        <FilterBar
          active={!!search.trim()}
          onReset={() => setSearch('')}
          summary={
            data
              ? `${filteredServices.length} of ${data.data.length} services`
              : undefined
          }
          actions={
            <CsvButton
              filename={csvFilename('services', dayjs().format('YYYY-MM-DD'))}
              columns={serviceCsvColumns}
              rows={filteredServices}
            />
          }
        >
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Search services"
            style={{ width: 260 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </FilterBar>
        <Table<DataType>
          loading={isLoading}
          columns={columns}
          dataSource={formattedData}
          onChange={onChange}
          scroll={{ x: 'max-content' }}
          pagination={{ hideOnSinglePage: true, style: { margin: 16 } }}
          onRow={(record) => ({
            onClick: () => {},
          })}
        />
      </Card>

      <ServiceModal
        open={isModalOpen}
        mode={mode}
        serviceId={serviceId}
        initialData={serviceData}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Service;
