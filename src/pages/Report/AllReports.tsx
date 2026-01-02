import axios from 'axios';
import React, { useState } from 'react';
import {
  Button,
  DatePicker,
  Dropdown,
  Input,
  Menu,
  Modal,
  Table,
  Switch,
} from 'antd';
import type { DatePickerProps, TableColumnsType, TableProps } from 'antd';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { IoMdMore } from 'react-icons/io';
import { toast } from 'react-toastify';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import dayjs from 'dayjs';

import {
  useGetUsersQuery,
  useUpdateInvoiceMutation,
} from '../../store/reportSlice';

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
  vat: number;
  grand_total: number;
  paid: boolean;
  id: string;
  discount: number;
}

const Calendar = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [invoiceId, setInvoiceId] = useState('');
  const [editData, setEditData] = useState({
    discount: 0,
    name: '',
    paid: false,
    date: '',
  });

  const navigate = useNavigate();
  const { data, isLoading } = useGetUsersQuery();
  const [updateInvoice] = useUpdateInvoiceMutation();

  const handleMenuClick = (record: DataType) => {
    const isoDate = moment(record.date, 'DD-MM-YYYY').format('YYYY-MM-DD');
    setEditData({
      discount: record.discount,
      name: record.name,
      paid: record.paid,
      date: isoDate,
    });
    setInvoiceId(record.id);
    setModalOpen(true);
  };

  const menu = (record: DataType) => (
    <Menu
      onClick={(e) => {
        e.domEvent.stopPropagation();
        if (e.key === 'edit') {
          handleMenuClick(record);
        } else if (e.key === 'invoice') {
          navigate(`/invoice/${record.id}`);
        }
      }}
    >
      <Menu.Item key="edit">Edit</Menu.Item>
      <Menu.Item key="invoice">Print Invoice</Menu.Item>
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
      title: ' VAT',
      dataIndex: 'vat',
      className: 'w-28',
    },
    {
      title: 'Grand Total',
      dataIndex: 'grand_total',
    },
    {
      title: ' Profit',
      dataIndex: 'profit',
      className: 'w-28',
    },
    {
      title: 'Paid',
      dataIndex: 'paid',
      render: (paid) => (paid ? 'Yes' : 'No'),
    },
    {
      title: '',
      dataIndex: 'edit',
      render: (_, record) => (
        <Dropdown overlay={menu(record)} trigger={['click']}>
          <Button
            icon={<IoMdMore />}
            onClick={(e) => {
              e.stopPropagation();
            }}
          />
        </Dropdown>
      ),
    },
  ];

  const formattedData = data
    ? data.data.map((invoice: any, index: number) => ({
        key: index,
        id: invoice._id,
        invoice_number: invoice.invoice_number,
        date: moment(invoice.date).format('DD-MM-YYYY'),
        name: invoice.name,
        vat: (
          <span>
            {invoice.totalVat ? invoice.totalVat.toFixed(2) : '-'}{' '}
            {invoice.vatPaidByCompany && (
              <span className="text-xs text-green-500">(company)</span>
            )}
          </span>
        ),
        sub_total: invoice.subTotal.toFixed(2),
        profit: invoice.profit.toFixed(2),
        grand_total: invoice.grandTotal.toFixed(2),
        discount: invoice.discount,
        paid: invoice.paid,
      }))
    : [];

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    discount: Yup.number().min(0, 'Discount cannot be negative'),
    date: Yup.string().required('Date is required'),
    paid: Yup.boolean(),
  });

  return (
    <>
      <Table<DataType>
        loading={isLoading}
        columns={columns}
        dataSource={formattedData}
        onRow={(record) => ({
          onClick: () => navigate(`/report/${record.id}`),
        })}
      />

      <Modal
        title="Edit Invoice"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
      >
        <Formik
          initialValues={editData}
          validationSchema={validationSchema}
          onSubmit={async (values) => {
            try {
              const response = await updateInvoice({
                invoiceId,
                body: values,
              }).unwrap();

              if (response) {
                toast.success(response.message);
                setModalOpen(false);
              }
            } catch (error) {
              toast.error('Failed to update invoice');
            }
          }}
          enableReinitialize
        >
          {({
            values,
            handleChange,
            setFieldValue,
            handleSubmit,
            errors,
            touched,
          }) => (
            <Form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col">
                  <label>Name:</label>
                  <Input
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                  />
                  {errors.name && touched.name && (
                    <div className="text-red-500 text-sm">{errors.name}</div>
                  )}
                </div>

                <div className="flex flex-col">
                  <label>Discount:</label>
                  <Input
                    name="discount"
                    type="number"
                    value={values.discount}
                    onChange={handleChange}
                  />
                  {errors.discount && touched.discount && (
                    <div className="text-red-500 text-sm">
                      {errors.discount}
                    </div>
                  )}
                </div>

                <div className="flex flex-col">
                  <label>Date:</label>
                  <DatePicker
                    value={values.date ? dayjs(values.date) : null}
                    onChange={(date, dateString) =>
                      setFieldValue('date', dateString)
                    }
                  />
                  {errors.date && touched.date && (
                    <div className="text-red-500 text-sm">{errors.date}</div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <label>Paid:</label>
                  <Switch
                    checked={values.paid}
                    onChange={(checked) => setFieldValue('paid', checked)}
                  />
                </div>

                <div className="text-right pt-4">
                  <Button type="primary" htmlType="submit">
                    Submit
                  </Button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>
    </>
  );
};

export default Calendar;
