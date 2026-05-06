import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import { EditOutlined, DeleteOutlined } from '@mui/icons-material';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ColumnDef<T> {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T) => React.ReactNode; // custom render, mặc định là row[key]
}

interface DataTableProps<T extends { id: string }> {
  columns: ColumnDef<T>[];
  rows: T[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const DataTable = <T extends { id: string }>({
  columns,
  rows,
  onEdit,
  onDelete
}: DataTableProps<T>) => {
  const showActions = Boolean(onEdit || onDelete);

  return (
    <TableContainer component={Paper} elevation={3}>
      <Table>
        <TableHead>
          <TableRow className="bg-gray-200">
            {columns.map((col) => (
              <TableCell
                key={col.key}
                align={col.align ?? 'left'}
                sx={{ textTransform: 'uppercase', fontWeight: 600 }}
              >
                {col.label}
              </TableCell>
            ))}
            {showActions && (
              <TableCell
                align="right"
                sx={{ textTransform: 'uppercase', fontWeight: 600 }}
              >
                Thao tác
              </TableCell>
            )}
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              {columns.map((col) => (
                <TableCell key={col.key} align={col.align ?? 'left'}>
                  {col.render
                    ? col.render(row)
                    : ((row as Record<string, unknown>)[
                        col.key
                      ] as React.ReactNode)}
                </TableCell>
              ))}
              {showActions && (
                <TableCell align="right">
                  <div className="flex items-center justify-end gap-1">
                    {onEdit && (
                      <Tooltip title="Chỉnh sửa">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => onEdit(row.id)}
                        >
                          <EditOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {onDelete && (
                      <Tooltip title="Xóa">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onDelete(row.id)}
                        >
                          <DeleteOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DataTable;
