import React, { useEffect, useState } from 'react';
import {
  Button,
  Dropdown,
  Menu,
  Popconfirm,
  Table,
  TableColumnsType,
  TableProps,
} from 'antd';
import { useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  useGetUsersByIdQuery,
  useUpdateItemMutation,
} from '../store/reportSlice';
import { IoMdMore } from 'react-icons/io';
import { QuestionCircleOutlined } from '@ant-design/icons';
import EditModal from '../components/editModal';
import { number } from 'yup';
import { toast } from 'react-toastify';

interface Item {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  serviceCharge: number;
  tax: number;
  total: number;
  _id: string;
}

const InvoiceDetail = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const menu = (
    <Menu
      onClick={(e) => {
        e.domEvent.stopPropagation();
        // handleMenuClick(e); // Call the function properly
      }}
    >
      <Menu.Item
        onClick={(e) => {
          e.domEvent.stopPropagation();
          setModalOpen(true); // Open the modal

          // handleMenuClick(e); // Call the function properly
        }}
        key="edit"
      >
        Edit
      </Menu.Item>
      {/* <Menu.Item key="delete">
      {' '}
      <Popconfirm
      title="Delete the task"
        description="Are you sure to delete this task?"
        icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
        // onConfirm={handleDelete}
        // onCancel={handleCancel}
      >
      Delete
      </Popconfirm>{' '}
      </Menu.Item> */}
    </Menu>
  );

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
    {
      title: '',
      dataIndex: 'edit',
      render: (_, record) => (
        <Dropdown overlay={menu} trigger={['click']}>
          <Button
            icon={<IoMdMore />}
            onClick={function hello() {
              (e: any) => e.stopPropagation();
              setEditId(record._id);
            }}
          />
        </Dropdown>
      ),
    },
  ];
  // const [items, setItems] = useState<Item[]>([]);

  const { id } = useParams<{ id: string }>();
  const { data, error, isLoading } = useGetUsersByIdQuery(id);

  const formattedData = data
    ? data.data.map((items: any, index: number) => {
        return {
          id: index + 1,
          description: items.description.name,
          quantity: items.quantity,
          rate: items.rate,
          total: items.total,
          tax: items.tax,
          serviceCharge: items.serviceCharge,
          _id: items._id,
        };
      })
    : [];

  // useEffect(() => {
  //   const getInvoice = async () => {
  //     try {
  //       const response = await axios.get(
  //         `https://inventory-backend-azure.vercel.app/api/reports/items/${id}`,
  //       );
  //       const formattedData = data.data.map(
  //         (items: any, index: number) => {
  //           return {
  //             id: index + 1,
  //             description: items.description.name,
  //             quantity: items.quantity,
  //             rate: items.rate,
  //             total: items.total,
  //             tax: items.tax,
  //             serviceCharge: items.serviceCharge,
  //           };
  //         },
  //       );
  //       setItems(formattedData);
  //     } catch (error) {
  //       console.error('Error fetching the invoice:', error);
  //     }
  //   };
  //   getInvoice();
  // }, []);

  const [editData, setEditData] = useState({
    serviceCharge: 0,
    rate: 0,
    tax: 0,
    quantity: 0,
  });

  const onChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: Number(e.target.value),
    });
  };

  const [editId, setEditId] = useState('');

  const [updateItem] = useUpdateItemMutation();

  const handleOk = async () => {
    console.log(id, editId, editData);
    const response = await updateItem({
      id,
      editId,
      body: editData,
    }).unwrap();
    if (response) {
      toast.success(response.message);
      setModalOpen(false);
    } else {
      toast.success('error');
    }
  };

  return (
    <>
      <Table<Item>
        loading={isLoading}
        columns={columns}
        dataSource={formattedData}
        // onChange={(e) => console.log(e)}
        onRow={(record) => {
          return {
            onClick: () => {
              // setEditId(record._id);
              console.log('Row clicked. ID:', record);
              setEditData(record); // access any property
              // setSelectedId(record.id); // if needed
              // open modal or navigate
            },
          };
        }}
      />

      <EditModal
        open={modalOpen}
        handleOk={handleOk}
        setOpen={setModalOpen}
        onChange={onChange}
        selectRow={editData}
      />
    </>
  );
};

export default InvoiceDetail;
