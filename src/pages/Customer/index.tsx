import React, { useMemo, useState } from 'react';
import { Button, Input, Table } from 'antd';
import type { TableColumnsType } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { IoAdd } from 'react-icons/io5';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { useGetAllCustomersQuery } from '../../store/slice/reportSlice';
import Card from '../../components/ui/Card';
import CsvButton from '../../components/ui/CsvButton';
import { CsvColumn, csvFilename } from '../../utils/csv';
import CustomerModal from '../../components/CustomerModal';

interface CustomerRow {
  key: string;
  name: string;
  contact?: number;
  trn?: number;
  address?: string;
  email?: string;
  invoices: number;
}

const customerCsvColumns: CsvColumn<CustomerRow>[] = [
  { header: 'Name', value: (customer) => customer.name },
  { header: 'Contact', value: (customer) => customer.contact },
  { header: 'TRN', value: (customer) => customer.trn },
  { header: 'Address', value: (customer) => customer.address },
  { header: 'Email', value: (customer) => customer.email },
  { header: 'Invoices', value: (customer) => customer.invoices },
];

const columns: TableColumnsType<CustomerRow> = [
  {
    title: 'Name',
    dataIndex: 'name',
    render: (name) => (
      <span className="font-medium text-black dark:text-white">{name}</span>
    ),
  },
  { title: 'Contact', dataIndex: 'contact', render: (v) => v || '-' },
  { title: 'TRN', dataIndex: 'trn', render: (v) => v || '-' },
  { title: 'Address', dataIndex: 'address', render: (v) => v || '-' },
  { title: 'Email', dataIndex: 'email', render: (v) => v || '-' },
  { title: 'Invoices', dataIndex: 'invoices', align: 'right' },
];

const Customer = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { data, error, isLoading } = useGetAllCustomersQuery();

  if (error) {
    toast.error('Error fetching customers');
  }

  const rows: CustomerRow[] = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (data?.data ?? [])
      .filter(
        (customer: any) =>
          !query ||
          [customer.name, customer.contact, customer.email]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(query)),
      )
      .map((customer: any) => ({
        key: customer._id,
        name: customer.name,
        contact: customer.contact,
        trn: customer.trn,
        address: customer.address,
        email: customer.email,
        invoices: customer.products?.length ?? 0,
      }));
  }, [data, search]);

  const total = data?.data?.length ?? 0;

  return (
    <div className="flex flex-col gap-3">
      <Card
        title="Customers"
        subtitle={`${total} ${total === 1 ? 'customer' : 'customers'}`}
        extra={
          <div className="flex flex-wrap items-center gap-3">
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Search name, phone or email"
              style={{ width: 260 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <CsvButton
              filename={csvFilename('customers', dayjs().format('YYYY-MM-DD'))}
              columns={customerCsvColumns}
              rows={rows}
            />
            <Button
              type="primary"
              icon={<IoAdd size={18} />}
              onClick={() => setIsModalOpen(true)}
            >
              Add Customer
            </Button>
          </div>
        }
        flush
        className="overflow-hidden"
      >
        <Table<CustomerRow>
          loading={isLoading}
          columns={columns}
          dataSource={rows}
          scroll={{ x: 'max-content' }}
          pagination={{ hideOnSinglePage: true, style: { margin: 16 } }}
        />
      </Card>

      <CustomerModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Customer;
