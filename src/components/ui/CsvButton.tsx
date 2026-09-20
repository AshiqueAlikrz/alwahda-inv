import { Button, Tooltip } from 'antd';
import { toast } from 'react-toastify';
import { IoDownloadOutline } from 'react-icons/io5';
import { CsvColumn, downloadCsv } from '../../utils/csv';

interface CsvButtonProps<T> {
  filename: string;
  columns: CsvColumn<T>[];
  // exactly the rows currently shown, so the file matches the screen
  rows: T[];
}

const CsvButton = <T,>({ filename, columns, rows }: CsvButtonProps<T>) => (
  <Tooltip title={rows.length ? undefined : 'Nothing to download'}>
    <Button
      icon={<IoDownloadOutline size={16} />}
      disabled={rows.length === 0}
      onClick={() => {
        downloadCsv(filename, columns, rows);
        toast.success(
          `Downloaded ${rows.length} ${rows.length === 1 ? 'row' : 'rows'}`,
        );
      }}
    >
      Download CSV
    </Button>
  </Tooltip>
);

export default CsvButton;
