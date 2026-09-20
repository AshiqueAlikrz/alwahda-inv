import { useRef, useState } from 'react';
import { Button, Input, Modal } from 'antd';
import { toast } from 'react-toastify';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import alwahdaText from '../assets/alwahda.png';
import moment from 'moment';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  useConvertProformaMutation,
  useGetInvoiceByIdQuery,
  useGetProformaByIdQuery,
  useSendInvoiceEmailMutation,
} from '../store/slice/reportSlice';
import Loading from '../components/Loading';

// The same printable page serves tax invoices and proforma invoices
const InvoiceData = ({
  variant = 'invoice',
}: {
  variant?: 'invoice' | 'proforma';
}) => {
  const isProforma = variant === 'proforma';
  const navigate = useNavigate();
  const { id } = useParams(); // Extract the invoiceId from the URL
  const [convertProforma, { isLoading: isConverting }] =
    useConvertProformaMutation();
  // const { billingData } = useContext(billingDataContext);
  const invoiceRef = useRef();
  // const [invoice, setInvoice] = useState([]);
  const [emailOpen, setEmailOpen] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');
  const [sendInvoiceEmail, { isLoading: isSending }] =
    useSendInvoiceEmailMutation();

  // Renders the invoice card to a one-page A4 PDF. The email copy uses JPEG at
  // a lower scale so the upload stays well under the server's request limit.
  const buildPdf = async ({ compact = false } = {}) => {
    const element = invoiceRef.current;

    const canvas = await html2canvas(element, {
      scale: compact ? 2 : 3, // 🔥 Higher scale = sharper text
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const imgData = compact
      ? canvas.toDataURL('image/jpeg', 0.85)
      : canvas.toDataURL('image/png'); // Lossless

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(
      imgData,
      compact ? 'JPEG' : 'PNG',
      0,
      0,
      pdfWidth,
      pdfHeight,
      undefined,
      compact ? 'FAST' : 'SLOW', // Best quality rendering
    );

    return pdf;
  };

  const handleDownload = async () => {
    const pdf = await buildPdf();
    pdf.save(
      isProforma
        ? `${data?.data?.proformaNo}-${data?.data?.name}`
        : `${data?.data?.name}`,
    );
  };

  const handleSendEmail = async () => {
    const email = customerEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Enter a valid email address');
      return;
    }
    try {
      const pdf = await buildPdf({ compact: true });
      const pdfBase64 = pdf.output('datauristring').split(',')[1];
      const response = await sendInvoiceEmail({
        invoiceId: id as string,
        email,
        pdfBase64,
      }).unwrap();
      toast.success(response.message);
      setEmailOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to send invoice email');
    }
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

  const invoiceQuery = useGetInvoiceByIdQuery(id, { skip: isProforma });
  const proformaQuery = useGetProformaByIdQuery(id, { skip: !isProforma });
  const { data, error, isLoading } = isProforma ? proformaQuery : invoiceQuery;

  const handleConvert = () => {
    Modal.confirm({
      title: 'Convert to tax invoice?',
      content:
        'This creates a real invoice dated today, and it will be counted in reports. It can only be done once.',
      okText: 'Convert',
      onOk: async () => {
        try {
          const response = await convertProforma({
            proformaId: id as string,
            date: moment().format('YYYY-MM-DD'),
          }).unwrap();
          toast.success(response.message);
          navigate(`/invoice/${response.data._id}`);
        } catch (err: any) {
          toast.error(err?.data?.message || 'Failed to convert proforma');
        }
      },
    });
  };

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
            <h3 className="text-2xl font-bold text-primary mt-2 text-center">
              {isProforma ? 'Proforma Invoice' : 'Tax Invoice'}
            </h3>

            <div className=" flex justify-between items-center mt-6">
              <div>
                <p className="text-left font-bold text-lg">
                  Customer:{' '}
                  <span className="text-black font-medium">
                    {' '}
                    {data?.data?.name}
                  </span>
                </p>
                {data?.data?.contact ? (
                  <p className="text-left font-semibold text-lg">
                    Contact:{' '}
                    <span className="text-black font-medium">
                      {' '}
                      +971 {data?.data?.contact}
                    </span>
                  </p>
                ) : (
                  ''
                )}
                {data?.data?.trn ? (
                  <p className="text-left font-semibold text-lg">
                    TRN:{' '}
                    <span className="text-black font-medium">
                      {' '}
                      {data?.data?.trn}
                    </span>
                  </p>
                ) : (
                  ''
                )}
                {data?.data?.address && (
                  <p className="text-left font-semibold text-lg">
                    Address:{' '}
                    <span className="text-black font-medium">
                      {' '}
                      {data?.data?.address}
                    </span>
                  </p>
                )}
              </div>

              <div className="flex flex-col items-end  h-20 ">
                <h3 className=" text-lg font-semibold  ">
                  {isProforma ? 'Proforma No:' : 'Invoice No:'}
                  <span className=" font-medium text-lg text-auto text-black">
                    {' '}
                    {isProforma
                      ? data?.data?.proformaNo
                      : data?.data?.invoice_number}
                  </span>
                </h3>
                <p className="text-left font-semibold text-lg">
                  Date :{' '}
                  <span className="text-black font-medium">{`${formatDate(
                    data?.data?.date,
                    'DD/MM/YYYY',
                  )}`}</span>
                </p>
                <p className="text-left font-semibold text-lg">
                  TRN :{' '}
                  <span className="text-black font-medium">
                    100038138200003
                  </span>
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

            {isProforma && (
              <p className="mb-6 mt-3 text-sm text-black">
                This is a proforma invoice, issued before the sale. It is not a
                tax invoice and no payment has been received against it.
              </p>
            )}

            <div className="font-sans flex justify-between items-center h-8 p-3 bg-blue-800">
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
          {!isProforma && (
            <button
              onClick={() => setEmailOpen(true)}
              className="mt-4 mx-6 bg-green-600 text-white px-4 py-2 rounded download-pdf"
            >
              Send to Email
            </button>
          )}
          <button
            onClick={printPdf}
            className="mt-4 mx-6 bg-red-600 text-white px-4 py-2 rounded print-pdf"
          >
            PRINT
          </button>
          {isProforma && data?.data?.status === 'open' && (
            <Button
              type="primary"
              className="mt-4 download-pdf"
              loading={isConverting}
              onClick={handleConvert}
            >
              Convert to Invoice
            </Button>
          )}
          {isProforma && data?.data?.status === 'converted' && (
            <p className="mt-4 text-sm download-pdf">
              This proforma has been invoiced.{' '}
              {data?.data?.convertedInvoiceId && (
                <Link
                  className="text-primary underline"
                  to={`/invoice/${data.data.convertedInvoiceId}`}
                >
                  View the invoice
                </Link>
              )}
            </p>
          )}
        </div>
      )}

      <Modal
        title="Send Invoice to Customer"
        open={emailOpen}
        okText="Send"
        confirmLoading={isSending}
        onOk={handleSendEmail}
        onCancel={() => setEmailOpen(false)}
      >
        <div className="flex flex-col gap-1">
          <label>Customer email :</label>
          <Input
            type="email"
            autoFocus
            placeholder="customer@example.com"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            onPressEnter={handleSendEmail}
          />
          <p className="text-xs text-body">
            The invoice is attached to the email as a PDF.
          </p>
        </div>
      </Modal>
    </>
  );
};

export default InvoiceData;
