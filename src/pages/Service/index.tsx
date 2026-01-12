import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { Button, Dropdown, Input, Menu, Modal, Popconfirm, Table } from 'antd';
import type { TableColumnsType, TableProps } from 'antd';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
// import { billingDataContext } from '../contexts/DataContext';
import { IoMdMore } from 'react-icons/io';
import { QuestionCircleOutlined } from '@ant-design/icons';
import useReportApi from '../../api/report';
import { useSelector } from 'react-redux';
import {
  useCreateServiceMutation,
  useDeleteServiceMutation,
  useGetAllServiceQuery,
  useGetUsersByIdQuery,
  useGetUsersQuery,
  useUpdateServiceMutation,
} from '../../store/reportSlice';
import ButtonCard from '../../components/buttonCard';
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

  const [mode, setMode] = useState('Add');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serviceData, setServiceData] = useState({
    name: '',
    price: 0,
  });
  const [serviceId, setServiceId] = useState('');

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
    },
    {
      title: 'Price (AED)',
      dataIndex: 'price',
    },

    {
      title: '',
      dataIndex: 'edit',
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
  const [createService] = useCreateServiceMutation();
  const [updateService] = useUpdateServiceMutation();
  const [deleteService] = useDeleteServiceMutation();

  if (error) {
    toast.error('Error fetching services');
  }

  const formattedData = data
    ? data?.data?.map((invoice: any, index: number) => {
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

  const handleOk = async () => {
    setIsModalOpen(false);
    if (mode === 'Edit') {
      const response = await updateService({ serviceId, body: serviceData });
      toast.success(response.data.message);
    } else {
      const response = await createService(serviceData).unwrap();
      toast.success(response.message);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onChange = (e: any) => {
    setServiceData({
      ...serviceData,
      [e.target.name]:
        e.target.name === 'name' ? e.target.value : Number(e.target.value),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex w-full justify-end">
        <Button type="primary" onClick={showModal}>
          Add Service
        </Button>
      </div>
      <Table<DataType>
        loading={isLoading}
        columns={columns}
        dataSource={formattedData}
        onChange={onChange}
        onRow={(record) => ({
          onClick: () => {},
        })}
      />

      <Modal
        title={`${mode} Service`}
        closable={{ 'aria-label': 'Custom Close Button' }}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <div className="flex gap-3 flex-col">
          <div className="flex gap-1">
            <label className="text-nowrap">Service Name :</label>
            <Input
              type="text"
              onChange={onChange}
              name="name"
              placeholder="Service Name"
              value={serviceData.name}
            />
          </div>
          <div className="flex gap-1">
            <label className="text-nowrap">Price :</label>
            <Input
              onChange={onChange}
              type="number"
              placeholder="price"
              name="price"
              value={serviceData.price}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Service;
