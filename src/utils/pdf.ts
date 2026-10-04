import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface PagedPdfOptions {
  filename: string;
  // elements that must not be cut in half; a page may only end at the bottom of one of them
  breakSelector: string;
  // blank space, in points, left above the content on every page after the first
  continuationPad?: number;
}

// Saves an element as a full-bleed A4 PDF. A tall element continues on extra pages. The space left
// over on a page is filled by stretching the row of pixels at the cut, so a coloured column
// (like a CV sidebar) keeps running to the page edge instead of stopping mid-page.
export const saveElementAsPagedPdf = async (
  element: HTMLElement,
  { filename, breakSelector, continuationPad = 28 }: PagedPdfOptions,
) => {
  const scale = 2;
  // html2canvas measures text with a helper element it adds at the end of <body>. The site's CSS
  // reset makes the image inside it a block, which pushes all text a few pixels too low, so the
  // image is put back inline while the picture is taken.
  const metricsFix = document.createElement('style');
  metricsFix.textContent =
    'body > div:last-child img { display: inline-block !important; }';
  document.head.appendChild(metricsFix);
  let canvas: HTMLCanvasElement;
  try {
    canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      backgroundColor: '#ffffff',
    });
  } finally {
    metricsFix.remove();
  }
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const pxPerPt = canvas.width / pageWidth;
  const pagePx = Math.floor(pageHeight * pxPerPt);
  const padPx = Math.round(continuationPad * pxPerPt);

  const rect = element.getBoundingClientRect();
  const toCanvas = (y: number) =>
    Math.round(((y - rect.top) / rect.height) * canvas.height);
  const blocks = Array.from(element.querySelectorAll(breakSelector)).map(
    (node) => {
      const box = node.getBoundingClientRect();
      return { top: toCanvas(box.top), bottom: toCanvas(box.bottom) };
    },
  );
  // A page may end at the bottom of a block, as long as no other block (say, one in a
  // neighbouring column) is still running across that row.
  const breakPoints = blocks
    .map((candidate) => candidate.bottom)
    .filter(
      (point) =>
        !blocks.some(
          (other) => other.top < point - 2 && other.bottom > point + 2,
        ),
    )
    .sort((a, b) => a - b);

  // The very last rows of the picture can come out blank, so they are left off
  const height = canvas.height - 3;
  // A row just past a cut lies in the gap between two blocks, so it holds only background colours
  const gapRow = (cut: number) => Math.min(cut + 2, height - 1);

  // a few pixels of rounding must not spill onto an extra, empty page
  const tolerance = 8;
  let start = 0;
  while (start < height - tolerance) {
    const pad = start > 0 ? padPx : 0;
    const room = pagePx - pad;
    let end = Math.min(start + room, height);
    if (height - end <= tolerance) {
      end = height;
    } else {
      const safe = breakPoints
        .filter((point) => point > start + room * 0.5 && point <= end)
        .pop();
      if (safe) end = safe;
    }
    const sliceHeight = Math.min(end - start, room);

    const page = document.createElement('canvas');
    page.width = canvas.width;
    page.height = pagePx;
    const context = page.getContext('2d')!;
    // the stretched rows must stay solid colours, not fade into their neighbours
    context.imageSmoothingEnabled = false;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, page.width, page.height);
    if (pad > 0) {
      context.drawImage(
        canvas,
        0,
        gapRow(start),
        canvas.width,
        1,
        0,
        0,
        page.width,
        pad,
      );
    }
    context.drawImage(
      canvas,
      0,
      start,
      canvas.width,
      sliceHeight,
      0,
      pad,
      page.width,
      sliceHeight,
    );
    const filled = pad + sliceHeight;
    if (filled < pagePx) {
      context.drawImage(
        canvas,
        0,
        gapRow(start + sliceHeight),
        canvas.width,
        1,
        0,
        filled,
        page.width,
        pagePx - filled,
      );
    }

    if (start > 0) pdf.addPage();
    pdf.addImage(
      page.toDataURL('image/jpeg', 0.95),
      'JPEG',
      0,
      0,
      pageWidth,
      pageHeight,
    );
    start = end;
  }
  pdf.save(filename);
};
