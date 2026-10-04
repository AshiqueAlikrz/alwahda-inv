import { useMemo, useRef, useState } from 'react';
import { AutoComplete, Button, Checkbox, Input, InputNumber } from 'antd';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import moment from 'moment';
import { IoAdd, IoTrashOutline } from 'react-icons/io5';
import Card from '../../components/ui/Card';
import {
  useAddQuotationTermMutation,
  useCreateQuotationMutation,
  useDeleteQuotationTermMutation,
  useGetAllservicesQuery,
  useGetQuotationTermsQuery,
} from '../../store/slice/reportSlice';
import { formatMoney } from '../../utils/money';

const VAT_PERCENT = 5;

interface Row {
  key: number;
  description: string;
  qty: number | null;
  price: number | null;
}

const toCents = (value: number) => Math.round((value + Number.EPSILON) * 100);

const NewQuotation = () => {
  const navigate = useNavigate();
  const [createQuotation, { isLoading: isSaving }] =
    useCreateQuotationMutation();

  // saved services are offered as suggestions; the description stays free text
  const { data: services } = useGetAllservicesQuery();
  const serviceOptions = useMemo(
    () =>
      (services?.data || []).map((service: any) => ({
        key: service._id,
        value: service.name,
        price: service.price,
      })),
    [services],
  );

  const nextKey = useRef(2);
  const [client, setClient] = useState('');
  const [date, setDate] = useState(moment().format('YYYY-MM-DD'));
  // left blank, the server assigns the next number in sequence
  const [quoteNo, setQuoteNo] = useState('');
  const [rows, setRows] = useState<Row[]>([
    { key: 1, description: '', qty: 1, price: null },
  ]);
  // the company's saved terms; each one is printed unless it is unticked here
  const { data: termsData, isLoading: termsLoading } =
    useGetQuotationTermsQuery();
  const savedTerms = termsData?.data || [];
  const [addTerm, { isLoading: isAddingTerm }] = useAddQuotationTermMutation();
  const [deleteTerm] = useDeleteQuotationTermMutation();
  const [uncheckedTerms, setUncheckedTerms] = useState<string[]>([]);
  const [newTerm, setNewTerm] = useState('');

  const toggleTerm = (term: string, checked: boolean) =>
    setUncheckedTerms((prev) =>
      checked ? prev.filter((item) => item !== term) : [...prev, term],
    );

  const saveNewTerm = async () => {
    const term = newTerm.trim();
    if (!term) return;
    try {
      await addTerm({ term }).unwrap();
      setNewTerm('');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to add the term');
    }
  };

  const removeTerm = async (term: string) => {
    try {
      await deleteTerm({ term }).unwrap();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to remove the term');
    }
  };
  // after a failed save attempt, highlight what is missing
  const [submitted, setSubmitted] = useState(false);

  const updateRow = (key: number, patch: Partial<Row>) =>
    setRows((prev) =>
      prev.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );

  const addRow = () =>
    setRows((prev) => [
      ...prev,
      { key: nextKey.current++, description: '', qty: 1, price: null },
    ]);

  const removeRow = (key: number) =>
    setRows((prev) => prev.filter((row) => row.key !== key));

  // same whole-cent maths as the server, which is what actually gets saved
  const totals = useMemo(() => {
    const lineCents = rows.map((row) =>
      toCents((row.qty || 0) * (row.price || 0)),
    );
    const subtotalCents = lineCents.reduce((sum, cents) => sum + cents, 0);
    const vatCents = Math.round((subtotalCents * VAT_PERCENT) / 100);
    return {
      lines: lineCents.map((cents) => cents / 100),
      subtotal: subtotalCents / 100,
      vat: vatCents / 100,
      total: (subtotalCents + vatCents) / 100,
    };
  }, [rows]);

  const rowProblem = (row: Row) =>
    !row.description.trim() || !row.qty || row.qty <= 0 || row.price === null;

  const save = async () => {
    setSubmitted(true);
    if (!client.trim()) return toast.error('Client name is required');
    if (!date) return toast.error('Pick a date');
    if (rows.length === 0) return toast.error('Add at least one item');
    if (rows.some(rowProblem)) {
      return toast.error('Every item needs a description, quantity and price');
    }

    try {
      const response = await createQuotation({
        client: client.trim(),
        date,
        quoteNo: quoteNo.trim(),
        items: rows.map((row) => ({
          description: row.description.trim(),
          qty: row.qty as number,
          price: row.price as number,
        })),
        terms: savedTerms.filter((term) => !uncheckedTerms.includes(term)),
      }).unwrap();
      toast.success(`Quotation ${response.data.quoteNo} created`);
      navigate(`/quotation/${response.data._id}`);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create quotation');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card title="Details" subtitle="Who the quotation is for">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-black dark:text-white">
              Client name
            </label>
            <Input
              size="large"
              value={client}
              maxLength={200}
              placeholder="Company or person"
              status={submitted && !client.trim() ? 'error' : ''}
              onChange={(e) => setClient(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-black dark:text-white">
              Date
            </label>
            <Input
              size="large"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-black dark:text-white">
              Quotation no.
            </label>
            <Input
              size="large"
              value={quoteNo}
              maxLength={30}
              placeholder="Automatic if left blank"
              onChange={(e) => setQuoteNo(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <Card
        title="Items"
        subtitle="What is being quoted"
        extra={
          <Button icon={<IoAdd size={18} />} onClick={addRow}>
            Add item
          </Button>
        }
      >
        <div className="hidden grid-cols-12 gap-3 pb-2 text-xs font-semibold uppercase tracking-wide text-body dark:text-bodydark md:grid">
          <span className="col-span-6">Description</span>
          <span className="col-span-2">Qty</span>
          <span className="col-span-2">Unit price</span>
          <span className="col-span-1 text-right">Amount</span>
          <span className="col-span-1" />
        </div>

        <div className="flex flex-col gap-3">
          {rows.map((row, index) => (
            <div
              key={row.key}
              className="grid grid-cols-12 items-start gap-3 border-t border-stroke pt-3 first:border-0 first:pt-0 dark:border-strokedark md:border-0 md:pt-0"
            >
              <div className="col-span-12 md:col-span-6">
                <AutoComplete
                  size="large"
                  style={{ width: '100%' }}
                  value={row.description}
                  maxLength={300}
                  placeholder={`Item ${index + 1} description`}
                  status={submitted && !row.description.trim() ? 'error' : ''}
                  options={serviceOptions}
                  filterOption={(input, option) =>
                    String(option?.value ?? '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  onChange={(value) =>
                    updateRow(row.key, { description: value })
                  }
                  onSelect={(value, option: any) =>
                    updateRow(row.key, {
                      description: value,
                      price: option.price ?? row.price,
                    })
                  }
                />
              </div>
              <div className="col-span-5 md:col-span-2">
                <InputNumber
                  size="large"
                  min={0}
                  style={{ width: '100%' }}
                  value={row.qty}
                  status={
                    submitted && (!row.qty || row.qty <= 0) ? 'error' : ''
                  }
                  onChange={(value) => updateRow(row.key, { qty: value })}
                />
              </div>
              <div className="col-span-5 md:col-span-2">
                <InputNumber
                  size="large"
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  value={row.price}
                  placeholder="0.00"
                  status={submitted && row.price === null ? 'error' : ''}
                  onChange={(value) => updateRow(row.key, { price: value })}
                />
              </div>
              <div className="col-span-10 flex h-10 items-center justify-between text-sm font-semibold tabular-nums text-black dark:text-white md:col-span-1 md:justify-end">
                <span className="text-xs font-medium text-body dark:text-bodydark md:hidden">
                  Amount
                </span>
                {formatMoney(totals.lines[index])}
              </div>
              <div className="col-span-2 flex justify-end md:col-span-1">
                <Button
                  size="large"
                  danger
                  type="text"
                  aria-label={`Remove item ${index + 1}`}
                  disabled={rows.length === 1}
                  icon={<IoTrashOutline size={18} />}
                  onClick={() => removeRow(row.key)}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <Card
          title="Terms & conditions"
          subtitle="Ticked terms are printed on the quotation"
        >
          <div className="flex flex-col gap-1">
            {savedTerms.map((term) => (
              <div
                key={term}
                className="flex items-start justify-between gap-3 rounded-lg px-2 py-1.5 hover:bg-gray-2 dark:hover:bg-meta-4"
              >
                <Checkbox
                  checked={!uncheckedTerms.includes(term)}
                  onChange={(e) => toggleTerm(term, e.target.checked)}
                >
                  {term}
                </Checkbox>
                <Button
                  size="small"
                  danger
                  type="text"
                  aria-label={`Delete term: ${term}`}
                  icon={<IoTrashOutline size={16} />}
                  onClick={() => removeTerm(term)}
                />
              </div>
            ))}
            {!termsLoading && savedTerms.length === 0 && (
              <p className="px-2 py-1.5 text-sm text-body dark:text-bodydark">
                No saved terms yet. Add one below.
              </p>
            )}
          </div>

          <div className="mt-4 flex gap-3">
            <Input
              size="large"
              value={newTerm}
              maxLength={300}
              placeholder="Write a new term"
              onChange={(e) => setNewTerm(e.target.value)}
              onPressEnter={saveNewTerm}
            />
            <Button
              size="large"
              icon={<IoAdd size={18} />}
              loading={isAddingTerm}
              disabled={!newTerm.trim()}
              onClick={saveNewTerm}
            >
              Add term
            </Button>
          </div>
        </Card>

        <Card>
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-body dark:text-bodydark">Subtotal</dt>
              <dd className="font-medium tabular-nums text-black dark:text-white">
                {formatMoney(totals.subtotal)} AED
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-body dark:text-bodydark">
                VAT ({VAT_PERCENT}%)
              </dt>
              <dd className="font-medium tabular-nums text-black dark:text-white">
                {formatMoney(totals.vat)} AED
              </dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-stroke pt-3 dark:border-strokedark">
              <dt className="font-semibold text-black dark:text-white">
                Total
              </dt>
              <dd className="text-xl font-bold tabular-nums text-primary">
                {formatMoney(totals.total)} AED
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      <div className="flex justify-end gap-3">
        <Button size="large" onClick={() => navigate('/quotations')}>
          Cancel
        </Button>
        <Button size="large" type="primary" loading={isSaving} onClick={save}>
          Save quotation
        </Button>
      </div>
    </div>
  );
};

export default NewQuotation;
