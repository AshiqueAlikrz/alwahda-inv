import React, { useMemo, useState } from 'react';
import { Input, Select, Table, Tag } from 'antd';
import type { TableColumnsType } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useGetProformasQuery } from '../../store/slice/reportSlice';
import Card from '../../components/ui/Card';
import FilterBar from '../../components/ui/FilterBar';
import CsvButton from '../../components/ui/CsvButton';
import { CsvColumn, csvFilename } from '../../utils/csv';
import { formatMoney } from '../../utils/money';

type StatusFilter = 'all' | 'open' | 'converted';

interface ProformaRow {
  key: string;
  id: string;
  proformaNo: string;
  date: string;
  name: string;
  grandTotal: string;
  status: 'open' | 'converted';
}

const columns: TableColumnsType<ProformaRow> = [
  {
    title: 'Proforma',
    dataIndex: 'proformaNo',
    render: (no) => (
      <span className="font-semibold text-black dark:text-white">{no}</span>
    ),
  },
  { title: 'Date', dataIndex: 'date' },
  {
    title: 'Customer',
    dataIndex: 'name',
    render: (name) => (
      <span className="font-medium text-black dark:text-white">{name}</span>
    ),
  },
  { title: 'Grand Total', dataIndex: 'grandTotal', align: 'right' },
  {
    title: 'Status',
    dataIndex: 'status',
    render: (status) =>
      status === 'converted' ? (
        <Tag color="green">Invoiced</Tag>
      ) : (
        <Tag color="blue">Open</Tag>
      ),
  },
];

const proformaCsvColumns: CsvColumn<any>[] = [
  { header: 'Proforma No', value: (p) => p.proformaNo },
  { header: 'Date', value: (p) => moment.utc(p.date).format('YYYY-MM-DD') },
  { header: 'Customer', value: (p) => p.name },
  { header: 'Grand Total', value: (p) => p.grandTotal, money: true },
  {
    header: 'Status',
    value: (p) => (p.status === 'converted' ? 'Invoiced' : 'Open'),
  },
];

const Proforma = () => {
  const navigate = useNavigate();
  const { data, error, isLoading } = useGetProformasQuery();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');

  if (error) {
    toast.error('Error fetching proforma invoices');
  }

  const all: any[] = data?.data ?? [];

  // the filtered documents; the table shows them formatted, the CSV gets the raw values
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return all
      .filter((p) => status === 'all' || p.status === status)
      .filter(
        (p) =>
          !query ||
          String(p.name ?? '')
            .toLowerCase()
            .includes(query) ||
          String(p.proformaNo ?? '')
            .toLowerCase()
            .includes(query),
      );
  }, [all, search, status]);

  const rows: ProformaRow[] = useMemo(
    () =>
      filtered.map((p) => ({
        key: p._id,
        id: p._id,
        proformaNo: p.proformaNo,
        date: moment(p.date).format('DD-MM-YYYY'),
        name: p.name,
        grandTotal: formatMoney(p.grandTotal),
        status: p.status,
      })),
    [filtered],
  );

  return (
    <Card
      title="Proforma Invoices"
      subtitle="Quotes to customers before the sale. They are not counted in reports until converted to an invoice."
      flush
      className="overflow-hidden"
    >
      <FilterBar
        active={!!search.trim() || status !== 'all'}
        onReset={() => {
          setSearch('');
          setStatus('all');
        }}
        summary={data ? `${rows.length} of ${all.length}` : undefined}
        actions={
          <CsvButton
            filename={csvFilename(
              'proforma-invoices',
              status !== 'all' && status,
              moment().format('YYYY-MM-DD'),
            )}
            columns={proformaCsvColumns}
            rows={filtered}
          />
        }
      >
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Search customer or PF number"
          style={{ width: 260 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select<StatusFilter>
          style={{ width: 140 }}
          value={status}
          onChange={setStatus}
          options={[
            { value: 'all', label: 'All status' },
            { value: 'open', label: 'Open' },
            { value: 'converted', label: 'Invoiced' },
          ]}
        />
      </FilterBar>
      <Table<ProformaRow>
        loading={isLoading}
        columns={columns}
        dataSource={rows}
        scroll={{ x: 'max-content' }}
        rowClassName="cursor-pointer"
        pagination={{ hideOnSinglePage: true, style: { margin: 16 } }}
        onRow={(record) => ({
          onClick: () => navigate(`/proforma/${record.id}`),
        })}
      />
    </Card>
  );
};

export default Proforma;
