import axios from 'axios';
import React, { useMemo, useState } from 'react';
import {
  Button,
  DatePicker,
  Dropdown,
  Input,
  Menu,
  Modal,
  Select,
  Table,
  Switch,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
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
} from '../../store/slice/reportSlice';
import Card from '../../components/ui/Card';
import FilterBar from '../../components/ui/FilterBar';
import PaidPill from '../../components/ui/PaidPill';
import CsvButton from '../../components/ui/CsvButton';
import { CsvColumn, csvFilename } from '../../utils/csv';
import { formatMoney } from '../../utils/money';

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

// one row per invoice, with the same figures as the table but as plain numbers
const invoiceCsvColumns: CsvColumn<any>[] = [
  { header: 'Invoice No', value: (invoice) => invoice.invoice_number },
  {
    header: 'Date',
    value: (invoice) => moment.utc(invoice.date).format('YYYY-MM-DD'),
  },
  { header: 'Customer', value: (invoice) => invoice.name },
  { header: 'Sub Total', value: (invoice) => invoice.subTotal, money: true },
  {
    header: 'Discount',
    value: (invoice) => invoice.discount ?? 0,
    money: true,
  },
  { header: 'VAT', value: (invoice) => invoice.totalVat ?? 0, money: true },
  {
    header: 'Grand Total',
    value: (invoice) => invoice.grandTotal,
    money: true,
  },
  { header: 'Profit', value: (invoice) => invoice.profit, money: true },
  { header: 'Status', value: (invoice) => (invoice.paid ? 'Paid' : 'Unpaid') },
  {
    header: 'VAT Paid By',
    value: (invoice) => (invoice.vatPaidByCompany ? 'Company' : 'Customer'),
  },
];

type DateRange = [dayjs.Dayjs | null, dayjs.Dayjs | null] | null;
type PaidFilter = 'all' | 'paid' | 'unpaid';

const Calendar = () => {
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>(null);
  const [paidFilter, setPaidFilter] = useState<PaidFilter>('all');
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
      title: 'Invoice',
      dataIndex: 'invoice_number',
      render: (number) => (
        <span className="font-semibold text-black dark:text-white">
          #{number}
        </span>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
    },
    {
      title: 'Customer',
      dataIndex: 'name',
      render: (name) => (
        <span className="font-medium text-black dark:text-white">{name}</span>
      ),
    },
    {
      title: 'Sub Total',
      dataIndex: 'sub_total',
      align: 'right',
    },
    {
      title: 'Discount',
      dataIndex: 'discount',
      align: 'right',
    },
    {
      title: 'VAT',
      dataIndex: 'vat',
      align: 'right',
    },
    {
      title: 'Grand Total',
      dataIndex: 'grand_total',
      align: 'right',
      render: (total) => (
        <span className="font-semibold text-black dark:text-white">
          {total}
        </span>
      ),
    },
    {
      title: 'Profit',
      dataIndex: 'profit',
      align: 'right',
    },
    {
      title: 'Status',
      dataIndex: 'paid',
      render: (paid) => <PaidPill paid={paid} />,
    },
    {
      title: '',
      dataIndex: 'edit',
      width: 64,
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

  const filterActive =
    !!search.trim() || !!dateRange?.[0] || paidFilter !== 'all';

  const resetFilters = () => {
    setSearch('');
    setDateRange(null);
    setPaidFilter('all');
  };

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();
    const [from, to] = dateRange ?? [null, null];
    return (data?.data ?? []).filter((invoice: any) => {
      if (
        query &&
        !String(invoice.name ?? '')
          .toLowerCase()
          .includes(query) &&
        !String(invoice.invoice_number ?? '').includes(query.replace('#', ''))
      ) {
        return false;
      }
      if (paidFilter === 'paid' && !invoice.paid) return false;
      if (paidFilter === 'unpaid' && invoice.paid) return false;
      if (from && to) {
        const date = dayjs(invoice.date);
        if (date.isBefore(from.startOf('day')) || date.isAfter(to.endOf('day')))
          return false;
      }
      return true;
    });
  }, [data, search, dateRange, paidFilter]);

  // the file name says which slice it holds, e.g. invoices_unpaid_2026-09-01_to_2026-09-20.csv
  const csvName = csvFilename(
    'invoices',
    paidFilter !== 'all' && paidFilter,
    dateRange?.[0] && dateRange?.[1]
      ? `${dateRange[0].format('YYYY-MM-DD')}_to_${dateRange[1].format(
          'YYYY-MM-DD',
        )}`
      : dayjs().format('YYYY-MM-DD'),
  );

  const formattedData = data
    ? filteredInvoices.map((invoice: any, index: number) => ({
        key: index,
        id: invoice._id,
        invoice_number: invoice.invoice_number,
        date: moment(invoice.date).format('DD-MM-YYYY'),
        name: invoice.name,
        vat: invoice.totalVat ? formatMoney(invoice.totalVat) : '-',
        sub_total: formatMoney(invoice.subTotal),
        profit: formatMoney(invoice.profit),
        grand_total: formatMoney(invoice.grandTotal),
        discount: formatMoney(invoice.discount),
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
      <Card flush className="overflow-hidden">
        <FilterBar
          active={filterActive}
          onReset={resetFilters}
          summary={
            data
              ? `${filteredInvoices.length} of ${data.data.length} invoices`
              : undefined
          }
          actions={
            <CsvButton
              filename={csvName}
              columns={invoiceCsvColumns}
              rows={filteredInvoices}
            />
          }
        >
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Search customer or invoice #"
            style={{ width: 260 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <DatePicker.RangePicker
            value={dateRange as any}
            onChange={(range) => setDateRange(range as DateRange)}
          />
          <Select<PaidFilter>
            style={{ width: 130 }}
            value={paidFilter}
            onChange={setPaidFilter}
            options={[
              { value: 'all', label: 'All status' },
              { value: 'paid', label: 'Paid' },
              { value: 'unpaid', label: 'Unpaid' },
            ]}
          />
        </FilterBar>
        <Table<DataType>
          loading={isLoading}
          columns={columns}
          dataSource={formattedData}
          scroll={{ x: 'max-content' }}
          rowClassName="cursor-pointer"
          pagination={{ hideOnSinglePage: true, style: { margin: 16 } }}
          onRow={(record) => ({
            onClick: () => navigate(`/report/${record.id}`),
          })}
        />
      </Card>

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
                  <label className="mb-1 text-sm font-medium">Name</label>
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
                  <label className="mb-1 text-sm font-medium">Discount</label>
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
                  <label className="mb-1 text-sm font-medium">Date</label>
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
                  <label className="mb-1 text-sm font-medium">Paid</label>
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
