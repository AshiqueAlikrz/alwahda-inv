import React, { useContext, useEffect, useMemo, useState } from 'react';
import { TinyColor } from '@ctrl/tinycolor';
import {
  AutoComplete,
  Modal,
  Button,
  ConfigProvider,
  Space,
  Select,
  Divider,
} from 'antd';
import { MdDeleteOutline } from 'react-icons/md';
import { TiPlus } from 'react-icons/ti';
// import Invoice from './Invoice';
import { useNavigate } from 'react-router-dom';
// import { billingDataContext } from '../contexts/DataContext';
import { IoMdPrint } from 'react-icons/io';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import { Formik, Form, Field, ErrorMessage, useFormik } from 'formik';
import axios from 'axios';
import { Alert } from 'antd';
import { CloseSquareFilled, PlusOutlined } from '@ant-design/icons';
import {
  useCreateInvoiceMutation,
  useCreateProformaMutation,
  useGetAllCustomersQuery,
  useGetAllservicesQuery,
  useLazyGetDailyReportsQuery,
} from '../store/slice/reportSlice';
import Loading from '../components/Loading';
import CheckboxOne from '../components/Checkboxes/CheckboxOne';
import {
  IoReceiptOutline,
  IoDocumentTextOutline,
  IoClipboardOutline,
} from 'react-icons/io5';
import { HiOutlinePlus } from 'react-icons/hi';
import ServiceModal from '../components/ServiceModal';
import CustomerModal from '../components/CustomerModal';
import Card from '../components/ui/Card';

const colors1 = ['#fc6076', '#FF0000'];
const colors2 = ['#A4FF6B', '#008000'];
const getHoverColors = (colors: any) =>
  colors.map((color: any) => new TinyColor(color).lighten(5).toString());
const getActiveColors = (colors: any) =>
  colors.map((color: any) => new TinyColor(color).darken(5).toString());

const environment = import.meta.env;

