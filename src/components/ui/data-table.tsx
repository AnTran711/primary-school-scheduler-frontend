import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Box,
  Typography
} from '@mui/material';
import {
  EditOutlined,
  DeleteOutlined,
  InboxOutlined
} from '@mui/icons-material';

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
  emptyText?: string; // tuỳ chỉnh text khi không có dữ liệu
}

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = ({ text }: { text: string }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      py: 8,
      gap: 1.5,
      color: 'text.disabled'
    }}
  >
    <InboxOutlined sx={{ fontSize: 48 }} />
    <Typography variant="body2" color="text.disabled">
      {text}
    </Typography>
  </Box>
);

// ─── Component ────────────────────────────────────────────────────────────────

const DataTable = <T extends { id: string }>({
  columns,
  rows,
  onEdit,
  onDelete,
  emptyText = 'Không có dữ liệu'
}: DataTableProps<T>) => {
  const showActions = Boolean(onEdit || onDelete);
  const totalCols = columns.length + (showActions ? 1 : 0);

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
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={totalCols} sx={{ border: 0 }}>
                <EmptyState text={emptyText} />
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
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
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DataTable;
