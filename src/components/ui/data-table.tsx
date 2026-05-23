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
  Typography,
  TableFooter
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
    <Typography variant="body2" sx={{ color: 'text.disabled' }}>
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

        <TableFooter>
          <TableRow>
            <TableCell
              colSpan={totalCols}
              sx={{
                borderTop: '1px solid',
                borderColor: 'divider',
                borderBottom: 0,
                py: 1.5,
                px: 2,
                bgcolor: 'grey.50'
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 1
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 500, color: 'text.secondary' }}
                >
                  Tổng cộng
                </Typography>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: 1.25,
                    py: 0.25,
                    borderRadius: 1,
                    bgcolor: 'primary.50',
                    border: '1px solid',
                    borderColor: 'primary.100'
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, color: 'primary.main' }}
                  >
                    {rows.length}
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 500, color: 'text.secondary' }}
                >
                  bản ghi
                </Typography>
              </Box>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
};

export default DataTable;
