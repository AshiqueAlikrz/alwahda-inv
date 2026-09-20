import { Button, Tooltip } from 'antd';
import { toast } from 'react-toastify';
import { IoDownloadOutline } from 'react-icons/io5';
import { XlsxColumn, downloadXlsx } from '../../utils/xlsx';

interface XlsxButtonProps<T> {
  filename: string;
  columns: XlsxColumn<T>[];
  // exactly the rows currently shown, so the file matches the screen
  rows: T[];
}

const XlsxButton = <T,>({ filename, columns, rows }: XlsxButtonProps<T>) => (
  <Tooltip title={rows.length ? undefined : 'Nothing to download'}>
    <Button
      icon={<IoDownloadOutline size={16} />}
      disabled={rows.length === 0}
      onClick={async () => {
        try {
          await downloadXlsx(filename, columns, rows);
          toast.success(
            `Downloaded ${rows.length} ${rows.length === 1 ? 'row' : 'rows'}`,
          );
        } catch (err) {
          console.error('Excel export failed:', err);
          toast.error('Could not create the Excel file');
        }
      }}
    >
      Download Excel
    </Button>
  </Tooltip>
);

export default XlsxButton;
