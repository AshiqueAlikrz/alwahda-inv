import React, { useContext, useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { billingDataContext } from '../contexts/DataContext';
import alwahdaText from '../assets/alwahda.png';
import moment from 'moment';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useGetInvoiceByIdQuery } from '../store/reportSlice';
import Loading from '../components/Loading';

const InvoiceData = () => {
  const { id } = useParams(); // Extract the invoiceId from the URL
  // const { billingData } = useContext(billingDataContext);
  const invoiceRef = useRef();
  // const [invoice, setInvoice] = useState([]);
  const handleDownload = async () => {
    const element = invoiceRef.current;

    const canvas = await html2canvas(element, {
      scale: 3, // 🔥 Higher scale = sharper text
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png'); // Lossless

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(
      imgData,
      'PNG',
      0,
      0,
      pdfWidth,
      pdfHeight,
      undefined,
      'SLOW', // Best quality rendering
    );

    pdf.save(`${data?.data?.name}`);
  };

  const printPdf = () => {
    window.print();
  };

  const formatDate = (date: any, format: any) => {
    return moment(date).format(format);
  };

  // useEffect(() => {
  //   const fetchInvoiceItems = async () => {
  //     try {
  //       const response = await axios.get(
  //         `https://inventory-backend-azure.vercel.app/api/reports/invoice/${invoiceId}`,
  //       );
  //       setInvoice(response.data.data);
  //     } catch (error) {
  //       console.error('Error fetching invoice items:', error);
  //     }
  //   };
  //   if (invoiceId) {
  //     fetchInvoiceItems();
  //   }
  // }, [invoiceId]);

  const { data, error, isLoading } = useGetInvoiceByIdQuery(id);

  const showTaxService = data?.data?.items?.some(
    (item: any) => item?.serviceCharge > 0 && item?.tax > 0,
  );
  return (
    <>
      {isLoading ? (
        <div className="h-screen w-full bg-white opacity-50 flex justify-center items-center">
          <Loading />
        </div>
      ) : (
        <div className="m-8 h-auto">
          <style>
            {`
          @media print {
            .print-pdf,.download-pdf{
              display: none;
            }
          }
        `}
          </style>
          <div
            ref={invoiceRef}
            className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg "
          >
            <div className="flex w-full bg-black">
              <img src={alwahdaText} className="w-full h-full object-cover" />
            </div>
            <div className=" flex justify-between items-center mt-6">
              <div>
                <h2 className="text-2xl font-bold text-left">Tax Invoice</h2>
                <p className="text-left font-medium">
                  Invoice No:{' '}
                  <span className="text-black">
                    {data?.data?.invoice_number}
                  </span>
                </p>
                <p className="text-left font-medium">
                  Date :{' '}
                  <span className="text-black">{`${formatDate(
                    data?.data?.date,
                    'DD-MM-YYYY',
                  )}`}</span>
                </p>
              </div>
              <div className="flex flex-col h-auto text-lg font-medium">
                <h1 className="text-primary">Tax Invoice - فاتورة ضريبية</h1>
                <hr className="text-primary mt-3" />
                <span className="text-primary">TRN : 100038138200003</span>
              </div>
              <div className="flex flex-col items-end  h-20 ">
                <h3 className=" text-lg font-semibold mr-5 ">Bill To:</h3>
                <p className=" font-medium text-lg text-auto text-black">
                  {data?.data?.name}
                </p>
                {/* <p className="text-gray-600 ">Bur Dubai</p> */}
              </div>
            </div>

            <div className="mb-6"></div>

            <table className="min-w-full bg-white border">
              <thead>
                <tr>
                  <th className="py-2 px-4 border ">#</th>
                  <th className="py-2 px-10 border">Description</th>
                  <th className="py-2 px-4 border ">Quantity</th>
                  <th className="py-2 px-4 border">Unit Price</th>
                  {showTaxService && (
                    <th className="py-2 px-4 border">Service Chr. </th>
                  )}
                  {showTaxService && (
                    <th className="py-2 px-4 border ">Tax </th>
                  )}
                  <th className="py-2 px-4 border">Total</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.items?.map((item: any, index: any) => (
                  <tr key={index}>
                    <td className="py-2 px-4 text-center font-medium border  text-nowrap">
                      {index + 1}
                    </td>
                    <td className="py-2 px-4 text-center font-medium border  text-nowrap">
                      {item.description.name}
                    </td>
                    <td className="py-2 px-4 text-center font-medium border text-nowrap">
                      {item.quantity}
                    </td>
                    <td className="py-2 px-4 text-center   font-medium border  text-nowrap">
                      {item?.rate?.toFixed(2)}
                    </td>

                    {showTaxService && (
                      <>
                        <td className="py-2 px-4 text-center font-medium border text-nowrap">
                          {item.serviceCharge?.toFixed(2)}
                        </td>

                        <td className="py-2 px-4 text-center font-medium border text-nowrap">
                          {item.tax?.toFixed(2)}
                        </td>
                      </>
                    )}
                    <td className="py-2 px-4 text-center  font-medium border text-nowrap">
                      {item?.total?.toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="py-4 px-4 border "></td>
                  <td className="py-4 px-4 border "></td>
                  <td className="py-4 px-4 border "></td>
                  <td className="py-4 px-4 border "></td>
                  <td className="py-4 px-4 border "></td>
                  {showTaxService && (
                    <>
                      <td className="py-4 px-4 border"></td>
                      <td className="py-4 px-4 border"></td>
                    </>
                  )}
                </tr>
                <tr>
                  <td className="py-4 px-4 border"></td>
                  <td className="py-4 px-4 border"></td>
                  <td className="py-4 px-4 border"></td>
                  <td className="py-4 px-4 border"></td>
                  <td className="py-4 px-4 border"></td>
                  {showTaxService && (
                    <>
                      <td className="py-4 px-4 border"></td>
                      <td className="py-4 px-4 border"></td>
                    </>
                  )}
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td
                    colSpan={`${showTaxService ? '6' : '4'}`}
                    className="py-2 px-4 text-right font-bold border"
                  >
                    VAT
                  </td>
                  <td className="py-2  px-4 font-bold text-nowrap">
                    AED {data?.data?.totalVat?.toFixed(2) || 0}{' '}
                  </td>
                </tr>
                {data?.data?.discount > 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="py-2 px-4 text-right font-semibold border"
                    >
                      Sub total
                      <span className="text-xs"> (Including 5% VAT)</span>
                    </td>
                    <td className="py-2 px-4 font-semibold border text-nowrap">
                      AED {data?.data?.subTotal?.toFixed(2)}{' '}
                    </td>
                  </tr>
                )}

                {data?.data?.discount > 0 && (
                  <tr>
                    <td
                      colSpan={`${showTaxService ? '6' : '4'}`}
                      className="py-2 px-4 text-right font-semibold border"
                    >
                      Discount
                    </td>
                    <td className="py-2 px-4 font-semibold border text-nowrap">
                      AED {data?.data?.discount?.toFixed(2)}{' '}
                    </td>
                  </tr>
                )}
                <tr>
                  <td
                    colSpan={`${showTaxService ? '6' : '4'}`}
                    className="py-2 px-4 text-right font-bold border"
                  >
                    Total
                  </td>
                  <td className="py-2  px-4 font-bold border text-nowrap">
                    AED {data?.data?.grandTotal?.toFixed(2)}{' '}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div className="flex justify-between items-center h-8 p-3 bg-blue-800">
              <p className="text-white font-semibold flex mb-3">
                {/* <GiWorld className="m-1 size-4" /> */}
                www.alwahdaonline.com
              </p>
              <p className="flex text-white font-semibold mb-3">
                {/* <AiOutlineMail className="m-1 size-4" />  */}
                alwahda02@gmail.com
              </p>
            </div>
          </div>
          <button
            onClick={handleDownload}
            className="mt-4 bg-blue-800 text-white px-4 py-2 rounded download-pdf"
          >
            Download as PDF
          </button>
          <button
            onClick={printPdf}
            className="mt-4 mx-6 bg-red-600 text-white px-4 py-2 rounded print-pdf"
          >
            PRINT
          </button>
        </div>
      )}
    </>
  );
};

export default InvoiceData;
