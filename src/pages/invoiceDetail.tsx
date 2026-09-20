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
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  useGetInvoiceByIdQuery,
  useGetUsersByIdQuery,
  useUpdateItemMutation,
} from '../store/slice/reportSlice';
import { IoMdMore } from 'react-icons/io';
import { QuestionCircleOutlined } from '@ant-design/icons';
import EditModal from '../components/editModal';
import { number } from 'yup';
import { toast } from 'react-toastify';
import moment from 'moment';
import { IoArrowBack, IoPrintOutline } from 'react-icons/io5';
import Card from '../components/ui/Card';
import PaidPill from '../components/ui/PaidPill';
import { formatMoney } from '../utils/money';

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
      title: '#',
      dataIndex: 'id',
      key: 'id',
      width: 64,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (description) => (
        <span className="font-medium text-black dark:text-white">
          {description}
        </span>
      ),
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
      render: (rate) => formatMoney(rate),
    },
    {
      title: 'Service Chr.',
      dataIndex: 'serviceCharge',
      key: 'serviceCharge',
      align: 'right',
      render: (charge) => formatMoney(charge),
    },
    {
      title: 'Tax',
      dataIndex: 'tax',
      key: 'tax',
      align: 'right',
      render: (tax) => formatMoney(tax),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      align: 'right',
      render: (total) => (
        <span className="font-semibold text-black dark:text-white">
          {formatMoney(total)}
        </span>
      ),
    },
    {
      title: '',
      dataIndex: 'edit',
      width: 64,
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
  const { data: invoiceData } = useGetInvoiceByIdQuery(id);
  const navigate = useNavigate();
  const invoice = (invoiceData as any)?.data;
  const createdByName = invoice?.createdBy?.name;
  const vatPaidByCompany = invoice?.vatPaidByCompany;

  const formattedData = data
    ? data.data.map((items: any, index: number) => {
        return {
          id: index + 1,
          description: items.description.name,
          quantity: items.quantity,
          rate: items.rate,
          total: items.total,
          tax: items.tax.toFixed(2),
          serviceCharge: items.serviceCharge.toFixed(2),
          _id: items._id,
        };
      })
    : [];

  const [editData, setEditData] = useState({
    serviceCharge: 0,
    rate: 0,
    tax: 0,
    quantity: 0,
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    setEditData({
      ...editData,
      [name]: Number(value),
      // VAT is 5% of the (net) service charge; refill it when the service charge changes, still editable afterwards
      ...(name === 'serviceCharge' && {
        tax: Number((Number(value) * 0.05).toFixed(2)),
      }),
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

  const totals = invoice
    ? [
        { label: 'Sub total', value: invoice.subTotal },
        { label: 'Discount', value: invoice.discount },
        { label: 'VAT', value: invoice.totalVat },
      ]
    : [];

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <Link
              to="/report/allreports"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-body hover:text-primary dark:text-bodydark"
            >
              <IoArrowBack size={16} />
              All invoices
            </Link>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold text-black dark:text-white">
                {invoice ? `Invoice #${invoice.invoice_number}` : 'Invoice'}
              </h2>
              {invoice && <PaidPill paid={invoice.paid} />}
            </div>
            {invoice && (
              <p className="mt-1 text-sm text-body dark:text-bodydark">
                {invoice.name} · {moment(invoice.date).format('DD-MM-YYYY')}
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex flex-col items-end gap-1 text-sm text-black dark:text-white">
              <div className="flex">
                <span className="font-medium">Created By:&nbsp;</span>
                <span>{createdByName || '-'}</span>
              </div>
              <div className="flex">
                <span className="font-medium">VAT Paid By:&nbsp;</span>
                <span>
                  {vatPaidByCompany === undefined
                    ? '-'
                    : vatPaidByCompany
                    ? 'Company'
                    : 'Customer'}
                </span>
              </div>
            </div>
            <Button
              type="primary"
              icon={<IoPrintOutline size={16} />}
              onClick={() => navigate(`/invoice/${id}`)}
            >
              Print invoice
            </Button>
          </div>
        </div>
      </Card>

      <Card
        title="Items"
        subtitle={`${formattedData.length} ${
          formattedData.length === 1 ? 'item' : 'items'
        }`}
        flush
        className="overflow-hidden"
      >
        <Table<Item>
          loading={isLoading}
          columns={columns}
          dataSource={formattedData}
          rowKey="_id"
          pagination={false}
          scroll={{ x: 'max-content' }}
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
      </Card>

      {invoice && (
        <Card className="ml-auto w-full max-w-sm">
          <dl className="flex flex-col gap-3 text-sm">
            {totals.map((row) => (
              <div key={row.label} className="flex justify-between">
                <dt className="text-body dark:text-bodydark">{row.label}</dt>
                <dd className="font-medium tabular-nums text-black dark:text-white">
                  {formatMoney(row.value)} AED
                </dd>
              </div>
            ))}
            <div className="flex items-baseline justify-between border-t border-stroke pt-3 dark:border-strokedark">
              <dt className="font-semibold text-black dark:text-white">
                Grand total
              </dt>
              <dd className="text-xl font-bold tabular-nums text-primary">
                {formatMoney(invoice.grandTotal)} AED
              </dd>
            </div>
            <div className="flex justify-between text-body dark:text-bodydark">
              <dt>Profit</dt>
              <dd className="font-medium tabular-nums">
                {formatMoney(invoice.profit)} AED
              </dd>
            </div>
          </dl>
        </Card>
      )}

      <EditModal
        open={modalOpen}
        handleOk={handleOk}
        setOpen={setModalOpen}
        onChange={onChange}
        selectRow={editData}
      />
    </div>
  );
};

export default InvoiceDetail;
