import { useMemo, useState } from 'react';
import { Button, DatePicker, Input, Table } from 'antd';
import type { TableColumnsType } from 'antd';
import type { Dayjs } from 'dayjs';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { IoAdd, IoDocumentTextOutline } from 'react-icons/io5';
import Card from '../../components/ui/Card';
import CsvButton from '../../components/ui/CsvButton';
import FilterBar from '../../components/ui/FilterBar';
import { useGetQuotationsQuery } from '../../store/slice/reportSlice';
import { CsvColumn, csvFilename } from '../../utils/csv';
import { formatMoney } from '../../utils/money';

interface QuotationRow {
  key: string;
  quoteNo: string;
  date: string;
  client: string;
  total: string;
  createdBy: string;
}

type DateRange = [Dayjs | null, Dayjs | null] | null;

const columns: TableColumnsType<QuotationRow> = [
  {
    title: 'Quotation',
    dataIndex: 'quoteNo',
    render: (quoteNo) => (
      <span className="font-semibold text-black dark:text-white">
        {quoteNo}
      </span>
    ),
  },
  { title: 'Date', dataIndex: 'date' },
  {
    title: 'Client',
    dataIndex: 'client',
    render: (client) => (
      <span className="font-medium text-black dark:text-white">{client}</span>
    ),
  },
  {
    title: 'Total (AED)',
    dataIndex: 'total',
    align: 'right',
    render: (total) => (
      <span className="font-semibold text-black dark:text-white">{total}</span>
    ),
  },
  { title: 'Created by', dataIndex: 'createdBy' },
];

const quotationCsvColumns: CsvColumn<any>[] = [
  { header: 'Quotation No', value: (quotation) => quotation.quoteNo },
  {
    header: 'Date',
    value: (quotation) => moment.utc(quotation.date).format('YYYY-MM-DD'),
  },
  { header: 'Client', value: (quotation) => quotation.client },
  { header: 'Subtotal', value: (quotation) => quotation.subtotal, money: true },
  { header: 'VAT', value: (quotation) => quotation.vatAmount, money: true },
  { header: 'Total', value: (quotation) => quotation.total, money: true },
  {
    header: 'Created By',
    value: (quotation) => quotation.createdBy?.name ?? '',
  },
];

const Quotations = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetQuotationsQuery();
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>(null);

  const all: any[] = data?.data ?? [];

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    // quotation dates are stored as the calendar day, so compare day strings
    const from = dateRange?.[0]?.format('YYYY-MM-DD');
    const to = dateRange?.[1]?.format('YYYY-MM-DD');
    return all.filter((quotation) => {
      if (
        query &&
        !String(quotation.client ?? '')
          .toLowerCase()
          .includes(query) &&
        !String(quotation.quoteNo ?? '')
          .toLowerCase()
          .includes(query)
      ) {
        return false;
      }
      if (from && to) {
        const day = moment.utc(quotation.date).format('YYYY-MM-DD');
        if (day < from || day > to) return false;
      }
      return true;
    });
  }, [all, search, dateRange]);

  const rows: QuotationRow[] = filtered.map((quotation) => ({
    key: quotation._id,
    quoteNo: quotation.quoteNo,
    date: moment.utc(quotation.date).format('DD-MM-YYYY'),
    client: quotation.client,
    total: formatMoney(quotation.total),
    createdBy: quotation.createdBy?.name || '-',
  }));

  const filterActive = !!search.trim() || !!dateRange?.[0];

  const csvName = csvFilename(
    'quotations',
    dateRange?.[0] && dateRange?.[1]
      ? `${dateRange[0].format('YYYY-MM-DD')}_to_${dateRange[1].format(
          'YYYY-MM-DD',
        )}`
      : moment().format('YYYY-MM-DD'),
  );

  const empty = (
    <div className="flex flex-col items-center gap-3 py-10">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-2xl text-primary">
        <IoDocumentTextOutline />
      </span>
      <p className="text-sm text-body dark:text-bodydark">
        {isError
          ? "Couldn't load quotations."
          : filterActive
          ? 'No quotations match these filters.'
          : 'No quotations yet. Create your first one.'}
      </p>
      {!isError && !filterActive && (
        <Button type="primary" onClick={() => navigate('/quotations/new')}>
          New quotation
        </Button>
      )}
    </div>
  );

  return (
    <Card
      title="Quotations"
      subtitle={`${all.length} ${
        all.length === 1 ? 'quotation' : 'quotations'
      }`}
      extra={
        <Button
          type="primary"
          icon={<IoAdd size={18} />}
          onClick={() => navigate('/quotations/new')}
        >
          New quotation
        </Button>
      }
      flush
      className="overflow-hidden"
    >
      <FilterBar
        active={filterActive}
        onReset={() => {
          setSearch('');
          setDateRange(null);
        }}
        summary={data ? `${filtered.length} of ${all.length}` : undefined}
        actions={
          <CsvButton
            filename={csvName}
            columns={quotationCsvColumns}
            rows={filtered}
          />
        }
      >
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Search client or quotation no."
          style={{ width: 260 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <DatePicker.RangePicker
          value={dateRange as any}
          onChange={(range) => setDateRange(range as DateRange)}
        />
      </FilterBar>
      <Table<QuotationRow>
        loading={isLoading}
        columns={columns}
        dataSource={rows}
        locale={{ emptyText: empty }}
        scroll={{ x: 'max-content' }}
        rowClassName="cursor-pointer"
        pagination={{ hideOnSinglePage: true, style: { margin: 16 } }}
        onRow={(record) => ({
          onClick: () => navigate(`/quotation/${record.key}`),
        })}
      />
    </Card>
  );
};

export default Quotations;