const Billing = () => {
  const navigate = useNavigate();

  const [fetchDailyReports] = useLazyGetDailyReportsQuery();

  const user = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user') || '{}')
    : null;

  const initialBillingData = {
    name: '',
    date: '',
    trn: 0,
    items: [
      {
        id: 0,
        description: '',
        rate: 0,
        quantity: 0,
        serviceCharge: 0,
        tax: 0,
        total: 0,
        vat: false,
      },
    ],
    subTotal: 0,
    invoiceNumber: '',
    grandTotal: 0,
    totalVat: 0,
    discount: 0,
    profit: 0,
    paid: false,
    contact: 0,
    address: '',
  };
  // const { billingData, setBillingData, invoice, setInvoice } =
  //   useContext(billingDataContext);

  const [open, setOpen] = useState(false);
  // the same form saves either a tax invoice or a proforma invoice
  const [billMode, setBillMode] = useState<'invoice' | 'proforma'>('invoice');
  const [vatFromMe, setVatFromMe] = useState(false);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [nameDropdownOpen, setNameDropdownOpen] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [serviceRowIndex, setServiceRowIndex] = useState(0);
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(
    null,
  );

  const showModal = (mode: 'invoice' | 'proforma' = 'invoice') => {
    setBillMode(mode);
    setOpen(true);
  };

  const handleOk = () => {
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const addRow = (index: any) => {
    const newRow = {
      id: index != Number ? 1 : index + 1,
      description: '',
      quantity: 0,
      fee: 0,
      serviceCharge: 0,
      tax: 1,
      total: 0,
    };
    formik.setFieldValue('items', [...formik.values.items, newRow]);
  };

  const deleteRow = (deleteRowId: any) => {
    if (deleteRowId > -1) {
      const updatedItems = formik.values.items.filter(
        (item: any, index: Number) => index !== deleteRowId,
      );
      formik.setFieldValue('items', updatedItems);
    }
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    date: Yup.date().required('Date is required'),
    items: Yup.array()
      .of(
        Yup.object().shape({
          description: Yup.string().required('Description is required'),
          quantity: Yup.number()
            .required('Quantity is required')
            .min(1, 'Quantity must be at least 1'),
          rate: Yup.number()
            .required('Rate is required')
            .min(1, 'Rate must be at least 1'),
          serviceCharge: Yup.number()
            .required('service charge is required')
            .min(1, 'charge must be at least 1'),
        }),
      )
      .required('At least one item is required'),
  });

  const onClose = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    console.log(e, 'I was closed.');
  };

  // const { data, error, isLoading } = useCreateInvoiceMutation(invoiceId);

  const [createInvoice] = useCreateInvoiceMutation();
  const [createProforma] = useCreateProformaMutation();

  const formik = useFormik({
    initialValues: initialBillingData,
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (values?.items?.length === 0) {
          alert('Add atlease 1 item');
        } else {
          // setBillingData(values);
          // const response = await axios.post(
          // const response = await axios.post(
          //   `${environment.VITE_DOMAIN_URL}/reports/createInvoice`,
          //   `${environment.VITE_DOMAIN_URL}/reports/createInvoice`,
          //   values,
          //   values,
          // );
          if (billMode === 'proforma') {
            const proformaResponse = await createProforma({
              ...values,
              vatPaidByCompany: vatFromMe,
              profit: totalProfit,
            }).unwrap();
            handleReset();
            toast.success(proformaResponse.message);
            navigate(`/proforma/${proformaResponse.data._id}`);
            return;
          }

          const response = await createInvoice({
            ...values,
            vatPaidByCompany: vatFromMe,
            profit: totalProfit,
            companyId: user?.company._id,
          }).unwrap();

          if (response) {
            formik.resetForm({
              values: {
                name: '',
                trn: 0,
                date: '',
                invoiceNumber: '',
                items: [],
                subTotal: 0,
                grandTotal: 0,
                discount: 0,
                profit: 0,
                paid: false,
                totalVat: 0,
                contact: 0,
                address: '',
              },
            });
            toast.success(response.message);
            <Alert
              message="Error Text"
              description="Error Description Error Description Error Description Error Description Error Description Error Description"
              type="error"
              closable={{
                'aria-label': 'close',
                closeIcon: <CloseSquareFilled />,
              }}
              onClose={onClose}
            />;
            navigate(`/invoice/${response.data._id}`);
            fetchDailyReports();
          } else {
            toast.error('Error creating invoice');
          }
        }
      } catch (error: any) {
        toast.error(error?.data?.message || 'Something went wrong');
      }
    },
  });

  useEffect(() => {
    formik?.values?.items?.forEach((item: any, index: any) => {
      const formattedTotal = vatFromMe
        ? (item.quantity || 0) * (item.rate || 0) +
          parseFloat((item.serviceCharge || 0).toFixed(2))
        : (item.quantity || 0) * (item.rate || 0) +
          parseFloat(((item.serviceCharge || 0) + (item.tax || 0)).toFixed(2));

      const tax = vatFromMe
        ? (item.serviceCharge * 5) / 105
        : (item.serviceCharge * 5) / 100;
      formik.setFieldValue(`items[${index}].total`, formattedTotal);
      formik.setFieldValue(`items[${index}].tax`, tax);

      const isVatApplied = item.serviceCharge > 0;
      formik.setFieldValue(`items[${index}].vat`, isVatApplied);
    });
  }, [formik.values.items, formik.setFieldValue, vatFromMe]);

  const subTotal = useMemo(() => {
    return formik.values.items.reduce(
      (acc: any, item: any) => acc + item.total,
      0,
    );
  }, [formik.values.items]);

  const totalVat = useMemo(() => {
    return formik.values.items.reduce(
      (acc: any, item: any) => acc + item.tax,
      0,
    );
  }, [formik.values.items]);

  const grandTotal = useMemo(() => {
    const total = subTotal - formik.values.discount;
    return total;
  }, [formik.values.items, formik.values]);

  const totalProfit = useMemo(() => {
    const profit = formik.values.items.reduce(
      (acc, item) => acc + Number(item.serviceCharge || 0),
      0,
    );
    const excludeVat = vatFromMe ? profit - Number(totalVat || 0) : profit;
    return excludeVat - Number(formik.values.discount || 0);
  }, [formik.values.items, vatFromMe, totalVat, formik.values.discount]);

  const handleReset = () => {
    formik.resetForm({
      values: {
        name: '',
        date: '',
        trn: 0,
        invoiceNumber: '',
        items: [],
        subTotal: 0,
        grandTotal: 0,
        discount: 0,
        paid: false,
        totalVat: 0,
        profit: 0,
        contact: 0,
        address: '',
      },
    });
  };

  const handleKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      const newRow = { id: 0, description: '', rate: '', quantity: '' };
      formik.setFieldValue('items', [...formik.values.items, newRow]);
    }
  };

  useEffect(() => {
    formik.setFieldValue('subTotal', subTotal);
    formik.setFieldValue('totalVat', totalVat);
    formik.setFieldValue('grandTotal', grandTotal);
  }, [subTotal, grandTotal]);

  const { data, error, isLoading } = useGetAllservicesQuery();
  const { data: customersData } = useGetAllCustomersQuery();
  const customers: any[] = customersData?.data ?? [];

  // Fill the bill's customer fields; keeps whatever was typed for details the customer doesn't have
  const fillCustomer = (customer: any) => {
    formik.setFieldValue('name', customer.name);
    if (customer.contact) formik.setFieldValue('contact', customer.contact);
    if (customer.trn) formik.setFieldValue('trn', customer.trn);
    if (customer.address) formik.setFieldValue('address', customer.address);
  };

  return (
    <>
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Card className="text-center">
          <div className="flex h-full flex-col items-center gap-5 py-8">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-3xl text-primary">
              <IoReceiptOutline />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-black dark:text-white">
                Create a new bill
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-body dark:text-bodydark">
                Enter the customer details and pick the services. The tax
                invoice is saved and opens ready to print.
              </p>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<HiOutlinePlus />}
              onClick={() => showModal('invoice')}
            >
              New bill
            </Button>
          </div>
        </Card>

        <Card className="text-center">
          <div className="flex h-full flex-col items-center gap-5 py-8">
            <span
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
              style={{ color: '#1baf7a', backgroundColor: '#1baf7a1f' }}
            >
              <IoClipboardOutline />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-black dark:text-white">
                Create a proforma invoice
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-body dark:text-bodydark">
                A preliminary bill sent before the sale. It is not counted in
                reports until you convert it to a tax invoice.
              </p>
            </div>
            <Button
              size="large"
              icon={<HiOutlinePlus />}
              onClick={() => showModal('proforma')}
            >
              New proforma
            </Button>
          </div>
        </Card>

        <Card className="text-center">
          <div className="flex h-full flex-col items-center gap-5 py-8">
            <span
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
              style={{ color: '#eb6834', backgroundColor: '#eb68341f' }}
            >
              <IoDocumentTextOutline />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-black dark:text-white">
                Create a quotation
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-body dark:text-bodydark">
                Prepare a price quote for a client. It gets its own number and
                can be printed or saved as a PDF.
              </p>
            </div>
            <Button
              size="large"
              icon={<HiOutlinePlus />}
              onClick={() => navigate('/quotations/new')}
            >
              New quotation
            </Button>
          </div>
        </Card>
      </div>

      <Modal
        className="flex justify-center !z-10 "
        open={open}
        title={billMode === 'proforma' ? 'New Proforma Invoice' : 'New Bill'}
        width={1100}
        style={{ maxWidth: 'calc(100vw - 32px)' }}
        onOk={formik.handleSubmit}
        onCancel={handleCancel}
        footer={[
          <Button key="" type="text" onClick={handleReset}>
            Reset
          </Button>,
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="save" type="primary" onClick={formik.handleSubmit}>
            <IoMdPrint />
            Print
          </Button>,
        ]}
      >
        <div className="container mx-auto ">
          <form>
            <div className="grid grid-cols-1 gap-4 rounded-xl bg-gray-2 p-4 dark:bg-meta-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-black dark:text-white">
                  Name
                </label>
                <AutoComplete
                  size="large"
                  className="w-full"
                  placeholder="Type or select a customer"
                  value={formik.values.name}
                  open={nameDropdownOpen}
                  onDropdownVisibleChange={setNameDropdownOpen}
                  onChange={(value) => formik.setFieldValue('name', value)}
                  onBlur={() => formik.setFieldTouched('name', true)}
                  onSelect={(value) => {
                    const customer = customers.find((c) => c.name === value);
                    if (customer) fillCustomer(customer);
                  }}
                  options={customers.map((customer) => ({
                    value: customer.name,
                    label: (
                      <div className="flex justify-between gap-3">
                        <span>{customer.name}</span>
                        {customer.contact && (
                          <span className="text-xs opacity-60">
                            {customer.contact}
                          </span>
                        )}
                      </div>
                    ),
                  }))}
                  filterOption={(input, option) =>
                    String(option?.value ?? '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  notFoundContent={
                    <span className="text-xs">
                      No matching customer. A new one is saved with the bill.
                    </span>
                  }
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Divider style={{ margin: '8px 0' }} />
                      <Button
                        type="text"
                        block
                        icon={<PlusOutlined />}
                        onClick={() => {
                          setNameDropdownOpen(false);
                          setCustomerModalOpen(true);
                        }}
                      >
                        Add Customer
                      </Button>
                    </>
                  )}
                />
                {formik.errors.name && formik.touched.name ? (
                  <div className="mt-1 text-xs text-red-600">
                    {formik.errors.name}
                  </div>
                ) : null}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-black dark:text-white">
                  Contact
                </label>
                <input
                  type="number"
                  required
                  name="contact"
                  value={formik.values.contact}
                  onChange={formik.handleChange}
                  className="h-10 w-full rounded-lg border border-stroke bg-white px-3 text-sm font-medium text-black outline-none transition focus:border-primary dark:border-strokedark dark:bg-form-input dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-black dark:text-white">
                  Address
                </label>
                <input
                  type="text"
                  required
                  name="address"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  className="h-10 w-full rounded-lg border border-stroke bg-white px-3 text-sm font-medium text-black outline-none transition focus:border-primary dark:border-strokedark dark:bg-form-input dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-black dark:text-white">
                  TRN
                </label>
                <input
                  type="number"
                  required
                  name="trn"
                  value={formik.values.trn}
                  onChange={formik.handleChange}
                  className="h-10 w-full rounded-lg border border-stroke bg-white px-3 text-sm font-medium text-black outline-none transition focus:border-primary dark:border-strokedark dark:bg-form-input dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-black dark:text-white">
                  Date
                </label>
                <input
                  required
                  name="date"
                  type="date"
                  value={formik.values.date}
                  onChange={formik.handleChange}
                  className="h-10 w-full rounded-lg border border-stroke bg-white px-3 text-sm font-medium text-black outline-none transition focus:border-primary dark:border-strokedark dark:bg-form-input dark:text-white"
                />
                {formik.errors.date && formik.touched.date ? (
                  <div className="mt-1 text-xs text-red-600">
                    {formik.errors.date}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="w-full h-6 flex justify-between">
              {formik.errors.invoice && formik.touched.invoice ? (
                <div className="text-red-600">{formik.errors.invoice}</div>
              ) : null}
            </div>
            <div className="mt-4 flex w-full items-center justify-end gap-2 text-sm font-medium text-black dark:text-white">
              VAT applied by company{' '}
              <CheckboxOne isChecked={vatFromMe} setIsChecked={setVatFromMe} />
            </div>
            <div className="my-4 overflow-x-auto rounded-xl border border-stroke dark:border-strokedark">
              <table className="min-w-max w-full table-auto ">
                <thead>
                  <tr className="bg-gray-2 text-xs font-semibold uppercase tracking-wide text-body dark:bg-meta-4 dark:text-bodydark">
                    <th className="py-3 px-6 text-right">
                      {formik?.values?.items?.length < 1 && (
                        <TiPlus
                          className="text-green-600 text-xl hover:text-gray-800 cursor-pointer"
                          onClick={addRow}
                        />
                      )}
                    </th>
                    <th className="py-3 px-6 text-left"></th>
                    <th className="py-3 px-6 text-left">Serial.No</th>
                    <th className="py-3 px-6 text-center">Description</th>
                    <th className="py-3 px-6 text-center">Quantity</th>
                    <th className="py-3 px-6 text-left">Fee</th>
                    <th className="py-3 px-6 text-center">service chr.</th>
                    <th className="py-3 px-6 text-center">Tax</th>
                    <th className="py-3 px-6 text-center">Total</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                  {formik?.values?.items?.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-stroke dark:border-strokedark"
                    >
                      <td className="py-3 px-6 text-right">
                        <TiPlus
                          className="text-green-600 text-xl hover:text-gray-800 cursor-pointer"
                          onClick={() => addRow(index)}
                        />
                      </td>
                      <td className="py-3 px-6 text-left whitespace-nowrap">
                        <MdDeleteOutline
                          className="text-red-600 text-xl hover:text-gray-800 cursor-pointer"
                          onClick={() => deleteRow(index)}
                        />
                      </td>
                      <td className="py-3 px-6 text-center font-semibold">
                        {index + 1}
                      </td>
                      <td className="py-3 px-16 text-left whitespace-nowrap font-semibold">
                        {/* description */}

                        <Select
                          className="w-72"
                          showSearch
                          style={{
                            width: 200,
                          }}
                          placeholder="Search to Select"
                          value={item.description || undefined}
                          open={openDropdownIndex === index}
                          onDropdownVisibleChange={(visible) =>
                            setOpenDropdownIndex(visible ? index : null)
                          }
                          dropdownRender={(menu) => (
                            <>
                              {menu}
                              <Divider style={{ margin: '8px 0' }} />
                              <Button
                                type="text"
                                block
                                icon={<PlusOutlined />}
                                onClick={() => {
                                  setServiceRowIndex(index);
                                  setOpenDropdownIndex(null);
                                  setServiceModalOpen(true);
                                }}
                              >
                                Add Service
                              </Button>
                            </>
                          )}
                          optionFilterProp="label"
                          filterSort={(optionA, optionB) =>
                            (optionA.label ?? '')
                              .toLowerCase()
                              .localeCompare(
                                (optionB.label ?? '').toLowerCase(),
                              )
                          }
                          name={`items[${index}].description`}
                          onChange={(value) => {
                            const selectedService = data?.data?.find(
                              (item: any) => item._id === value,
                            );
                            formik.setFieldValue(
                              `items[${index}].description`,
                              selectedService?._id || '',
                            );
                            formik.setFieldValue(
                              `items[${index}].rate`,
                              selectedService?.price || '',
                            );
                          }}
                        >
                          {false ? (
                            <Select.Option key={item.id} value={item._id}>
                              <Loading />
                            </Select.Option>
                          ) : (
                            data?.data?.map((item: any) => (
                              <Select.Option key={item.id} value={item._id}>
                                {item.name}
                              </Select.Option>
                            ))
                          )}
                        </Select>
                        {formik.errors.items &&
                          formik.touched.items &&
                          formik.errors.items[index]?.description &&
                          formik.touched.items[index]?.description && (
                            <div className="text-red-600 font-thin text-xs">
                              {formik.errors.items[index].description}
                            </div>
                          )}
                      </td>

                      {/* quantity */}

                      <td className="py-3 px-2 text-center ">
                        <input
                          type="number"
                          className="form-input h-9 w-20 rounded-lg border border-stroke text-center text-sm font-semibold outline-none focus:border-primary dark:border-strokedark"
                          required
                          onKeyDown={handleKeyDown}
                          name={`items[${index}].quantity`}
                          value={formik?.values?.items[index]?.quantity}
                          onChange={formik.handleChange}
                        />
                        {formik.errors.items &&
                          formik.touched.items &&
                          formik.errors.items[index]?.quantity &&
                          formik.touched.items[index]?.quantity && (
                            <div className="text-red-600 text-xs">
                              {formik.errors.items[index].quantity}
                            </div>
                          )}
                      </td>

                      {/* rate */}

                      <td className="py-3 px-2 text-left ">
                        <input
                          type="number"
                          className="form-input h-9 w-20 rounded-lg border border-stroke text-center text-sm font-semibold outline-none focus:border-primary dark:border-strokedark"
                          name={`items[${index}].rate`}
                          value={formik?.values?.items[index]?.rate}
                          onChange={formik.handleChange}
                        />
                        {formik.errors.items &&
                          formik.touched.items &&
                          formik.errors.items[index]?.rate &&
                          formik.touched.items[index]?.rate && (
                            <div className="text-red-600 text-xs">
                              {formik.errors.items[index].rate}
                            </div>
                          )}
                      </td>

                      {/* service chr. */}
                      <td className="items-center flex-col flex py-3 mx-5 text-left">
                        <input
                          type="number"
                          className="form-input h-9 w-20 rounded-lg border border-stroke text-center text-sm font-semibold outline-none focus:border-primary dark:border-strokedark"
                          name={`items[${index}].serviceCharge`}
                          value={formik?.values?.items[index]?.serviceCharge}
                          onChange={formik.handleChange}
                        />
                        {formik.errors.items &&
                          formik.touched.items &&
                          formik.errors.items[index]?.serviceCharge &&
                          formik.touched.items[index]?.serviceCharge && (
                            <div className="text-red-600 text-xs">
                              {formik.errors.items[index].serviceCharge}
                            </div>
                          )}
                      </td>

                      {/* Tax */}

                      <td
                        className="py-3 px-6 text-center font-semibold "
                        // name={`items[${index}].total`}
                        // value={formik?.values?.items[index]?.total}
                        // onChange={formik.handleChange}
                      >
                        {/* {!isNaN(
                          formik?.values?.items[index]?.rate *
                            formik?.values?.items[index]?.quantity,
                        )
                          ? formik?.values?.items[index]?.rate *
                              formik?.values?.items[index]?.quantity +
                            formik?.values?.items[index]?.total.toFixed(2)
                          : '0.00'} */}
                        {formik?.values?.items[index]?.tax.toFixed(2)}
                      </td>

                      {/* total */}

                      <td
                        className="py-3 px-6 text-center font-semibold "
                        // name={`items[${index}].total`}
                        // value={formik?.values?.items[index]?.total}
                        // onChange={formik.handleChange}
                      >
                        {/* {!isNaN(
                          formik?.values?.items[index]?.rate *
                            formik?.values?.items[index]?.quantity,
                        )
                          ? formik?.values?.items[index]?.rate *
                              formik?.values?.items[index]?.quantity +
                            formik?.values?.items[index]?.total
                          : '0.00'} */}
                        {formik?.values?.items[index]?.total
                          ? formik?.values?.items[index]?.total
                          : '0.00'}
                      </td>
                    </tr>
                  ))}

                  <tr className="bg-gray-2 text-sm text-body dark:bg-meta-4 dark:text-bodydark">
                    <td
                      colSpan={8}
                      className="py-3 px-6 text-right font-semibold"
                    >
                      Sub Total :
                    </td>
                    <td className="py-3 px-6 text-right font-semibold">
                      {formik?.values?.subTotal?.toFixed(2)} AED
                    </td>
                  </tr>
                  <tr className="bg-gray-2 text-sm text-body dark:bg-meta-4 dark:text-bodydark">
                    <td
                      colSpan={8}
                      className="py-3 px-6 text-right font-semibold"
                    >
                      Total VAT :
                    </td>
                    <td className="py-3 px-6 text-right font-semibold">
                      {formik?.values?.totalVat?.toFixed(2)} AED
                    </td>
                  </tr>

                  <tr className="bg-gray-2 text-sm text-body dark:bg-meta-4 dark:text-bodydark">
                    <td colSpan={8} className="py-3 px-6 text-right font-bold">
                      Discount
                    </td>
                    <td className="py-3 px-2 text-left flex justify-center">
                      <input
                        type="number"
                        className="form-input h-9 w-20 rounded-lg border border-stroke text-center text-sm font-semibold outline-none focus:border-primary dark:border-strokedark"
                        name="discount"
                        required
                        value={formik?.values?.discount}
                        onChange={formik?.handleChange}
                      />
                      {/* {formik.errors.discount && formik.touched.discount ? <div className="text-red-600">{formik.errors.discount}</div> : null} */}
                    </td>
                  </tr>

                  <tr className="bg-primary/5 text-base text-primary">
                    <td colSpan={8} className="py-3 px-6 text-right font-bold">
                      Grand Total :
                    </td>
                    <td className="py-3 px-6 text-right font-bold">
                      {formik?.values?.grandTotal?.toFixed(2)} AED
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </form>
        </div>
      </Modal>

      <CustomerModal
        open={customerModalOpen}
        zIndex={1100}
        initialName={formik.values.name}
        onClose={() => setCustomerModalOpen(false)}
        onSaved={fillCustomer}
      />

      <ServiceModal
        open={serviceModalOpen}
        zIndex={1100}
        onClose={() => setServiceModalOpen(false)}
        onSaved={(service) => {
          formik.setFieldValue(
            `items[${serviceRowIndex}].description`,
            service?._id || '',
          );
          formik.setFieldValue(
            `items[${serviceRowIndex}].rate`,
            service?.price || '',
          );
        }}
      />
    </>
  );
};

export default Billing;
