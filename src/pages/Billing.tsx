import React, { useContext, useEffect, useMemo, useState } from 'react';
import { TinyColor } from '@ctrl/tinycolor';
import { Modal, Button, ConfigProvider, Space, Select } from 'antd';
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
import { CloseSquareFilled } from '@ant-design/icons';
import {
  useCreateInvoiceMutation,
  useGetAllservicesQuery,
} from '../store/reportSlice';
import Loading from '../components/Loading';
import CheckboxOne from '../components/Checkboxes/CheckboxOne';

const colors1 = ['#fc6076', '#FF0000'];
const colors2 = ['#A4FF6B', '#008000'];
const getHoverColors = (colors: any) =>
  colors.map((color: any) => new TinyColor(color).lighten(5).toString());
const getActiveColors = (colors: any) =>
  colors.map((color: any) => new TinyColor(color).darken(5).toString());

const environment = import.meta.env;

const Billing = () => {
  const navigate = useNavigate();

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
  const [vatFromMe, setVatFromMe] = useState(false);

  const showModal = () => {
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
          // serviceCharge: Yup.number()
          //   .required('service charge is required')
          //   .min(1, 'charge must be at least 1'),
        }),
      )
      .required('At least one item is required'),
  });

  const onClose = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    console.log(e, 'I was closed.');
  };

  // const { data, error, isLoading } = useCreateInvoiceMutation(invoiceId);

  const [createInvoice] = useCreateInvoiceMutation();

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
          const response = await createInvoice({
            ...values,
            companyId: '6949745c5a24cbc01d85433c',
            vatPaidByCompany: vatFromMe,
            profit: totalProfit,
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
          } else {
            toast.error('Error creating invoice');
          }
        }
      } catch (error: any) {
        toast.error(error);
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

      const tax = (item.serviceCharge / 100) * 5;
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
  // setAllServices(data?.data);
  // console.log(data?.data);
  // if (!isLoading) {
  //   if (data) setAllServices(data?.data);
  // } else {
  //   toast.error('Error fetching the invoice:', error);
  // }

  // console.log('data.data', data);

  // useEffect(() => {
  //   const getService = async () => {
  //     try {
  //       const response = await axios.get(
  //         `${environment.VITE_DOMAIN_URL}/reports/getService`,
  //       );

  //       setAllServices(response.data.data);
  //     } catch (error: any) {}
  //   };
  //   getService();
  // }, []);

  console.log('formik', formik.values);

  return (
    <>
      <Space>
        <ConfigProvider
          theme={{
            components: {
              Button: {
                colorPrimary: `linear-gradient(135deg, ${colors1.join(', ')})`,
                colorPrimaryHover: `linear-gradient(135deg, ${getHoverColors(
                  colors1,
                ).join(', ')})`,
                colorPrimaryActive: `linear-gradient(135deg, ${getActiveColors(
                  colors1,
                ).join(', ')})`,
                lineWidth: 0,
              },
            },
          }}
        >
          <Button
            type="primary"
            size="large"
            className="h-20 w-44"
            onClick={showModal}
          >
            BILL
          </Button>
        </ConfigProvider>
        <ConfigProvider
          theme={{
            components: {
              Button: {
                colorPrimary: `linear-gradient(90deg,  ${colors2.join(', ')})`,
                colorPrimaryHover: `linear-gradient(135deg, ${getHoverColors(
                  colors2,
                ).join(', ')})`,
                colorPrimaryActive: `linear-gradient(90deg, ${getActiveColors(
                  colors2,
                ).join(', ')})`,
                lineWidth: 0,
              },
            },
          }}
        >
          {/* <Button
            type="primary"
            size="large"
            className="h-20 w-44"
            onClick={() => {
              navigate('/report');
            }}
          >
            REPORT
          </Button> */}
        </ConfigProvider>
      </Space>

      {/* modal */}

      <Modal
        className="flex justify-center !z-10 "
        open={open}
        title="BILLING"
        onOk={formik.handleSubmit}
        onCancel={handleCancel}
        footer={[
          <Button key="save" onClick={formik.handleSubmit}>
            <IoMdPrint />
            PRINT
          </Button>,
          <Button key="cancel" type="primary" danger onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="" type="dashed" danger onClick={handleReset}>
            Reset
          </Button>,
        ]}
      >
        <div className="container mx-auto ">
          <form>
            <div className="grid grid-cols-3 gap-3 justify-between w-full bg-slate-100 p-3">
              <div className="flex items-center gap-2 h-9 w-full">
                <h2 className="font-semibold text-base mx-1">Name :</h2>
                <input
                  type="text"
                  required
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  className="h-8 w-4/6 rounded-md  p-1 font-semibold "
                />
                {formik.errors.name && formik.touched.name ? (
                  <div className="text-red-600">{formik.errors.name}</div>
                ) : null}
              </div>

              <div className="flex items-center gap-2 h-9 w-full">
                <h2 className="font-semibold text-base mx-1">Contact :</h2>
                <input
                  type="number"
                  required
                  name="contact"
                  value={formik.values.contact}
                  onChange={formik.handleChange}
                  className="h-8 w-3/6 rounded-md  p-1 font-semibold "
                />
              </div>
              <div className="flex items-center gap-2 h-9 w-full">
                <h2 className="font-semibold text-base mx-1">Address :</h2>
                <input
                  type="text"
                  required
                  name="address"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  className="h-8 w-3/6 rounded-md  p-1 font-semibold "
                />
              </div>
              <div className="flex items-center gap-2 h-9 w-full">
                <h2 className="font-semibold text-base mx-1">TRN :</h2>
                <input
                  type="number"
                  required
                  name="trn"
                  value={formik.values.trn}
                  onChange={formik.handleChange}
                  className="h-8 w-3/6 rounded-md  p-1 font-semibold "
                />
              </div>
              {/* {formik.errors.invoice && formik.touched.invoice ? <div className="text-red-600">{formik.errors.invoice}</div> : null} */}

              <div className="flex items-center gap-2 h-9 w-full">
                <h2 className="font-semibold text-base">Date :</h2>
                <div className="flex space-x-4">
                  <div className="w-full justify-center items-center flex">
                    <input
                      required
                      name="date"
                      type="date"
                      value={formik.values.date}
                      onChange={formik.handleChange}
                      className="relative w-full h-8 outline-none text-gray-500 rounded-lg p-2.5 focus:shadow-md mx-2 font-semibold"
                    />
                    {formik.errors.date && formik.touched.date ? (
                      <div className="text-red-600">{formik.errors.date}</div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full h-6 flex justify-between">
              {formik.errors.invoice && formik.touched.invoice ? (
                <div className="text-red-600">{formik.errors.invoice}</div>
              ) : null}
            </div>
            <div className="w-full h-4 font-bold text-xs gap-2 flex items-center justify-end">
              VAT applied by company :{' '}
              <CheckboxOne isChecked={vatFromMe} setIsChecked={setVatFromMe} />
            </div>
            <div className="!bg-slate-100 !shadow-md !rounded !my-6">
              <table className="min-w-max w-full table-auto ">
                <thead>
                  <tr className="!bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
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
                      className="!border-b !border-slate-300 !bg-gray-800 !hover:bg-gray-100"
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
                          className="form-input w-16 h-7 rounded text-center border border-slate-300 font-semibold"
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
                          className="form-input w-16 h-7 rounded text-center border border-slate-300 font-semibold"
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
                      <td className="items-center gap-2 flex py-3 mx-5 text-left">
                        <input
                          type="number"
                          className="form-input w-16 h-7 rounded text-center border border-slate-300 font-semibold"
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

                  <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
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
                  <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
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

                  <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                    <td colSpan={8} className="py-3 px-6 text-right font-bold">
                      Discount
                    </td>
                    <td className="py-3 px-2 text-left flex justify-center">
                      <input
                        type="number"
                        className="form-input w-16 h-7 rounded text-center border font-semibold"
                        name="discount"
                        required
                        value={formik?.values?.discount}
                        onChange={formik?.handleChange}
                      />
                      {/* {formik.errors.discount && formik.touched.discount ? <div className="text-red-600">{formik.errors.discount}</div> : null} */}
                    </td>
                  </tr>

                  <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
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
    </>
  );
};

export default Billing;
