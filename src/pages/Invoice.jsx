import React, { useContext, useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { billingDataContext } from '../contexts/DataContext';
import alwahdaText from '../assets/alwahda.png';
import moment from 'moment';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const Invoice = () => {
  const { invoiceId } = useParams(); // Extract the invoiceId from the URL
  const { billingData } = useContext(billingDataContext);
  const invoiceRef = useRef();
  const [invoice, setInvoice] = useState([]);
  const handleDownload = () => {
    const element = invoiceRef.current;
    const scale = 1.5;

    html2canvas(element, {
      scale,
      useCORS: true,
      allowTaint: true,
      logging: true,
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(billingData.name);
    });
  };

  const printPdf = () => {
    window.print();
  };

  const formatDate = (date, format) => {
    return moment(date).format(format);
  };

  useEffect(() => {
    const fetchInvoiceItems = async () => {
      try {
        const response = await axios.get(
          `https://inventory-backend-azure.vercel.app/api/reports/invoice/${invoiceId}`,
        );
        setInvoice(response.data.data);
      } catch (error) {
        console.error('Error fetching invoice items:', error);
      }
    };
    if (invoiceId) {
      fetchInvoiceItems();
    }
  }, [invoiceId]);

  return (
    <div className="m-8">
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
        className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg border"
      >
        <div className="flex w-full h-24  bg-black">
          <img src={alwahdaText} className="w-full h-full object-cover" />
        </div>
        <div className="flex justify-between items-center mt-6">
          <div>
            <h2 className="text-gray-800 text-2xl font-bold text-left">
              Invoice
            </h2>
            <p className="text-left font-medium">
              Invoice No:{' '}
              <span className="text-black">{invoice.invoice_number}</span>
            </p>
            <p className="text-left font-medium">
              Date :{' '}
              <span className="text-black">{`${formatDate(
                invoice?.date,
                'DD-MM-YYYY',
              )}`}</span>
            </p>
          </div>
          <div className="flex flex-col items-end w-4/6 h-20 ">
            <h3 className="text-gray-600 text-lg font-semibold mr-5 ">
              Bill To:
            </h3>
            <p className=" font-medium text-lg text-auto text-black">
              {invoice?.name}
            </p>
            {/* <p className="text-gray-600 ">Bur Dubai</p> */}
          </div>
        </div>

        <div className="mb-6"></div>

        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border border-gray-200">#</th>
              <th className="py-2 px-10 border border-gray-200">Description</th>
              <th className="py-2 px-4 border border-gray-200">Quantity</th>
              <th className="py-2 px-4 border border-gray-200">Unit Price</th>
              <th className="py-2 px-4 border border-gray-200">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice?.items?.map((item, index) => (
              <tr key={index}>
                <td className="py-2 px-4 text-center text-black font-medium border border-gray-200">
                  {index + 1}
                </td>
                <td className="py-2 px-4 text-center text-black font-medium border border-gray-200">
                  {item.description.name}
                </td>
                <td className="py-2 px-4 text-center text-black font-medium border border-gray-200">
                  {item.quantity}
                </td>
                <td className="py-2 px-4 text-center text-black font-medium border border-gray-200">
                  {item?.rate?.toFixed(2)}
                </td>
                <td className="py-2 px-4 text-center text-black font-medium border border-gray-200">
                  {item?.total?.toFixed(2)}
                </td>
              </tr>
            ))}
            <tr>
              <td className="py-4 px-4 border border-gray-200"></td>
              <td className="py-4 px-4 border border-gray-200"></td>
              <td className="py-4 px-4 border border-gray-200"></td>
              <td className="py-4 px-4 border border-gray-200"></td>
              <td className="py-4 px-4 border border-gray-200"></td>
            </tr>
            <tr>
              <td className="py-4 px-4 border border-gray-200"></td>
              <td className="py-4 px-4 border border-gray-200"></td>
              <td className="py-4 px-4 border border-gray-200"></td>
              <td className="py-4 px-4 border border-gray-200"></td>
              <td className="py-4 px-4 border border-gray-200"></td>
            </tr>
          </tbody>
          <tfoot>
            {invoice?.discount > 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="py-2 px-4 text-right font-semibold border border-gray-200"
                >
                  Sub total
                </td>
                <td className="py-2 text-black px-4 font-semibold border border-gray-200">
                  AED {invoice?.sub_total?.toFixed(2)}{' '}
                </td>
              </tr>
            )}
            {invoice?.discount > 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="py-2 px-4 text-right font-semibold border border-gray-200"
                >
                  Discount
                </td>
                <td className="py-2 px-4 text-black font-semibold border border-gray-200">
                  AED {invoice?.discount?.toFixed(2)}{' '}
                </td>
              </tr>
            )}
            <tr>
              <td
                colSpan="4"
                className="py-2 px-4 text-right font-bold border border-gray-200"
              >
                Total
              </td>
              <td className="py-2 text-black px-4 font-bold border border-gray-200">
                AED {invoice?.grand_total?.toFixed(2)}{' '}
              </td>
            </tr>
          </tfoot>
        </table>

        <div className="flex justify-around items-center h-8 mt-4 bg-blue-800">
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
  );
};

export default Invoice;
