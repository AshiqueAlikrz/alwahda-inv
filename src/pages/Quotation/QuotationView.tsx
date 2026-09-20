import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from 'antd';
import { toast } from 'react-toastify';
import moment from 'moment';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  IoArrowBack,
  IoDownloadOutline,
  IoPrintOutline,
} from 'react-icons/io5';
import alwahdaText from '../../assets/alwahda.png';
import Card from '../../components/ui/Card';
import Loading from '../../components/Loading';
import { useGetQuotationByIdQuery } from '../../store/slice/reportSlice';
import { formatMoney } from '../../utils/money';

const QuotationView = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useGetQuotationByIdQuery(id);
  const documentRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const quotation = data?.data;

  // Renders the document to an A4 PDF. A long quotation continues on extra pages, and pages break
  // between table rows / list items so a line of text is never cut in half.
  const downloadPdf = async () => {
    const element = documentRef.current;
    if (!element || !quotation) return;
    setDownloading(true);
    try {
      const scale = 2;
      const canvas = await html2canvas(element, {
        scale,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      const contentHeight = pdf.internal.pageSize.getHeight() - margin * 2;
      const pxPerPt = canvas.width / pageWidth;
      const pagePx = Math.floor(contentHeight * pxPerPt);

      // bottom edges of rows and list items, in canvas pixels: the places a page may end
      const top = element.getBoundingClientRect().top;
      const breakPoints = Array.from(element.querySelectorAll('tr, li, h4'))
        .map((node) =>
          Math.round((node.getBoundingClientRect().bottom - top) * scale),
        )
        .sort((a, b) => a - b);

      let start = 0;
      while (start < canvas.height) {
        let end = Math.min(start + pagePx, canvas.height);
        if (end < canvas.height) {
          const safe = breakPoints
            .filter((point) => point > start + pagePx * 0.5 && point <= end)
            .pop();
          if (safe) end = safe;
        }

        const slice = document.createElement('canvas');
        slice.width = canvas.width;
        slice.height = end - start;
        slice
          .getContext('2d')!
          .drawImage(
            canvas,
            0,
            start,
            canvas.width,
            end - start,
            0,
            0,
            canvas.width,
            end - start,
          );

        if (start > 0) pdf.addPage();
        pdf.addImage(
          slice.toDataURL('image/jpeg', 0.95),
          'JPEG',
          0,
          margin,
          pageWidth,
          (end - start) / pxPerPt,
        );
        start = end;
      }
      pdf.save(`${quotation.quoteNo} - ${quotation.client}.pdf`);
    } catch {
      toast.error('Could not create the PDF');
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (isError || !quotation) {
    return (
      <Card>
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <p className="text-lg font-semibold text-black dark:text-white">
            Quotation not found
          </p>
          <p className="text-sm text-body dark:text-bodydark">
            It may have been removed, or belongs to another company.
          </p>
          <Link to="/quotations">
            <Button type="primary">Back to quotations</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* when printing, show only the document and let the page flow normally */}
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            #quotation-document, #quotation-document * { visibility: visible; }
            #quotation-document { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; }
            html, body, #root, .h-screen { height: auto !important; overflow: visible !important; }
            .overflow-hidden, .overflow-y-auto, .overflow-x-hidden { overflow: visible !important; }
            .print-pdf, .download-pdf { display: none !important; }
            tr { break-inside: avoid; }
          }
        `}
      </style>

      <div className="print-pdf mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/quotations"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-body hover:text-primary dark:text-bodydark"
        >
          <IoArrowBack size={16} />
          All quotations
        </Link>
        <div className="flex gap-3">
          <Button
            icon={<IoDownloadOutline size={16} />}
            loading={downloading}
            onClick={downloadPdf}
          >
            Download as PDF
          </Button>
          <Button
            type="primary"
            icon={<IoPrintOutline size={16} />}
            onClick={() => window.print()}
          >
            Print
          </Button>
        </div>
      </div>

      <div
        id="quotation-document"
        ref={documentRef}
        className="rounded-lg bg-white p-6 shadow-lg"
      >
        <div className="flex w-full bg-black">
          <img src={alwahdaText} className="h-full w-full object-cover" />
        </div>
        <h3 className="mt-2 text-center text-2xl font-bold text-primary">
          Quotation
        </h3>

        <div className="mt-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-left text-lg font-bold">
              Client:{' '}
              <span className="font-medium text-black">{quotation.client}</span>
            </p>
          </div>
          <div className="flex flex-col items-end">
            <p className="text-lg font-semibold">
              Quotation No:{' '}
              <span className="font-medium text-black">
                {quotation.quoteNo}
              </span>
            </p>
            <p className="text-lg font-semibold">
              Date :{' '}
              <span className="font-medium text-black">
                {moment.utc(quotation.date).format('DD/MM/YYYY')}
              </span>
            </p>
            <p className="text-lg font-semibold">
              TRN :{' '}
              <span className="font-medium text-black">100038138200003</span>
            </p>
          </div>
        </div>

        <table className="mt-6 w-full table-auto border-collapse border text-black">
          <thead>
            <tr className="bg-gray-2 text-left">
              <th className="border px-4 py-2 text-center">#</th>
              <th className="border px-4 py-2">Description</th>
              <th className="border px-4 py-2 text-center">Quantity</th>
              <th className="border px-4 py-2 text-right">Unit Price</th>
              <th className="border px-4 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {quotation.items.map((item: any, index: number) => (
              <tr key={item._id || index}>
                <td className="border px-4 py-2 text-center">{index + 1}</td>
                <td className="border px-4 py-2">{item.description}</td>
                <td className="border px-4 py-2 text-center">{item.qty}</td>
                <td className="border px-4 py-2 text-right">
                  {formatMoney(item.price)}
                </td>
                <td className="border px-4 py-2 text-right">
                  {formatMoney(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td
                colSpan={4}
                className="border px-4 py-2 text-right font-semibold"
              >
                Subtotal
              </td>
              <td className="text-nowrap border px-4 py-2 text-right font-semibold">
                AED {formatMoney(quotation.subtotal)}
              </td>
            </tr>
            <tr>
              <td
                colSpan={4}
                className="border px-4 py-2 text-right font-semibold"
              >
                VAT ({quotation.vatPercent}%)
              </td>
              <td className="text-nowrap border px-4 py-2 text-right font-semibold">
                AED {formatMoney(quotation.vatAmount)}
              </td>
            </tr>
            <tr>
              <td colSpan={4} className="border px-4 py-2 text-right font-bold">
                Total
              </td>
              <td className="text-nowrap border px-4 py-2 text-right font-bold">
                AED {formatMoney(quotation.total)}
              </td>
            </tr>
          </tfoot>
        </table>

        {quotation.terms?.length > 0 && (
          <div className="mt-6 text-black" style={{ breakInside: 'avoid' }}>
            <h4 className="text-lg font-bold">Terms & Conditions</h4>
            <ul className="mt-1 list-disc pl-6">
              {quotation.terms.map((term: string, index: number) => (
                <li key={index}>{term}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex h-8 items-center justify-between bg-blue-800 p-3 font-sans">
          <p className="mb-3 flex font-semibold text-white">
            www.alwahdaonline.com
          </p>
          <p className="mb-3 flex font-semibold text-white">
            alwahda02@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuotationView;
